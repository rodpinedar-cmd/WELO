-- WELO Database Schema
-- Ejecutar en Supabase SQL Editor

-- Tabla de parejas
CREATE TABLE couples (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  user1_id UUID REFERENCES auth.users(id),
  user1_role TEXT DEFAULT 'ella',
  user2_id UUID REFERENCES auth.users(id),
  user2_role TEXT DEFAULT 'el',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de respuestas del Match Diario
CREATE TABLE match_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  date DATE NOT NULL,
  answers JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(couple_id, user_id, date)
);

-- Tabla de reconocimientos
CREATE TABLE recognitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  from_user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE match_answers;
ALTER PUBLICATION supabase_realtime ADD TABLE recognitions;

-- Row Level Security (RLS)
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE recognitions ENABLE ROW LEVEL SECURITY;

-- Policies: usuarios solo ven datos de su pareja
CREATE POLICY "Users can view own couple"
  ON couples FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can insert couple"
  ON couples FOR INSERT
  WITH CHECK (auth.uid() = user1_id);

CREATE POLICY "Users can update own couple"
  ON couples FOR UPDATE
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can view own match answers"
  ON match_answers FOR SELECT
  USING (couple_id IN (SELECT id FROM couples WHERE user1_id = auth.uid() OR user2_id = auth.uid()));

CREATE POLICY "Users can insert own match answers"
  ON match_answers FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own recognitions"
  ON recognitions FOR SELECT
  USING (couple_id IN (SELECT id FROM couples WHERE user1_id = auth.uid() OR user2_id = auth.uid()));

CREATE POLICY "Users can insert recognitions"
  ON recognitions FOR INSERT
  WITH CHECK (from_user_id = auth.uid());
