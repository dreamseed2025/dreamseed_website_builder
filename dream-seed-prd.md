{\rtf1\ansi\ansicpg1252\cocoartf2822
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 # Dream Seed Product Requirements Document (PRD)\
\
---\
\
## Epic A: Convince & Convert (Marketing Site)\
\
### Story A1 \'97 Trust-Build Landing\
**Context**  \
> New visitors need a clear, credible reason to start their business with Dream Seed.\
\
**Problem**  \
> Visitors don\'92t quickly grasp the value or next step; conversion suffers.\
\
**Requirements**\
- Landing page shows headline and primary CTA *\'93Start my dream\'94*\
- Social proof visible (testimonials, ratings, logos)\
- Pricing summary with link to detailed pricing\
- CTA leads to signup flow\
- Page loads in <2.5s on 4G\
- Mobile-friendly (viewport 360px\'961920px)\
\
**Test Cases**\
- Verify CTA scroll/focus to signup\
- Lighthouse performance & mobile layout check\
- A/B content toggles render without layout shift\
\
---\
\
### Story A2 \'97 Pricing & Plan Selection\
**Context**  \
> Prospects need clarity on cost and what\'92s included before subscribing.\
\
**Problem**  \
> Confusion over features and plan outcomes causes drop-off.\
\
**Requirements**\
- Pricing page lists at least 2 plans with inclusions\
- Plan selection persists into signup\
- Displays monthly cost, renewal terms, refund policy link\
- Taxes/fees disclaimer shown pre-checkout\
\
**Test Cases**\
- Plan selection passes to checkout\
- Legal links visible and accessible\
- Price reflects currency from site setting\
\
---\
\
## Epic B: Account & Billing\
\
### Story B1 \'97 Sign Up & Email Verification\
**Context**  \
> Create secure accounts and confirm contactability.\
\
**Problem**  \
> Fake/typo emails block onboarding and coach follow-up.\
\
**Requirements**\
- Sign up with email/password or OAuth (Google/Apple)\
- Email verification required before dashboard access\
- Password strength rules, show/hide toggle\
- Error states for duplicate emails or weak passwords\
\
**Test Cases**\
- Unverified user cannot access dashboard\
- Verification link expires & can be resent\
- OAuth login returns to dashboard\
\
---\
\
### Story B2 \'97 Subscription Checkout\
**Context**  \
> User chooses a plan and pays to activate Dream Seed features.\
\
**Problem**  \
> Friction at payment reduces conversions and increases support load.\
\
**Requirements**\
- PCI-compliant hosted checkout (e.g., Stripe Checkout)\
- Support card + Apple Pay/Google Pay\
- On success: subscription active, receipt emailed, redirect to onboarding\
- On failure: retry option with no charge\
- Webhooks update status (active, past_due, canceled)\
\
**Test Cases**\
- Successful payment activates features\
- Past_due shows banner with \'93Update payment\'94\
- Cancel subscription reflects end of period\
\
---\
\
### Story B3 \'97 Login & Session Management\
**Context**  \
> Return users need quick, secure access.\
\
**Problem**  \
> Session errors or timeouts disrupt progress.\
\
**Requirements**\
- Login with email/password or OAuth\
- Optional 2FA via authenticator or SMS\
- 30-minute idle logout, device remember toggle\
- Forgot password reset flow\
\
**Test Cases**\
- Invalid credentials show safe error\
- 2FA challenge required if enabled\
- Session expiry logs out with resume option\
\
---\
\
## Epic C: AI Business Coach\
\
### Story C1 \'97 Coach Chat in Dashboard\
**Context**  \
> Core value: conversational guidance to launch a business.\
\
**Problem**  \
> Users feel overwhelmed; need stepwise guidance.\
\
**Requirements**\
- Dashboard shows chat with history\
- Coach greets with tailored onboarding question\
- Typing indicators, timestamps, formatting\
- Context memory scoped to each dream\
- Guardrails against legal/financial advice\
\
**Test Cases**\
- New user gets onboarding prompt\
- Switching dreams changes context\
- Rate limits prevent spam\
\
---\
\
### Story C2 \'97 Call the Coach (AI Voice)\
**Context**  \
> Some users prefer speaking to accelerate clarity.\
\
**Problem**  \
> Typing fatigue and nuance loss in text-only chat.\
\
**Requirements**\
- \'93Call Coach\'94 button initiates browser VoIP\
- AI coach shares context with chat\
- Live transcription + summary added to chat\
- Call duration, mute/end, device selection\
\
**Test Cases**\
- Call connects with microphone permissions\
- Transcription \uc0\u8805 90% accuracy on clear audio\
- Summary appears in chat\
\
---\
\
### Story C3 \'97 Dynamic Question Flow\
**Context**  \
> Coach collects data for LLC, domain, site, and email setup.\
\
**Problem**  \
> Unstructured data leads to errors and rework.\
\
**Requirements**\
- Branching questions for business formation\
- Data captured into Formation Profile\
- Completion meter shows % of required info\
- Review/edit answers before automation\
\
**Test Cases**\
- Branching logic adapts to user answers\
- Editing updates Formation Profile\
- Missing fields block progression\
\
---\
\
## Epic D: Domain Discovery & Purchase\
\
### Story D1 \'97 Domain Suggestions\
**Context**  \
> Users need help finding brandable names.\
\
**Problem**  \
> Manual search is slow; good names often unavailable.\
\
**Requirements**\
- Suggestions based on keywords + TLD preferences\
- Show availability & price\
- Mark favorites; add to cart\
\
**Test Cases**\
- Changing TLD filter updates suggestions\
- Taken domains show alternates\
- Favorites persist per dream\
\
---\
\
### Story D2 \'97 Domain Search & Purchase\
**Context**  \
> Users want to search and buy directly.\
\
**Problem**  \
> Context switching to external registrars breaks flow.\
\
**Requirements**\
- Search bar for exact queries\
- Availability, price, WHOIS privacy\
- In-app registrar integration for purchase\
- Purchase receipt + DNS link\
\
**Test Cases**\
- Purchase marks domain owned\
- Failed purchase shows recoverable error\
- WHOIS privacy toggle reflected\
\
---\
\
## Epic E: Workspace Canvas\
\
### Story E1 \'97 Canvas Collaboration\
**Context**  \
> Founders brainstorm assets next to the coach.\
\
**Problem**  \
> External tools lose context.\
\
**Requirements**\
- Split view: chat + canvas\
- Upload text, images, audio, shapes\
- Drag/arrange with zoom/pan\
- Items timestamped + linked to chat\
\
**Test Cases**\
- Upload validation and progress\
- Canvas state persists per dream\
- Keyboard shortcuts (undo/redo, zoom)\
\
---\
\
### Story E2 \'97 AI Assistance on Canvas\
**Context**  \
> Accelerate content creation (taglines, sitemaps).\
\
**Problem**  \
> Blank canvas stalls progress.\
\
**Requirements**\
- Right-click \'93Ask Coach\'94 on canvas items\
- Coach references item in suggestions\
- Generated content added to canvas\
\
**Test Cases**\
- Multi-item selection creates combined prompt\
- Images/audio produce summaries first\
- Undo removes generated content\
\
---\
\
## Epic F: Formation Orchestration\
\
### Story F1 \'97 Formation Readiness Checklist\
**Context**  \
> Ensure all data collected before filing.\
\
**Problem**  \
> Partial submissions cause filing failures.\
\
**Requirements**\
- Checklist shows required fields\
- Ready to file only when complete\
- Confirmation modal with disclaimers\
\
**Test Cases**\
- Incomplete items link to chat\
- Editing updates checklist\
- Confirmation logs e-sign\
\
---\
\
## Epic G: Admin Portal\
\
### Story G1 \'97 User & Dream Directory\
**Context**  \
> Admins need visibility on signups and dreams.\
\
**Problem**  \
> Support and ops lack overview.\
\
**Requirements**\
- List of users with filters\
- Detail page shows contact info + dreams\
- Export CSV of directory\
\
**Test Cases**\
- Filters return correct subsets\
- Multiple dreams display separately\
- Export produces valid CSV\
\
---\
\
### Story G2 \'97 Payments & Standing\
**Context**  \
> Monitor financial health and eligibility.\
\
**Problem**  \
> Unpaid accounts block services.\
\
**Requirements**\
- Show subscription status and standing\
- Link to billing history and invoices\
\
**Test Cases**\
- Past_due shows banner\
- Canceled accounts show end date\
- Export payments report\
\
---\
\
### Story G3 \'97 Progress Tracking\
**Context**  \
> Admins want visibility into entrepreneur progress.\
\
**Problem**  \
> Hard to know who is stuck.\
\
**Requirements**\
- Show profile completeness, checklist, last interaction\
- Show domain status\
- Access transcripts\
\
**Test Cases**\
- Sort by completeness works\
- Transcript opens read-only\
- Admin notes are audit-logged\
\
---\
\
## Epic H: PRD Markup Repository\
\
### Story H1 \'97 Maintain PRD in Markup\
**Context**  \
> System architect maintains a living PRD.\
\
**Problem**  \
> Scattered docs cause misalignment.\
\
**Requirements**\
- In-app editor with syntax highlighting and versioning\
- Validate schema (context, requirements, test_cases)\
- Commit history with diff and rollback\
- Link PRD sections to story IDs\
\
**Test Cases**\
- Invalid schema blocks save\
- Rollback restores version\
- Story ID links resolve correctly}