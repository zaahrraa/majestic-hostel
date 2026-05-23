
-- ============================================================
-- 1. ATTENDANCE TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('entry', 'exit')),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "attendance_insert_student"
  ON public.attendance FOR INSERT
  WITH CHECK (student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "attendance_select_student"
  ON public.attendance FOR SELECT
  USING (
    student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR get_user_role(auth.uid()) = 'warden'
  );

CREATE INDEX idx_attendance_student_id ON public.attendance(student_id);
CREATE INDEX idx_attendance_timestamp ON public.attendance(timestamp DESC);

-- ============================================================
-- 2. BILLING RECORDS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.billing_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('fee', 'fine', 'extra_charge')),
  description TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  units NUMERIC(10,2),
  rate NUMERIC(10,2),
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Paid', 'Waived')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.billing_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "billing_select"
  ON public.billing_records FOR SELECT
  USING (
    student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR get_user_role(auth.uid()) = 'warden'
  );

CREATE POLICY "billing_insert_warden"
  ON public.billing_records FOR INSERT
  WITH CHECK (get_user_role(auth.uid()) = 'warden');

CREATE POLICY "billing_update_warden"
  ON public.billing_records FOR UPDATE
  USING (get_user_role(auth.uid()) = 'warden');

CREATE TRIGGER update_billing_records_updated_at
  BEFORE UPDATE ON public.billing_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_billing_student_id ON public.billing_records(student_id);

-- ============================================================
-- 3. PAYMENT VOUCHERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payment_vouchers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  billing_record_id UUID REFERENCES public.billing_records(id) ON DELETE SET NULL,
  voucher_url TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Verified', 'Rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_vouchers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vouchers_insert_student"
  ON public.payment_vouchers FOR INSERT
  WITH CHECK (student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "vouchers_select"
  ON public.payment_vouchers FOR SELECT
  USING (
    student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR get_user_role(auth.uid()) = 'warden'
  );

CREATE POLICY "vouchers_update_warden"
  ON public.payment_vouchers FOR UPDATE
  USING (get_user_role(auth.uid()) = 'warden');

CREATE TRIGGER update_payment_vouchers_updated_at
  BEFORE UPDATE ON public.payment_vouchers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 4. CLEARANCE REQUESTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.clearance_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  warden_notes TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.clearance_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clearance_insert_student"
  ON public.clearance_requests FOR INSERT
  WITH CHECK (student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "clearance_select"
  ON public.clearance_requests FOR SELECT
  USING (
    student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR get_user_role(auth.uid()) = 'warden'
  );

CREATE POLICY "clearance_update_warden"
  ON public.clearance_requests FOR UPDATE
  USING (get_user_role(auth.uid()) = 'warden');

CREATE TRIGGER update_clearance_requests_updated_at
  BEFORE UPDATE ON public.clearance_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_clearance_student_id ON public.clearance_requests(student_id);

-- ============================================================
-- 5. REVIEWS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Featured', 'Rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_insert_student"
  ON public.reviews FOR INSERT
  WITH CHECK (student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "reviews_select_featured_or_own"
  ON public.reviews FOR SELECT
  USING (
    status = 'Featured'
    OR student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR get_user_role(auth.uid()) = 'warden'
  );

CREATE POLICY "reviews_update_warden"
  ON public.reviews FOR UPDATE
  USING (get_user_role(auth.uid()) = 'warden');

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 6. STORAGE BUCKET FOR PAYMENT VOUCHERS
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('vouchers', 'vouchers', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "vouchers_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'vouchers' AND auth.uid() IS NOT NULL);

CREATE POLICY "vouchers_view"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'vouchers');
