REVOKE ALL ON FUNCTION public.has_portfolio_access(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_portfolio_access(uuid) TO authenticated, service_role;