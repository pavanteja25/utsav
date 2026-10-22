-- ==============================================================================
-- THE UTSAV HOUSE - SUPABASE DATABASE & STORAGE SCHEMA
-- ==============================================================================
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- It creates all required tables, Row Level Security (RLS) policies, storage buckets,
-- and seeds the initial categories, site images, and testimonials.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. SITE SETTINGS TABLE (Whole website images & global branding)
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'global_settings',
    hero_image TEXT NOT NULL DEFAULT '/images/hero-wedding-garden.webp',
    hero_image_alt TEXT DEFAULT 'Ivory floral wedding mandap beside a lake in the warm evening light',
    hero_eyebrow TEXT DEFAULT 'EVENT PLANNING & DESIGN · INDIA',
    hero_title TEXT DEFAULT 'Moments that stay forever.',
    hero_description TEXT DEFAULT 'Thoughtfully planned. Beautifully designed. We turn your special moments into unforgettable memories.',
    story_image_1 TEXT DEFAULT '/images/event-100.jpg',
    story_image_2 TEXT DEFAULT '/images/event-101.jpg',
    about_image TEXT DEFAULT '/images/event-109.jpg',
    contact_image TEXT DEFAULT '/images/wedding-day-decor/wedding-day-decor-01.jpeg',
    instagram_handle TEXT DEFAULT '@the_utsavhouse',
    instagram_url TEXT DEFAULT 'https://www.instagram.com/the_utsavhouse/',
    email_address TEXT DEFAULT 'theutsavhouse@gmail.com',
    phone_primary TEXT DEFAULT '+91 96768 37722',
    phone_secondary TEXT DEFAULT '+91 96768 47722',
    admin_passcode TEXT DEFAULT 'utsav2026',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. CATEGORIES TABLE (Dynamic category names, slugs, descriptions & order)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    parent_slug TEXT,
    description TEXT,
    cover_image TEXT,
    cover_alt TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. GALLERY & SECTION IMAGES TABLE (Segregated by category with cache busting)
CREATE TABLE IF NOT EXISTS public.gallery_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_slug TEXT NOT NULL REFERENCES public.categories(slug) ON UPDATE CASCADE ON DELETE CASCADE,
    src TEXT NOT NULL,
    alt TEXT DEFAULT 'The Utsav House inspiration',
    caption TEXT,
    display_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TESTIMONIALS TABLE
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_name TEXT NOT NULL,
    event_type TEXT NOT NULL DEFAULT 'Wedding',
    quote TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    is_visible BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- 7. RLS POLICIES
-- Allow public (anon + authenticated) to READ all active website content
DROP POLICY IF EXISTS "Public can read site settings" ON public.site_settings;
CREATE POLICY "Public can read site settings" ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can update site settings" ON public.site_settings;
CREATE POLICY "Public can update site settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read categories" ON public.categories;
CREATE POLICY "Public can read categories" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can manage categories" ON public.categories;
CREATE POLICY "Public can manage categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read gallery images" ON public.gallery_images;
CREATE POLICY "Public can read gallery images" ON public.gallery_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can manage gallery images" ON public.gallery_images;
CREATE POLICY "Public can manage gallery images" ON public.gallery_images FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read testimonials" ON public.testimonials;
CREATE POLICY "Public can read testimonials" ON public.testimonials FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can manage testimonials" ON public.testimonials;
CREATE POLICY "Public can manage testimonials" ON public.testimonials FOR ALL USING (true) WITH CHECK (true);

-- 8. STORAGE BUCKET FOR IMAGE UPLOADS
-- Creates the 'utsav-media' bucket if it doesn't already exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('utsav-media', 'utsav-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS: allow public access to view and upload images
DROP POLICY IF EXISTS "Public can view utsav media" ON storage.objects;
CREATE POLICY "Public can view utsav media" ON storage.objects
FOR SELECT USING (bucket_id = 'utsav-media');

DROP POLICY IF EXISTS "Public can upload utsav media" ON storage.objects;
CREATE POLICY "Public can upload utsav media" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'utsav-media');

DROP POLICY IF EXISTS "Public can update utsav media" ON storage.objects;
CREATE POLICY "Public can update utsav media" ON storage.objects
FOR UPDATE USING (bucket_id = 'utsav-media');

DROP POLICY IF EXISTS "Public can delete utsav media" ON storage.objects;
CREATE POLICY "Public can delete utsav media" ON storage.objects
FOR DELETE USING (bucket_id = 'utsav-media');

-- 9. SEED INITIAL DATA
-- Initial Site Settings
INSERT INTO public.site_settings (id, hero_image, hero_image_alt, hero_eyebrow, hero_title, hero_description, story_image_1, story_image_2, about_image, contact_image, admin_passcode)
VALUES (
    'global_settings',
    '/images/hero-wedding-garden.webp',
    'Ivory floral wedding mandap beside a lake in the warm evening light',
    'EVENT PLANNING & DESIGN · INDIA',
    'Moments that stay forever.',
    'Thoughtfully planned. Beautifully designed. We turn your special moments into unforgettable memories.',
    '/images/event-100.jpg',
    '/images/event-101.jpg',
    '/images/event-109.jpg',
    '/images/wedding-day-decor/wedding-day-decor-01.jpeg',
    'utsav2026'
)
ON CONFLICT (id) DO NOTHING;

-- Initial Main Categories
INSERT INTO public.categories (slug, title, parent_slug, description, cover_image, cover_alt, display_order)
VALUES
    ('wedding-decor', 'Wedding Decor', NULL, 'From intimate pre-wedding rituals to grand mandaps, every setting honours your traditions and tells your love story.', '/images/wedding-day-decor/wedding-day-decor-01.jpeg', 'Sunlit courtyard entrance arch with scalloped frame and hanging floral bells', 1),
    ('birthday-decor', 'Birthday Decor', NULL, 'A little wonder, a lot of joy. Thoughtful themes, custom backdrops, artistic floral installations and vibrant celebratory touches.', '/images/birthday-decor/birthday-01.jpeg', 'Enchanted pastel fairytale birthday celebration with floral plinths and personalized signage', 2),
    ('traditional-celebrations', 'Traditional Celebrations', NULL, 'From Sankranti and Ugadi to Diwali and sacred rituals, celebrating the rich colours, fragrant marigolds, and sacred togetherness of our heritage.', '/images/traditional-celebrations/traditional-01.jpeg', 'Heritage brass swing cradle ceremony adorned with lotus buds and marigolds', 3),
    ('house-celebrations', 'House Celebrations', NULL, 'The warmth of home, thoughtfully celebrated. Intimate poojas, housewarming ceremonies, and beautiful family gatherings.', '/images/house-celebrations/house-01.jpeg', 'Intimate home pooja and housewarming setup with brass pestle, mortar, and floral grinding stones', 4)
ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title, description = EXCLUDED.description, cover_image = EXCLUDED.cover_image;

-- Initial Subcategories (Weddings)
INSERT INTO public.categories (slug, title, parent_slug, description, cover_image, cover_alt, display_order)
VALUES
    ('wedding-day-decor', 'Wedding Day Decor', 'wedding-decor', 'From the mandap to the smallest table detail, a setting that honours your traditions and tells your story.', '/images/wedding-day-decor/wedding-day-decor-01.jpeg', 'Wedding Day Decor', 1),
    ('engagement', 'Engagement', 'wedding-decor', 'The first promise deserves a beautiful setting. Bespoke floral backdrops, intimate seating, and a celebration that feels like you.', '/images/event-112.jpg', 'Engagement Stage Decor', 2),
    ('reception', 'Reception', 'wedding-decor', 'Grand stages, enchanting ambient lighting, and opulent floral statements to celebrate your new beginning with everyone you cherish.', '/images/event-103.jpg', 'Reception Decor', 3),
    ('pellikoduku-pellikuthuru', 'Pellikoduku & Pellikuthuru', 'wedding-decor', 'Honouring the bride and groom’s sacred new beginnings with rich Telugu traditions, fragrant flowers, and the warmth of family.', '/images/event-106.jpg', 'Telugu Wedding Traditions Decor', 4),
    ('haldi', 'Haldi', 'wedding-decor', 'Sunshine, marigolds and a little mischief. A bright, playful setting for your happiest pre-wedding moments.', '/images/event-105.jpg', 'Haldi Ceremony Decor', 5),
    ('mehendi', 'Mehendi', 'wedding-decor', 'Vibrant hues, fragrant henna, and playful festivities. A celebratory setting adorned with floral swings, colorful drapes, and joyful energy.', '/images/event-104.jpg', 'Mehendi Decor', 6),
    ('sangeeth', 'Sangeeth', 'wedding-decor', 'A stage for your favourite people and your favourite songs. Rich colours, glowing lights and an unforgettable evening.', '/images/event-102.jpg', 'Sangeeth Night Decor', 7)
ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title, description = EXCLUDED.description;

-- Initial Testimonials
INSERT INTO public.testimonials (client_name, event_type, quote, rating, is_visible, display_order)
VALUES
    ('Ananya & Karthik', 'Wedding', 'Every little detail felt like us. The colours, the flowers, the entire feeling — simply beautiful.', 5, true, 1),
    ('Srinivas Rao Family', 'Family celebration', 'Our traditions were at the heart of everything. It felt warm, personal and wonderfully effortless.', 5, true, 2),
    ('Deepika & Rohit', 'Engagement', 'From the first idea to the final candle, our celebration came together so thoughtfully.', 5, true, 3);
