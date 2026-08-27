import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Super-Admin provisioning API.
 *
 * These are the only paths that may create auth accounts or clone data.
 * Every handler re-verifies the caller is a super admin *server side* — the
 * client never gets to assert its own role.
 */

const cloneInput = z.object({
  sourceId: z.string().uuid(),
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug may contain lowercase letters, numbers and dashes"),
  theme: z.string().trim().min(1).max(60).default("scholarly-emerald"),
  logo: z.string().trim().max(500).nullable().optional(),
  favicon: z.string().trim().max(500).nullable().optional(),
  description: z.string().trim().max(500).nullable().optional(),
  status: z.enum(["active", "suspended"]).default("active"),
  copyData: z.boolean().default(true),
  adminName: z.string().trim().max(120).optional(),
  adminEmail: z.string().trim().email().max(255),
  adminPassword: z.string().min(8).max(72),
});

export const clonePortfolio = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => cloneInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    const { data: isSuper } = await supabase.rpc("is_super_admin", {});
    if (isSuper !== true) throw new Error("Only super admins can clone portfolios.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = data.adminEmail.toLowerCase();

    // Pre-flight uniqueness checks so we fail before creating anything.
    const { data: slugTaken } = await supabaseAdmin
      .from("portfolios")
      .select("id")
      .eq("slug", data.slug)
      .maybeSingle();
    if (slugTaken) throw new Error(`The slug "${data.slug}" is already taken.`);

    const { data: emailTaken } = await supabaseAdmin
      .from("portfolio_admins")
      .select("id")
      .eq("email", email)
      .is("deleted_at", null)
      .maybeSingle();
    if (emailTaken) throw new Error(`An admin with the email "${email}" already exists.`);

    // Step 1 + 2 — portfolio row and every related record, inside one transaction.
    const { data: newId, error: cloneError } = await supabase.rpc("clone_portfolio", {
      _source_id: data.sourceId,
      _name: data.name,
      _slug: data.slug,
      _theme: data.theme,
      _logo: data.logo ?? undefined,
      _favicon: data.favicon ?? undefined,
      _status: data.status,
      _description: data.description ?? undefined,
      _copy_data: data.copyData,
    });
    if (cloneError || !newId) throw new Error(cloneError?.message ?? "Cloning failed.");

    const portfolioId = newId as unknown as string;

    // Step 3 — the portfolio admin account. Roll the whole clone back on failure.
    try {
      const created = await supabaseAdmin.auth.admin.createUser({
        email,
        password: data.adminPassword,
        email_confirm: true,
        user_metadata: { full_name: data.adminName ?? null, portfolio_id: portfolioId },
      });
      if (created.error || !created.data.user) {
        throw new Error(created.error?.message ?? "Could not create the admin account.");
      }

      const { error: assignError } = await supabase.rpc("assign_portfolio_admin", {
        _portfolio_id: portfolioId,
        _user_id: created.data.user.id,
        _email: email,
        _full_name: data.adminName ?? undefined,
        _must_reset: true,
      });
      if (assignError) {
        await supabaseAdmin.auth.admin.deleteUser(created.data.user.id);
        throw new Error(assignError.message);
      }

      return { portfolioId, adminUserId: created.data.user.id, slug: data.slug };
    } catch (error) {
      // Rollback: deleting the portfolio cascades to every cloned record.
      await supabaseAdmin.from("portfolios").delete().eq("id", portfolioId);
      throw error instanceof Error ? error : new Error("Cloning failed.");
    }
  });

const adminInput = z.object({
  portfolioId: z.string().uuid(),
  fullName: z.string().trim().max(120).optional(),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(72),
});

export const createPortfolioAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => adminInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: isSuper } = await supabase.rpc("is_super_admin", {});
    if (isSuper !== true) throw new Error("Only super admins can create portfolio admins.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = data.email.toLowerCase();

    const created = await supabaseAdmin.auth.admin.createUser({
      email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.fullName ?? null, portfolio_id: data.portfolioId },
    });
    if (created.error || !created.data.user) {
      throw new Error(created.error?.message ?? "Could not create the admin account.");
    }

    const { error } = await supabase.rpc("assign_portfolio_admin", {
      _portfolio_id: data.portfolioId,
      _user_id: created.data.user.id,
      _email: email,
      _full_name: data.fullName ?? undefined,
      _must_reset: true,
    });
    if (error) {
      await supabaseAdmin.auth.admin.deleteUser(created.data.user.id);
      throw new Error(error.message);
    }

    return { adminUserId: created.data.user.id };
  });

const resetInput = z.object({
  adminId: z.string().uuid(),
  password: z.string().min(8).max(72),
});

export const resetPortfolioAdminPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => resetInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: isSuper } = await supabase.rpc("is_super_admin", {});
    if (isSuper !== true) throw new Error("Only super admins can reset passwords.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: admin, error: lookupError } = await supabaseAdmin
      .from("portfolio_admins")
      .select("id, user_id, email")
      .eq("id", data.adminId)
      .maybeSingle();
    if (lookupError || !admin) throw new Error("Admin not found.");
    if (!admin.user_id) throw new Error("This admin has no login account yet.");

    const { error } = await supabaseAdmin.auth.admin.updateUserById(admin.user_id, {
      password: data.password,
    });
    if (error) throw new Error(error.message);

    await supabase.rpc("flag_password_reset", { _admin_id: data.adminId });
    return { email: admin.email };
  });
