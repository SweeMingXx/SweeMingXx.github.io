# Future of Technology: Applied Technical Innovations
User-First Conversational Agents, Connected Entity Graphs, and In-House Generative Architecture

PAPER SESSIONS REPORT · LAS CONFERENCE 2026 · THEME 2 · 28 OCTOBER 2026 · 10:45 – 12:00 SGT @ ATRIUM

## Presenters & context
PAPER 1: USER-FIRST LIBRARY AI CHATBOT — SAMANTHA SEAH & LI ZHENYAN — Singapore Management University (SMU) Libraries

PAPER 2: CONNECTED AUTHORITY & LINKED DATA — PHYLLIS WEE — Lead Information Architecture, National Library Board (NLB)

PAPER 3: BUILDING LIBBEE AI VS. BUYING — KANNADASAN VENKATACHALAM (VENKI) — Lian Ying Chow Library, Ngee Ann Polytechnic

SESSION CONTEXT & VENUE: Theme 2 Morning Technical Presentations at the Atrium preceding the Midday Luncheon

## Executive Summary & Overview
The Theme 2 concurrent technical paper session at the Atrium highlighted tangible implementations of applied automation, conversational artificial intelligence, and semantic knowledge graphs across Singapore's library sector. Moving past exploratory speculation, each presenting institution demonstrated how technical architectures can directly solve frontline user friction, modernize legacy bibliographic models, and power autonomous services.

The presentations formed a cohesive progression of technological agency: SMU Libraries revealed a 1.5-year longitudinal user-experience study governing the rollout of their 24/7 Microsoft Copilot Studio assistant; The National Library Board (NLB) detailed their revolutionary Entity Data Service (EDS), migrating 3 million cultural records from isolated text strings into linked semantic identities; and Ngee Ann Polytechnic demonstrated why they engineered LibBee AI entirely in-house via dual-layer RAG and live API pipelines to support an unmanned campus library.

### 1. Human-Centered Chatbots
SMU structures AI chatbots through longitudinal user discovery, testing intent expectations against technical capabilities.

### 2. From Strings to Things
NLB replaces static string matching with a linked entity knowledge graph unifying National Library and Archives records.

### 3. In-House AI Engineering
Ngee Ann Poly builds LibBee AI using dual-layer RAG and live APIs (Alma/Primo), keeping full control over cost, rules, and privacy.

## SMU: User-First Design for an Academic AI Assistant
Samantha Seah and Li Zhenyan presented SMU Libraries' 1.5-year deployment of their embedded web AI assistant built on Microsoft Copilot Studio. Instead of letting software capabilities dictate service models, SMU conducted rigorous discovery (May 2025) and refinement (May 2026) cohorts across undergraduates, postgraduates, faculty, and administrative staff.

The study uncovered an initial expectation gap: while librarians conceived the bot as a Tier-1 operational guide (answering hours, locations, basic policies), users expected an omniscient research partner. Grounded in user feedback, the team refined the bot to deliver concise, task-driven answers with introductory suggestion pills, unobtrusively docked at the page bottom. Crucially, a hybrid triage was established: if a query requires deep human judgment, the bot seamlessly routes it to the live chat or queues an email ticket.

### NLB Entity Data Service (EDS) ingestion pipeline
- 1. Source Contexts — ILMS, CMS, NAS & Auth Records
- 2. Static Aggregation — Preferred string + birth dates match
- 3. Primary Entity — Knowledge Card & URI Identification
- Connected Graph — RDF / JSON-LD / Linked Data

## NLB: Entity Data Service (EDS) & Connected Graph
Phyllis Wee presented the National Library Board's pioneering shift from traditional string-based authority control toward semantic entity management. Managing public libraries, the National Library, and the National Archives of Singapore (NAS), NLB oversees diverse physical and digital datasets where historical figures, institutions, and places recur under varied naming conventions.

The Entity Data Service (EDS) unifies 3 million transformed records. Operating via an automated ETL pipeline, records are first aggregated into source-level entities before converging into a Primary Entity. This model bridges linguistic scripts: for example, cultural icon Tan Swie Hian and his Chinese script identity (陈瑞献) are treated as attributes of a single URI entity, enabling machine-readable discovery across RDF, JSON-LD, and Turtle.

## Ngee Ann Poly: Building LibBee AI vs. Buying
Kannadasan Venkatachalam (Venki) detailed why Lian Ying Chow Library at Ngee Ann Polytechnic chose to engineer LibBee AI entirely in-house rather than procurement of rigid commercial chatbots. Serving Singapore's premier unmanned academic facility, the library needed an autonomous agent capable of supporting both student learning and faculty teaching in one continuous conversation.

Venki explained that off-the-shelf market solutions failed to integrate bespoke institutional regulations or live enterprise catalogs. Developing LibBee internally gave the library total governance over system rules, data privacy, conversational tone, and ongoing compute expenditures, turning the assistant into an intuitive digital front door for campus-wide services.

| Project & Presenter | Core Architectural Intervention | Operational & User Impact |
|---|---|---|
| SMU Library Chatbot — Samantha Seah & Li Zhenyan | Copilot Studio; 2-stage UX study; Tier-1 FAQ knowledge base; hybrid human routing. | Scores 4.0+/5 across usability; reduces routine email inbox inquiries. |
| NLB Entity Data Service — Phyllis Wee (NLB) | Successive ETL aggregation; multi-script reconciliation; 3M record linked graph. | Resolves homonyms and script variants (e.g. Tan Swie Hian / 陈瑞献); free open API. |
| LibBee AI Assistant — K. Venkatachalam (NP) | Dual-layer architecture: RAG verified documents + live APIs (Alma/Primo/LibCal). | Powers unmanned library; context-aware nudges; autonomous room booking. |

## Dual-Layer Intelligence: Verified Docs & Live APIs
LibBee operates through a sophisticated dual-layer architecture: Layer 1 indexes verified institutional documentation via Retrieval-Augmented Generation (RAG), which librarians update instantly without developer intervention; Layer 2 connects directly to live library systems (Ex Libris Alma, Primo discovery, LibCal, LinkedIn Learning) via open APIs.

### The Philosophy of the Honeycomb & Pedagogical Guidance
Named after a bee foraging nectar across flowers, LibBee gathers disparate library resources into digestible "honey". Crucially, it does not ghostwrite assignments. When students submit assignment briefs, LibBee parses core concepts, generates Socratic prompts, and pulls course reserves, actively cultivating independent critical inquiry.

The platform adapts dynamically based on user identity—offering lesson planning and Boolean query generation for faculty, alongside proactive exam nudges and late-night wellness reminders for students studying past 10 PM.

## Key Takeaways & Core Strategic Insights
### Executive takeaways
- Test Intent, Not Tech: SMU proves chatbots succeed when evaluated on user expectation alignment rather than raw functionality.
- Entities Over Strings: NLB demonstrates that connected linked data graphs bridge fragmented institutional silos into persistent identities.
- The Build Imperative: In-house engineering gives libraries total autonomy over AI rules, student data privacy, and operational costs.
- Dual-Layer RAG Architecture: Grounding AI across curated static policies and live transactional APIs eliminates algorithmic hallucination.

### Core strategic insights
- Transparent Boundaries: Disclosing bot limitations upfront builds patron trust and ensures timely escalation to human professionals.
- Semantic Script Equity: Authority systems must connect diverse language forms (English, Chinese, Tamil) to shared real-world identities.
- Scaffolding over Substitution: AI assistants must be engineered to scaffold student critical thinking rather than performing coursework for them.
- Librarians as Continuous Auditors: Sustaining conversational bots requires internal administrative interfaces for rapid auditing and prompt tuning.

## Top 5 Key Quotes from the Atrium Paper Presentations
> "We didn't start by asking what technology could do, but asking what our users want... A technically correct response may still feel unhelpful if it does not meet the user's actual intent."
> — Li Zhenyan & Samantha Seah, SMU Libraries

> "Linked data connects collections, authority data connects entities, and entities connect the stories of Singapore."
> — Phyllis Wee, Lead Information Architecture, National Library Board

> "A bee collects nectar from different sources, brings it back to the hive, and converts it into honey. LibBee flies across the vast landscape of library resources to give users the honey of pure insight."
> — Kannadasan Venkatachalam (Venki), Ngee Ann Polytechnic Library

> "The shift is from controlling the form of a name to controlling the identity behind it, making its context and relationships explicit for both humans and machines."
> — Phyllis Wee, on rethinking authority work for the semantic web

> "LibBee is there to support learning and critical thinking. It doesn't do any work for them. When students paste an assignment brief, it asks Socratic questions—it does not write the assignment."
> — Kannadasan Venkatachalam, on ethical AI pedagogical design
