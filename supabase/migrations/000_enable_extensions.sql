-- Ensure required extensions exist before other migrations run.
-- We rely on pgcrypto's gen_random_uuid() for UUID defaults and attempt
-- to enable uuid-ossp so uuid_generate_v4() is also available if needed.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
  EXECUTE 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp"';
EXCEPTION
  WHEN insufficient_privilege OR undefined_file THEN
    RAISE NOTICE 'uuid-ossp extension is unavailable; continuing because gen_random_uuid() defaults are used instead.';
END;
$$ LANGUAGE plpgsql;
