-- ==============================================================================
-- Momented: Database Schema
-- ==============================================================================
-- Complete PostgreSQL schema definition for Momented (Editorial Photography
-- Journal, Wallpaper API & Studio CMS).
--
-- Adheres to Supabase & Postgres Best Practices:
-- - SECURITY INVOKER RPCs with SET search_path = '' and service_role-only grants
-- - Least Privilege principle: service_role only for state mutations & RPCs
-- - Partial nullable FK indexes and covering composite junction indexes
-- - Check & unique constraints ensuring domain integrity
-- - Full Row-Level Security (RLS) with explicit TO anon, authenticated read policies
-- - Stateful Admin Sessions with leaked-secret defense and Supabase Linter compliance
-- ==============================================================================

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
    CONSTRAINT photos_cloudinary_public_id_unique UNIQUE (cloudinary_public_id),
    CONSTRAINT photos_title_non_empty CHECK (char_length(btrim(title)) > 0),
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
    cover_photo_id UUID REFERENCES public.photos(id) ON DELETE SET NULL,
    CONSTRAINT collections_title_non_empty CHECK (char_length(btrim(title)) > 0)
);

-- Compositional Rule Collections (e.g., Leading Lines, Rule of Thirds)
CREATE TABLE IF NOT EXISTS public.rule_collections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    cover_photo_id UUID REFERENCES public.photos(id) ON DELETE SET NULL,
    CONSTRAINT rule_collections_title_non_empty CHECK (char_length(btrim(title)) > 0)
);

-- Calendar Month Collections (1 = January, 12 = December)
CREATE TABLE IF NOT EXISTS public.calendar_collections (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    cover_photo_id UUID REFERENCES public.photos(id) ON DELETE SET NULL,
    CONSTRAINT calendar_month_range CHECK (id BETWEEN 1 AND 12),
    CONSTRAINT calendar_collections_title_non_empty CHECK (char_length(btrim(title)) > 0)
);

-- Photographic Series (multi-photo visual essays)
CREATE TABLE IF NOT EXISTS public.series (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    cover_photo_id UUID REFERENCES public.photos(id) ON DELETE SET NULL,
    CONSTRAINT series_title_non_empty CHECK (char_length(btrim(title)) > 0)
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
    user_agent TEXT,
    CONSTRAINT admin_sessions_expiry_valid CHECK (expires_at > created_at)
);

-- ==============================================================================
-- 4. Initial Seed Data (Calendar Months)
-- ==============================================================================

INSERT INTO public.calendar_collections (id, title, description) VALUES
(1, 'January', NULL),
(2, 'February', NULL),
(3, 'March', NULL),
(4, 'April', NULL),
(5, 'May', NULL),
(6, 'June', NULL),
(7, 'July', NULL),
(8, 'August', NULL),
(9, 'September', NULL),
(10, 'October', NULL),
(11, 'November', NULL),
(12, 'December', NULL)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 5. Performance Indexes
-- ==============================================================================

-- Fast deterministic descending sort for gallery & feeds (leftmost prefix also covers created_at DESC)
CREATE INDEX IF NOT EXISTS idx_photos_created_at_id
    ON public.photos (created_at DESC, id DESC);

-- Composite index for taken_at with fallback to created_at
CREATE INDEX IF NOT EXISTS idx_photos_taken_at_created_at
    ON public.photos (taken_at DESC NULLS LAST, created_at DESC);

-- Covering composite junction indexes for reverse lookups and Index-Only Scans
CREATE INDEX IF NOT EXISTS idx_photo_collections_collection_photo
    ON public.photo_collections (collection_id, photo_id);

CREATE INDEX IF NOT EXISTS idx_collections_created_at_id
    ON public.collections (created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_collections_cover_photo_id
    ON public.collections (cover_photo_id)
    WHERE cover_photo_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_photo_rule_collections_rule_photo
    ON public.photo_rule_collections (rule_id, photo_id);

CREATE INDEX IF NOT EXISTS idx_rule_collections_created_at_id
    ON public.rule_collections (created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_rule_collections_cover_photo_id
    ON public.rule_collections (cover_photo_id)
    WHERE cover_photo_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_photo_calendar_collections_calendar_photo
    ON public.photo_calendar_collections (calendar_id, photo_id);

-- Series indexes
CREATE INDEX IF NOT EXISTS idx_series_created_at_id
    ON public.series (created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_series_cover_photo_id
    ON public.series (cover_photo_id)
    WHERE cover_photo_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_series_photos_order
    ON public.series_photos (series_id, position ASC)
    INCLUDE (photo_id);

CREATE INDEX IF NOT EXISTS idx_series_photos_photo_id
    ON public.series_photos (photo_id);

-- Admin session index for active session lookups and pruning
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at
    ON public.admin_sessions (expires_at);

-- ==============================================================================
-- 6. Atomic RPC Stored Procedures (service_role only, SECURITY INVOKER)
-- ==============================================================================

-- Atomically increment photo download count
CREATE OR REPLACE FUNCTION public.increment_downloads(row_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY INVOKER
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
SECURITY INVOKER
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
SECURITY INVOKER
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
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
    IF p_table_name = 'photo_collections' AND p_main_col IN ('photo_id', 'collection_id') AND p_target_col IN ('photo_id', 'collection_id') AND p_main_col <> p_target_col THEN
        IF p_main_col = 'photo_id' THEN
            DELETE FROM public.photo_collections WHERE photo_id = p_main_id::uuid;
            INSERT INTO public.photo_collections (photo_id, collection_id)
            SELECT p_main_id::uuid, u.target_id::uuid
            FROM unnest(COALESCE(p_target_ids, ARRAY[]::text[])) AS u(target_id)
            WHERE u.target_id IS NOT NULL AND btrim(u.target_id) <> ''
            ON CONFLICT DO NOTHING;
        ELSE
            DELETE FROM public.photo_collections WHERE collection_id = p_main_id::uuid;
            INSERT INTO public.photo_collections (collection_id, photo_id)
            SELECT p_main_id::uuid, u.target_id::uuid
            FROM unnest(COALESCE(p_target_ids, ARRAY[]::text[])) AS u(target_id)
            WHERE u.target_id IS NOT NULL AND btrim(u.target_id) <> ''
            ON CONFLICT DO NOTHING;
        END IF;
    ELSIF p_table_name = 'photo_rule_collections' AND p_main_col IN ('photo_id', 'rule_id') AND p_target_col IN ('photo_id', 'rule_id') AND p_main_col <> p_target_col THEN
        IF p_main_col = 'photo_id' THEN
            DELETE FROM public.photo_rule_collections WHERE photo_id = p_main_id::uuid;
            INSERT INTO public.photo_rule_collections (photo_id, rule_id)
            SELECT p_main_id::uuid, u.target_id::uuid
            FROM unnest(COALESCE(p_target_ids, ARRAY[]::text[])) AS u(target_id)
            WHERE u.target_id IS NOT NULL AND btrim(u.target_id) <> ''
            ON CONFLICT DO NOTHING;
        ELSE
            DELETE FROM public.photo_rule_collections WHERE rule_id = p_main_id::uuid;
            INSERT INTO public.photo_rule_collections (rule_id, photo_id)
            SELECT p_main_id::uuid, u.target_id::uuid
            FROM unnest(COALESCE(p_target_ids, ARRAY[]::text[])) AS u(target_id)
            WHERE u.target_id IS NOT NULL AND btrim(u.target_id) <> ''
            ON CONFLICT DO NOTHING;
        END IF;
    ELSIF p_table_name = 'photo_calendar_collections' AND p_main_col IN ('photo_id', 'calendar_id') AND p_target_col IN ('photo_id', 'calendar_id') AND p_main_col <> p_target_col THEN
        IF p_main_col = 'photo_id' THEN
            DELETE FROM public.photo_calendar_collections WHERE photo_id = p_main_id::uuid;
            INSERT INTO public.photo_calendar_collections (photo_id, calendar_id)
            SELECT p_main_id::uuid, u.target_id::integer
            FROM unnest(COALESCE(p_target_ids, ARRAY[]::text[])) AS u(target_id)
            WHERE u.target_id IS NOT NULL AND btrim(u.target_id) <> ''
            ON CONFLICT DO NOTHING;
        ELSE
            DELETE FROM public.photo_calendar_collections WHERE calendar_id = p_main_id::integer;
            INSERT INTO public.photo_calendar_collections (calendar_id, photo_id)
            SELECT p_main_id::integer, u.target_id::uuid
            FROM unnest(COALESCE(p_target_ids, ARRAY[]::text[])) AS u(target_id)
            WHERE u.target_id IS NOT NULL AND btrim(u.target_id) <> ''
            ON CONFLICT DO NOTHING;
        END IF;
    ELSE
        RAISE EXCEPTION 'Invalid junction configuration: table=%, main=%, target=%', p_table_name, p_main_col, p_target_col;
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

-- Public read-only policies for editorial content (explicit TO anon, authenticated)
DROP POLICY IF EXISTS "Public read access for photos" ON public.photos;
CREATE POLICY "Public read access for photos"
    ON public.photos FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public read access for collections" ON public.collections;
CREATE POLICY "Public read access for collections"
    ON public.collections FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public read access for rule_collections" ON public.rule_collections;
CREATE POLICY "Public read access for rule_collections"
    ON public.rule_collections FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public read access for calendar_collections" ON public.calendar_collections;
CREATE POLICY "Public read access for calendar_collections"
    ON public.calendar_collections FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public read access for photo_collections" ON public.photo_collections;
CREATE POLICY "Public read access for photo_collections"
    ON public.photo_collections FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public read access for photo_rule_collections" ON public.photo_rule_collections;
CREATE POLICY "Public read access for photo_rule_collections"
    ON public.photo_rule_collections FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public read access for photo_calendar_collections" ON public.photo_calendar_collections;
CREATE POLICY "Public read access for photo_calendar_collections"
    ON public.photo_calendar_collections FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public read access for series" ON public.series;
CREATE POLICY "Public read access for series"
    ON public.series FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public read access for series_photos" ON public.series_photos;
CREATE POLICY "Public read access for series_photos"
    ON public.series_photos FOR SELECT TO anon, authenticated USING (true);

-- Restrict admin_sessions completely from public API
REVOKE ALL ON public.admin_sessions FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.admin_sessions TO service_role;

-- Explicit policy to satisfy Supabase Linter (0008_rls_enabled_no_policy)
DROP POLICY IF EXISTS "Deny direct public access" ON public.admin_sessions;
CREATE POLICY "Deny direct public access"
    ON public.admin_sessions
    FOR ALL
    TO PUBLIC
    USING (false)
    WITH CHECK (false);

-- ==============================================================================
-- 8. Refresh Schema Cache
-- ==============================================================================

NOTIFY pgrst, 'reload schema';
