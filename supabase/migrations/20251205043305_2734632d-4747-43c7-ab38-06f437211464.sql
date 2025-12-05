-- =============================================
-- FIX: feed_posts - Remove public access, require authentication
-- =============================================

-- Drop existing overly permissive SELECT policies
DROP POLICY IF EXISTS "Anyone can view posts" ON feed_posts;
DROP POLICY IF EXISTS "Public view posts" ON feed_posts;

-- Create authenticated-only SELECT policy
CREATE POLICY "Authenticated users can view posts"
ON feed_posts FOR SELECT
TO authenticated
USING (true);

-- =============================================
-- FIX: feed_likes - Same issue (public access)
-- =============================================

-- Drop existing overly permissive SELECT policies
DROP POLICY IF EXISTS "Anyone can view likes" ON feed_likes;
DROP POLICY IF EXISTS "Public view likes" ON feed_likes;

-- Create authenticated-only SELECT policy
CREATE POLICY "Authenticated users can view likes"
ON feed_likes FOR SELECT
TO authenticated
USING (true);