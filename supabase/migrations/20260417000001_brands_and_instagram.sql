-- Brands table
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#3377AF',
  secondary_color TEXT NOT NULL DEFAULT '#83F714',
  accent_color TEXT,
  font_display TEXT NOT NULL DEFAULT 'Space Grotesk',
  font_body TEXT NOT NULL DEFAULT 'Montserrat',
  tone_of_voice TEXT NOT NULL DEFAULT 'Profissional',
  description TEXT,
  website TEXT,
  instagram_handle TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Instagram accounts table
CREATE TABLE IF NOT EXISTS public.instagram_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL,
  access_token TEXT NOT NULL,
  page_id TEXT NOT NULL,
  ig_user_id TEXT NOT NULL,
  brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  profile_picture_url TEXT,
  connected_at TIMESTAMPTZ DEFAULT NOW()
);

-- Open RLS policies
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on brands" ON public.brands FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on instagram_accounts" ON public.instagram_accounts FOR ALL USING (true) WITH CHECK (true);

-- Insert default brands
INSERT INTO public.brands (name, primary_color, secondary_color, accent_color, font_display, font_body, tone_of_voice, description, instagram_handle) VALUES
  ('Orlando Fast Pass', '#3377AF', '#83F714', '#FF6B35', 'Space Grotesk', 'Montserrat', 'Profissional', 'Agencia de viagens especializada em Orlando', '@orlandofastpass'),
  ('Explotek', '#3377AF', '#83F714', '#00D4FF', 'Space Grotesk', 'Montserrat', 'Profissional', 'Portal de inteligencia de mercado', '@explotek.pro');
