CREATE TABLE public.carousels (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  topic text NOT NULL,
  style text NOT NULL,
  slides jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.carousels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read carousels" ON public.carousels FOR SELECT USING (true);
CREATE POLICY "Anyone can insert carousels" ON public.carousels FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete carousels" ON public.carousels FOR DELETE USING (true);