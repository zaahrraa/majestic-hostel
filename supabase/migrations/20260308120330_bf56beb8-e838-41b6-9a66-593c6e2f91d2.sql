
-- Seed sample complaints and visitor requests using real profile IDs

DO $$
DECLARE
  ayesha_id UUID;
  fatima_id UUID;
  hira_id UUID;
  mahnoor_id UUID;
  komal_id UUID;
BEGIN
  SELECT id INTO ayesha_id FROM public.profiles WHERE email = 'ayesha.khan@gmail.com' LIMIT 1;
  SELECT id INTO fatima_id FROM public.profiles WHERE email = 'fatimaali@gmail.com' LIMIT 1;
  SELECT id INTO hira_id FROM public.profiles WHERE email = 'hira.ahmed@gmail.com' LIMIT 1;
  SELECT id INTO mahnoor_id FROM public.profiles WHERE email = 'mahnoor@gmail.com' LIMIT 1;
  SELECT id INTO komal_id FROM public.profiles WHERE email = 'komal.iqbal@gmail.com' LIMIT 1;

  -- Complaints
  IF ayesha_id IS NOT NULL THEN
    INSERT INTO public.complaints (student_id, title, description, status, created_at)
    VALUES (ayesha_id, 'Water Supply Issue', 'Water supply was disrupted in the washroom for 2 days.', 'Resolved', '2025-06-02');
  END IF;

  IF hira_id IS NOT NULL THEN
    INSERT INTO public.complaints (student_id, title, description, status, created_at)
    VALUES (hira_id, 'AC Not Working', 'AC is not working properly in room 3B since last week.', 'Pending', '2025-06-05');
  END IF;

  IF mahnoor_id IS NOT NULL THEN
    INSERT INTO public.complaints (student_id, title, description, status, created_at)
    VALUES (mahnoor_id, 'Leaking Pipe', 'There is a leaking pipe in the kitchen area on floor 2.', 'Pending', '2025-06-07');
  END IF;

  -- Visitor Requests
  IF ayesha_id IS NOT NULL THEN
    INSERT INTO public.visitor_requests (student_id, visitor_name, relation, visit_date, status, created_at)
    VALUES (ayesha_id, 'Mrs. Khan', 'Mother', '2025-06-12', 'Approved', '2025-06-10');
  END IF;

  IF fatima_id IS NOT NULL THEN
    INSERT INTO public.visitor_requests (student_id, visitor_name, relation, visit_date, status, created_at)
    VALUES (fatima_id, 'Fatima''s Sister', 'Sister', '2025-06-14', 'Pending', '2025-06-12');
  END IF;

  IF mahnoor_id IS NOT NULL THEN
    INSERT INTO public.visitor_requests (student_id, visitor_name, relation, visit_date, status, created_at)
    VALUES (mahnoor_id, 'Brother Bilal', 'Brother', '2025-06-18', 'Pending', '2025-06-15');
  END IF;

  IF komal_id IS NOT NULL THEN
    INSERT INTO public.visitor_requests (student_id, visitor_name, relation, visit_date, status, created_at)
    VALUES (komal_id, 'Father Mr. Iqbal', 'Father', '2025-06-20', 'Pending', '2025-06-16');
  END IF;
END $$;
