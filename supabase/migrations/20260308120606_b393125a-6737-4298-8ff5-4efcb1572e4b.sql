
-- Fix: replace recursive RLS on profiles with a security definer function

-- 1. Create a security definer function to check role (avoids recursion)
CREATE OR REPLACE FUNCTION public.get_user_role(uid UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = uid LIMIT 1;
$$;

-- 2. Drop all existing profiles policies that cause recursion
DROP POLICY IF EXISTS "profiles_select_own_or_warden" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_warden" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;

-- 3. Recreate policies using the security definer function (no recursion)
CREATE POLICY "profiles_select"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.get_user_role(auth.uid()) = 'warden'
  );

CREATE POLICY "profiles_insert"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update"
  ON public.profiles FOR UPDATE
  USING (
    auth.uid() = user_id
    OR public.get_user_role(auth.uid()) = 'warden'
  );

-- 4. Also fix other tables that reference profiles for warden check
-- Complaints
DROP POLICY IF EXISTS "complaints_select" ON public.complaints;
DROP POLICY IF EXISTS "complaints_insert_student" ON public.complaints;
DROP POLICY IF EXISTS "complaints_update_warden" ON public.complaints;

CREATE POLICY "complaints_select"
  ON public.complaints FOR SELECT
  USING (
    student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR public.get_user_role(auth.uid()) = 'warden'
  );

CREATE POLICY "complaints_insert_student"
  ON public.complaints FOR INSERT
  WITH CHECK (
    student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "complaints_update_warden"
  ON public.complaints FOR UPDATE
  USING (public.get_user_role(auth.uid()) = 'warden');

-- Visitor requests
DROP POLICY IF EXISTS "visitor_requests_select" ON public.visitor_requests;
DROP POLICY IF EXISTS "visitor_requests_insert_student" ON public.visitor_requests;
DROP POLICY IF EXISTS "visitor_requests_update_warden" ON public.visitor_requests;

CREATE POLICY "visitor_requests_select"
  ON public.visitor_requests FOR SELECT
  USING (
    student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR public.get_user_role(auth.uid()) = 'warden'
  );

CREATE POLICY "visitor_requests_insert_student"
  ON public.visitor_requests FOR INSERT
  WITH CHECK (
    student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "visitor_requests_update_warden"
  ON public.visitor_requests FOR UPDATE
  USING (public.get_user_role(auth.uid()) = 'warden');

-- Bookings
DROP POLICY IF EXISTS "bookings_select_warden" ON public.bookings;
DROP POLICY IF EXISTS "bookings_update_warden" ON public.bookings;

CREATE POLICY "bookings_select_warden"
  ON public.bookings FOR SELECT
  USING (public.get_user_role(auth.uid()) = 'warden');

CREATE POLICY "bookings_update_warden"
  ON public.bookings FOR UPDATE
  USING (public.get_user_role(auth.uid()) = 'warden');

-- Notices
DROP POLICY IF EXISTS "notices_select_authenticated" ON public.notices;
DROP POLICY IF EXISTS "notices_insert_warden" ON public.notices;
DROP POLICY IF EXISTS "notices_update_warden" ON public.notices;
DROP POLICY IF EXISTS "notices_delete_warden" ON public.notices;

CREATE POLICY "notices_select_authenticated"
  ON public.notices FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "notices_insert_warden"
  ON public.notices FOR INSERT
  WITH CHECK (public.get_user_role(auth.uid()) = 'warden');

CREATE POLICY "notices_update_warden"
  ON public.notices FOR UPDATE
  USING (public.get_user_role(auth.uid()) = 'warden');

CREATE POLICY "notices_delete_warden"
  ON public.notices FOR DELETE
  USING (public.get_user_role(auth.uid()) = 'warden');
