
-- ============================================================
-- MAJESTIC GIRLS HOSTEL — Full Stack Schema
-- ============================================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'warden')),
  room_number TEXT,
  phone TEXT,
  university TEXT,
  cnic TEXT,
  guardian TEXT,
  guardian_phone TEXT,
  fee_status TEXT NOT NULL DEFAULT 'Pending' CHECK (fee_status IN ('Paid', 'Pending')),
  booking_status TEXT NOT NULL DEFAULT 'Active' CHECK (booking_status IN ('Active', 'Pending', 'Approved')),
  join_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own_or_warden"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles p2
      WHERE p2.user_id = auth.uid() AND p2.role = 'warden'
    )
  );

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "profiles_update_warden"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p2
      WHERE p2.user_id = auth.uid() AND p2.role = 'warden'
    )
  );

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- 2. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  cnic TEXT,
  university TEXT NOT NULL,
  guardian TEXT,
  guardian_phone TEXT,
  room_type TEXT NOT NULL,
  move_in_date DATE,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Rejected')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bookings_insert_anyone"
  ON public.bookings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "bookings_select_warden"
  ON public.bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'warden'
    )
  );

CREATE POLICY "bookings_update_warden"
  ON public.bookings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'warden'
    )
  );


-- 3. COMPLAINTS TABLE
CREATE TABLE IF NOT EXISTS public.complaints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Resolved')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "complaints_select"
  ON public.complaints FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.role = 'warden'
    )
  );

CREATE POLICY "complaints_insert_student"
  ON public.complaints FOR INSERT
  WITH CHECK (
    student_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "complaints_update_warden"
  ON public.complaints FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.role = 'warden'
    )
  );


-- 4. VISITOR REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.visitor_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  visitor_name TEXT NOT NULL,
  relation TEXT NOT NULL,
  visit_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.visitor_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "visitor_requests_select"
  ON public.visitor_requests FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.role = 'warden'
    )
  );

CREATE POLICY "visitor_requests_insert_student"
  ON public.visitor_requests FOR INSERT
  WITH CHECK (
    student_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "visitor_requests_update_warden"
  ON public.visitor_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.role = 'warden'
    )
  );


-- 5. NOTICES TABLE
CREATE TABLE IF NOT EXISTS public.notices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  important BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notices_select_authenticated"
  ON public.notices FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "notices_insert_warden"
  ON public.notices FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.role = 'warden'
    )
  );

CREATE POLICY "notices_update_warden"
  ON public.notices FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.role = 'warden'
    )
  );

CREATE POLICY "notices_delete_warden"
  ON public.notices FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.role = 'warden'
    )
  );


-- 6. AUTO-UPDATE TIMESTAMPS FUNCTION + TRIGGERS
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_complaints_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_visitor_requests_updated_at
  BEFORE UPDATE ON public.visitor_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notices_updated_at
  BEFORE UPDATE ON public.notices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- 7. SEED NOTICES
INSERT INTO public.notices (title, content, important) VALUES
  ('Eid Holiday Schedule', 'The hostel will have extended curfew hours during Eid. Students must register their leave by 25th of this month.', true),
  ('Fee Payment Reminder', 'Monthly fees are due by the 5th of each month. A late fee of PKR 500 applies after the due date.', true),
  ('Cleanliness Drive', 'A hostel-wide cleanliness inspection will be conducted this Saturday. Please ensure your rooms are tidy.', false),
  ('New Biometric System', 'The updated biometric system has been installed. Please register your fingerprints at the reception before Friday.', false)
ON CONFLICT DO NOTHING;
