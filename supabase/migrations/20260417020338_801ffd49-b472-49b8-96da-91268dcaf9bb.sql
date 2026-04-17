-- brands table
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  accent_color TEXT,
  font_display TEXT,
  font_body TEXT,
  tone_of_voice TEXT,
  description TEXT,
  website TEXT,
  instagram_handle TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read brands" ON public.brands FOR SELECT USING (true);
CREATE POLICY "Public insert brands" ON public.brands FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update brands" ON public.brands FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete brands" ON public.brands FOR DELETE USING (true);

-- instagram_accounts table
CREATE TABLE IF NOT EXISTS public.instagram_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  access_token TEXT NOT NULL,
  page_id TEXT NOT NULL,
  ig_user_id TEXT NOT NULL,
  profile_picture_url TEXT,
  brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  connected_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.instagram_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read instagram_accounts" ON public.instagram_accounts FOR SELECT USING (true);
CREATE POLICY "Public insert instagram_accounts" ON public.instagram_accounts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update instagram_accounts" ON public.instagram_accounts FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete instagram_accounts" ON public.instagram_accounts FOR DELETE USING (true);

-- carousels: add publish workflow fields + UPDATE policy
ALTER TABLE public.carousels ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'rascunho';
ALTER TABLE public.carousels ADD COLUMN IF NOT EXISTS scheduled_date TIMESTAMPTZ;
DROP POLICY IF EXISTS "Anyone can update carousels" ON public.carousels;
CREATE POLICY "Anyone can update carousels" ON public.carousels FOR UPDATE USING (true) WITH CHECK (true);