
-- Fix: make bookings insert policy explicit — allow anon and authenticated users
-- (This is intentional: visitors fill the booking form before having an account)
DROP POLICY IF EXISTS "bookings_insert_anyone" ON public.bookings;

CREATE POLICY "bookings_insert_public"
  ON public.bookings FOR INSERT
  WITH CHECK (
    full_name IS NOT NULL
    AND email IS NOT NULL
    AND phone IS NOT NULL
    AND university IS NOT NULL
    AND room_type IS NOT NULL
  );
