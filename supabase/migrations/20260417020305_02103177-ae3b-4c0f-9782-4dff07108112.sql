INSERT INTO storage.buckets (id, name, public) VALUES ('video-clips', 'video-clips', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public read video-clips" ON storage.objects FOR SELECT USING (bucket_id = 'video-clips');
CREATE POLICY "Allow upload video-clips" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'video-clips');
CREATE POLICY "Allow delete video-clips" ON storage.objects FOR DELETE USING (bucket_id = 'video-clips');