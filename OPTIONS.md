> Historical: Nov 5-6 option research, superseded when FeelInk was chosen (Nov 6, about 21:35). Research preserved as written; current state is in STATUS.md.

# Capital Hacks 5.0 options, researched Nov 5, 2026

No option chosen. Product decision is Reeve's. No target user has confirmed anything. No model call or demo has been tested.

Labels: **Measured** = queried by the advisor. **Read** = advisor opened the source. **Codex only** = Codex opened it, advisor got HTTP 403. **Secondary** = read about it through another page. **Reasoned** = judgment.

Advisor lean: C, then A. B has the highest emotional ceiling but is not new and depends on a real speaker. Codex's independent ranking: C, A, D, B, E. Agreement between agents is not validation.

## A. Wheelchair map for Sacramento
- Measured Nov 5: public layer `services5.arcgis.com/54falWtcpty3V47Z/arcgis/rest/services/COSADACurbRamps/FeatureServer/0`, no login. 36,425 corner points, last edited about Oct 30, 2026. RampStatus: ADA Accessible Curb Ramp 9,968; No Curb Ramp Necessary, No Sidewalk 9,197; Curb Ramp 8,647; Barrier 6,829; Not Applicable 1,602; In Construction 182. Box around Sac State (-121.45,38.54,-121.39,38.58, about 3.2 x 2.8 mi): Barrier 843, ADA Accessible 845, Curb Ramp 448. The city's definition of "Barrier" is unconfirmed.
- Read, City ADA plan (Apr 15, 2025): 3,200 miles of sidewalk (p2), Barden settlement 2003 (p3), resident complaints list (p19), citizen request program (p24), inspection is request-only (p25), GIS inventory (p39-40).
- Rivals. Read: Project Sidewalk (crowd + ML; LA is the only California city listed), RampNet (arXiv 2508.09415, 0.9236 AP), Cyvl homepage (vehicle sensors, roads; sidewalks not mentioned). Secondary: AccessMap (3 Washington cities as of 2020). Codex only: CurbWise (hackathon: routing + Gemini hazard photos), DeepWalk (iPhone LiDAR).
- Imagery: Mapillary is CC BY-SA, free token (secondary). Sacramento coverage unchecked. Street View terms are a problem per an academic write-up; enforceability unclear.
- Friday kill test: walk 6 crossings, label by hand, run vision blind. Kill the routing claim if it confidently approves an impassable crossing. Also score vision against city labels on 100 corners.

## B. Aphasia voice
- Rivals. Read: AphaSay (Android beta waitlist, iPhone coming, gpt-4o-transcribe then GPT-4o with Living Patient Profile, speaks automatically above 80% confidence, options at 50-80%, ElevenLabs clone, no team or testimonials named). R-SPEAK (JMIR 2026: ASR, LLM with partner speech, user picks, personal TTS; 4 people with aphasia in interview table, 6 clinicians; SUS 75; best small model 0.814 at 0.60 s; development since Sep 2023). La Trobe, Scientific Reports 2025 (GPT-4o, 1,982 AphasiaBank utterances, 80% is cosine similarity; "I don't feel good" to "I feel good" scored 0.88; manual transcripts). MyAphasia (phrase board). AANI (won a Cursor hackathon as an aphasia tool, then rebuilt for general AAC). Codex only: Speech Assistant AAC.
- Access. Read: UC Davis Health Aphasia Communication Group, Fridays 12:30-2:00, 4860 Y St, contact on its page, confirm location. Sac State speech clinic exists (916-278-6989); its aphasia group appears only on an old third-party listing.
- Money. Secondary: Medicare treats speech-generating devices as DME after an SLP evaluation; software code E2511. A 2013 ASHA article says store-downloaded apps do not qualify.
- Friday kill test: run real AphasiaBank utterances including negations and medication requests; kill if choices omit or reverse the meaning. Students imitating aphasia validates nothing.

## C. Non-visual web agent with a verified submit gate
- Problem. Read: WebAIM Million 2026: 95.9% of home pages with detected WCAG failures, 51% missing form labels, 30.6% empty buttons.
- Rivals and research. Read: A11y-CUA (CHI 2026: agent success 78.3% default, 41.67% keyboard-only, 28.3% magnifier), ICML 2026 position paper, Milan case study of agentic browsers (one low-vision expert; lack of non-visual feedback), Sally (macOS, motor/cognitive focus, no verified submission documented), Screen Agent pilot. Secondary: Shin et al. CHI 2026 (Wizard-of-Oz, 12 visually impaired adults; limit of 3 options; fear of hallucination; payment distrust), AudioEye vendor study (96% vs 31% task completion, sells fixes). Codex only: Zoya, Barracua (hackathon voice agents with confirmation; no documented value verification). Not tested hands-on by anyone here: Comet, Atlas, Gemini Auto Browse.
- Candidate novelty: approval bound to values read deterministically from the page, fail closed if they change. Not proof of worldwide novelty.
- Access. Secondary: Society for the Blind, 916-452-8271, AT training.
- Friday kill tests: (1) NVDA on, eyes closed, try Comet or Gemini in Chrome on one real task. (2) Adversarial form: wrong defaults, misleading labels, value changed after approval; any silent wrong submission kills the safety claim. Blindfold testing does not replace blind users.

## D. Medi-Cal 80 hours
- Read: starts Jan 1, 2027 (DHCS and counties); six-month renewals from Mar 1, 2027 (Orange County); exemption list (Orange County). Secondary: up to 2M could lose coverage including 180K unhoused (SAN, citing state officials); Louisiana pilot 894 of about 13,000 completed (KFF, Oct 2025).
- Finding that weakens it. Read, KFF via InsuranceNewsNet, June 2026: where data can't confirm hours, enrollees may self-attest in 2027; proof comes later. California's handling unconfirmed. Federal rule page blocked; DHCS plan returned HTML.
- Rivals. Read: Nava OSCER (open source, exemption screener, Document AI, mobile reporting), Nava Caseworker Toolkit and Form-Filling Assistant in Riverside County. Codex only: SteadyIQ, CBPP vendor assessment. Unread by both: MedicaidKeeper.
- Advisor verdict: most urgent, weakest demo, synthetic data, harm if wrong.

## E. Security team for small governments
- Secondary: MS-ISAC federal funding ended Sep 30, 2025, moved to paid membership.
- Rivals. Codex only: NodeZero, Pentera, Strix. Advisor did not open these.
- Fits Reeve's skills best and fails "a life visibly changes" hardest.

## Cut early
- ADU plan check: Archistar has a California ADU pack and claims statewide procurement (vendor material).
- Zone 0 phone walk: approved Aug 19, 2026, not yet final; IBHS photo self-inspection is the path insurers name; AI photo apps and a Devpost project already exist.
- CPR camera coach: camera measurement published since 2017-18; one manikin study showed no significant quality gain; a normal team can finish it.
- ASL translation: reasoned only, can't train a reliable model in a weekend.

# Round 2, early Nov 6: demo-only, whatever it takes

Reeve's new brief is in STATUS.md. Full Codex reports are in `research/`. Advisor lean: Silent voice, then Walk-through ADA audit. No pick yet. Nothing tested. Round 1's lean on C is withdrawn as first choice.

## Silent voice
Someone who can't make sound mouths words at a phone and it speaks in their cloned voice after they confirm.
- Read: LipLearner (CHI 2023), 0.8947 F1, 25 commands, one-shot. Tepy, early prototype headset for laryngectomy. Companies House: Liopa Ltd in liquidation, reason unknown.
- Secondary: SRAVI in ICU patients, about 21.8% fixed phrases and 34.6% free speech (HRA summary). Tracheotomy has little impact on lip movement (2023 ICU paper).
- Codex only: Silencio (hackathon), oral tubes can obscure lips.
- Friday kill test: one calibrated speaker, 50 randomized unseen trials with confusable and out-of-vocabulary phrases. Confident wrong speech kills it. Unknown: whether two students can match LipLearner in 48 hours, and whether its code is usable.
- Local users not yet found. Look for a laryngectomy group or ENT and speech clinics.

## Walk-through ADA audit
Scan a real room with a LiDAR phone, get a 3D twin with measured barriers pinned and cited. Demo the judges' own room.
- Read: RASSAR (homes, proof of concept, CHI 2024, public code). Secondary: DeepWalk (sidewalks), ARHAT (homes), Senate analysis of the $4,000 floor and the $1,000 reduction, CASp qualified-defendant status. Claim volumes not found. Codex only: BlueDAG (established, manual inspection), AccessScan (hackathon).
- Needs a LiDAR iPhone. Use an off-the-shelf scanning app and process on Windows.
- Friday kill test: scan 10 openings 3 times against a tape. Kill automatic verdicts if error exceeds the compliance margin. Never claim lawsuit protection.

## NextLight (Codex idea)
Show a routine once; a projector lights the real objects and catches skipped steps. Rivals Codex only: SPICE, JMIR cognitive prosthesis, MapHabit. Kill test: teach 3 steps unedited, omit one, move objects, test venue lighting.

## ThisMeans (Codex idea)
Live narration tells a blind student what the teacher's pointing means. Read: Sac State Assistive Technology Lab, AIRC 2011, M-F 8-5, atl@csus.edu, 916-278-3409. Rivals Codex only: EyeQ, VeasyGuide, AD4Edu. Kill test: 12 unseen pointing utterances; below 10 correct or median lag above 3 seconds kills it.

## Verified web agent (C, narrowed)
Read: Guide ships on Windows at $8-25 a month, sends screenshots to Claude, describes no confirmation step, and warns against passwords, banking, medical and government portals. Codex only: AccessPilot (hackathon) claims approval gates. The DOM is not the submitted data, so bind the outgoing request.

## Ruled out in round 2
Fire claim: Bevel (secondary), Yembo, AfterProof, Contensure (Codex only). Bodycam: JusticeText with a county purchase (Codex only). News desert: Hamlet, Citizen Portal (Codex only). Deaf ER: Sign-Speak, Hand Talk (Codex only). Life-event agent: Empathy, UK Tell Us Once (Codex only). Blindfold guide: Clew Maps covers much of it (Codex only), and there's a safety problem. Lower: ScrapProof, ShelterFit, RuleCrash.
