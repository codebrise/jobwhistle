# Jobwhistle — Technical SEO & Structured Data Strategy

---

## 1. Technical SEO Foundation

- **Semantic HTML5:** Strict landmark tags (`header`, `nav`, `main`, `article`, `aside`, `footer`).
- **Heading Hierarchy:** Single `<h1>` per page, logical `<h2>` and `<h3>` nesting.
- **Dynamic XML Sitemap:** Automatically generated at `/sitemap.xml` with priority and change frequencies.
- **Robots.txt:** Configured at `/robots.ts` to allow marketing/docs while disallowing authenticated `/app/` and `/api/` paths.
- **Canonical URLs:** Handled automatically via `metadataBase`.
- **Open Graph & Twitter Cards:** Master 1200x630 vector-rendered OG image and Twitter summary card embedded in every public page.

---

## 2. Structured Data (JSON-LD)

Declared in `app/layout.tsx`:
- `@type: Organization` (CodeBrise)
- `@type: SoftwareApplication` (Jobwhistle, Category: DeveloperApplication, Price: $0 Free Beta).
