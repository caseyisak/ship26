Bears Demo – Repo & Space Discovery Questions
Use this doc to inspect the existing demo repo + Contentful space/env and answer back, so we can tailor the demo flows instead of recommending net‑new builds.

1. Demo Story & Constraints
   1.1 Primary storyline(s)

Is this demo:
Purely Bears
Bears + generic examples
Who is the main “hero” of the story?
Pooja – VP, Social & Digital Content Strategy
Megan – Manager, Social Media Brand Integration
Austin – Web Designer
“The org” (cross‑functional story)

1.2 Timebox / scope

How many new flows can we realistically add or significantly modify before demo?
1 big flow
2–3 flows
More (low risk / lots of time)
Any areas we explicitly do not want to touch before this meeting?
(e.g., auth stack, routing, infra, existing demos that other teams depend on)

1.3 Value pillars – rank these

Rank 1–4 (1 = must‑hit):

Time savings / content velocity:
Risk reduction / governance:
Personalization / fan experience:
Multi‑surface orchestration (web/app/social):
AI assist / workflows:

2. Frontend Repo – What’s There Today
   2.1 Stack & routing

Framework:
Next.js
Remix
CRA / Vite
Other: ****\_\_****
Key routes that already exist and are wired to content:
Homepage: ****\_\_****
Gameday / game detail: ****\_\_****
Schedule: ****\_\_****
Any existing “social” or “news” routes?: ****\_\_****

2.2 Components we can reuse

List existing components relevant to this demo:

Hero / banner components:
Names + paths: ****\_\_****
Game list / card components:
Names + paths: ****\_\_****
Any “feed” or “activity rail” components:
Names + paths: ****\_\_****
How flexible are these components?
Easy to add props/variants
Hard‑coded / painful to modify

2.3 Auth / login

Do we have any login or mock login flow implemented?
Real auth (e.g., Auth0, Cognito)
Mock “log in as…” selector
No auth at all
Are any user traits (like location, member type, segment) available in front‑end state after login?
Traits and where they live (e.g., React context, Redux, URL params):
fanType: ****\_\_****
homeMarket: ****\_\_****
Other: ****\_\_****

2.4 State & feature flags

Any feature flagging or “demo mode” logic?
LaunchDarkly / external
Simple env flags
In‑code booleans / context
If yes, where/how is it defined? (files, pattern)

2.5 Analytics / instrumentation

Do we currently log clicks/CTR or events client‑side?
Real analytics (GA, Segment, etc.)
Simple console logs / internal tracking
None
Any utilities/hooks for emitting events we can reuse? (names/paths)

3. Contentful Space & Content Model
   3.1 Existing content types (high‑level)

List the key content types and their rough purpose:

****\_\_****: (e.g., Game, opponent, week, kickoff)
****\_\_****: (e.g., Campaign / Theme)
****\_\_****: (e.g., Hero / Banner)
****\_\_****: (e.g., SocialPost / Article / LiveUpdate)
Any existing gameday‑specific or social‑specific types?

3.2 Workflows / statuses

Are any workflow statuses configured already (beyond basic Draft/Published)?
Yes – list: ****\_\_****
No – only Draft/Published
Any existing workflow rules or Launch workflows in use?

3.3 Personalization setup (if any)

Is Contentful Personalization (Ninetailed / Contentful Personalization app) installed?
Yes – in this space
Yes – in the org, but not this space
No
If yes:
Audiences defined: ****\_\_****
Experiences / variants already modeled: ****\_\_****
Any example use cases (e.g., personalized hero, geo‑based banner)?

3.4 Seed data quality

How many realistic entries exist for:
Games: ~\_**\_
Campaigns: ~\_\_**
Heroes/banners: ~\_**\_
Social‑like content: ~\_\_**
Are they:
Bears‑specific and realistic
Generic demo data
Mostly lorem ipsum

3.5 Releases / grouping

Are Launch releases being used?
Yes – actively, in this space
Yes – in another space only
No
If yes, any existing releases we can inspect? (e.g., “Black Friday”, “Spring Launch”, “Schedule Release”):
Names: ****\_\_****
If Launch is not used, do we have any pattern that groups entries into a “release” (tags, custom fields, etc.)?

4. Personalization & “Login → Banner Changes”
   4.1 Available traits for segmentation

Which user traits can we realistically use in the demo to switch banners?
Location / home market
Season‑ticket vs casual fan
Family‑oriented vs hardcore fan
Other: ****\_\_****
Where do those traits live now?
Auth profile
Front‑end state only
Not implemented yet (we’d mock via a selector)

4.2 Technical integration

Is the Contentful Personalization SDK already wired in?
Client‑side only
Edge / server‑side too
Not yet
Any existing examples (even non‑Bears) of:
Personalized hero/section?
AB test/experiment?

4.3 Banner wiring

How is the homepage hero/banner currently driven?
Contentful entry (e.g., HeroBanner)
Hardcoded in code
Mixed
If Contentful‑driven:
Which type/fields drive:
Image: ****\_\_****
Headline: ****\_\_****
CTA text/URL: ****\_\_****

5. Bundling Assets & Content into a Release
   5.1 Current practice

When you simulate a “big drop” (e.g., schedule release, jersey reveal), how is it modeled?
All separate entries only?
Any tags/fields that tie them together (e.g., releaseId, campaignCode)?

5.2 Launch / Release readiness

Is Launch enabled in the org and this space?
Yes (we can create new releases)
Yes, but we prefer not to use it in this demo
No
If enabled:
Is there a preferred way you want to show grouping?
Actual Launch views
Custom “Release” content type in the UI
Very lightweight (e.g., filtered list by tag)

5.3 Assets organization

Are assets:
Organized by folder per campaign/game
Named with a consistent scheme (e.g., Wk1_Packers_Hero_16x9)
Mixed / unstructured
Any asset metadata/tags we can leverage (e.g., ratio, usage, campaign)?

6. Dev Agent Usage & Risk Tolerance
   6.1 What the agent can safely do

Check all that apply:

Modify content types via migrations (add/remove fields, enums)
Create new content types
Wire new SDKs (e.g., Personalization, analytics)
Add/edit front‑end components
Create new routes/pages
Adjust environment variables / configs

6.2 Guardrails / “no‑go” zones

Areas we must not touch with automation:
Org‑wide roles/permissions
Production / shared spaces
CDN / hosting config
Shared components used by other teams/demos
Other: ****\_\_****

6.3 Preferred approach

Given all of the above, for the upcoming demo what’s the appetite for:

1–2 surgical enhancements (e.g., personalized banner + gameday social list)
A more opinionated end‑to‑end flow (e.g., full “Week 1 vs Packers” release combining web/app/social)
Just wiring existing pieces together better (no new types)

Once this checklist is filled out, I can:

Stop proposing net‑new builds where you already have equivalent structures.
Point at specific content types and components to use (e.g., “reuse HeroBanner + add a segment field”).
Recommend 1–2 high‑impact flows where using the dev agent is actually worth it for the Bears demo.

Written with Glean Assistant
