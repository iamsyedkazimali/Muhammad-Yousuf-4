import { queryOptions } from "@tanstack/react-query";
import { getActiveSlug, getPortfolio } from "./portfolio-context";
import { getSingleton, listPublished, selectScoped } from "./portfolio-repository";

/**
 * Every public query key is namespaced by the *currently active* portfolio so
 * caches never collide between tenants. The exported `q` object exposes lazy
 * getters: the query options (and therefore the key) are rebuilt on access,
 * which is what makes `/muhammad-yousaf` and `/ghulam-hussain` independent.
 */
const key = (...parts: string[]) => ["public", getActiveSlug(), ...parts];

const publishedList = <T,>(table: string, order = "order_index") =>
  queryOptions({
    queryKey: key(table),
    queryFn: (): Promise<T[]> => listPublished<T>(table, order),
  });

const singleton = <T,>(table: string) =>
  queryOptions({
    queryKey: key(table, "single"),
    queryFn: (): Promise<T | null> => getSingleton<T>(table),
  });

type Lazy<T extends Record<string, () => unknown>> = { [K in keyof T]: ReturnType<T[K]> };

/** Turns a map of factories into an object of getters. */
function lazyGroup<T extends Record<string, () => unknown>>(defs: T): Lazy<T> {
  const out = {} as Lazy<T>;
  for (const name of Object.keys(defs) as (keyof T)[]) {
    Object.defineProperty(out, name, {
      enumerable: true,
      get: () => defs[name]!(),
    });
  }
  return out;
}

export const q = lazyGroup({
  portfolio: () =>
    queryOptions({
      queryKey: key("portfolio"),
      queryFn: () => getPortfolio(),
    }),
  profile: () => singleton<any>("profile"),
  hero: () => singleton<any>("hero_section"),
  about: () => singleton<any>("about_section"),
  contact: () => singleton<any>("contact_info"),
  settings: () => singleton<any>("site_settings"),
  subjects: () => publishedList<any>("subjects"),
  qualifications: () => publishedList<any>("qualifications"),
  experiences: () => publishedList<any>("experiences"),
  gallery: () => publishedList<any>("gallery"),
  testimonials: () => publishedList<any>("testimonials"),
  announcements: () => publishedList<any>("announcements", "created_at"),
  featuredCourses: () => publishedList<any>("featured_courses"),
  studentResults: () => publishedList<any>("student_results"),
  achievements: () => publishedList<any>("achievements"),
  faqs: () => publishedList<any>("faqs"),
  socialLinks: () => publishedList<any>("social_links"),
});

export const qExtra = lazyGroup({
  teachingServices: () => publishedList<any>("teaching_services"),
  examCountdowns: () => publishedList<any>("exam_countdowns"),
  popups: () =>
    queryOptions({
      queryKey: key("popup_notifications"),
      queryFn: (): Promise<any[]> =>
        selectScoped<any>("popup_notifications", "*", (query) =>
          query
            .eq("is_published", true)
            .eq("is_active", true)
            .order("priority", { ascending: false }),
        ),
    }),
});
