-- Staff directory table
CREATE TABLE public.staff (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  timing TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff_select_authenticated" ON public.staff FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "staff_insert_warden" ON public.staff FOR INSERT
  WITH CHECK (get_user_role(auth.uid()) = 'warden');
CREATE POLICY "staff_update_warden" ON public.staff FOR UPDATE
  USING (get_user_role(auth.uid()) = 'warden');
CREATE POLICY "staff_delete_warden" ON public.staff FOR DELETE
  USING (get_user_role(auth.uid()) = 'warden');

CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON public.staff
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Payments ledger
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'Unpaid',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payments_select" ON public.payments FOR SELECT
  USING (
    student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR get_user_role(auth.uid()) = 'warden'
  );
CREATE POLICY "payments_insert_warden" ON public.payments FOR INSERT
  WITH CHECK (get_user_role(auth.uid()) = 'warden');
CREATE POLICY "payments_update_warden" ON public.payments FOR UPDATE
  USING (get_user_role(auth.uid()) = 'warden');

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Inventory verification flag
ALTER TABLE public.profiles ADD COLUMN inventory_verified BOOLEAN NOT NULL DEFAULT false;