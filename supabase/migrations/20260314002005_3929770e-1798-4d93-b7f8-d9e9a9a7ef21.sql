
-- ─── 1. Leave / Gate Pass Requests ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.leave_requests (
  id            uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  guardian_name  text NOT NULL,
  guardian_phone text NOT NULL,
  destination   text NOT NULL,
  leaving_at    timestamp with time zone NOT NULL,
  returning_at  timestamp with time zone NOT NULL,
  status        text NOT NULL DEFAULT 'Pending',
  warden_notes  text,
  created_at    timestamp with time zone NOT NULL DEFAULT now(),
  updated_at    timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leave_insert_student" ON public.leave_requests FOR INSERT WITH CHECK (
  student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "leave_select" ON public.leave_requests FOR SELECT USING (
  student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  OR get_user_role(auth.uid()) = 'warden'
);
CREATE POLICY "leave_update_warden" ON public.leave_requests FOR UPDATE USING (
  get_user_role(auth.uid()) = 'warden'
);

CREATE TRIGGER update_leave_requests_updated_at
  BEFORE UPDATE ON public.leave_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── 2. Hostel Rules (CMS) ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.hostel_rules (
  id          uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  icon        text NOT NULL DEFAULT '📋',
  title       text NOT NULL,
  description text NOT NULL,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamp with time zone NOT NULL DEFAULT now(),
  updated_at  timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.hostel_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rules_select_public" ON public.hostel_rules FOR SELECT USING (true);
CREATE POLICY "rules_insert_warden" ON public.hostel_rules FOR INSERT WITH CHECK (get_user_role(auth.uid()) = 'warden');
CREATE POLICY "rules_update_warden" ON public.hostel_rules FOR UPDATE USING (get_user_role(auth.uid()) = 'warden');
CREATE POLICY "rules_delete_warden" ON public.hostel_rules FOR DELETE USING (get_user_role(auth.uid()) = 'warden');

CREATE TRIGGER update_hostel_rules_updated_at
  BEFORE UPDATE ON public.hostel_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.hostel_rules (icon, title, description, sort_order) VALUES
  ('🔐', 'Biometric Entry/Exit Required',  'All students must use the biometric system for every entry and exit. No exceptions.', 1),
  ('🌙', 'Seasonal Curfew Timings',        'Students must return before the seasonal closing time. Timings are posted on the notice board.', 2),
  ('📋', 'Weekend Leave Recording',         'Weekend leaves must be properly recorded with the warden at least 24 hours in advance.', 3),
  ('🚫', 'No Outside Gatherings',           'Gatherings outside the hostel gate are strictly prohibited for security reasons.', 4),
  ('🧹', 'Daily Room Cleanliness',          'Rooms must be cleaned daily. Inspections are conducted regularly. Maintain your space.', 5),
  ('🍽️', 'Mess & Kitchen Conduct',         'Use mess and kitchen cleanly. Only allowed food items may be prepared. Clean after use.', 6),
  ('📚', 'Late-Night Study Courtesy',       'Respect roommates during late-night study hours. Maintain noise discipline after 11 PM.', 7),
  ('💰', 'Late Fee Policy',                 'A late fee of PKR 500 is charged for every month payment is overdue. Pay on time.', 8);

-- ─── 3. Room Listings (CMS) ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.room_listings (
  id                  uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_type           text NOT NULL,
  title               text NOT NULL,
  description         text NOT NULL,
  image_url           text,
  badge               text,
  badge_color         text DEFAULT 'gold',
  features            text[] DEFAULT '{}',
  capacity            integer NOT NULL DEFAULT 1,
  availability_status text NOT NULL DEFAULT 'Available',
  sort_order          integer NOT NULL DEFAULT 0,
  created_at          timestamp with time zone NOT NULL DEFAULT now(),
  updated_at          timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.room_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rooms_select_public" ON public.room_listings FOR SELECT USING (true);
CREATE POLICY "rooms_insert_warden" ON public.room_listings FOR INSERT WITH CHECK (get_user_role(auth.uid()) = 'warden');
CREATE POLICY "rooms_update_warden" ON public.room_listings FOR UPDATE USING (get_user_role(auth.uid()) = 'warden');
CREATE POLICY "rooms_delete_warden" ON public.room_listings FOR DELETE USING (get_user_role(auth.uid()) = 'warden');

CREATE TRIGGER update_room_listings_updated_at
  BEFORE UPDATE ON public.room_listings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.room_listings (room_type, title, description, image_url, badge, badge_color, features, capacity, availability_status, sort_order) VALUES
  ('1seater', '1-Seater Room', 'Your own private sanctuary — perfect for focused study and personal space.',
   'https://i.postimg.cc/C1c6VYRr/1seater.png', 'Premium', 'gold',
   ARRAY['Private bathroom','Study desk','Wardrobe','AC ready','Window view'], 1, 'Available', 1),
  ('2seater', '2-Seater Room', 'Comfortable shared living with a trusted roommate. Affordable yet spacious.',
   'https://i.postimg.cc/c4sPj96P/2-seater.png', 'Popular', 'rose',
   ARRAY['Shared bathroom','2 Study desks','2 Wardrobes','AC ready','Comfortable beds'], 2, 'Available', 2),
  ('3seater', '3-Seater Room', 'Best value option for a vibrant community experience. Great friendships await.',
   'https://i.postimg.cc/sgW8GtLr/3-seater.png', 'Best Value', 'muted',
   ARRAY['Shared bathroom','3 Study desks','3 Wardrobes','Budget-friendly','Great community'], 3, 'Available', 3);

-- ─── 4. Gallery Images (CMS) ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.gallery_images (
  id         uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  src        text NOT NULL,
  alt        text NOT NULL,
  category   text NOT NULL DEFAULT 'General',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gallery_select_public" ON public.gallery_images FOR SELECT USING (true);
CREATE POLICY "gallery_insert_warden" ON public.gallery_images FOR INSERT WITH CHECK (get_user_role(auth.uid()) = 'warden');
CREATE POLICY "gallery_update_warden" ON public.gallery_images FOR UPDATE USING (get_user_role(auth.uid()) = 'warden');
CREATE POLICY "gallery_delete_warden" ON public.gallery_images FOR DELETE USING (get_user_role(auth.uid()) = 'warden');

INSERT INTO public.gallery_images (src, alt, category, sort_order) VALUES
  ('https://i.postimg.cc/dtYnSLN7/mainbuilding.png',                              'Main Building',          'Building',   1),
  ('https://i.postimg.cc/PfmQZdX2/main-Building2.png',                            'Main Building Entrance', 'Building',   2),
  ('https://i.postimg.cc/wBCDyGSJ/main-Building3.png',                            'Main Building View',     'Building',   3),
  ('https://i.postimg.cc/v8L5TXXY/stairs.png',                                    'Internal Staircase',     'Interior',   4),
  ('https://i.postimg.cc/Nj8DcYVb/mess.png',                                      'Dining Mess',            'Facilities', 5),
  ('https://i.postimg.cc/cHCBw3J7/kitechen1.png',                                'Kitchen Main',           'Facilities', 6),
  ('https://i.postimg.cc/CMZWVB4H/kitchen2.png',                                 'Kitchen Secondary',      'Facilities', 7),
  ('https://i.postimg.cc/vmqSJbgr/facilites-like-fridge-and-water-dispensor.png','Freezer & Appliances',   'Facilities', 8),
  ('https://i.postimg.cc/fyX2Sd2s/elevator.png',                                 'Elevator',               'Facilities', 9),
  ('https://i.postimg.cc/1zHvpPr8/attached-washroom1.png',                       'Attached Washroom',      'Rooms',     10),
  ('https://i.postimg.cc/C1c6VYRr/1seater.png',                                  '1-Seater Room',          'Rooms',     11),
  ('https://i.postimg.cc/c4sPj96P/2-seater.png',                                 '2-Seater Room',          'Rooms',     12),
  ('https://i.postimg.cc/sgW8GtLr/3-seater.png',                                 '3-Seater Room',          'Rooms',     13);

-- ─── 5. Media storage bucket ─────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "media_select_public" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "media_insert_warden" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'media' AND get_user_role(auth.uid()) = 'warden'
);
CREATE POLICY "media_delete_warden" ON storage.objects FOR DELETE USING (
  bucket_id = 'media' AND get_user_role(auth.uid()) = 'warden'
);
