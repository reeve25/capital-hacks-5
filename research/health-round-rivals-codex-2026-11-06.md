> Historical: Nov 6 ideation material, superseded when FeelInk was chosen (Nov 6, about 21:35). Research preserved as written; current state is in STATUS.md.

**Verdicts: LAST MUSCLE—CROWDED; STILL HERE—KILLED; TONGUE X-RAY—CROWDED; FACE THE VOICE—KILLED; HALF A SMILE—CROWDED; EPLEY COACH—CROWDED.**

Searches covered Devpost, GitHub, app stores, startups/YC, Apple/Google/Microsoft features and papers, including recent 2026 variants. **All 18 rival sources listed below were opened.** Prizes are unstated unless named; project descriptions establish overlap, not clinical effectiveness.

**1. LAST MUSCLE — CROWDED**

Search vocabulary included *residual voluntary movement, facial switch, adaptive AAC, subpixel motion, locked-in communication,* and *EMG access*.

- [Motif](https://devpost.com/software/motif-wcmv8y), **Oct 17, 2026**: ordinary webcam learns 1–4 individual facial movements, including one-switch scanning and spoken phrases. ALS testing, predictive spelling and personal voices remain future work.
- [movo](https://devpost.com/software/movo-agy2be), **Oct 25, 2026; OxHack First Place**: webcam head pointing and winks, predictive T9 typing and ElevenLabs cloning of the user’s voice.
- [Residual](https://devpost.com/software/residual), **Oct 18, 2026**: personalized blink/eyebrow controls, fatigue-aware switching to scanning, speech and caregiver messaging; voice banking remains future work.

**Evidence and feasibility**

- **No minimum voluntary movement amplitude was established for a reliable consumer-camera ALS switch.** SeeMe tracks approximately **0.2-mm facial pores**; that is spatial resolution, not a demonstrated minimum displacement. A separate [DISC experiment](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0282730) detected visually imperceptible facial changes in **10 healthy volunteers**, using a Canon DSLR and chinrest—not an ALS communication switch.
- Eye control can deteriorate: an [ALS study](https://link.springer.com/article/10.1007/s00415-023-11957-y) compared **22 advanced, 44 earlier-stage patients and 32 controls**, finding greater oculomotor impairment in advanced disease. It does not establish an eye-tracker failure prevalence.
- Existing alternatives include [Google Camera Switch](https://support.google.com/accessibility/android/answer/11150722?hl=EN-GB), with adjustable facial-gesture size/duration; [Switch Viacam](https://sviacam.sourceforge.net/), a webcam motion switch; and [NeuroNode](https://controlbionics.com/neuronode/), an EMG/spatial sensor supporting small muscle signals and facial electrodes.

**Left:** Reliable, deliberate, otherwise invisible switching in actual late-stage ALS remains unvalidated; visible-gesture AAC and personalized speech already overlap heavily.

**2. STILL HERE — KILLED**

Search vocabulary included *covert command following, cognitive motor dissociation, coma microexpression, stimulus-evoked facial movement,* and *bedside consciousness assessment*.

- [SeeMe](https://doi.org/10.1038/s43856-025-01042-y), **Aug 20, 2025**: bedside camera detects otherwise unseen facial responses to spoken eye, tongue and smile commands—the central scientific demonstration.
- [mindBEAGLE PRO](https://www.gtec.at/product/mindbeagle-brain-assessment-and-communication/), documented in an **Apr 10, 2025 brochure**: EEG assessment of command following and selected-patient yes/no communication; requires additional hardware.
- [CAS consciousness-detection patent WO2025123409A1](https://patents.google.com/patent/WO2025123409A1/en), **Jun 19, 2025**: camera/eye-tracking responses to visual stimulation; adjacent mechanism, with no shipped product or clinical validation established.

**Evidence and feasibility**

- **SeeMe:** **37 comatose brain-injury patients plus 16 healthy volunteers**; analyzable eye recordings in **36**, mouth recordings in **17**. Eye responses: **30/36**, versus **25/36** clinically; mouth responses: **16/17**. The abstract’s **85.7%/71.4% are arithmetic errors**: those eye fractions equal **83.3%/69.4%**.
- Eye detection occurred **4.1 days earlier** in a paired analysis of **24** patients; mouth detection **8.3 days earlier**, **n=7**. The reported **81%** concerns command classification, **not diagnostic specificity for awareness**. Formal sensitivity/specificity remain unvalidated; artifacts, sedation, occlusion and possible false positives matter. Reliable yes/no communication was not demonstrated. [Full SeeMe paper](https://doi.org/10.1038/s43856-025-01042-y).
- **2024 NEJM:** **353 adults**, six centers; CMD detected in **60/241 (25%)** without observable command following. Conversely, **69/112 (62%)** who followed commands behaviorally tested negative on task fMRI/EEG. This was a convenience sample, median **7.9 months after injury**, with only **25% assessed within 28 days**—not universal acute-coma prevalence or camera validation. [Author manuscript](https://pmc.ncbi.nlm.nih.gov/articles/PMC7617195/).

**Left:** A validated phone implementation and dependable yes/no channel remain; no matching clinical phone product was found in these searches.

**3. TONGUE X-RAY — CROWDED**

Search vocabulary included *acoustic-to-articulatory inversion, speech-driven vocal tract, formant-to-tongue feedback, rhotic biofeedback,* and *internal-mouth pronunciation coach*.

- [Isiko](https://devpost.com/software/isiko), **Feb 18, 2024, TreeHacks**: microphone-driven **3D vocal-tract avatar** for pronunciation learning. Its page claims real-time operation but says the working product was offline and streaming remained unfinished.
- [LARYNX](https://devpost.com/software/voxlarynx), **Mar 1, 2026; HackIllinois Best AI Inference, second place**: audio-to-inferred articulator motion rendered inside a **3D skull**. Its purpose is deepfake detection, and its creator acknowledges an unfinished build.
- [Hide Your CLB](https://devpost.com/software/hide-your-clb), **Jan 17, 2026; Hack&Roll Top 9**: microphone formants drive live tongue/mouth estimates for Mandarin coaching; **2D SVG**, rather than 3D.

**Evidence and feasibility**

- [SPARC](https://github.com/Berkeley-Speech-Group/Speech-Articulatory-Coding) supplies pretrained inversion models: **12 coordinates representing six articulators in 2D**, not full tongue anatomy. Its [paper](https://arxiv.org/html/2406.12998v3) reports **correlation 0.878 ± 0.012** on held-out MNGU0 utterances; cross-speaker evaluation uses fitted alignment. No code/weight license was displayed in the opened repository.
- [ARTI-6](https://github.com/lee-jhwn/arti-6), **2025/2026**, provides checkpoints and reports **0.87 correlation**, using articulatory regions derived from a single-speaker MRI dataset; no license displayed. [AAI_Speaker_depen](https://huggingface.co/leenag/AAI_Speaker_depen) explicitly lists **Apache-2.0**, **PCC .810 / RMSE .761**, but tests held-out speech from the **same speaker**; RMSE units are unspecified.
- A [2026 randomized trial](https://pubs.asha.org/doi/10.1044/2025_JSLHR-25-00700) enrolled **108 children aged 9–15**, receiving **19 sessions**. Visual biofeedback improved generalization of /r/ more than motor treatment alone; ultrasound outperformed acoustic feedback in a subanalysis. This supports those feedback methods, not inferred tongue animation.
- [staRt](https://steinhardt.nyu.edu/news/helping-people-communicate), released **2020**, already provides free iOS visual-acoustic /r/ feedback through a frequency-spectrum display; it does not reconstruct the tongue.

**Left:** Accurate reconstruction of an individual child’s erroneous articulation—especially unseen children or deaf children—remains unestablished by these model results.

**4. FACE THE VOICE — KILLED**

Search vocabulary included *auditory-hallucination avatar, voice morphing, persecutory voice dialogue, assertiveness training,* and *inner-critic externalization*.

- [EchoCalm](https://devpost.com/software/echocalm), **Aug 9, 2025; Hackhub Honorable Mention**: AVATAR-inspired personalized hallucination voice/avatar and real-time AI dialogue. Human therapist collaboration is future work.
- [Avatar Therapy Ltd](https://avatartherapy.co.uk/), established trial-backed software, with **2026/27 rollout plans**: customized face/voice, therapist-controlled dialogue and changing power relationship. Uses transformed therapist speech rather than necessarily neural cloning.
- [Heka VR](https://hekavr.com/), current platform reporting patient use since **2019**: personalized hostile-voice embodiment, live clinician dialogue, training and supervision; requires VR equipment.

**Evidence and feasibility**

- **Original powered AVATAR trial, 2017/2018:** **150 randomized**, versus supportive counselling; at 12 weeks, hallucination-severity difference **−3.82 points**, **95% CI −6.70 to −0.94**. No adverse events were attributed to either therapy. [Trial](https://pubmed.ncbi.nlm.nih.gov/29175276/).
- **AVATAR2, Oct 2024:** **345 randomized**. At 16 weeks, distress differences versus usual care were **−1.05 points, d=.38** for brief treatment and **−1.60, d=.58** for extended treatment. Neither primary distress comparison remained significant at 28 weeks; extended treatment’s voice-frequency benefit persisted.
- Safety was **not “no adverse events”**: **58 serious events across 56 participants**, including two deaths judged unrelated; **six events in five participants were possibly treatment-related**. Delivery involved **19 trained, supervised psychologists, psychiatrists and nurse therapists**. [Full AVATAR2 paper](https://www.nature.com/articles/s41591-024-03252-8).
- The [June 2026 correction](https://pmc.ncbi.nlm.nih.gov/articles/PMC13375539/) concerns secondary-scale calculations and changes no inferential conclusions. The inner-critic extension also has a [2025 randomized study of 68 undergraduates](https://pubmed.ncbi.nlm.nih.gov/40714698/); that does not establish treatment efficacy for severe clinical self-criticism.

**Left:** Workflow or implementation differences remain; embodying a hostile voice and practicing therapist-guided assertive dialogue is established overlap.

**5. HALF A SMILE — CROWDED**

Search vocabulary included *digital symmetrization, healthy-hemiface mirroring, virtual mirror therapy, facial reanimation, Bell’s palsy filter,* and *video-call compensation*.

- [FaraPy](https://sites.cs.ucsb.edu/~sra/publications/farapy.pdf), **UIST, Oct 2021**: mobile AR facial-paralysis mirror therapy, unilateral movement feedback and progress tracking. Its **20-person** evaluation established user experience, not rehabilitation efficacy.
- [Face2Face Facial Palsy](https://cdn2.hubspot.net/hubfs/2724821/Kapios_One_Pager.pdf), **undated vendor document**: existing facial-paralysis mirror-biofeedback product. The [opened app archive](https://face2face-facial-palsy.appstor.io/) explicitly describes copying the healthy side over the affected side and home exercises; video-call export was not verified.
- [Facila](https://facila.tech/), current site announcing an **Oct 2, 2026 presentation**: standard-webcam facial mesh and muscle-activation feedback, explicitly seeking facial-paralysis partners; clinical validation/deployment remains prospective.

**Evidence and feasibility**

- [LivePortrait](https://github.com/KlingAIResearch/LivePortrait), released **2024**, provides portrait animation and expression retargeting. Its reported **12.8-ms generation on RTX 4090** is not end-to-end webcam latency.
- Its [license](https://raw.githubusercontent.com/KlingAIResearch/LivePortrait/main/LICENSE) is **MIT for core code**, but bundled **InsightFace pretrained models are restricted to noncommercial research** and require replacement for commercial use.
- [FasterLivePortrait](https://github.com/warmshao/FasterLivePortrait) provides a webcam workflow, claiming **30+ FPS on RTX 3090**. MIT code does not override separate model licenses. Neither repository establishes facial-paralysis compensation efficacy.
- Facial paralysis is already explicitly served by FaraPy and Face2Face. Also, **Moebius can involve bilateral paralysis**; a working-side-driven design cannot assume every intended user has a usable hemiface.

**Left:** Identity-preserving unilateral reconstruction inside ordinary video calls remains a narrower, unverified gap than mirror therapy or facial biofeedback.

**6. EPLEY COACH — CROWDED**

Search vocabulary included *positional nystagmus, affected-ear identification, canal localization, smartphone vestibular testing,* and *angle-aware repositioning*.

- [Epley Coach](https://github.com/Anuj7411/epley-coach), repository created **Sep 28, 2026**, Shipaton entry: the **same name**, five-position guidance, live angle checks, gated timers and spoken instructions. Uses inertial sensors and a questionnaire; expressly cannot inspect eye movements. No award verified.
- [EarSteady](https://play.google.com/store/apps/details?id=com.earsteady.app), updated **Jun 22, 2026**: camera head tracking upright, phone-on-cheek motion sensing while lying down, voice guidance and timed positioning; no nystagmus diagnosis.
- [EyePhone research](https://pubmed.ncbi.nlm.nih.gov/40688101/), **Jun 25, 2025**: smartphone eye tracking detects positional nystagmus during clinician-performed tests; no complete autonomous diagnosis-and-treatment workflow demonstrated.

**Evidence and feasibility**

- EyePhone tested **10 participants / 23 videos**, including only **three positive videos**. Sensitivity was **100%, 95% CI 44–100%**; specificity **100%, CI 84–100%**. These are small, video-level pilot results—not validated canal/ear localization.
- A [sham-controlled Epley trial](https://pmc.ncbi.nlm.nih.gov/articles/PMC2077628/) found **28/35 (80%)** free of positional vertigo/nystagmus at **24 hours**, versus **3/31 (10%)** sham. Repeated maneuvers were allowed.
- A [2023 self-Epley trial](https://pubmed.ncbi.nlm.nih.gov/37459743/) reported **29/32 (90.62%)** resolution at **one week**, versus **28/32 (87.5%)** clinician treatment; initial self-treatment was supervised and then repeated twice daily. Neither result means one unsupervised five-minute attempt reliably cures dizziness.
- [Healing Vertigo](https://play.google.com/store/apps/details?hl=en_US&id=com.app.healingbppv) already guides assessment and maneuver selection. [SmartVertigo’s July 2026 FDA clearance](https://www.accessdata.fda.gov/cdrh_docs/pdf26/K260566.pdf) covers iPhone eye recording/tracking **with a light-occluding headset** and expressly provides **no diagnosis or diagnostic recommendations**.

**Left:** Validated, unaided-phone nystagmus localization integrated with the appropriate maneuver remains unestablished in the opened evidence.

**What I could not check**

- **[vrtGO](https://vrtgo.app/)** is an important unresolved near-exact lead: indexed text claims front-camera nystagmus analysis and guided maneuvers, but opening returned no readable content and the browser host was unavailable. Date, functionality and validation remain unchecked.
- **[Cheshire](https://devpost.com/software/cheshire)** appears in a 2026 hackathon gallery as tiny-movement-to-own-voice communication; its project page stopped at a robot check.
- The new **[2026 SeeMe registry](https://clinicaltrials.gov/study/NCT07560631)** did not expose readable study details. Some paper full texts, current store availability and separately licensed model weights remained inaccessible or unspecified.
- No models/apps were executed, no patient performance independently tested, and private/unindexed submissions were not searchable. No exact YC rival was established. **“Not found” means not found in these searches.** No files were edited or contacts made.


