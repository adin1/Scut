-- Rulează acest script IMEDIAT după prima migrare Prisma care creează
-- tabelul audit_events. Scopul: chiar dacă serverul aplicației e compromis
-- (cont DB cu credențialele din .env), atacatorul nu poate modifica sau
-- șterge istoricul — poate doar adăuga blocuri noi, ceea ce lanțul de
-- hash-uri va marca oricum ca invalide dacă încearcă să "repare" ceva.

-- 1. Creează un rol separat, dedicat, folosit DOAR de aplicație pentru
--    scrierea în audit_events. Nu refolosi rolul de "superuser"/migrare.
--    (Dacă rolul există deja, sari peste acest pas.)
-- CREATE ROLE app_audit_writer WITH LOGIN PASSWORD 'schimbă-această-parolă';

-- 2. Revocă explicit orice permisiune implicită.
REVOKE ALL ON audit_events FROM app_audit_writer;

-- 3. Acordă STRICT ce e nevoie: INSERT și SELECT. Nicio urmă de
--    UPDATE, DELETE sau TRUNCATE pentru rolul aplicației.
GRANT INSERT, SELECT ON audit_events TO app_audit_writer;

-- 4. La fel pentru secvența folosită de blockIndex (autoincrement) —
--    aplicația are nevoie doar să citească/avanseze valoarea curentă.
GRANT USAGE, SELECT ON SEQUENCE audit_events_block_index_seq TO app_audit_writer;

-- 5. IMPORTANT: rolul folosit pentru migrări Prisma (schema changes)
--    trebuie să fie DIFERIT de app_audit_writer și să nu fie folosit
--    de server.ts la runtime — altfel un server compromis moștenește
--    și drepturile de migrare, care includ implicit ALTER/DROP.

-- 6. Opțional, dar recomandat pentru o barieră suplimentară: un trigger
--    care respinge explicit orice UPDATE/DELETE, indiferent de rol
--    (a doua linie de apărare, dacă cineva schimbă greșit un GRANT):
CREATE OR REPLACE FUNCTION prevent_audit_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'audit_events este append-only: % nepermis pe blocul %',
    TG_OP, OLD.block_index;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_events_no_update
  BEFORE UPDATE ON audit_events
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_mutation();

CREATE TRIGGER audit_events_no_delete
  BEFORE DELETE ON audit_events
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_mutation();

-- Verificare rapidă după rulare:
-- \dp audit_events   (în psql, arată permisiunile efective)
