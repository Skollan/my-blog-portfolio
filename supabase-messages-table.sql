-- Création de la table messages pour le formulaire de contact
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ajouter un index sur created_at pour les requêtes de tri
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Politique RLS (Row Level Security) - permettre l'insertion pour tous
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre l'insertion de nouveaux messages
CREATE POLICY IF NOT EXISTS "Allow insert messages" ON messages
  FOR INSERT WITH CHECK (true);

-- Politique pour permettre la lecture des messages (pour l'admin)
CREATE POLICY IF NOT EXISTS "Allow read messages" ON messages
  FOR SELECT USING (true);