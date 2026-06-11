# QA Test Script: SHIP '26 Demo UI Bug Pass

**Branch:** `feat/stitch-search`
**Worktree:** `/Users/casey.lisak/Dev/metafi-worktrees/demo-ship26`
**Base URL:** `http://localhost:3000` (always append `?preview=true`)
**Contentful env:** `ship-vercel`
**Date:** 2026-06-10

---

## Pre-flight

Before running any test case:

1. Kill any process on port 3000: `lsof -ti:3000 | xargs kill -9 2>/dev/null`
2. Start dev server: `cd /Users/casey.lisak/Dev/metafi-worktrees/demo-ship26 && rm -rf .next && bun run dev --port 3000`
3. Wait for `Ready in Xms` in terminal output
4. Clear browser state: open DevTools > Application > Clear site data (cookies, localStorage, sessionStorage)
5. Open DevTools Console tab; filter to Errors only; keep visible throughout all tests

---

## TC-01: Homepage -- Product Images

**Precondition:** Logged out. Fresh browser state. Dev server running on port 3000.

**Steps:**
1. Navigate to `http://localhost:3000/page/home?preview=true`
2. Wait for page to fully load (no skeleton/spinner)
3. Scroll down to the "New Arrivals" section (product card grid)

**Expected:**
- All product card images render (no broken image icons, no empty gray boxes)
- Arc 900 product card shows a product image hosted on Contentful (`images.ctfassets.net`) or the commerce adapter
- Arc 600 product card shows a product image (same criteria)
- Images are properly sized within their card containers (no overflow, no distortion)

**Pass criteria:** 0 broken images in the New Arrivals section. Arc 900 and Arc 600 both show visible product photos.
**Fail criteria:** Any `<img>` with a broken src, 404 in Network tab for an image request, or a placeholder "IMG" span visible.

---

## TC-02: Homepage -- Source Badge on Product Cards

**Precondition:** On `/page/home?preview=true`, scrolled to New Arrivals section.

**Steps:**
1. Inspect each product card in "New Arrivals"
2. Look for any badge/pill below the product name or near the price

**Expected:**
- Product cards do NOT show a badge reading "Shopify"
- If a source/platform badge is shown, it reads "E-Commerce Integration", "Commerce", or a generic label
- Badge styling uses the Integration Simulator 3P app color (check `commerceBadge`/`commerceColor` props)

**Pass criteria:** Zero product cards show "Shopify" text anywhere.
**Fail criteria:** Any card shows the literal text "Shopify" as a badge or label.

---

## TC-03: Homepage -- Contact Form Contrast

**Precondition:** On `/page/home?preview=true`.

**Steps:**
1. Scroll to the contact form section (typically near bottom of page)
2. Inspect the heading, description text, form labels, input placeholder text, and submit button text
3. Use DevTools color picker or visual inspection to check contrast

**Expected:**
- Heading text is clearly readable against its background
- Description/body text is clearly readable
- Form labels are visible (not same color as background)
- Input text and placeholder text are readable
- Submit button text contrasts against the button background
- NO purple-on-purple text anywhere in the section
- Minimum: all text is distinguishable from its background without squinting

**Pass criteria:** All text in the contact form section is legible. No color combination where foreground and background are both purple/dark shades.
**Fail criteria:** Any text that blends into its background, or purple text on a purple background.

---

## TC-04: Profile Previewer -- Layout (Logged Out)

**Precondition:** Logged out. On any page with `?preview=true`.

**Steps:**
1. Click the gear icon (Settings) in the navbar
2. Click "Profile Previewer" from the dropdown
3. Observe the panel that slides in from the left

**Expected:**
- Panel slides in from the left edge of the screen
- Panel has a purple header bar reading "Profile Previewer"
- Three distinct sections are visible, separated by borders:
  1. **Session Traits** -- shows "Visit: #1 -- New visitor"
  2. **Customer Traits** -- shows "Visitor ID" (truncated hash) and "Location" (geo or "--")
  3. **Audiences** -- shows "None -- anonymous visitor"
- Each section label is uppercase small text (e.g., "SESSION TRAITS", "CUSTOMER TRAITS", "AUDIENCES")
- Panel is fixed-position, does not push page content to the right
- Panel is scrollable if content overflows vertically

**Pass criteria:** All 3 sections visible and labeled. Session Traits shows visit count and visitor status. Panel doesn't cause page layout shift.
**Fail criteria:** Missing section, panel pushes content, or "Visit #1" line is missing.

---

## TC-05: Profile Previewer -- Audience Names (Post-Login)

**Precondition:** Logged in as Jordan (see TC-12 for login steps). Profile Previewer open.

**Steps:**
1. Open Profile Previewer if not already open
2. Scroll to the "Audiences" section
3. Read the audience names listed

**Expected:**
- Audience entries show human-readable names from `audience-map.ts`, e.g.:
  - "Logged In User"
  - "Customer Type -- Returning"
  - Other relevant audience names
- If Jordan's NT audience ID (`3ExwxjXXhbjWpQguGyvR7N`) appears, it should show a mapped name, NOT the raw ID "3ExwxjX..."
- Each audience has a green dot indicator to its left

**Pass criteria:** All audience entries show friendly names (no raw alphanumeric IDs visible in the Audiences section).
**Fail criteria:** Any audience entry displays a raw ID like "Audience 3ExwxjXX..." or similar.

**NOTE:** If Jordan's audience ID is not in `audience-map.ts`, this is a dev fix needed -- the map must include all SHIP '26 persona audience IDs.

---

## TC-06: SearchPanel -- Initial State (Logged Out)

**Precondition:** Logged out. Fresh sessionStorage (no prior search state). On `/page/home?preview=true`.

**Steps:**
1. Look for the search icon in the navbar (magnifying glass icon)
2. Click the search icon

**Expected:**
- Panel slides in from the right edge of the screen
- Header shows "Shopping Assistant" with a purple Sparkle icon
- ESC badge and X button visible in header
- **Featured products** section visible with exactly 3 product cards (first 3 from `productCatalog`)
- None of the 3 featured products are lamps (no "Arc 900", "Arc 600", "Arc 300" in the default 3)
  - **NOTE:** The code shows `productCatalog.slice(0, 3)` for no-query state. This test validates the catalog ordering -- if lamps ARE in the first 3, this is a Contentful/settings data issue, not a code bug.
- Input field shows placeholder: `Try "lamp for my living room" or "statement piece"`
- Purple Sparkle icon shows in input when empty (switches to Search icon when typing)
- Footer shows "Recent" and "Saved" links

**Pass criteria:** Panel opens, 3 featured products shown, input is focusable with correct placeholder.
**Fail criteria:** Panel doesn't open, 0 products shown, or panel renders but is empty/broken.

---

## TC-07: SearchPanel -- AI Conversation Start

**Precondition:** SearchPanel is open (from TC-06). No prior chat messages.

**Steps:**
1. Type "lamp for my living room" in the search input
2. Press Enter or click the purple arrow button

**Expected:**
- User message appears as a right-aligned bubble: "lamp for my living room"
- Assistant response appears with purple avatar + "Shopping Assistant" label
- Response text mentions the Arc 900 and recommends it for living rooms
- Response asks about style preference ("bold or more minimalist")
- Arc 900 product card appears below the assistant message with:
  - Product image
  - Product name, category badge, "In Stock" indicator
  - Price
  - "Add" and "Details" buttons
- Input field clears after submission

**Pass criteria:** User message + assistant response + product card all render. Response text is coherent and matches the scripted `AI_SCRIPTS['lamp for my living room']` entry.
**Fail criteria:** No response appears, product card missing, or response is the generic fallback.

---

## TC-08: SearchPanel -- Conversation Narrowing

**Precondition:** TC-07 completed. Chat thread has the lamp conversation.

**Steps:**
1. Type "statement piece" in the input
2. Press Enter

**Expected:**
- New user message: "statement piece"
- Assistant response mentions "signature statement piece", Arc 900 in matte-black, and Arc 600
- Two product cards appear: Arc 900 and Arc 600
- Both cards have "Add" buttons (because `showAddToCart: true` in the script)
- Chat thread scrolls to show the latest messages

**Pass criteria:** Second exchange renders correctly. 2 product cards shown with Add buttons.
**Fail criteria:** Response doesn't match scripted content, or only 1 product card shown.

---

## TC-09: SearchPanel -- Product Card Navigation to PDP

**Precondition:** TC-08 completed. Product cards visible in chat.

**Steps:**
1. Click "Details" on the Arc 900 product card in the chat thread
2. Observe navigation

**Expected:**
- Browser navigates to `/products/arko-arc-900` (SKU lowercased, underscores to hyphens)
- PDP page loads with Arc 900 product details
- SearchPanel closes on navigation (or stays open -- document actual behavior)

**Pass criteria:** Navigation to PDP works. PDP loads without error.
**Fail criteria:** 404 page, broken link, or navigation doesn't happen.

---

## TC-10: PLP -- ContentMatchReveal Chip Bar

**Precondition:** Navigate to `/products?preview=true`. Products are loaded.

**Steps:**
1. Check the area above the product grid or in the sidebar for tag/filter UI
2. Look specifically for the text "CONTENTFUL TAGS MATCHED" (uppercase header)
3. Look for "Query: ..." text
4. Look for colored tag chips

**Expected:**
- NO "CONTENTFUL TAGS MATCHED" header text visible (the old grouped layout from `ContentMatchReveal`)
- NO "Query: Lighting" or similar query echo text
- If tags are displayed, they appear as a horizontal row of colored chips (not grouped by category with labels)
- Each chip should have an X (dismiss) button
- Clicking X on a chip removes that tag from the chip bar AND from any sidebar filter selection

**Pass criteria:** Old verbose layout is gone. Tags (if shown) are flat chip row with dismiss buttons.
**Fail criteria:** "CONTENTFUL TAGS MATCHED" text visible, or "Query:" text visible.

**NOTE:** The current `ContentMatchReveal.tsx` still has the old layout with `CONTENTFUL TAGS MATCHED` heading and `Query:` text. This is a **known dev fix** -- verify after the dev agent updates this component.

---

## TC-11: PLP -- Callout Card Login Trigger

**Precondition:** On `/products?preview=true`. Logged out.

**Steps:**
1. Scroll through the PLP looking for a callout/promo card (distinct from product cards -- typically styled as a CTA or banner)
2. If a callout card exists with a login prompt or CTA, click it
3. Observe what opens

**Expected:**
- If the callout card has `promptToLogIn` behavior: clicking it opens the Login modal (same modal as navbar Login button)
- Login modal shows the sign-in form with email prefilled, persona buttons, Google/SSO options
- Modal can be dismissed with X or clicking outside

**Pass criteria:** Callout card click triggers login modal (if that's the intended behavior). Login modal renders correctly.
**Fail criteria:** Click does nothing, navigates to wrong page, or modal is broken.

**NOTE:** This depends on Contentful entry wiring. If no callout card exists on PLP, mark as N/A.

---

## TC-12: Login as Jordan -- Personalization Cascade

**Precondition:** On any page with `?preview=true`. Logged out. Profile Previewer open (optional but recommended for observation).

**Steps:**
1. Click "Login" in the navbar
2. Login modal opens
3. Look for persona buttons (e.g., "Sign in as Jordan", "Sign in as Amber")
4. Click "Sign in as Jordan"
5. Modal closes
6. Open Profile Previewer (gear icon > Profile Previewer) if not already open
7. Observe changes across the page

**Expected:**
- Login modal closes
- Navbar shows persona dropdown with Jordan's display name and color dot
- Profile Previewer updates:
  - **Customer Traits** shows: first_name (Jordan), last_name, email, loyalty_tier (platinum), customer_type (returning), and other Jordan metadata
  - `interested_in` appears under **Customer Traits** (NOT under Session Traits -- it's identity data tied to the persona, not behavioral)
  - Traits animate in with purple highlight fade
  - **Audiences** section shows matched audiences with friendly names (e.g., "Logged In User", "Customer Type -- Returning")
  - No raw audience IDs visible
- Product prices (if visible) show platinum discount: strikethrough original price + discounted price (15% off)
  - Example: ~~$149.00~~ $126.65

**Pass criteria:** Jordan login triggers NT identify, Profile Previewer shows customer traits + audiences, prices show discount.
**Fail criteria:** Profile Previewer stays empty after login, audiences show raw IDs, or prices don't update.

---

## TC-13: PDP -- Arc 900 with FAQ

**Precondition:** Logged in as Jordan. Navigate to Arc 900 PDP (click product card or go to `/products/arko-arc-900?preview=true`).

**Steps:**
1. Scroll down to the FAQ section on the PDP
2. Observe FAQ items, badges, and accordion behavior
3. Check that all FAQ answers are fully visible (no clipping)
4. Toggle an FAQ item closed, then open again

**Expected:**
- FAQ section renders with Jordan's personalized variant (fetched via `/api/faq/[entryId]`)
- FAQ items use chevron icon (not +/- icons) that rotates on toggle
- All FAQ items start expanded (default open state)
- Source badges appear on the **question row** (not inside the answer body):
  - "From the manufacturer" (blue)
  - "Styled by our editors" (purple)
  - "Customers say" (green)
- All 6 answers are fully visible without manual toggling -- no text clipping
- CSS grid animation works smoothly on close/open toggle
- After close-then-open, answer text is fully visible (no height calc bug)

**Pass criteria:** FAQ renders with badges on question rows, chevron animation, all answers visible, no clipping after toggle.
**Fail criteria:** Answer text clips, badges are inside answer body, +/- icons instead of chevrons, or variant fetch fails (fallback to baseline FAQ).

---

## TC-14: PDP -- Add to Cart and Checkout Flow

**Precondition:** On Arc 900 PDP. Logged in as Jordan.

**Steps:**
1. Click "Add to Cart" button on the PDP
2. Observe what opens
3. If SearchPanel opens: check for chat history persistence
4. Look for assistant message about the cart addition
5. If checkout modal opens: verify pricing

**Expected (SearchPanel flow):**
- SearchPanel opens automatically from the right
- Previous chat history (from TC-07/TC-08) is visible (persisted via sessionStorage)
- New assistant message appears: mentions "Arc 900" added to cart
- "Yes, checkout now" suggestion or similar CTA visible
- Clicking checkout CTA opens MockCommerceCheckout modal

**Expected (MockCommerceCheckout modal):**
- Modal shows order summary with "Arko Arc 900"
- Because Jordan is platinum tier:
  - Subtotal: $149.00
  - Discount line: -15% ($22.35)
  - Total: $126.65
- "Confirm" button visible
- Clicking Confirm shows check icon + "Order confirmed" state
- Modal auto-closes after ~2.5 seconds

**Pass criteria:** Add-to-cart triggers either SearchPanel or checkout modal. Platinum discount applied correctly. Order confirmation works.
**Fail criteria:** Nothing happens on Add to Cart click, or prices show full price without discount for Jordan.

**NOTE:** The exact add-to-cart flow depends on PDP implementation. Document which path actually fires.

---

## TC-15: Session Traits Accumulation

**Precondition:** Profile Previewer open throughout the browsing session.

**Steps:**
1. Start fresh (logged out, clear state)
2. Open Profile Previewer
3. Navigate to `/page/home?preview=true` -- note Session Traits
4. Click search icon, type a query, submit -- note Session Traits
5. Navigate to PLP -- note Session Traits
6. Navigate to a PDP -- note Session Traits
7. Log in as Jordan -- note Session Traits vs Customer Traits

**Expected:**
- Session Traits section starts with "Visit: #1 -- New visitor" and "No behavioral signals yet"
- As browsing continues, traits from `SESSION_TRAITS` set accumulate:
  - `interested_in` (if surfaced as session trait)
  - `clicked_hero_cta` (if user clicks a hero CTA)
  - `isNewsletterSubscribed` (if applicable)
- New traits animate in with purple highlight effect
- Customer Traits remain minimal until login (just Visitor ID + Location)
- After login: Customer Traits populate with persona data, Session Traits retain browsing signals

**Pass criteria:** At least one session trait appears during the browsing flow. Traits animate in correctly.
**Fail criteria:** Session Traits section always shows "No behavioral signals yet" regardless of browsing activity.

**NOTE FROM HANDOFF:** "Profile Previewer session traits don't populate" is listed as a P0 open bug. This test case documents the expected behavior -- the dev agent needs to wire session trait capture before this passes. The `SESSION_TRAITS` set in `profile-previewer.tsx` only checks for `interested_in`, `clicked_hero_cta`, and `isNewsletterSubscribed` -- broader signals like `session_search_query`, `session_pages_viewed`, `session_ai_chat_active` are NOT in the set and will need to be added.

---

## TC-16: Console Errors -- All Pages

**Precondition:** DevTools Console open, filtered to Errors. Run this check on EVERY page during the test session.

**Steps:**
1. On `/page/home?preview=true` -- check console
2. On `/products?preview=true` (PLP) -- check console
3. On `/products/arko-arc-900?preview=true` (PDP) -- check console
4. After login as Jordan -- check console on each page
5. After opening/closing SearchPanel -- check console
6. After opening/closing Profile Previewer -- check console

**Expected:**
- 0 errors in the console on any page
- Warnings are acceptable (React dev warnings, NT SDK warnings)
- No `[fetchGraphQL] GraphQL errors` warnings in the terminal
- No 404s in Network tab for API routes or images
- No hydration mismatch errors

**Pass criteria:** Zero console errors across all tested pages and interactions.
**Fail criteria:** Any console error (red). Document the exact error message, page, and user action that triggered it.

---

## TC-17: SearchPanel -- Keyboard and Dismiss Behavior

**Precondition:** On any page. SearchPanel closed.

**Steps:**
1. Click search icon to open panel
2. Press Escape key
3. Re-open panel
4. Click outside the panel (on the tinted overlay area)
5. Re-open panel, type a query, press Escape

**Expected:**
- Escape key closes the panel
- Clicking outside the panel: observe behavior (the overlay has `pointer-events-none`, so clicking outside should NOT close -- document actual behavior)
- Panel state (query text, chat messages) persists in sessionStorage between open/close cycles
- Re-opening the panel restores the previous query and chat thread

**Pass criteria:** Escape dismisses. State persists across open/close cycles.
**Fail criteria:** Escape doesn't work, or state is lost on re-open.

---

## TC-18: SearchPanel -- Clear/Reset

**Precondition:** SearchPanel open with an active chat thread (from TC-07/TC-08).

**Steps:**
1. Look for the "Clear" button in the footer (RotateCcw icon + "Clear" text)
2. Click Clear

**Expected:**
- All chat messages removed
- Query input cleared
- Product results revert to "Featured products" (default 3)
- sessionStorage is cleared for `search-panel-state`

**Pass criteria:** Full reset to initial state.
**Fail criteria:** Chat messages persist after clear, or Clear button is missing.

---

## Summary Matrix

| TC | Area | Priority | Depends On |
|----|------|----------|------------|
| 01 | Homepage images | P0 | -- |
| 02 | Homepage source badge | P1 | -- |
| 03 | Homepage contact form contrast | P0 | -- |
| 04 | Profile Previewer layout | P0 | -- |
| 05 | Profile Previewer audience names | P0 | TC-12 |
| 06 | SearchPanel initial state | P0 | -- |
| 07 | SearchPanel AI conversation | P0 | TC-06 |
| 08 | SearchPanel narrowing | P1 | TC-07 |
| 09 | SearchPanel to PDP navigation | P1 | TC-08 |
| 10 | PLP ContentMatchReveal | P1 | Dev fix needed |
| 11 | PLP callout card login | P1 | CTFL fix needed |
| 12 | Login as Jordan | P0 | -- |
| 13 | PDP FAQ with badges | P0 | TC-12 |
| 14 | PDP add to cart / checkout | P0 | TC-12 |
| 15 | Session traits accumulation | P0 | Dev fix needed |
| 16 | Console errors | P0 | All TCs |
| 17 | SearchPanel keyboard/dismiss | P1 | TC-06 |
| 18 | SearchPanel clear/reset | P1 | TC-07 |

---

## Execution Notes

- **Run order:** TC-01 through TC-04, then TC-06 through TC-09 (logged-out flow). Then TC-12 (login), TC-05, TC-13, TC-14 (logged-in flow). TC-15 requires a full fresh run. TC-16 runs throughout.
- **Playwright MCP:** For automated execution, use `browser_navigate` + `browser_snapshot` + `browser_take_screenshot` for each step. Use `browser_console_messages` for TC-16.
- **Screenshots:** Take a screenshot at each Expected checkpoint for the handoff doc.
- **Port lock:** localhost:3000 ONLY. Live preview will not work on other ports.
