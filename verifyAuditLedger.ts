/**
 * Script de verificare INDEPENDENT al lanțului de audit.
 *
 * Important: acest script se rulează separat de aplicația server, ideal de
 * pe altă mașină / cu alte credențiale DB (read-only), și nu ar trebui
 * expus ca endpoint HTTP din aceeași aplicație care scrie în ledger —
 * altfel verificarea "se auto-atestă", ceea ce nu dovedește nimic unui
 * auditor extern sau unei instanțe.
 *
 * Rulare: npx tsx scripts/verifyAuditLedger.ts
 */
import { PrismaClient } from '@prisma/client';
import { GENESIS_HASH, serializeBlockForHashing, computeBlockHash } from '../server/auditLedger';

interface VerificationFailure {
  blockIndex: number;
  reason: string;
}

async function verifyLedger(prisma: PrismaClient): Promise<{
  ok: boolean;
  totalBlocks: number;
  failures: VerificationFailure[];
}> {
  const events = await prisma.auditEvent.findMany({
    orderBy: { blockIndex: 'asc' },
  });

  const failures: VerificationFailure[] = [];
  let expectedPrevHash = GENESIS_HASH;
  let expectedIndex = 1;

  for (const ev of events) {
    // 1. Continuitatea indexului — nu trebuie să existe goluri sau blocuri lipsă.
    if (ev.blockIndex !== expectedIndex) {
      failures.push({
        blockIndex: ev.blockIndex,
        reason: `Index neașteptat: se aștepta ${expectedIndex}, găsit ${ev.blockIndex}. Posibil bloc lipsă sau șters.`,
      });
    }

    // 2. Legătura cu blocul anterior — inima verificării de tamper-evidence.
    if (ev.prevBlockHash !== expectedPrevHash) {
      failures.push({
        blockIndex: ev.blockIndex,
        reason: `prevBlockHash nu corespunde cu hash-ul blocului anterior. Lanțul e rupt aici.`,
      });
    }

    // 3. Recalculăm hash-ul din conținutul stocat și îl comparăm cu cel salvat.
    const recomputed = computeBlockHash(
      serializeBlockForHashing({
        prevBlockHash: ev.prevBlockHash,
        blockIndex: ev.blockIndex,
        timestamp: ev.timestamp.toISOString(),
        actorId: ev.actorId,
        actorRole: ev.actorRole,
        actorInstitution: ev.actorInstitution ?? '',
        action: ev.action,
        resourceType: ev.resourceType,
        resourceId: ev.resourceId,
        description: ev.description,
        legalBasis: ev.legalBasis ?? '',
        ipAddress: ev.ipAddress ?? '',
        breakGlassReason: ev.breakGlassReason ?? '',
      })
    );

    if (recomputed !== ev.blockHash) {
      failures.push({
        blockIndex: ev.blockIndex,
        reason: `Hash-ul stocat nu corespunde conținutului blocului — conținutul a fost modificat după scriere.`,
      });
    }

    expectedPrevHash = ev.blockHash;
    expectedIndex += 1;
  }

  return { ok: failures.length === 0, totalBlocks: events.length, failures };
}

async function main() {
  const prisma = new PrismaClient();
  try {
    const result = await verifyLedger(prisma);
    console.log(`Blocuri verificate: ${result.totalBlocks}`);
    if (result.ok) {
      console.log('✅ Lanțul este integru — nicio modificare detectată.');
      process.exit(0);
    } else {
      console.error(`❌ INTEGRITATE COMPROMISĂ — ${result.failures.length} probleme găsite:`);
      for (const f of result.failures) {
        console.error(`  Bloc ${f.blockIndex}: ${f.reason}`);
      }
      process.exit(1);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();

export { verifyLedger };
