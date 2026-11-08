> Historical: Nov 6 ideation material, superseded when FeelInk was chosen (Nov 6, about 21:35). Research preserved as written; current state is in STATUS.md.

# Rival check, Capital Hacks 5.0 candidates (Fri Nov 6, 2026)

Labels: **Read** = I opened the page or README. **Secondary** = I only saw a search-result snippet or news summary.
Devpost returned HTTP 200 to curl with a browser user agent, so Devpost pages below are Read. WebFetch got 403 on edinburghchamber.co.uk (not retried).

## Verdict table

| # | Idea | Verdict | Attack sentence |
|---|------|---------|-----------------|
| 1 | Look-to-listen (lip+audio separation to earbuds) | CROWDED, not killed | "Meta Conversation Focus, AirPods Conversation Boost and OrCam Hear already isolate the voice in front of you; the lip-reading version is an old research idea (Google 2018, Heriot-Watt glasses, Bose RAVEN)." |
| 2 | Verified non-visual web agent | CROWDED on "blind + voice + web agent + confirm before acting"; the cryptographic/deterministic binding is OPEN in a hackathon setting | "Blindly and ScreenGuardian already ask the user to confirm before filling or submitting." |
| 3 | Walk-through ADA audit (LiDAR, 3D, cited) | CROWDED, close to KILLED if you pitch "scan room, find barriers, show 3D" | "RASSAR (UW, CHI 2024) does LiDAR room scans with ADA-based rules, and AccessiRoom and TouchSpace/AccessAtlas did LiDAR-scan accessibility at hackathons this year." |
| 4 | ThisMeans (deictic narration for blind students) | OPEN (weak but real gap) | "Is the classroom pointing problem real enough, and can you resolve 'this' reliably in 44 hours?" (judges attack feasibility, not novelty). |
| 5 | Silent emergency call (mouth words, voice to 911) | KILLED as framed | "Silent Voice (Cal Hacks 13, 2nd overall) is mouth-anything, speak in a cloned voice, even on a phone call; yours is the same pipeline pointed at 911." |

## Candidate 1: Look-to-listen

Vocabularies tried: (a) "hearing loss, noisy restaurant, phone camera, earbuds"; (b) "audio-visual speech separation / target speech extraction / AVSE / cocktail party"; (c) "hackathon, devpost, lip reading hearing aid". Plus shipped-feature search for Apple/Google/Meta.

Closest rivals:
- **Meta "Conversation Focus"** on Ray-Ban Meta / Oakley Meta glasses, v21 update, Dec 2025 (Secondary: Engadget, Digital Trends, Android Authority snippets). Beamforming (reported 5-mic array), boosts the person in front of you. Audio-only, no lip use, needs Meta glasses. Partial overlap on the user outcome. This is the line a judge will use.
- **Apple AirPods Conversation Boost / Conversation Awareness / Live Listen** (Secondary: Apple accessibility pages, MacRumors via search). Beamforming toward the voice in front. Partial overlap, not lip-based, no captions fed from separation.
- **OrCam Hear** (Secondary: Red Dot award page, hearinghealthmatters): commercial earbuds plus dongle and app, AI source separation, user picks speakers; one snippet says it combines audio processing with lip reading (unverified). Partial to strong overlap. Needs enrollment-style speaker selection per the descriptions I saw; not confirmed.
- **Heriot-Watt / Edinburgh Napier COG-MHEAR "hearing glasses"** (Secondary: hw.ac.uk news 2025, STV, Edinburgh Chamber snippets): glasses camera tracks lips, phone app sends audio+video over 5G to a cloud server, cleaned audio returns to hearing aid or headphones. Prototype, 2026 target, no hackathon prize. Exact conceptual overlap, but research prototype, cloud-based, glasses not phone.
- **Gogate et al., Interspeech 2023 demo** (Secondary): desktop app, lip-based enhancement integrated with openMHA, tested with hearing-impaired listeners.
- **Bose RAVEN + WASPAA 2025 demo "Real-Time System for Audio-Visual Target Speech Enhancement"** (arXiv 2507.21448 and 2509.20741; github.com/Bose/RAVEN, Read the README): claims the first open-source real-time AVSE that runs on CPU (Mac Mini demo, Python). Code is public.
- **Helen** (HKUST, 2019 President's Cup winner, Dyson Award national runner-up; Secondary): wearable camera plus LipNet for hearing in noise. Older, not a phone.
- **Google 2018 "Looking to Listen at the Cocktail Party"** (Secondary): the original no-enrollment, face-specified separation. Research only, no consumer feature found.
- Hackathon sweep: Cal Hacks 13 gallery (all 102 listed projects, Read titles and taglines via curl) has no look-to-listen project. I found no Devpost project for it through search, but search coverage of Devpost is weak (see unchecked).

What is left: phone-camera pointing (not glasses, not cloud-only), works on a stranger with no enrollment, lip-cued separation to ordinary earbuds, with a live caption output from the same separated stream. No rival I read does all of: phone camera, stranger, lip-based, captions, ordinary earbuds. Meta and Apple do the "voice in front" part with microphones only; Heriot-Watt is the closest on method.

Open AV speech separation models (Read READMEs, plus arXiv abstract for Swift-Net):

| Model | Repo | License | Weights | Speed figures from README/paper |
|---|---|---|---|---|
| IIANet (NeurIPS 2023) | JusperLee/IIANet | Apache-2.0 | Yes (LRS2, LRS3, Vox2 zips via release v1.0.0) | 3.1M params, 18.6 GMACs, 110.11 ms "GPU infer time" (GPU and clip length not stated in README); offline, non-causal. IIANet-fast listed at about 11% of CTCNet MACs |
| RTFS-Net (ICLR 2024) | spkgyk/RTFS-Net | MIT | Yes, 4/6/12-layer LRS2 weights | README emphasizes low compute; I did not extract a number. Offline |
| Swift-Net (2025) | JusperLee/Swift-Net, arXiv 2506.06689 | CC BY-NC-SA 4.0 (non-commercial; fine for a hackathon, bad for a startup claim) | Not confirmed; README points to training scripts and CTCNet's pretrained video module | Abstract: causal, streaming, "fast and lightweight", aimed at real-time; no ms figure in the abstract I read. Also has causal variants of AV-TFGridNet, RTFSNet, CTCNet |
| CTCNet (TPAMI 2024) | JusperLee/CTCNet | Apache-2.0 | Yes (table of pretrained models) | Offline; no speed figure extracted |
| VisualVoice (CVPR 2021) | facebookresearch/VisualVoice | "other" per GitHub (check LICENSE before use) | Yes (wget links) | Offline, old |
| RAVEN (Interspeech 2025) | Bose/RAVEN | GitHub shows no license (all rights reserved by default) | Not found in README; it instructs training on VoxCeleb2 | Paper/WASPAA demo claim CPU real-time; I could not verify the 120 ms figure |
| Lip features: auto_avsr (Apache-2.0), AV-HuBERT (license NOASSERTION, checkpoints need license agreement) | mpc001/auto_avsr, facebookresearch/av_hubert | as listed | Yes | Used by RAVEN as visual encoders |

Real-time caveat: the models with weights (IIANet, RTFS-Net, CTCNet) are non-causal, so you would chunk them (with added latency) rather than stream. Swift-Net is the one built for streaming but I did not confirm released weights, and its license is non-commercial. Treat "real-time on RTX 4050" as unproven for all of them.

Feasibility (2 students, RTX 4050 6 GB class laptop, ~44 h): MEDIUM-HIGH risk. Doable as a demo: webcam face crop (25 fps mouth ROI) plus chunked IIANet or RTFS-Net inference with pretrained LRS3 weights, output to earbuds, captions via a streaming ASR on the separated audio. Risks: environment setup for old research repos, mouth-ROI preprocessing matching training (25 fps, 16 kHz), chunk latency perceived as lag, and phone-as-camera streaming adds a network hop. I did not run anything (told not to download models), so VRAM and latency on a 4050 are unmeasured.

## Candidate 2: Verified non-visual web agent

Vocabularies tried: (a) "blind users, AI agent, fill web forms, voice approval"; (b) "human-in-the-loop approval bound to payload hash, fail closed, TOCTOU"; (c) "screen reader companion, read back values before submit, hackathon".

Closest rivals:
- **Blindly** (Devpost, Hackville 2026, Jan 18 2026; **Read**): conversational screen-reader companion that predicts what an action will do before the click, confirms responses before filling fields, "never auto-fills without explicit user approval", can browse and fill forms. No prize seen on the page. Partial overlap: approval gate yes, binding to outgoing request values no.
- **ScreenGuardian** (Devpost, Gemini Live Agent Challenge, Mar 16 2026; **Read**): visually impaired users, Gemini vision plus Live voice, agent clicks and fills forms; risk assessment and confirmation before sensitive actions (purchases, payments). Partial overlap, vision-based, no deterministic value binding.
- **fill.ai** (Devpost, HopHacks Fall 2025; Secondary, snippet plus submission line Read): voice-driven PDF form filler for the visually impaired. Partial.
- **FormWhisper, EchoAccess, Diamond Access AI, Wayfinder (AI Tinkerers ElevenLabs hackathon, Boston winner), Screen Agent (BMCC poster May 2026)** (all Secondary): voice or conversational web navigation for blind users, none seen with request-bound approval.
- **Approval-binding in the agent-security world** (Secondary, search snippets): hashgate on PyPI (payload-hash approval, fail closed on state change), Microsoft Agent Governance Toolkit ADR 0030 (proposed, action-bound fail-closed approval), Gravitee write-ups (parameter-hash approval tokens), a LangChain forum thread noting stock HITL does not bind approval to the payload, AWS Builder "hash-bound human approval". The mechanism is known; applying it to a blind user's spoken approval of a real browser form is what I did not find.

Verdict: CROWDED on the user story. A judge who has seen Blindly or ScreenGuardian will say "confirm-before-submit exists." The differentiator must be shown, not told: a live demo where a value is changed after approval (injected by a page script or a prompt-injected agent) and the submission is blocked, with the spoken read-back generated from the actual outgoing request, not from the agent's plan.

What is left: deterministic read-back from the real outgoing request, plus fail-closed on post-approval mutation, for a non-visual user. None of the rivals I read describes this.

Feasibility: MEDIUM. Playwright route interception to capture the request body, a canonicalizer, TTS/STT, and a mismatch check is small. Hard parts are real sites (JS-built bodies, multipart, CSRF tokens that legitimately change) and deciding which fields count as "values". No GPU needed.

## Candidate 3: Walk-through ADA audit

Vocabularies tried: (a) "LiDAR scan room ADA accessibility audit"; (b) "RoomPlan / digital twin / wheelchair / building code report"; (c) "ADA compliance iPhone app startup door width ramp slope".

Closest rivals:
- **RASSAR (UW Makeability Lab, ASSETS 2023 demo, CHI 2024)** (Secondary: arXiv 2404.07479 pages via search, ar5iv; abstract-level): smartphone LiDAR + ARKit/RoomPlan, detects and localizes indoor accessibility and safety issues in AR, JSON rubrics referencing ADA guidelines, user study versus manual audits. Strong overlap on the core idea. Research, not a product.
- **AccessiRoom** (Devpost, Hack the 6ix 2026, Jul 18 2026; **Read**): native iPad app, RoomPlan LiDAR scan to interactive accessibility assessment against a per-occupant mobility profile (passage width, turning space). It says it does not claim to certify compliance. No prize on the page. Strong partial overlap (barriers from a LiDAR scan); not ADA-cited.
- **AccessAtlas** (Devpost, UNIHACK 2026, Mar 15 2026; **Read**): crowdsourced 3D accessibility maps from phone LiDAR, AI turns scans into structured accessibility reviews. Partial.
- **TouchSpace** (Devpost, Cal Hacks 13.0, Oct 25 2026, winner of Anthropic "Claude for Public Benefit"; **Read**): LiDAR iPhone scan of indoor spaces into tactile/audio maps for blind users. Same scan input, different output. A judge from Cal Hacks lineage will know it.
- **DeepWalk** (startup, iPhone LiDAR sidewalk/curb ramp ADA measurement, Esri partner; Secondary). Outdoor, commercial.
- **ADA Pro (iOS app, checklist-style CASp inspection), UW-Madison ARHAT (home accessibility app), George Mason "Salus" robot (Jun 2026)** (Secondary).
- Research note (Secondary): a transportation study found iPhone 13 Pro LiDAR generally effective for ADA issues but inconsistent on curb ramp slopes.

Verdict: CROWDED. If pitched as "scan room, find barriers", RASSAR plus AccessiRoom beat you to it.

What is left: per-finding citation to the specific ADA Standards section with the measured value and a pinned 3D location in an exportable report (an audit deliverable, not a personal-mobility assessment). I did not find a rival that outputs a section-cited ADA report; RASSAR cites guidelines in rubrics but is an AR app.

Feasibility: MEDIUM-HIGH risk. Needs an iPhone/iPad with LiDAR and a Swift/RoomPlan app or exported USDZ; I do not know if the team has one. Measurement accuracy (door clear width, slopes) from RoomPlan is unvalidated; do not claim compliance. Not an RTX 4050 problem; it is a device and Swift problem.

## Candidate 4: ThisMeans

Vocabularies tried: (a) "blind student teacher pointing 'this' 'that' deictic narration board"; (b) "live audio description lecture professor points whiteboard VLM"; (c) "devpost blind student classroom live narration gesture pointing glasses hackathon".

Closest rivals (all Secondary, search snippets):
- **Haptic Deictic System (Virginia Tech, "Enabling the Blind to See Gestures")**: glove that conveys teacher pointing over raised-line graphics. Academic, haptic.
- **UC3M cognitive agent project (Feb 2026 post, in progress)**: monitors classroom audio, detects references like "this graph", resolves against slides, delivers description by speech on demand. This is the nearest conceptual rival; slides, not live pointing, and in progress.
- **Classroom Slide Narration System (arXiv 2201.08574)**, **WorldScribe (arXiv 2408.06627)**, **DigiEduHack board-reading glasses concept**, **Visionary AI glasses (JIC 2025)**: slide or text narration, no pointing resolution.
- Study on sighted teachers' deictic language harming blind students (JDSS, Pakistan): confirms the problem is documented.
- No Devpost or GitHub project found for pointing + "this/that" resolution. Cal Hacks 13 gallery: none.

Verdict: OPEN, after 3 vocabularies (plus the gallery scan). Caveat: search engines surface Devpost poorly, so absence is moderate evidence only.

What is left: live resolution of "this/that/here" from speech timing plus pointing gesture plus board content, spoken to the student. No rival does it live.

Feasibility: MEDIUM-HIGH risk. Needs pointing-target detection (hand/finger pose, MediaPipe) mapped to board OCR regions, ASR with timestamps, an LLM to bind "this" to a region, TTS. Fits on a 4050 for the vision parts or use cloud VLM. Accuracy of pointing-to-text-region is the weak link; demo needs a controlled board. Impact is also narrower (needs a classroom scenario).

## Candidate 5: Silent emergency call

Vocabularies tried: (a) "silent 911 lip reading mouth words TTS dispatcher domestic violence"; (b) "silent speech interface mouthing phone camera emergency"; (c) "devpost 911 nonverbal can't speak silent emergency AI voice agent".

Closest rivals:
- **Silent Voice** (github.com/thaimtl/Silent-Voice README **Read**; Devpost silent-voice-s1f74p **Read**, Cal Hacks 13.0, submitted Nov 1 2026 per page timestamp, "Cal Hacks Second Overall" and Cartesia best-use winner): you mouth words silently, camera lip reader (Auto-AVSR) plus facial EMG model SVR-1 plus Claude context repair, Cartesia speaks each word in your cloned voice, works "even on a phone call" via Twilio. Built for laryngectomy patients. Overlap with your idea: very high on the pipeline (lips to cloned voice to a phone call); it does not target 911, location sharing, or hiding scenarios in what I read. Note the EMG pads are part of their accuracy story; a camera-only version will be weaker, and the lip-reading accuracy limit is the same issue for you.
- **Existing silent-call infrastructure** (Secondary): Text-to-911 (e.g. Louisville July 2026 rollout, Rave/Motorola case studies), keypad prompts for silent 911 callers (Massachusetts, Maine DTMF alert), UK "Silent Solution" 999.
- **AI 911 dispatcher-side projects** (Secondary, Devpost): DispatchAI (Berkeley 2024), LifeSaver (Waterloo hackathon), Halo AI, Rescue Remix, QuickCall911. They serve callers who can speak or dispatchers, not mouthing callers.
- **LipLearner (U Tokyo)** (Secondary): phone lip-based silent commands.

Verdict: KILLED as stated. "Mouth anything at a phone, a voice speaks" is Silent Voice's tagline, from the same season, 2nd overall at Cal Hacks, findable by anyone who searches "mouth words" or "silent voice". Only survivable as a narrowly different thing (location payload, dispatcher protocol, text-to-911 bridge), which then competes with text-to-911 that already exists.

What is left: a 911-specific constrained-vocabulary flow with automatic location and confirmation to the dispatcher. Honest limit: free-form lip reading from a phone camera is not reliable enough for an emergency, and a judge will say so.

Feasibility: LOW-MEDIUM and ethically fraught (do not place real 911 calls; demo with a mock dispatcher line).

## Not checked or blocked

- Devpost search/gallery coverage: I read only the Cal Hacks 13 project gallery (8 pages, 102 projects, titles and taglines) and individual Devpost pages. I did NOT scan TreeHacks, HackMIT, Hack the North, PennApps or LA Hacks galleries; I did not open each of the 102 Cal Hacks pages, only keyword-filtered the listing. The listing may show only winners; not verified.
- Not checked: YC company directory, app stores, arXiv beyond what search returned, Google shipped features (no Google-specific lead found), Samsung/Sony/Jabra/Phonak features. OrCam Hear and Meta/Apple details are Secondary and I did not verify whether OrCam uses lip reading.
- Blocked: WebFetch 403 on edinburghchamber.co.uk. Devpost was not blocked via curl. Search-result snippets are generated summaries; items marked Secondary should be spot-checked before quoting.
- Not verified: Swift-Net released weights, RAVEN weights and the 120 ms claim, GPU used for IIANet's 110 ms, RTFS-Net speed numbers. Nothing was run or downloaded; RTX 4050 latency is unmeasured.
- Sparse vocabularies for candidates 2 to 5 on GitHub specifically: I used web search, not GitHub code/repo search, except for candidate 1's AVSS repos.

## Bottom line

1. Candidate 5 is dead as framed. 3 is crowded. 2 is crowded on story but has a defensible mechanism angle. 1 is crowded commercially but has a real technical hook and public models. 4 is the only OPEN one, with the weakest feasibility.
2. If forced to rank by (survives judges' "already exists" attack) x (buildable in 44 h): 2 and 1 first, then 4, then 3, 5 last.
