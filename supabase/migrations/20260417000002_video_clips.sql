CREATE TABLE IF NOT EXISTS public.video_clips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  youtube_url TEXT NOT NULL,
  video_title TEXT,
  thumbnail_url TEXT,
  start_time INTEGER NOT NULL DEFAULT 0,
  end_time INTEGER NOT NULL DEFAULT 15,
  format TEXT NOT NULL DEFAULT 'reels',
  crop_position TEXT NOT NULL DEFAULT 'center',
  text_overlay JSONB,
  quality TEXT NOT NULL DEFAULT '1080p',
  status TEXT NOT NULL DEFAULT 'pending',
  output_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.video_clips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on video_clips" ON public.video_clips FOR ALL USING (true) WITH CHECK (true);
