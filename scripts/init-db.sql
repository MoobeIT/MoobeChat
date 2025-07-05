-- Criar extensão para gerar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verificar se a extensão foi criada
SELECT * FROM pg_extension WHERE extname = 'uuid-ossp'; 