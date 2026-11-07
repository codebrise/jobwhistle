# Jobwhistle — Design System & Component Architecture

**Version:** 1.0.0  
**Stack:** Next.js App Router, Tailwind CSS v4, Radix Primitives / shadcn foundation, Lucide Icons, Recharts.

---

## 1. Design Token Architecture

Design tokens are declared via CSS custom properties in `tokens.css` and bound to Tailwind CSS utilities.

### Spacing Scale
- 4px base increment
- Radius tokens:
  - `--radius-sm: 8px` (Badges, small tags, tooltips)
  - `--radius-md: 12px` (Cards, inputs, buttons)
  - `--radius-lg: 16px` (Panels, modal dialogs)
  - `--radius-xl: 20px` (Main app wrapper overlays)

### Elevation & Shadows
- Subtle, dark-tinted ambient shadows that feel native in dark mode without glow artifacting:
  - `--shadow-card: 0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4)`
  - `--shadow-popover: 0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.6)`

### Breakpoints
- `sm: 640px`
- `md: 768px` (Tablet / Drawer switch)
- `lg: 1024px` (Desktop sidebar entry)
- `xl: 1280px`
- `2xl: 1440px` (Max layout container)

---

## 2. Layout Structure

### Dashboard Shell
```
+-------------------------------------------------------------+
| Header (64px) — Brand Mark, Quick Nav, User Menu, Status    |
+-------------------------------------------------------------+
| Sidebar (240px)          | Main View Container (Max 1440px) |
| - Overview               |                                  |
| - Monitors (HTTP/HTTPS)  | [ Breadcrumbs & Actions Bar ]    |
| - Heartbeats (Cron Jobs) |                                  |
| - Incidents              | [ Metrics & Status Cards ]       |
| - Notifications          |                                  |
| - Settings               | [ Live Telemetry & History ]     |
|                          |                                  |
+--------------------------+----------------------------------+
```
- On mobile (`< 768px`), the sidebar collapses into a sliding bottom drawer or slide-over navigation with accessible keyboard trap and escape dismiss.

---

## 3. Core Component Library

1. **StatusBadges:** Multi-variant pill tags with dot indicator + label (`Up`, `Degraded`, `Down`, `Paused`, `Pending`).
2. **MetricCards:** Key performance numbers (Availability %, P95 Latency, Checks in 24h) with delta indicators and tabular typography.
3. **UptimeBars:** Segmented 30-day / 7-day bar representations displaying granular check periods with hover tooltip timestamps and statuses.
4. **LatencyChart:** Responsive time-series visualizer (Recharts) with clean gradient fill, tooltips showing timestamp + HTTP status code + latency in milliseconds.
5. **HeartbeatSnippetBox:** Code display box featuring tabbed snippets for `cURL`, `Node.js`, `Python`, `Bash`, and `PHP` with 1-click clipboard copy.
6. **IncidentTimeline:** Chronological event feed showing exact detection time, failure confirmation (after 2 consecutive failures), email alerts triggered, and resolution details.
7. **EmptyStateContainers:** Contextual states using original vector illustrations for zero monitors, zero heartbeats, and clean operational states.

---

## 4. Accessibility & Interaction Rules

- **WCAG 2.2 Level AA Compliance.**
- Color contrast meets or exceeds `4.5:1` for normal text and `3:1` for UI components and large text.
- Focus rings: 2px solid `var(--accent)` with 2px offset.
- All interactive elements possess explicit ARIA attributes and full keyboard tab stops.
- Reduced motion: `@media (prefers-reduced-motion: reduce)` disables telemetry transitions and graph animations.
