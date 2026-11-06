# Silent Voice plan audit — 2026-11-06

**Verdict: conditional research demo, not a validated recognition plan.** A useful narrow demo remains plausible, but neither the preferred Windows encoder nor actual silent performance is established. Move those gates ahead of polish. Do not promise patient performance, arbitrary-phrase rejection, a judge's one-minute enrollment or an own-voice restoration.

Scope: read CLAUDE.md, STATUS.md, PLAN.md, OPTIONS.md Round 2, research/codex-round2-candidates.md, HANDBACK.md and supervisor prompts. Two independent researchers checked data and encoders; a third independently reviewed evaluation, consent and the skeptical-judge story. Their agreement is not validation. Primary sources and observed checks below support each conclusion. No product code, model installation, bulk dataset download, outward message, purchase or settings change was performed. Audit-only test code is [fakecam-audit.cjs](fakecam-audit.cjs).

**Evidence labels:** **Read** = source statement or inspected code; **Measured** = an observation on this laptop/request; **Reasoned** = assessment or proposed requirement. Download probes verified headers/tiny payload prefixes, not complete usable archives. Detailed request notes: [datasets](data-audit-notes.md), [encoders](encoder-audit-notes.md).

## 1. Critical: the original first gate cannot test the core claim; humans arrive too late

**Read:** [Imperial's normal/whispered/silent study](https://spiral.imperial.ac.uk/entities/publication/f78d4012-fe20-48a7-9c04-578190828746) reports a silent-test classification drop up to 8.5 percentage points. A [2023 Interspeech paper](https://www.isca-archive.org/interspeech_2023/kashiwagi23_interspeech.html) explicitly addresses different normal/silent lip movements. Muting a spoken recording does not change its production mode.

**Read:** [LipLearner](https://arxiv.org/html/2302.05907v3) is encouraging actual silent-interaction research, not merely muted spoken-video evidence. Its 25-command one-shot F1 0.8947 is a different experiment/metric from the live study: one-shot recognition was 87.29% voiced versus 81.67% unvocalized after voiced enrollment. It fits a linear classifier; prototype averaging is not an established equivalent. These findings do not demonstrate this project's encoder, speakers, vocabulary, OOV rejection or patient transfer.

**Measured:** no app/ exists at audit time; no local recognition/human performance was measured. The old M5 only tested a *kit* on dataset footage, so it could be checked without a person ever silently mouthing anything.

**Reasoned / fix applied:** start with six phrases and three truly silent takes each; typed labels, separate validation and randomized fresh silent holdout. M2 delivers the kit, M3 requires actual human results at first availability Friday. Put PENDING HUMAN at the top of the handback now. Package/test independent work while waiting, but never pass the live gate or declare READY using replay. Healthy-student results remain healthy-student results.

## 2. Critical: no inspected encoder is a cleared, measured Windows dependency yet

**Measured:** nvidia-smi is absent. CIM enumerates Intel(R) Graphics only; **Intel Core 5 120U**, 10 physical cores, 12 logical processors; RAM 16,858,472,448 bytes (15.70 GiB). Absence of nvidia-smi alone would not prove GPU absence; controller enumeration supports the CPU-only operating assumption. No inference benchmark was run.

**Read/measured:** [LipLearner's actual repository](https://github.com/rkmtlab/LipLearner) is MIT, contains pretraining/iOS code, and its training entry point assumes CUDA. The README's [portable checkpoint](https://drive.google.com/file/d/1RK7no1QH8QFZzjVrmg64X8wuCLRfJzu3/view) returned HTTP 404 unauthenticated. The tracked CoreML weight archive returned 200 with Content-Length 88,982,435. Apple's [standard prediction API requires macOS](https://apple.github.io/coremltools/docs-guides/source/model-prediction.html); non-Apple conversion/execution alternatives are not verified here. Seven fork trees, release listings and a named-model search did not locate portable weights; this bounded search is not proof no mirror exists.

**Read/measured:** [Auto-AVSR](https://github.com/mpc001/auto_avsr) exposes a CPU [feature extraction example](https://github.com/mpc001/auto_avsr/blob/main/tutorials/feature_extraction.ipynb). Its official [250M-model checkpoint](https://drive.google.com/file/d/12PNM5szUsk_CuaV1yB9dL_YWvSM1zvAd/view), following the public download form, returned 206, application/octet-stream, bytes 0-15/1001892616 and ZIP magic without authentication. Availability is established; full integrity, loading and speed are not. Apache applies to code; README explicitly separates pretrained-model terms derived from training data. The notebook's older direct Imperial weight URL returned 404.

**Read:** [AV-HuBERT's license](https://github.com/facebookresearch/av_hubert/blob/main/LICENSE) is custom noncommercial research, with restrictions including commercial/production use and biometric processing; the [checkpoint page](https://facebookresearch.github.io/av_hubert/) includes acceptance. Its legacy fairseq/Python stack adds install risk. The smaller [TCN repository](https://github.com/mpc001/Lipreading_using_Temporal_Convolutional_Networks) also imposes comparative/benchmarking use conditions. None is permission-cleared just because the weights can be fetched.

**Reasoned / fix applied:** a ~1 GB parameter set is not inherently impossible in this RAM, but allocation copies, activations, browser and server matter. Limit LipLearner discovery to 30 minutes; give Auto-AVSR at most two hours only after use terms are established. Demand safe CPU load, real nonconstant embeddings, deterministic repeat inference, batch-one timing and peak RAM before UI polish; isolated-model results are provisional until M2 repeats with the full browser/server/encoder stack. No training/CoreML conversion detour. A landmark/DTW baseline is the executable fallback hypothesis, not evidence the final targets are attainable. No cloud rescue that silently breaks privacy/offline claims.

## 3. High: dataset access, reuse and class counts invalidate the proposed benchmark grid

| Corpus | Read / measured access and rights | Concrete consequence |
|---|---|---|
| **GRID, author Zenodo release** | [Record](https://zenodo.org/records/3625687) and [metadata](https://zenodo.org/api/records/3625687) identify open access, CC BY 4.0. Unauthenticated range request to s1.zip returned 206, ZIP bytes, total 423,520,514 bytes. | Best verified fixture source. Attribute creators/license and transformations. Start with one speaker plus alignments. Repeated aligned words vary in sentence context; report a spoken-word benchmark. Do not call them repeated medical phrases or silent speech. Original Sheffield research-use wording must not be substituted for the distinct explicit Zenodo release terms. |
| **MIRACL-VC1** | [Author page](https://abenhamadou.github.io/miraclvc1/) says research only; 15 speakers, ten words plus ten phrases, ten takes each. Public Drive response was 200 HTML virus-scan confirmation for ~5 GB, not media bytes or a login demand. | Actual archive retrieval remains unverified. Research-only terms do not establish prize/product-media reuse permission. Not default; do not bundle/show participant footage absent clear rights. Twenty total classes leave none for disjoint class-OOV testing at a 20-class setting. |
| **CREMA-D** | [README](https://github.com/CheyneyComputerScience/CREMA-D), [license](https://github.com/CheyneyComputerScience/CREMA-D/blob/master/LICENSE.txt): ODbL database, DbCL contents; user registration requested; normal ZIP has LFS pointers. CSV parse measured 7,442 clips, 91 actors, 12 sentence IDs, 1,089 actor/sentence groups, 5–16 takes per group. Individual video probe failed TLS locally; no successful media retrieval observed. | Twenty phrases impossible. Not every actor has every sentence. Emotional variants are not neutral repetitions. No registration submitted. Download a tiny valid subset before depending on it; avoid documented corrupt files. Attribution and public derivative-database obligations require review; code/content/personality rights are distinct. |

**Read:** [ODbL](https://opendatacommons.org/licenses/odbl/1-0/) allows commercial use with notice and relevant share-alike/access duties for derivative databases; it is not a blanket noncommercial ban. [DbCL](https://opendatacommons.org/licenses/dbcl/1-0/) addresses individual contents. This is a license screening, not assurance of every downstream right.

**Read / reasoned:** [iBUG's genuinely silent corpus](https://ibug.doc.ic.ac.uk/resources/av-database-normal-whispered-silent-speech/) is scientifically closer, but current download/use permission was not established; not an unattended dependency. RAVDESS's two statements do not solve ten-phrase evaluation, and video-only files do not necessarily mean silent production. No verified public source found replaces local consented silent enrollment.

**Fix applied:** explicit GRID release first; remove MIRACL/CREMA as default dependencies and unsupported 6/10/20 sweep. Preserve original-utterance split integrity, disjoint OOV classes and stated production mode. No forms, false affiliations or agreement acceptance unattended.

## 4. High: the error target can be gamed by rejecting everything or leaking test data

**Read:** old M1 has top-k and confident-wrong targets without definitions/coverage, and the architecture learns from every confirmation. There is no locked validation/test protocol. Nearby frames or emotion variants can also leak across splits.

**Reasoned:** reject-all trivially minimizes accepted mistakes. Threshold selection on the reported test invalidates the reported estimate; incremental learning during that test changes the experiment. A high similarity or softmax value is not a calibrated confidence, and visually indistinguishable OOV phrases cannot be universally rejected.

**Measured calculation:** Python evaluated 1 - 0.05**(1/20) = 0.139108. Even zero failures in 20 independent OOV trials leaves a one-sided exact 95% upper bound around 14%; correlated repeated takes weaken generalization further.

**Fix applied:** explicit accepted-wrong denominator, OOV false acceptance, nonspeech false activation and in-vocabulary coverage floor; raw top-k includes rejected in-vocabulary trials. Split by original take before crops, keep enrollment/validation/test disjoint, freeze threshold/learning/context, exclude prompts/audio/filenames/labels from model inputs. At least 60 randomized fresh trials per speaker with separate OOV and nonspeech groups; publish counts/confusion matrix and limits. Targets screen demo feasibility, not clinical error guarantees.

## 5. High: confirmation and a consent flag do not enforce the claimed safeguards

**Read:** old plan says speech only after confirmation, but gives no binding between a confirmation, current phrase and voice. A Boolean voice-consent flag says nothing about capture, retention, public recording or revocation; learning every confirmed phrase silently expands storage.

**Reasoned:** context changes, new frames or a different voice after selection can make a previous click speak an unreviewed result. Queued speech can survive delete/revoke. Local processing alone does not prevent sensitive face/voice retention in logs, caches, git or profiles. A consent flag cannot prove identity or prevent all misuse.

**Fix applied:** no default/automatic selection; explicit speech confirmation bound to exact text, capture/result version and voice profile. Invalidate on changes; cancel pending output on reset/loss/delete/revoke; no speech replay on reload. Separate capture/test, optional storage/training, voice and public-demo consent. Ephemeral default; test deletion of in-scope samples, embeddings, caches and output queues. State deletion scope rather than claiming forensic erasure. Audio disabled for recognition; typed context only. Verify local runtime assets and actual offline voice, not a cloud-backed browser voice presented as local.

## 6. High: one-minute enrollment and own-voice restoration are unsupported human promises

**Read:** old demo expects an unfamiliar judge to enroll and use medical phrases in under 60 seconds; tagline promises own voice. No relevant local measurement/sample is recorded.

**Reasoned calculation:** ten phrases × three takes × an assumed two seconds per take = 60 seconds of articulation alone, before permission, framing, labels, instructions, pauses or retries. This is a scenario calculation, not a measured phrase duration. Someone already voiceless may have no usable pre-loss archive; a judge's camera permission does not authorize cloning.

**Fix applied:** calibrated presenter first, enrollment timed from consent/framing through readiness; stranger demo conditional on a prior new-speaker test. Generic offline TTS first, optional specifically consented whole-phrase playback. Cloning deferred. Human tasks surfaced immediately; the build does not invent consent while the owner is away.

## 7. Medium: fake webcam works on Windows, but it does not validate silent recognition or audible output

**Read:** [Chromium source](https://raw.githubusercontent.com/chromium/chromium/main/media/capture/video/file_video_capture_device.cc) implements file-backed Y4M capture; [Playwright supports Windows](https://playwright.dev/docs/intro) and [scoped camera permissions](https://playwright.dev/docs/api/class-browsercontext#browser-context-grant-permissions). Context7 was queried first for launch flags/permissions, then source and a local test checked the mechanism.

**Measured:** node research/fakecam-audit.cjs exited 0 on Windows using an existing Playwright 1.63.0/Chromium 156.0.8078.4 installation. It generated synthetic Y4M in a temporary path containing spaces, passed that absolute forward-slash path as one argument, used an isolated camera-only context on loopback, and requested audio:false. Canvas samples saw both expected tones: 21 samples, red range 28–214, 64×48 video, zero audio tracks. Temporary fixture/context/server were removed/closed. No real webcam, user profile or persistent permission was used.

**Reasoned / fix applied:** M2 must use a permitted real full-face Y4M fixture through the actual crop/recognition path, assert frame content, and restart capture/browser per fixture to control looping/start position. MP4 is not the intended direct input. Keep fixtures short/downscaled to control uncompressed size. Synthetic colors and mocked recognizers only prove plumbing. Headless speech calls do not prove a speaker emitted audible offline sound; add a headed actual-output check. Physical camera, lighting, fresh takes and humans remain separate gates.

## 8. Medium: the skeptical-judge story overstates differentiation and clinical relevance

**Read:** [the HRA SRAVI result summary](https://www.hra.nhs.uk/planning-and-improving-research/application-summaries/research-summaries/speech-recognition-application-for-the-voice-impaired-sravi-v10/) reports 31 recruited patients and 468 videos; version-one accuracy 21.8%, version two 34.6%, with significant usability/acuity issues. These are distinct from the [2023 14-patient feasibility paper](https://pmc.ncbi.nlm.nih.gov/articles/PMC10332046/). Do not attach the later percentages to the earlier study or imply a lab-demo head-to-head win. The [company register](https://find-and-update.company-information.service.gov.uk/company/NI635074) records liquidation; it does not establish a technical failure cause.

**Reasoned / fix applied:** confirmation/context/rejection are design choices, not established novelty or an answer that defeats SRAVI. Show visual scores and rankings before/after context; reveal failures and fixed vocabulary; never let context invent output. Measure a simple phrase-board comparison, report participant type, and admit patient benefit, payment demand and superiority remain unvalidated. Reject emergency positioning. Pitch based on the bounded working implementation and honest future path, with all AI/model/data disclosures.

## 9. Medium: remote-first scaffolding and optional features precede existential risks

**Read:** old M0 requires creating/pushing a private GitHub repository while its hard rules require explicit yes for posts/account changes. The worker prompt also directs pushes. M4 context/voice precedes M5 human testing; outreach and polished assets can consume time before core recognition works. Prior-work eligibility and submission deadline remain unconfirmed in project records.

**Reasoned / fix applied:** local repo/tests/CI configuration first; remote operations only with documented explicit authorization, never inferred from privacy or an agent-written plan. PLAN hard rules govern worker pushes. Early handback records organizer confirmation as a human dependency, not a gate agents can silently mark passed. Model/human gates now precede context/voice/polish. Defer cloning, automatic segmentation, STT/LLM, wide benchmark sweeps and outreach. Keep a phrase-board/labeled-replay handoff if recognition fails; do not check recognition off merely because a fallback runs.

## Applied changes and remaining uncertainty

PLAN.md now specifies M0 local foundation, M1 bounded data/model proof, M2 minimal loop and early kit, M3 actual silent-human gate, M4 enforceable safety/optional context, M5 hardening and M6 evidence-matched pitch/repo quality. All gates remain unchecked. HANDBACK.md surfaces the pending human/consent/eligibility steps. STATUS.md gets one audit log line.

Remaining uncertainties are explicit: complete dataset/checkpoint integrity, checkpoint demo permissions, native Windows model loading, CPU recognition latency, silent accuracy/OOV behavior, installed offline speech, patient benefit, new-speaker enrollment and organizer rules. None was resolved by a source search, simulation or agent agreement. Next authorized build step is M0 then M1, not product switching or outreach.

Document verification: seven edited/added files decoded as UTF-8, four relative Markdown links resolved, seven milestones remained unchecked, and app/ remained absent. node --check research/fakecam-audit.cjs passed; the separate actual Windows smoke result is recorded above. Independent review of the revised plan/report/handback found no material contradiction and requested the full-stack memory/timing clarification, now applied. Product tests/build were not run because this audit created no product.
