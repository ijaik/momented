-- ==============================================================================
-- Momented: Database Schema
-- ==============================================================================
-- Complete PostgreSQL schema definition for Momented (Editorial Photography
-- Journal, Wallpaper API & Studio CMS).
--
-- Adheres to Supabase & Postgres Best Practices:
-- - Hardened SECURITY DEFINER RPCs with SET search_path = ''
-- - Least Privilege principle: Service-role only for state mutations & RPCs
-- - Comprehensive Foreign Key & performance ordering indexes
-- - Check constraints ensuring domain integrity (positive dimensions, non-negative stats)
-- - Full Row-Level Security (RLS) with explicit public read access for editorial content
-- - Stateful Admin Sessions with leaked-secret defense and Supabase Linter compliance
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. Core Tables
-- ==============================================================================

-- Photos Table
CREATE TABLE IF NOT EXISTS public.photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    cloudinary_url TEXT NOT NULL,
    cloudinary_public_id TEXT NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    camera_make TEXT,
    camera_model TEXT,
    focal_length TEXT,
    aperture TEXT,
    shutter_speed TEXT,
    iso INTEGER,
    artist TEXT,
    taken_at TIMESTAMP WITH TIME ZONE,
    downloads INTEGER NOT NULL DEFAULT 0,
    shares INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT photos_width_positive CHECK (width > 0),
    CONSTRAINT photos_height_positive CHECK (height > 0),
    CONSTRAINT photos_iso_positive CHECK (iso IS NULL OR iso > 0),
    CONSTRAINT photos_downloads_non_negative CHECK (downloads >= 0),
    CONSTRAINT photos_shares_non_negative CHECK (shares >= 0)
);

-- Thematic Collections
CREATE TABLE IF NOT EXISTS public.collections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    cover_photo_id UUID REFERENCES public.photos(id) ON DELETE SET NULL
);

-- Compositional Rule Collections (e.g., Leading Lines, Rule of Thirds)
CREATE TABLE IF NOT EXISTS public.rule_collections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    cover_photo_id UUID REFERENCES public.photos(id) ON DELETE SET NULL
);

-- Calendar Month Collections (1 = January, 12 = December)
CREATE TABLE IF NOT EXISTS public.calendar_collections (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    cover_photo_id UUID REFERENCES public.photos(id) ON DELETE SET NULL,
    CONSTRAINT calendar_month_range CHECK (id BETWEEN 1 AND 12)
);

-- Photographic Series (multi-photo visual essays)
CREATE TABLE IF NOT EXISTS public.series (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    cover_photo_id UUID REFERENCES public.photos(id) ON DELETE SET NULL
);

-- ==============================================================================
-- 2. Junction Tables (Many-to-Many)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.photo_collections (
    photo_id UUID NOT NULL REFERENCES public.photos(id) ON DELETE CASCADE,
    collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
    PRIMARY KEY (photo_id, collection_id)
);

CREATE TABLE IF NOT EXISTS public.photo_rule_collections (
    photo_id UUID NOT NULL REFERENCES public.photos(id) ON DELETE CASCADE,
    rule_id UUID NOT NULL REFERENCES public.rule_collections(id) ON DELETE CASCADE,
    PRIMARY KEY (photo_id, rule_id)
);

CREATE TABLE IF NOT EXISTS public.photo_calendar_collections (
    photo_id UUID NOT NULL REFERENCES public.photos(id) ON DELETE CASCADE,
    calendar_id INTEGER NOT NULL REFERENCES public.calendar_collections(id) ON DELETE CASCADE,
    PRIMARY KEY (photo_id, calendar_id)
);

CREATE TABLE IF NOT EXISTS public.series_photos (
    series_id UUID NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
    photo_id UUID NOT NULL REFERENCES public.photos(id) ON DELETE CASCADE,
    position INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (series_id, photo_id),
    CONSTRAINT series_photos_position_non_negative CHECK (position >= 0)
);

-- ==============================================================================
-- 3. Admin Authentication & Stateful Sessions
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.admin_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address TEXT,
    user_agent TEXT
);

-- ==============================================================================
-- 4. Initial Seed Data (Calendar Months)
-- ==============================================================================

INSERT INTO public.calendar_collections (id, title, description) VALUES
(1, 'January', 'Winter clarity and quiet beginnings.'),
(2, 'February', 'Muted tones, fleeting frost, and late winter light.'),
(3, 'March', 'Early thaw, shifting seasons, and returning daylight.'),
(4, 'April', 'Spring blooms, rain-washed streets, and fresh contrasts.'),
(5, 'May', 'Lush foliage, golden hour evenings, and vibrant life.'),
(6, 'June', 'Solstice warmth, deep shadows, and open skies.'),
(7, 'July', 'High summer sun, coastal horizons, and vivid warmth.'),
(8, 'August', 'Hazy afternoons, amber twilights, and late summer calm.'),
(9, 'September', 'Autumn equinox, golden foliage, and softening shadows.'),
(10, 'October', 'Crisp air, dramatic dusk, and earthy textures.'),
(11, 'November', 'Late fall mood, mist, monochrome branches, and twilight.'),
(12, 'December', 'Winter reflections, celebratory lights, and year-end quietude.')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 5. Performance Indexes
-- ==============================================================================

-- Fast descending sort for gallery & feeds (leftmost prefix also covers created_at DESC)
CREATE INDEX IF NOT EXISTS idx_photos_created_at_id 
    ON public.photos (created_at DESC, id DESC);

-- Composite index for taken_at with fallback to created_at
CREATE INDEX IF NOT EXISTS idx_photos_taken_at_created_at 
    ON public.photos (taken_at DESC NULLS LAST, created_at DESC);

-- Junction lookups by collection / rule / calendar
CREATE INDEX IF NOT EXISTS idx_photo_collections_collection_id 
    ON public.photo_collections (collection_id);

CREATE INDEX IF NOT EXISTS idx_collections_created_at 
    ON public.collections (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_collections_cover_photo_id 
    ON public.collections (cover_photo_id);

CREATE INDEX IF NOT EXISTS idx_photo_rule_collections_rule_id 
    ON public.photo_rule_collections (rule_id);

CREATE INDEX IF NOT EXISTS idx_rule_collections_created_at 
    ON public.rule_collections (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_rule_collections_cover_photo_id 
    ON public.rule_collections (cover_photo_id);

CREATE INDEX IF NOT EXISTS idx_photo_calendar_collections_calendar_id 
    ON public.photo_calendar_collections (calendar_id);

-- Series indexes
CREATE INDEX IF NOT EXISTS idx_series_created_at 
    ON public.series (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_series_cover_photo_id 
    ON public.series (cover_photo_id);

CREATE INDEX IF NOT EXISTS idx_series_photos_order 
    ON public.series_photos (series_id, position ASC);

CREATE INDEX IF NOT EXISTS idx_series_photos_photo_id 
    ON public.series_photos (photo_id);

-- Admin session index for active session lookups and pruning
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at 
    ON public.admin_sessions (expires_at);

-- ==============================================================================
-- 6. Atomic RPC Stored Procedures
-- ==============================================================================

-- Atomically increment photo download count
CREATE OR REPLACE FUNCTION public.increment_downloads(row_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    new_count INTEGER;
BEGIN
    UPDATE public.photos
    SET downloads = downloads + 1
    WHERE id = row_id
    RETURNING downloads INTO new_count;
    RETURN new_count;
END;
$$;

-- Atomically increment photo share count
CREATE OR REPLACE FUNCTION public.increment_shares(row_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    new_count INTEGER;
BEGIN
    UPDATE public.photos
    SET shares = shares + 1
    WHERE id = row_id
    RETURNING shares INTO new_count;
    RETURN new_count;
END;
$$;

-- Atomically replace and reorder series photo slides
CREATE OR REPLACE FUNCTION public.replace_series_photos(
    p_series_id UUID,
    p_photo_ids UUID[],
    p_positions INTEGER[]
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF cardinality(p_photo_ids) <> cardinality(p_positions) THEN
        RAISE EXCEPTION 'p_photo_ids and p_positions length mismatch';
    END IF;
    DELETE FROM public.series_photos WHERE series_id = p_series_id;
    IF cardinality(p_photo_ids) > 0 THEN
        INSERT INTO public.series_photos (series_id, photo_id, position)
        SELECT p_series_id, u.photo_id, u.position
        FROM unnest(p_photo_ids, p_positions) AS u(photo_id, position)
        ON CONFLICT (series_id, photo_id) DO UPDATE SET position = EXCLUDED.position;
    END IF;
END;
$$;

-- Atomically replace junction associations for collections / rules / calendar
CREATE OR REPLACE FUNCTION public.replace_photo_junctions(
    p_table_name TEXT,
    p_main_col TEXT,
    p_main_id TEXT,
    p_target_col TEXT,
    p_target_ids TEXT[]
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF p_table_name = 'photo_collections' THEN
        IF p_main_col = 'photo_id' AND p_target_col = 'collection_id' THEN
            DELETE FROM public.photo_collections WHERE photo_id = p_main_id::uuid;
            IF cardinality(p_target_ids) > 0 THEN
                INSERT INTO public.photo_collections (photo_id, collection_id)
                SELECT p_main_id::uuid, u.target_id::uuid
                FROM unnest(p_target_ids) AS u(target_id)
                WHERE u.target_id IS NOT NULL AND trim(u.target_id) <> ''
                ON CONFLICT DO NOTHING;
            END IF;
        ELSIF p_main_col = 'collection_id' AND p_target_col = 'photo_id' THEN
            DELETE FROM public.photo_collections WHERE collection_id = p_main_id::uuid;
            IF cardinality(p_target_ids) > 0 THEN
                INSERT INTO public.photo_collections (collection_id, photo_id)
                SELECT p_main_id::uuid, u.target_id::uuid
                FROM unnest(p_target_ids) AS u(target_id)
                WHERE u.target_id IS NOT NULL AND trim(u.target_id) <> ''
                ON CONFLICT DO NOTHING;
            END IF;
        ELSE
            RAISE EXCEPTION 'Invalid columns for photo_collections: %, %', p_main_col, p_target_col;
        END IF;
    ELSIF p_table_name = 'photo_rule_collections' THEN
        IF p_main_col = 'photo_id' AND p_target_col = 'rule_id' THEN
            DELETE FROM public.photo_rule_collections WHERE photo_id = p_main_id::uuid;
            IF cardinality(p_target_ids) > 0 THEN
                INSERT INTO public.photo_rule_collections (photo_id, rule_id)
                SELECT p_main_id::uuid, u.target_id::uuid
                FROM unnest(p_target_ids) AS u(target_id)
                WHERE u.target_id IS NOT NULL AND trim(u.target_id) <> ''
                ON CONFLICT DO NOTHING;
            END IF;
        ELSIF p_main_col = 'rule_id' AND p_target_col = 'photo_id' THEN
            DELETE FROM public.photo_rule_collections WHERE rule_id = p_main_id::uuid;
            IF cardinality(p_target_ids) > 0 THEN
                INSERT INTO public.photo_rule_collections (rule_id, photo_id)
                SELECT p_main_id::uuid, u.target_id::uuid
                FROM unnest(p_target_ids) AS u(target_id)
                WHERE u.target_id IS NOT NULL AND trim(u.target_id) <> ''
                ON CONFLICT DO NOTHING;
            END IF;
        ELSE
            RAISE EXCEPTION 'Invalid columns for photo_rule_collections: %, %', p_main_col, p_target_col;
        END IF;
    ELSIF p_table_name = 'photo_calendar_collections' THEN
        IF p_main_col = 'photo_id' AND p_target_col = 'calendar_id' THEN
            DELETE FROM public.photo_calendar_collections WHERE photo_id = p_main_id::uuid;
            IF cardinality(p_target_ids) > 0 THEN
                INSERT INTO public.photo_calendar_collections (photo_id, calendar_id)
                SELECT p_main_id::uuid, u.target_id::integer
                FROM unnest(p_target_ids) AS u(target_id)
                WHERE u.target_id IS NOT NULL AND trim(u.target_id) <> ''
                ON CONFLICT DO NOTHING;
            END IF;
        ELSIF p_main_col = 'calendar_id' AND p_target_col = 'photo_id' THEN
            DELETE FROM public.photo_calendar_collections WHERE calendar_id = p_main_id::integer;
            IF cardinality(p_target_ids) > 0 THEN
                INSERT INTO public.photo_calendar_collections (calendar_id, photo_id)
                SELECT p_main_id::integer, u.target_id::uuid
                FROM unnest(p_target_ids) AS u(target_id)
                WHERE u.target_id IS NOT NULL AND trim(u.target_id) <> ''
                ON CONFLICT DO NOTHING;
            END IF;
        ELSE
            RAISE EXCEPTION 'Invalid columns for photo_calendar_collections: %, %', p_main_col, p_target_col;
        END IF;
    ELSE
        RAISE EXCEPTION 'Invalid junction table name: %', p_table_name;
    END IF;
END;
$$;

-- Protect RPC execution: allow service_role only (server actions execute with SUPABASE_SECRET_KEY)
REVOKE EXECUTE ON FUNCTION public.increment_downloads(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_downloads(UUID) TO service_role;

REVOKE EXECUTE ON FUNCTION public.increment_shares(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_shares(UUID) TO service_role;

REVOKE EXECUTE ON FUNCTION public.replace_series_photos(UUID, UUID[], INTEGER[]) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.replace_series_photos(UUID, UUID[], INTEGER[]) TO service_role;

REVOKE EXECUTE ON FUNCTION public.replace_photo_junctions(TEXT, TEXT, TEXT, TEXT, TEXT[]) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.replace_photo_junctions(TEXT, TEXT, TEXT, TEXT, TEXT[]) TO service_role;

-- ==============================================================================
-- 7. Permissions & Row-Level Security (RLS)
-- ==============================================================================

-- Restrict base table mutation privileges for anon and authenticated
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon, authenticated;

-- Enable RLS across all tables
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rule_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_rule_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_calendar_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- Public read-only policies for editorial content
CREATE POLICY "Public read access for photos" 
    ON public.photos FOR SELECT USING (true);

CREATE POLICY "Public read access for collections" 
    ON public.collections FOR SELECT USING (true);

CREATE POLICY "Public read access for rule_collections" 
    ON public.rule_collections FOR SELECT USING (true);

CREATE POLICY "Public read access for calendar_collections" 
    ON public.calendar_collections FOR SELECT USING (true);

CREATE POLICY "Public read access for photo_collections" 
    ON public.photo_collections FOR SELECT USING (true);

CREATE POLICY "Public read access for photo_rule_collections" 
    ON public.photo_rule_collections FOR SELECT USING (true);

CREATE POLICY "Public read access for photo_calendar_collections" 
    ON public.photo_calendar_collections FOR SELECT USING (true);

CREATE POLICY "Public read access for series" 
    ON public.series FOR SELECT USING (true);

CREATE POLICY "Public read access for series_photos" 
    ON public.series_photos FOR SELECT USING (true);

-- Restrict admin_sessions completely from public API
REVOKE ALL ON public.admin_sessions FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.admin_sessions TO service_role;

-- Explicit policy to satisfy Supabase Linter (0008_rls_enabled_no_policy)
DROP POLICY IF EXISTS "Deny direct public access" ON public.admin_sessions;
CREATE POLICY "Deny direct public access" 
    ON public.admin_sessions 
    FOR ALL 
    TO PUBLIC 
    USING (false);

-- ==============================================================================
-- 8. Refresh Schema Cache
-- ==============================================================================

NOTIFY pgrst, 'reload schema';
