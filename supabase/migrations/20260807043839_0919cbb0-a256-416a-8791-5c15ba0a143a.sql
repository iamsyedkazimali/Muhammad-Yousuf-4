DROP POLICY IF EXISTS "Active portfolios are public" ON public.portfolios;

CREATE POLICY "Active portfolios are public"
  ON public.portfolios FOR SELECT TO anon
  USING (status = 'active');

CREATE POLICY "Signed-in users can view portfolios"
  ON public.portfolios FOR SELECT TO authenticated
  USING (status = 'active' OR public.has_role(auth.uid(), 'admin'));