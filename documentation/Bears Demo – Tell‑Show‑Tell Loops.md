# Bears Demo – Tell‑Show‑Tell Loops

Tightly scoped **Tell‑Show‑Tell (TST)** loops tailored to the Chicago Bears call, mapped to roles, and grounded in realistic Contentful capabilities.

Roles to keep in mind:

- **Pooja** – VP, Social & Digital Content Strategy  
- **Megan** – Manager, Social Media Brand Integration  
- **Austin** – Web Designer  
- **Nick / Casey** – Sales \+ SE

---

## Loop 1 – “One Voice, Six Surfaces”: Breaking News Workflow

### TELL – Reflect their current pain

Use their words:

- “Social media workflow is entirely manual: team opens **six separate platform tabs** to post breaking news, taking **10–15 minutes per announcement**.”  
- They said even **60–90 seconds saved per cycle** would be “game‑changing.”  
- There’s a strict distinction between **“one voice” breaking news** (uniform messaging) vs **platform‑specific content**.

Narrative:

“Right now, every time something big breaks, your editors essentially run a six‑lane relay race: copy/paste, tweak, attach assets, and hope every version says the same thing. You’re doing the hard strategic thinking, but execution is pure muscle memory.”

Anchor to roles:

- For **Pooja**: this is about brand coherence and speed under pressure.  
- For **Megan**: this is about execution load and error risk on her team.

### SHOW – Demo: “Breaking News Card” in Contentful

In your demo, show a single **Breaking News Card** UI (backed by `socialPost` entries):

1. **Context panel (top)**  
     
   - Type: `transaction`, `injury`, `coaching change`.  
   - Optional `game` reference or “off‑day breaking news”.  
   - Campaign reference (e.g., “2025 Regular Season”).

   

2. **Multi‑channel copy panel (middle)** – 2–3 columns:  
     
   - Column “X”  
     - Copy text field with live character count.  
   - Column “Instagram”  
     - Longer caption field (with line breaks and emojis).  
   - Column “Facebook”  
     - Slightly more descriptive text.  
   - Each column auto‑pulls from structured fields:  
     - Player name, position, team, short tagline, default hashtags.

   

3. **Asset rail (right)**  
     
   - Pre‑curated assets:  
     - `Breaking_TRADE_1x1`, `Breaking_TRADE_16x9`, `Breaking_TRADE_9x16`.  
   - Select once, applied to all relevant channels.

   

4. **Execution flow**  
     
   - Status moves: `draft → approved`.  
   - For each channel, show a **“Copy text”** button that:  
     - Copies full, channel‑appropriate text to clipboard.  
     - Shows a small checklist: “Now open X, attach 1:1 image, send.”

You deliberately **do not** post directly to X or IG in the demo (respecting their security posture after the prior account hack).

### TELL – Quantify impact & close

Time savings:

- Today: \~10–15 minutes per multi‑channel breaking announcement.  
- With Breaking News Card:  
  - 1–2 minutes to fill in fields.  
  - \~60–90 seconds to hop through native tabs and paste.  
- Realistic improvement: **6–10 minutes saved per major incident**.

For **Pooja**:

“That’s hours per month that you get back in‑season, without asking for new headcount or giving up control of your social handles.”

For **Megan**:

“Your team spends more time shaping the message, less time retyping it. And because everything starts from one card, ‘one voice’ is baked in.”

Urgency:

“This is a change you can pilot in the offseason on a couple of key announcements. If it doesn’t feel meaningfully faster after 2–3 real tests, you can walk away with no harm done.”

---

## Loop 2 – Multi‑Surface Campaigns: Web \+ App \+ Social Alignment

### TELL – Fragmentation of campaign work

From the call:

- Website is the **“organizational hub”**.  
- Mobile app is a **curated experience**.  
- Social is both **platform‑specific** and sometimes requires unified messaging.

Narrative:

“For any given game or campaign, you’re telling the Bears story in three different arenas: the site, the app, and social. But each surface is a semi‑separate project. When the narrative shifts mid‑week—a star is out, playoff odds change, a new storyline emerges—each surface has to be manually updated.”

### SHOW – Demo: “Flip the Campaign Switch”

Pick an upcoming big moment (e.g., **“Playoff Push”**):

1. **Show the Campaign entry**  
     
   - Fields:  
     - Name: `2025 Playoff Push`  
     - Tagline (short/medium/long).  
     - Hero image / background texture.  
     - Default hashtags.  
   - Link it to:  
     - The relevant `game` entries (Weeks 15–18).  
     - A couple of `socialPost` entries and home heroes.

   

2. **Web \+ App reading from Campaign**  
     
   - Show the homepage hero on your demo site:  
     - Title, background, CTA derived from `campaign`.  
   - Show the app banner mock:  
     - Uses the shorter tagline and mobile‑optimized image.

   

3. **Social posts reading from Campaign**  
     
   - Open a planned hype `socialPost`:  
     - Its `copy` field includes a token like `{{campaignTaglineShort}}`.  
   - Update the tagline in `campaign` and hit publish.  
   - Refresh preview:  
     - Web hero updates.  
     - App banner updates.  
     - Hype posts now preview with the new line.

You don’t need to wire every text field; you just need to show **one meaningful change** rippling across surfaces.

### TELL – Benefits & urgency

For **Pooja**:

“When a narrative shift happens mid‑week, you update it in one place and know that your site, app, and planned posts are in line. That’s governance and brand coherence without extra meetings.”

For **Austin**:

“Design once, apply many times. You’re creating patterns instead of bespoke one‑offs. That decreases maintenance and makes experimentation safer.”

For the team:

- Campaign transitions (regular season → playoffs, throwbacks, color rush, specific rival weeks) become:  
  - **1–2 updates** and checks instead of *N* separate edit flows.  
- You can position this as:  
  - “The difference between every surface drifting a little, and all of them turning on a dime when the story changes.”

---

## Loop 3 – Social Security & Risk Management Without Losing Control

### TELL – Acknowledge their security scar

They said:

- They had an **NFL account hack via a third‑party social tool**.  
- They now insist on **direct platform publishing**.

Narrative:

“You’ve paid the price for giving a tool too much power over your social accounts. You fixed that by moving to 100% native publishing. The downside is that you’re flying without a cockpit view of your posts—what’s approved, what’s risky, what’s already gone out.”

Frame Contentful as:

- A **flight deck**, not a scheduler:  
  - Stores the content.  
  - Routes approvals.  
  - Never logs into social as them.

### SHOW – Demo: “Risk‑Aware Social Cockpit”

1. **Game‑level Social Dashboard**  
     
   - Show a dashboard listing all `socialPost` entries for a chosen game:  
     - Columns: channel, postType, status, asset thumbnail, “Used?”.  
   - Filters: `postType = scoring`, `postType = injury`, etc.

   

2. **Risk lane for sensitive posts**  
     
   - Posts tagged as:  
     - `postType = injury`, `disciplinary`, `league-sensitive`.  
   - Those require:  
     - `draft → ready_for_review → approved` (two sets of eyes).  
   - Non‑sensitive posts:  
     - Can follow `draft → approved` (single approval).

   

3. **Post history view**  
     
   - Click a post to show:  
     - Final text.  
     - Asset used.  
     - Timeline of status changes (who approved when).

Re‑emphasize that **publishing still happens in the native apps**; Contentful only helps manage the before/after.

### TELL – Risk, governance & action

For **Pooja**:

“This gives you an audit log for the moments that matter most. If the league or ownership ever asks, ‘What did we say, who approved it, and what image did we use?’ you can answer in seconds.”

For **Megan**:

“You get a single ‘what’s ready vs what still needs work’ view for each game. No more hunting across DMs and spreadsheets to see if a sensitive post is good to go.”

Urgency:

“You’ve already locked down the publishing side. The missing piece is a source of truth. Putting that in place now is a proactive move—before the next high‑stakes moment forces a manual audit.”

---

## Loop 4 – AI as Junior Copywriter: Assistive, Not Autonomous

### TELL – Social team bandwidth & blank‑page problem

From the call, we know:

- The workflow today is fully manual and slow; they’re looking for **higher content velocity** and better workflows.

Narrative:

“Your editors are doing three jobs at once: strategist, copywriter, and traffic controller. Every new post starts from a blank field, even though 80% of the structure is the same across games and posts.”

Position AI as:

- A **suggestion engine** embedded in Contentful, not an auto‑poster:  
  - Contentful Personalization & AI Actions are explicitly described as tools to “deliver better content faster” and “maximize ROI” without heavy developer dependence.

### SHOW – Demo: AI Actions on a SocialPost

In a `socialPost` entry:

1. Show the `copy` field mostly empty.  
2. Above it, add an **AI Actions** menu with:  
   - “Suggest social copy from game recap.”  
3. When you click:  
   - The AI Action:  
     - Pulls structured info (`game`, `postType`, maybe a linked `Game Recap` entry).  
     - Applies a prompt that encodes:  
       - Tone (Bears voice).  
       - Do’s/don’ts.  
       - Lengths for each channel.  
   - Returns:  
     - 2–3 suggested variants in a “Suggestions” panel.  
4. Show the editor:  
   - Picking one.  
   - Making a small tweak (e.g., adding a key stat).  
   - Promoting it into the `copy` field.

Reinforce:

- This follows the pattern recommended in Contentful docs: AI suggestions are **human‑in‑the‑loop**, used to draft or refine content, not publish by themselves.

### TELL – Time, quality, and realistic ROI

Time savings:

- If drafting a caption today takes **2–3 minutes**, and AI suggestions get that to **60–90 seconds**, for \~20 key posts per game:  
  - You’re saving \~30–40 minutes per game.  
- Over 17 weeks (plus preseason and mid‑week content):  
  - That’s **dozens of hours** back per year, without extra headcount.

Quality:

- You can codify **voice & guardrails** once:  
  - Forbidden words.  
  - Tone spectrum.  
  - Hashtag rules.  
- New team members get **on‑rails suggestions** closer to on‑brand from day one.

Urgency:

“This is an offseason project you can test entirely inside Contentful—no risk to your social accounts. If it’s not saving your editors at least a few minutes per game by preseason, you turn it off. But if it works, it becomes a quiet force multiplier.”

---

## Loop 5 – Design Systems & Sponsors: Extending Value Beyond Today’s Ask

### 5A – Austin’s “Design Once, Use Everywhere” Pattern

#### TELL

Austin’s world:

- Owns web layouts and visual consistency.  
- Has to partner with social to keep campaigns visually coherent across surfaces.

Narrative:

“Right now, a lot of your design system lives in Figma and in your head. Editors know they’re supposed to use the ‘Playoff Hype’ look, but the actual guidance travels via screenshots, Slack, or tribal knowledge.”

#### SHOW – Demo: Design Patterns Linked to Content

Introduce a simple `DesignPattern` entry type in your demo data:

- Fields:  
  - Name, description.  
  - Figma URL.  
  - Thumbnail preview.  
  - “Do / Don’t” guidance (short bullet list).

In a `socialPost` or `Hero` entry:

1. Show a **Design tab**:  
   - “Design pattern: `Playoff Vertical Hero`.”  
   - Thumbnail of the pattern.  
   - Link “Open in Figma” for Austin/designer context.  
2. For web:  
   - The same `DesignPattern` referenced from the homepage hero.

#### TELL

For **Austin**:

“You don’t have to write a 20‑page spec. Every content object just points to the right pattern. When patterns change, you update a single entry, and editors everywhere see the updated guidance.”

For **Pooja/Megan**:

“That’s fewer off‑brand posts slipped through on busy days, and less back‑and‑forth over ‘this doesn’t look like our current campaign.’”

---

### 5B – Sponsors & Partners (Future‑Ready, But Realistic)

#### TELL

They already manage multiple vendors (Yinskam for dev, Rover for personalization) and care about campaigns and seasonal shifts.

Narrative:

“Today your sponsorship impact is mostly measured in decks: screenshots of posts and impressions pulled from platform tools. There’s no single spot that says ‘these are all the Week 1 content items where Sponsor X appears.’”

#### SHOW – Demo: Sponsor Tagging in Content

In `campaign` or `socialPost`:

- Add a simple `sponsor` field:  
  - E.g., `United`, `Nike`, `LocalRestaurant`.

Demo:

1. Show a Week 1 campaign where:  
   - Web hero, app banner, and certain social posts all set `sponsor = United`.  
2. Show a filtered list:  
   - “Show me all Week 1 assets where sponsor \= United.”  
3. Optional: Mock a simple “impressions” panel:  
   - You don’t have to have real data; you’re illustrating **structuring for future analytics**.

#### TELL

For **Pooja** and commercial teams:

“Even if you don’t wire in analytics on day one, you can start modeling sponsor attachment now. Down the road, you’ll be able to say: ‘Here are the exact objects you’re sponsoring and how they performed.’ That’s a better renewal conversation than a PDF of stats.”

Urgency:

“You don’t need a full data lake to start. Adding a simple `sponsor` field now means you’re not retrofitting the entire 2025 season later when someone asks for this view.”

---

## Loop 6 – Personalized Logged‑In Banners: “Welcome Back, Season Ticket Holder”

### TELL – Why personalization fits the Bears

Contentful’s personalization guidance:

- Personalized banners, hero images, and landing pages are common, high‑ROI patterns.  
- Ruggable’s personalized hero banners for ad traffic segments delivered **7x higher CTR** and **25% conversion uplifts**.

Narrative:

“Right now, your homepage is one‑size‑fits‑all. A season ticket holder logging in on Friday sees the same hero as an out‑of‑market fan who’s never set foot in Soldier Field. But those two fans want—and deserve—very different first impressions.”

### SHOW – Demo: “Click Log In → Banners Change”

Use your demo site with a simple persona selector:

1. **Anonymous visitor**  
     
   - See a generic hero:  
     - “Week 1 vs Packers – Tickets on Sale Now.”  
   - CTA: “View Tickets.”

   

2. **Click “Log in as…”**  
     
   - Provide 2–3 personas:  
     - `Season Ticket Holder – Chicago`  
     - `Out‑of‑Market Fan – LA`  
     - `Family‑Focused Fan – Suburbs`  
   - Under the hood:  
     - Set a local trait (`fanType`, `homeMarket`) and apply Contentful Personalization audiences based on those traits.

   

3. **Show personalized hero/banner variants**  
     
   - For **Season Ticket Holder**:  
     - “Welcome back, Season Ticket Member. Your Week 1 perks are live.”  
     - CTA: “View Member Benefits.”  
   - For **Out‑of‑Market Fan**:  
     - “Watch Bears vs Packers live in LA.”  
     - CTA: “See national & streaming options.”  
   - For **Family‑Focused Fan**:  
     - “Family Game Day: Bears vs \[Rival\] – Kid‑friendly experiences.”  
     - CTA: “See family packages.”

In Contentful:

- One `HeroBanner` content type with multiple **personalization variants** managed via **Contentful Personalization**:  
  - Baseline hero for anonymous.  
  - Variant for `fanType = season_ticket_holder`.  
  - Variant for `homeMarket != Chicago`.  
  - Variant for `fanType = family`.

### TELL – Tie to outcomes & Bears context

For **Pooja**:

“This is how you bring the ‘we know our fans’ story to life. The same content model feeds generic visitors, members, and out‑of‑market fans—each seeing what matters most to them.”

For **Megan**:

“It also unlocks storytelling you can reflect back on social: ‘Already a member? Log in to see your Week 1 perks,’ and then when they do, the site actually backs that up with a tailored hero.”

For **Austin**:

“You design the hero module once. Personalization just swaps out the content for the right audience.”

Urgency (and realism):

- Personalization doesn’t have to start with a full fan‑data integration:  
  - You can begin with a **mocked login selector** in your demo and simple rules based on:  
    - Logged‑in vs anonymous.  
    - Known location.  
    - Membership status, if available.  
- Contentful Personalization is built to let teams **create personalized experiences in under an hour** from within the CMS.

---

## Loop 7 – Bundling Assets into a “Week 1 Release”

### TELL – The release orchestration problem

Ruggable’s story:

- Time‑sensitive campaigns (e.g., Black Friday) required:  
  - Coordinating many assets and content blocks at once.  
  - Ensuring web content, promos, and localized experiences all launched together.

Bears analog:

“When you drop a big moment—schedule release, new jersey, Week 1 rivalry game—you have 10+ moving parts that all have to go live in a tight window: homepage hero, app tiles, email, multiple social posts, maybe sponsor overlays. Today, that coordination happens in spreadsheets and Slack.”

### SHOW – Demo: “Release: Week 1 vs Packers”

If Launch is available, base it on a **Release**; otherwise, simulate with a “Release board.”

1. **Open ‘Release: Week 1 vs Packers’**  
     
   - Show a list of linked items:  
     - Web:  
       - `Homepage Hero – Week 1`  
       - `Schedule Module – Week 1 Highlight`  
     - App:  
       - `App Banner – Week 1`  
     - Social:  
       - Hype `socialPost` (X, IG).  
       - Final `socialPost` (X, IG, FB).  
       - Optional sponsor‑attached posts.  
     - Assets:  
       - `Wk1_Packers_Hero_16x9`, `Wk1_Packers_Social_1x1`, `Wk1_Packers_9x16`.

   

2. **Status overview**  
     
   - Each item shows:  
     - Status: `draft/ready_for_review/approved`.  
   - At a glance:  
     - 10/12 items are approved.  
     - 2 remaining posts need copy or asset sign‑off.

   

3. **Preview & stage**  
     
   - Show a **Preview Release** view:  
     - Simulated site/app state as of go‑live.  
   - (Optional) Show a **“mark all as go‑live ready”** action that just sets statuses to `approved` for the demo.

### TELL – Benefits & how it fits other loops

For **Pooja & Nick**:

“This is your ‘one view’ for a major drop. Instead of chasing status across multiple systems, you see exactly which pieces of the Week 1 story are ready—and which need attention.”

For **Megan**:

“You no longer have to manually keep a checklist of which posts are safe to publish on game week. If it’s in the release and marked approved, it’s ready.”

Connect it back:

- This Release can include:  
  - Personalized heroes from Loop 6\.  
  - Gameday social from Loop 1\.  
  - Multi‑surface campaign assets from Loop 2\.  
- It becomes the **container** that makes the rest of your story feel deliberate and coordinated.

Urgency:

“You don’t need to standardize every release in year one. But if you start with one or two, like schedule release or opening day, you’ll have a repeatable pattern for the rest of the season.”

---

These loops are designed to be mix‑and‑match:

- For a short demo, you can run:  
  - Loop 1 (Breaking News) \+ Loop 6 (Personalized banners) \+ Loop 7 (Release).  
- For a deeper workshop, you can layer in:  
  - Loop 2 (multi‑surface campaigns), Loop 3 (risk), and Loop 4 (AI assist).

Each loop is grounded in:

- Their stated pain points.  
- Real Contentful capabilities (workflows, Launch, Personalization, AI Actions).  
- Measurable levers: time savings, consistency, risk reduction, and fan experience.

---

## Sources

- [ZoomInfo](https://contentful.slack.com/archives/D07CQAY6CQK/p1772237029446979)  
- [https://www.contentful.com/solutions/personalization/](https://www.contentful.com/solutions/personalization/)  
- [Create personalized landing pages in 60 seconds with Contentful Personalization | Contentful](https://www.contentful.com/blog/personalized-landing-pages/)  
- [Video: See Contentful Personalization in action | Contentful](https://www.contentful.com/resources/contentful-personalization-demo/)  
- [Contentful / EA FC \- Social Media Workflow Architecture Review](https://chorus.ai/meeting/4BA9F9F48B454A679ADC77B96FDBEE4A)  
- [Increase consistency and reach with a content repurposing strategy | Contentful](https://www.contentful.com/blog/repurposing-content/)  
- [Content Personalization | Contentful](https://www.contentful.com/guides/personalization/content/)  
- [Kraft-Heinz | The New Storytellers | Contentful](https://www.contentful.com/case-studies/kraft-heinz/)  
- [Ruggable | Contentful](https://www.contentful.com/case-studies/ruggable/)  
- [AI and Personalization | Contentful](https://www.contentful.com/guides/personalization/ai/)  
- [\[SE Templates\] RFP Template 2023](https://docs.google.com/document/d/1fYWsela9fJB8aHrcvNDF3IxBKRbvuqlqiAqigRNz8tI)

*Written with Glean Assistant*  
