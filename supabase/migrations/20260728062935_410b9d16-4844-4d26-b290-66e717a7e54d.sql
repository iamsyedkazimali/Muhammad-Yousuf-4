
DROP POLICY "enrollment_public_insert" ON public.enrollment_requests;
CREATE POLICY "enrollment_public_insert" ON public.enrollment_requests
FOR INSERT
WITH CHECK (
  full_name IS NOT NULL AND length(full_name) BETWEEN 1 AND 200
  AND email IS NOT NULL AND length(email) BETWEEN 3 AND 320
  AND (message IS NULL OR length(message) <= 4000)
);
