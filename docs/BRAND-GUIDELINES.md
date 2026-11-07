# Jobwhistle — Brand Identity Guidelines

**Parent Brand:** CodeBrise  
**Endorsement:** Jobwhistle by CodeBrise  
**Tagline:** Know when something goes quiet.  
**Secondary Tagline:** Small signals. Clear answers.  

---

## 1. Brand Philosophy and Visual Spirit

Jobwhistle was built to serve developers, indie hackers, and engineering teams who need quiet confidence in their production services. Unlike bloated observability suites or generic notification bells, Jobwhistle takes inspiration from acoustic precision, physical monitoring whistles, and active radar pulse telemetry.

### Attributes
- **Quiet Confidence:** Calm, precise feedback during normal operations and emergencies.
- **Technical Precision:** Clean geometric alignment, tabular numerals, unambiguous statuses.
- **Developer-First:** Code snippets, terminal-friendly syntax, zero marketing fluff.
- **Distinction from CodeBrise:** While proud of its parent brand CodeBrise, Jobwhistle maintains its own sovereign identity with Deep Pine and Signal Lime.

---

## 2. Brand Mark Construction

The Jobwhistle mark fuses two essential concepts:
1. **The Resonating Whistle Chamber:** A streamlined aerodynamic cylinder with a precision sound aperture slot and centered resonating core.
2. **Acoustic Monitoring Arcs:** Concentric telemetry arcs radiating at 45° from the sound aperture, evoking network pings, heartbeats, and alert propagation.

The mark is mathematically constructed on a 100x100 grid to maintain perfect legibility from 16px favicons to billboard displays.

---

## 3. Color Palette

### Core Brand Colors
| Swatch | Name | Hex | Usage |
|---|---|---|---|
| 🟩 | **Signal Lime** | `#C8F169` | Primary accent, operational pulse, key CTAs |
| 🌲 | **Deep Pine** | `#142522` | Core brand identity, primary button surfaces, dark framing |
| 🌊 | **Signal Teal** | `#347D72` | Secondary accent, link hovers, active telemetry rings |
| 🌿 | **Sage** | `#A9C5B1` | Subdued borders, secondary text, muted metadata |

### Dark Theme (Application & Marketing Primary)
- **Background:** `#0D1515` (Night Pine)
- **Foreground:** `#EAF0EC` (Crisp Off-White)
- **Surface:** `#131E1E` (Panel Background)
- **Surface Secondary:** `#1C2928` (Card / Input Hover)
- **Border:** `#2C3936`
- **Muted Text:** `#A0ADA7`
- **Accent Primary:** `#C8F169`

### Light Theme
- **Background:** `#F4F6F3` (Light Mist)
- **Foreground:** `#182421` (Deep Pine Text)
- **Surface:** `#FFFFFF` (Pure Card Surface)
- **Surface Secondary:** `#EDF1ED` (Container Inset)
- **Border:** `#DCE4DE`
- **Muted Text:** `#687670`
- **Primary:** `#142522`

### Status Indicators
| Status | Hex | Token | Meaning |
|---|---|---|---|
| **Up** | `#19875D` | `--status-up` | 2xx Success / On-time check-in |
| **Degraded** | `#C48A28` | `--status-degraded` | High latency / Warning thresholds |
| **Down** | `#D45252` | `--status-down` | 4xx/5xx / Connection timeout / Missed heartbeat |
| **Paused** | `#74847D` | `--status-paused` | Monitor paused by user |
| **Pending** | `#477DA8` | `--status-pending` | Awaiting initial check |
| **Unknown** | `#858F95` | `--status-unknown` | Unconfirmed telemetry state |

*Note: In accordance with WCAG 2.2 AA accessibility guidelines, color is never used as the sole indicator of status. Every badge and alert includes descriptive text and an icon.*

---

## 4. Typography

- **Primary Headings & Body:** Geist Sans
- **Data, Statuses, Latencies, Timestamps & Tokens:** Geist Mono
- **Tabular Numerals:** Always enabled for response times, uptime percentages, and status codes (`font-variant-numeric: tabular-nums`).

---

## 5. Asset Hierarchy

All master assets reside in `assets/`:
- `brand/logo/primary/`: Horizontal and stacked lockups.
- `brand/logo/dark/` & `brand/logo/light/`: Context-specific exports.
- `brand/logo/monochrome/`: Pure black and pure white vector and raster assets.
- `brand/symbol/`: Isolated whistle & signal mark.
- `brand/wordmark/`: Isolated typographical mark.
- `icons/favicon/`: Complete cross-platform favicon package (SVG, ICO, PNGs).
- `app-icons/`: Android adaptive icons, iOS App Store, PWA maskable icons.
- `social/`: Open Graph (1200x630), Twitter card, GitHub preview.
- `illustrations/`: Empty state graphics for monitors, heartbeats, and zero incidents.
