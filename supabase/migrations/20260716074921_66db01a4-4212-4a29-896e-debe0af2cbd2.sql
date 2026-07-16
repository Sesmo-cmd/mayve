
CREATE TABLE public.site_content (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read site content" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "admins insert site content" ON public.site_content FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "admins update site content" ON public.site_content FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "admins delete site content" ON public.site_content FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER site_content_set_updated_at BEFORE UPDATE ON public.site_content FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.site_content (key, value) VALUES
  ('home.hero.tag', 'New Collection'),
  ('home.hero.title', 'Comfort Meets <em>Bold</em> Elegance'),
  ('home.hero.description', 'Designed for the modern woman who refuses to choose between looking good and feeling free.'),
  ('home.hero.cta', 'Explore Collection'),
  ('home.about.eyebrow', 'Our Story'),
  ('home.about.title', 'Freedom in Movement & <em>Expression</em>'),
  ('home.about.description', 'Mayve is a contemporary made-to-order brand rooted in the belief that style should never come at the expense of comfort. For the modern, multi-dimensional woman.'),
  ('home.newarrivals.title', 'New Arrivals'),
  ('home.offset.title', 'The Offset Collection'),
  ('home.velora.title', 'Velora — Elevated Occasion'),
  ('tee.hero.eyebrow', 'Collection'),
  ('tee.hero.title', 'Mayve <em>Tee</em>'),
  ('tee.hero.description', 'Unisex essentials crafted for comfort and bold simplicity. Each piece is made to order — thoughtfully produced just for you.'),
  ('tee.footer.note', 'All pieces made to order · Production: 10–12 business days'),
  ('tee.footer.cta', 'Place an Order'),
  ('bespoke.hero.eyebrow', 'Portfolio'),
  ('bespoke.hero.title', 'Bespoke <em>Portfolio</em>'),
  ('bespoke.hero.description', 'An exclusive look into Mayve''s bespoke world — where ideas are transformed into refined, made-to-measure pieces. From initial concept to the final garment, each design reflects individuality, precision, and craftsmanship.'),
  ('bespoke.hero.cta', 'Ready to Create Something Uniquely Yours?'),
  ('bespoke.velora.title', 'Velora Collection');
