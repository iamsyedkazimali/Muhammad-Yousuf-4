ALTER TABLE public.enrollment_requests
  ADD COLUMN IF NOT EXISTS request_type text NOT NULL DEFAULT 'enroll',
  ADD COLUMN IF NOT EXISTS source_page text;

CREATE INDEX IF NOT EXISTS enrollment_requests_created_at_idx ON public.enrollment_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS enrollment_requests_request_type_idx ON public.enrollment_requests (request_type);