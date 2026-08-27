/** JSON-LD structured data builders. */

export const personSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Muhammad Yousaf",
  honorificPrefix: "Prof.",
  jobTitle: "O/A Level Mathematics Professor",
  description:
    "Retired O/A Level Mathematics professor with 36+ years of teaching experience, offering online Cambridge, Edexcel and AQA Mathematics tuition.",
  knowsAbout: [
    "O Level Mathematics",
    "IGCSE Mathematics",
    "Additional Mathematics",
    "A Level Pure Mathematics",
    "Mechanics",
    "Statistics",
  ],
  url: "/",
});

export const courseListSchema = (
  courses: { title: string; summary?: string | null; level?: string | null }[],
) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: courses.slice(0, 20).map((c, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "Course",
      name: c.title,
      description: c.summary ?? c.level ?? undefined,
      provider: { "@type": "Person", name: "Prof. Muhammad Yousaf" },
    },
  })),
});

export const faqSchema = (faqs: { question: string; answer: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.slice(0, 20).map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
});

export const breadcrumbSchema = (items: { name: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: it.name,
    item: it.url,
  })),
});
