import crypto from 'crypto';
import type { PrismaClient, AuditEvent } from '@prisma/client';

/**
 * Hash-ul "genesis" — folosit ca prevBlockHash pentru primul bloc din lanț.
 * O valoare fixă, cunoscută public, ca punct de plecare al verificării.
 */
export const GENESIS_HASH = '0'.repeat(64);

/**
 * Datele necesare pentru a adăuga un eveniment nou în ledger.
 * Notă: actorId / actorRole NU trebuie să vină niciodată direct din req.body.
 * Trebuie populate de server, pe baza sesiunii autentificate a request-ului.
 */
export interface NewAuditEventInput {
  actorId: string;
  actorRole: string;
  actorInstitution?: string;
  action: string;
  resourceType: string;
  resourceId: string;
  description: string;
  legalBasis?: string;
  ipAddress?: string;
  breakGlassReason?: string;
}

/**
 * Serializare deterministă a unui bloc pentru calculul hash-ului.
 * CRITIC: ordinea câmpurilor trebuie să fie fixă și identică la scriere
 * și la verificare — altfel hash-urile nu se vor mai potrivi niciodată.
 * Nu folosi JSON.stringify(obj) direct pe un obiect oarecare: ordinea
 * cheilor într-un obiect JS nu e o garanție de-a lungul versiunilor/motoarelor.
 */
function serializeBlockForHashing(params: {
  prevBlockHash: string;
  blockIndex: number;
  timestamp: string; // ISO string, ca să fie stabil indiferent de fus orar
  actorId: string;
  actorRole: string;
  actorInstitution: string;
  action: string;
  resourceType: string;
  resourceId: string;
  description: string;
  legalBasis: string;
  ipAddress: string;
  breakGlassReason: string;
}): string {
  return [
    params.prevBlockHash,
    params.blockIndex,
    params.timestamp,
    params.actorId,
    params.actorRole,
    params.actorInstitution,
    params.action,
    params.resourceType,
    params.resourceId,
    params.description,
    params.legalBasis,
    params.ipAddress,
    params.breakGlassReason,
  ].join('\u0001'); // separator care nu apare normal în text liber
}

function computeBlockHash(serialized: string): string {
  return crypto.createHash('sha256').update(serialized, 'utf8').digest('hex');
}

/**
 * Opțional dar recomandat: semnează hash-ul cu o cheie privată a serverului
 * (ideal ținută într-un KMS/HSM, nu într-un fișier .env).
 * Dacă nu ai încă infrastructura de semnare, poți lăsa signature = null
 * pentru moment — chaining-ul de mai jos funcționează independent de asta.
 */
function signHash(hash: string, privateKeyPem: string | null): string | null {
  if (!privateKeyPem) return null;
  const signer = crypto.createSign('SHA256');
  signer.update(hash);
  signer.end();
  return signer.sign(privateKeyPem, 'hex');
}

/**
 * Adaugă un eveniment nou în ledger, în siguranță față de scrieri concurente.
 *
 * Folosește o tranzacție Prisma cu SELECT ... FOR UPDATE (via $queryRaw pe
 * ultimul rând) pentru a preveni situația în care două request-uri simultane
 * citesc același "ultim bloc" și produc două lanțuri paralele — ceea ce ar
 * rupe garanția de ordine totală a ledger-ului.
 */
export async function appendAuditEvent(
  prisma: PrismaClient,
  input: NewAuditEventInput,
  serverPrivateKeyPem: string | null = null
): Promise<AuditEvent> {
  return prisma.$transaction(async (tx) => {
    // Blocare la nivel de rând pe ultimul bloc, ca să serializăm scrierile.
    // Dacă tabelul e gol, `lastRows` va fi array gol și pornim de la genesis.
    const lastRows = await tx.$queryRaw<Array<{ block_index: number; block_hash: string }>>`
      SELECT block_index, block_hash
      FROM audit_events
      ORDER BY block_index DESC
      LIMIT 1
      FOR UPDATE
    `;

    const prevBlockHash = lastRows[0]?.block_hash ?? GENESIS_HASH;
    const nextBlockIndex = (lastRows[0]?.block_index ?? 0) + 1;
    const timestamp = new Date();

    const normalized = {
      prevBlockHash,
      blockIndex: nextBlockIndex,
      timestamp: timestamp.toISOString(),
      actorId: input.actorId,
      actorRole: input.actorRole,
      actorInstitution: input.actorInstitution ?? '',
      action: input.action,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      description: input.description,
      legalBasis: input.legalBasis ?? '',
      ipAddress: input.ipAddress ?? '',
      breakGlassReason: input.breakGlassReason ?? '',
    };

    const serialized = serializeBlockForHashing(normalized);
    const blockHash = computeBlockHash(serialized);
    const signature = signHash(blockHash, serverPrivateKeyPem);

    return tx.auditEvent.create({
      data: {
        blockIndex: nextBlockIndex,
        timestamp,
        actorId: input.actorId,
        actorRole: input.actorRole,
        actorInstitution: input.actorInstitution,
        action: input.action,
        resourceType: input.resourceType,
        resourceId: input.resourceId,
        description: input.description,
        legalBasis: input.legalBasis,
        ipAddress: input.ipAddress,
        breakGlassReason: input.breakGlassReason,
        prevBlockHash,
        blockHash,
        signature: signature ?? undefined,
      },
    });
  });
}

// Exportate pentru reutilizare în scriptul de verificare independent.
export { serializeBlockForHashing, computeBlockHash };
