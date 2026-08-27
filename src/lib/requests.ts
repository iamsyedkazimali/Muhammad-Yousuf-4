import { z } from "zod";
import { insertRow } from "./portfolio-repository";

export const requestSchema = z.object({
  full_name: z.string().trim().min(2, "Please enter your name").max(200),
  email: z.string().trim().email("Please enter a valid email").max(320),
  phone: z.string().trim().max(50).optional().or(z.literal("")),
  country: z.string().trim().max(100).optional().or(z.literal("")),
  level: z.string().trim().max(100).optional().or(z.literal("")),
  message: z.string().trim().max(4000).optional().or(z.literal("")),
});

export type RequestInput = z.infer<typeof requestSchema>;
export type RequestType = "demo" | "enroll" | "contact";

/** Validates and stores a demo / enrollment / contact request for the active portfolio. */
export async function submitRequest(
  raw: Record<string, unknown>,
  request_type: RequestType,
  source_page?: string,
) {
  const parsed = requestSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { error } = await insertRow("enrollment_requests", {
    ...parsed.data,
    request_type,
    source_page: source_page ?? null,
  });
  if (error) return { ok: false as const, message: "Could not submit. Please try again." };
  return { ok: true as const };
}
