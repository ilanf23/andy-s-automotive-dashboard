# SEO/GEO Skill Starter Guide for Claude Cowork

A practical guide for building a Claude Cowork skill that produces SEO + GEO (Generative Engine Optimization) optimized content - i.e., content that ranks in Google **and** gets cited by Perplexity, ChatGPT, Claude, and Google AI Overviews.

This guide includes:

1. How Cowork skills are structured
2. A ready-to-fill `SKILL.md` template
3. A ready-to-fill `seo-geo-playbook.md` reference template
4. SEO + GEO quality gates
5. How to package and install the finished skill
6. Existing skills already in your Cowork that you can lean on

---

## 1. How Claude Cowork skills work

A skill is a folder Claude loads when a triggering phrase is used. Two main parts:

```
my-seo-geo-skill/
├── SKILL.md                  ← Always in context. The orchestrator.
└── references/
    ├── seo-geo-playbook.md   ← Tactical SEO + GEO playbook
    ├── output-template.md    ← Exact shape of the deliverable
    ├── icp-audience.md       ← Who this content is for
    └── voice-guide.md        ← Brand voice rules (if applicable)
```

**Three load-bearing principles:**

- **`SKILL.md` is the orchestrator** - keep it under 500 lines, and use it to tell Claude *when* to load each reference file (progressive disclosure). Loading everything upfront wastes context.
- **The description in frontmatter decides whether the skill fires.** Aggressive, specific trigger phrases beat generic ones. 8–12 trigger phrases is a healthy target. Hard cap: 1024 characters.
- **Quality gates are non-negotiable.** If a check fails, the skill rewrites rather than ships. This is what separates a skill from a one-shot prompt.

---

## 2. SKILL.md template - fill this in

Save the below as `SKILL.md` inside your skill folder. Replace bracketed sections with your specifics.

```markdown
---
name: [your-skill-name-kebab-case]
description: Produces SEO + GEO optimized content for [BRAND/INITIATIVE] targeting [AUDIENCE]. Trigger when the user asks to "write an SEO post for [BRAND]", "draft a GEO-optimized article", "create AI-citable content for [BRAND]", "blog post for [BRAND]", "rank for [keyword] and get cited by Perplexity", or any long-form content request tied to [BRAND]'s search and AI visibility. Output is a fully optimized [markdown post / Lovable prompt / CMS-ready HTML]. Do NOT use for non-[BRAND] content or generic SEO audits (use marketing:seo-audit for audits).
---

# [Your Skill Name]

Produces SEO + GEO optimized content for [BRAND]. Every output is engineered to (a) rank in traditional search and (b) be cited by generative AI engines (Perplexity, ChatGPT, Claude, Google AI Overviews).

## When to use this skill

Trigger on any request to write [BRAND] long-form content where search + AI citation visibility matters. If the request is for a different content type (email, social, ads), use the appropriate channel skill instead.

## Prerequisites: pull the knowledge base

Before writing, fetch the live brand knowledge base. Stale data kills trust signals.

| Source | Use For |
|--------|---------|
| [Notion / Drive / etc. link] | Brand voice + vocabulary |
| [Notion / Drive / etc. link] | ICP + audience pain points |
| [Notion / Drive / etc. link] | Approved data points + statistics |
| [Notion / Drive / etc. link] | Existing content (internal linking targets) |

## The ICP (who we are writing for)

Describe the reader in one paragraph. Their role, their anxieties, what they need to send to a colleague.

## Phase 0: Topic + Information Gain Gate

Score the topic 0–9 across five dimensions. Do not write anything that scores below 7.

| Dimension | Range | What we bring |
|-----------|-------|---------------|
| Proprietary data | 0–2 | [original numbers, internal research, deal data] |
| First-hand evidence | 0–2 | [expert experience, named examples] |
| Original framework | 0–2 | [decision trees, walkthroughs, checklists] |
| Expert attribution | 0–2 | [credentialed author, named voice] |
| Freshness hook | 0–1 | [current data, recent change, dated evidence] |

7–9 ships. 5–6 needs more proprietary input. Below 5 = kill the topic.

## Phase 1: SERP + AI Engine Audit

Read the top 3–5 results in Google for the target query.
Read what ChatGPT, Perplexity, and Google AI Overviews currently say.

Document:

- What every result covers (table stakes)
- What no result covers (the gap - your information-gain moat)
- What angle every result takes (the conventional wisdom you can invert)
- Whether current AI engine answers are correct, incomplete, or wrong

## Phase 2: Outline + Visual Anchor Plan

Plan 5–7 H2 sections. Each H2 must:

- Advance the central argument
- Include at least one visual or structured component (table, callout, definition box, FAQ entry)

## Phase 3: Draft

Use the brand voice rules in `references/voice-guide.md`. Structure follows the output template in `references/output-template.md`.

## Phase 4: SEO + GEO Optimization

Run the full SEO + GEO checklist in `references/seo-geo-playbook.md`. Do not ship without all checks passing.

## Quality gates (non-negotiable)

1. Information Gain score ≥ 7
2. At least one KeyTakeaway block placed before the 540-word mark (AI grounding plateau)
3. At least one DefinitionBox for the primary entity (AI's most-cited extraction format)
4. FAQPage schema present (still parsed by AI engines)
5. Article JSON-LD with `datePublished` and `dateModified`
6. 2–4 internal links + 3–5 external links to primary sources (`target="_blank" rel="noopener noreferrer"`)
7. At least one proprietary data point that exists nowhere else on the indexed web
8. Voice check (per `references/voice-guide.md`) passes

If any gate fails, rewrite. Do not ship.

## Reference files (load as needed)

- `references/seo-geo-playbook.md` - SEO + GEO tactical playbook
- `references/output-template.md` - exact deliverable format
- `references/icp-audience.md` - ICP + anxieties + emotional arc
- `references/voice-guide.md` - brand voice + vocabulary

Load each one only at the relevant phase.

## What this skill does NOT do

- One-off non-content tasks (use a different skill)
- Generic SEO audits (use `marketing:seo-audit`)
- Content for other brands
```

---

## 3. seo-geo-playbook.md template - drop into `references/`

This is the tactical playbook. Generic and portable across brands.

```markdown
# SEO + GEO Playbook

The two-headed optimization framework. SEO = ranking in Google. GEO = being cited by AI engines (Perplexity, ChatGPT, Claude, Google AI Overviews).

## SEO Optimization Checklist

### Meta layer
- Title tag: 50–60 characters, primary keyword in the first 60 chars
- Meta description: 150–160 characters, includes primary keyword + call to action
- Slug: short, readable, primary keyword, no stop words

### Heading hierarchy
- Exactly one H1, contains primary keyword
- H2s reflect the SERP's "People Also Ask" questions where natural
- No heading-level gaps (don't jump from H2 to H4)

### On-page
- Primary keyword in the first 100 words
- Secondary keywords naturally distributed (no stuffing)
- Image alt text descriptive and keyword-aware
- Internal links: 2–4 per post to related content
- External links: 3–5 to primary sources (`target="_blank" rel="noopener noreferrer"`)

### Schema (JSON-LD)
- Article schema with `headline`, `author`, `datePublished`, `dateModified`, `publisher`
- FAQPage schema (AI engines still parse this even after Google's rich-result changes)
- Breadcrumb schema
- Organization schema on the site root

### Technical
- LCP < 2.5s, INP < 200ms, CLS < 0.1
- Images: WebP, lazy-load below the fold, LCP image not lazy
- `font-display: swap`
- Mobile-responsive, tap targets ≥ 44px
- HTTPS, no mixed content

## GEO Optimization Checklist (AI Citation Optimization)

AI engines extract differently than Google. Optimize specifically for citation.

### Structural extraction patterns AI engines love

- **KeyTakeaway block before the 540-word mark.** AI grounding plateaus at ~540 words - content after that gets cited far less often. Front-load the most citable claim.
- **DefinitionBox for the primary entity.** Definition-shaped content is the #1 most-extracted format. Example: "**[Term]** is [one-sentence canonical definition]."
- **ComparisonTables with structured rows.** AI parses tables and frequently cites individual rows.
- **FAQPage schema** - even though Google restricted rich results, Perplexity, ChatGPT, and Google AI Overviews still parse and cite from these.
- **Numbered or bulleted lists with parallel structure** - easy for AI to extract whole or in part.

### Citation-worthiness signals

- Proprietary data with date stamps (e.g., "Based on our Q1 2026 data of N samples...")
- Named expert attribution with credentials
- Primary source citations (link to original studies, government data, not secondary summaries)
- `dateModified` updated every 90 days even for evergreen posts

### What AI engines penalize

- Content that contradicts widely-cited consensus without evidence
- Walls of unstructured prose (no h2s, no bullets, no schema)
- Marketing-tone content that reads like advertising
- Old `datePublished` with no `dateModified`

## Quarterly refresh protocol

Every 90 days, audit each post:

- Update statistics with current data
- Refresh "as of [date]" markers
- Check internal/external links still resolve
- Confirm rankings haven't dropped 3+ positions (if they have, investigate)
- Bump `dateModified` in schema

This single practice is the largest GEO lever most brands miss.

## Internal vs external linking ratios

- Internal links: 2–4 per post, descriptive anchor text ("see your real SBA payment" not "click here")
- External links: 3–5 per post, all to primary sources, all `target="_blank" rel="noopener noreferrer"`

## Readability

- Flesch-Kincaid grade level 8–10
- Average sentence length 14–16 words
- Mix sentence lengths (under 10 / 14–16 / 20–25)
- No paragraph over 6 sentences
- Define technical terms on first use, with abbreviation in parentheses
```

---

## 4. SEO + GEO quality gates (cheat sheet)

A skill is only as good as its quality gates. For SEO/GEO content, these are the non-negotiables:

1. **Information Gain score ≥ 7** - kills topics that won't rank or get cited
2. **KeyTakeaway before 540 words** - AI grounding plateau
3. **DefinitionBox for primary entity** - top AI extraction format
4. **FAQPage schema present** - still parsed by AI engines
5. **Article JSON-LD with `datePublished` + `dateModified`** - freshness signal
6. **2–4 internal + 3–5 external links** to primary sources
7. **At least one proprietary data point** - your information-gain moat
8. **Voice check passes** - brand consistency

If any gate fails: rewrite, don't ship.

---

## 5. Packaging + installing the finished skill

Once you've filled in the SKILL.md and reference files, package and install:

### Step-by-step

1. Put your skill folder in a working directory:

   ```
   my-seo-geo-skill/
   ├── SKILL.md
   └── references/
       ├── seo-geo-playbook.md
       ├── output-template.md
       ├── icp-audience.md
       └── voice-guide.md
   ```

2. Validate the structure:
   - SKILL.md frontmatter must include `name` and `description`
   - Description must be under 1024 characters
   - All referenced files in `references/` must exist

3. Zip the folder with a `.skill` extension (not `.zip`):

   ```bash
   cd my-seo-geo-skill/..
   zip -r my-seo-geo-skill.skill my-seo-geo-skill/
   ```

4. Open the `.skill` file in Cowork. The chat will render an install card - click **Save skill**.

5. Test by typing one of your trigger phrases in a fresh chat. Confirm the skill fires.

6. If it doesn't fire: your description is probably too generic. Make the trigger phrases more aggressive and specific.

---

## 6. Existing Cowork skills you can lean on right now

These ship in standard Cowork plugins. If you don't see them, install the **Marketing** plugin from the Cowork plugin marketplace (Cowork settings → Plugins → search "marketing" → install).

| Skill | What it does | Good for |
|-------|--------------|----------|
| `marketing:seo-audit` | Full SEO audit: keyword research, on-page, content gaps, technical, competitor comparison | Use before producing content to find opportunities |
| `marketing:competitive-brief` | Competitor positioning + content gap research | Phase 1 SERP audit |
| `marketing:content-creation` | Channel-specific drafting helper | Phase 3 drafting |
| `marketing:campaign-plan` | Full campaign brief with objectives, audience, channel strategy, content calendar | If your SEO/GEO work is part of a broader campaign |
| `marketing:brand-review` | Reviews content against brand voice and flags deviations | Phase 4 quality check |
| `marketing:performance-report` | Marketing performance reporting with prioritized recommendations | 90-day refresh audits |

### How to install the Marketing plugin

1. Open Cowork (Claude desktop app)
2. Go to Settings → Plugins (or click the plugins icon in the sidebar)
3. Search the marketplace for **"Marketing"**
4. Click **Install**
5. Restart Cowork (or refresh the session)
6. The `marketing:*` skills will now be available - test by typing `/seo-audit` or asking "run an SEO audit on example.com"

### How to install Anthropic's skill-creator (helps you build your own skills)

1. Same path: Settings → Plugins
2. Search for **"Anthropic"** or **"skill-creator"**
3. Install
4. Trigger by saying "create a new skill" - it'll walk you through scaffolding, validation, and packaging

---

## TL;DR - the fastest path

1. Install the **Marketing** plugin → you immediately get `marketing:seo-audit` and 5 other useful SEO/content skills
2. Install **skill-creator** → use it to scaffold your custom SEO/GEO skill
3. Use this file as the spec: copy the `SKILL.md` template, the `seo-geo-playbook.md` reference, fill in the brand-specific blanks
4. Package as a `.skill` file, save in Cowork
5. Ping me when you hit the trigger-language step - that's where most first-time skill builds break

- Ilan
