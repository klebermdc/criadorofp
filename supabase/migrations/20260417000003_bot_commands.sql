CREATE TABLE IF NOT EXISTS public.bot_commands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL DEFAULT 'discord',
  command TEXT NOT NULL,
  args JSONB,
  user_id TEXT,
  user_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

ALTER TABLE public.bot_commands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on bot_commands" ON public.bot_commands FOR ALL USING (true) WITH CHECK (true);
