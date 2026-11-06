**My pick is C, narrowly scoped. A is the backup. B and E have direct product collisions; D is substantially more crowded than its framing suggests.**

I searched product terminology, GitHub, app stores, academic papers, procurement material, and Devpost. Linked pages below were opened. “Read” describes documented capabilities—not independently tested performance. “Assessment” is my reasoning. One access exception is explicit under D.

**A — Sacramento sidewalk access map**

**Read: three closest rivals**

1. [CurbWise](https://devpost.com/software/curbwise): hackathon prototype combining wheelchair routing, Gemini hazard-photo classification, and temporary reports that change routes. **Very close.** It deletes photos and does not describe Sacramento request integration. Its write-up retains unfinished placeholders, weakening evidence of reliability.
2. [Project Sidewalk](https://makeabilitylab.cs.washington.edu/project/sidewalk/): deployed research platform combining street imagery, crowdsourcing, computer vision, and accessibility mapping. Already covers your central data-collection thesis; it is broader infrastructure rather than your proposed local workflow.
3. [AccessMap](https://tcat.cs.washington.edu/accessmap/): available public web application routing over sidewalks and crossings using slope, curb, and mobility preferences. Already covers personalized accessible routing; it does not establish fresh photographic evidence for every crossing.

Commercial inspection also exists: [DeepWalk](https://www.deepwalk.com/) measures sidewalk barriers using iPhone LiDAR. Its [Fairhaven proposal](https://assets-global.website-files.com/62f4191b449f5e4fa5d3dde7/65e1fac069b07f35f13866c5_FairhavenProposal.pdf) describes barrier reports and GIS deliverables; a proposal is not proof of purchase.

**Assessment:** The potential contribution is a **fresh, evidence-backed Sacramento crossing inventory connected to remediation**. None of the constituent technology is new. City localization alone is weak differentiation.

**Judge:** “How do you know an apparently accessible crossing is actually passable?” Honest answer: only through recent field verification and explicit unknowns. Images cannot establish every relevant dimension or current obstruction.

**Friday kill test:** Walk six crossings; independently label both ends and photograph them. Run the proposed vision pipeline without correcting it. Kill the routing claim if it confidently approves an impassable crossing or cannot associate evidence with the correct crossing.

**Sunday:** Reliable six-crossing demonstration: yes. Citywide reliable routing: no. Likeliest failure: incomplete crossing topology produces a convincing route through an unverified barrier.

**B — Aphasia voice**

**Read: three closest rivals**

1. [AphaSay](https://www.aphasay.com/how-it-works): advertised Android beta reconstructing aphasic speech using family names, medications, routines, selectable alternatives, and ElevenLabs voice cloning. **Almost your exact concept.** It sometimes speaks automatically; universal confirmation would differ, but is an obvious safeguard.
2. [R-SPEAK](https://www.jmir.org/2026/1/e93518): research prototype combining speech recognition, LLM reconstruction, user selection/editing, and personalized synthesized speech. Already includes the central interaction. Larger feasibility testing remains future work.
3. [Speech Assistant AAC](https://apps.apple.com/us/app/speech-assistant-aac/id1139762358): shipping app supporting saved/typed phrases, ElevenLabs voices, and playback during phone calls. It does not reconstruct fragmented speech, but removes phone mode and cloned output as distinctive features.

AphaSay’s advertised “80% accuracy” deserves skepticism: its cited [paper](https://pmc.ncbi.nlm.nih.gov/articles/PMC12630810/) reports **80% cosine similarity**, not successful recovery of intended meaning in 80% of conversations.

**Assessment:** **Nothing clearly new in the core concept.** Scene conditioning is a possible implementation difference, not demonstrated innovation.

**Judge:** “Are you recovering their intention or inventing a plausible sentence?” No general honest affirmative answer. Confirmation helps only when the person can recognize and reject a wrong reconstruction.

**Friday kill test:** With consent, test ambiguous utterances whose intended meanings are independently known, including negations and medication requests. Kill if choices repeatedly omit the intended meaning or confidently reverse it. Students acting fragmented speech cannot validate efficacy.

**Sunday:** Polished staged demonstration: yes. Reliable communication aid: no. Likeliest failure: fluent, emotionally persuasive misrepresentation of the speaker.

**C — Non-visual web agent**

**Read: three closest rivals**

1. [Zoya](https://devpost.com/software/zoya): hackathon prototype operating a Mac through voice, narrating progress, requesting spoken confirmation before consequential actions, and handing back passwords/codes. **Voice control plus approval is already taken.** Its page does not document independent field-value verification.
2. [Sally](https://github.com/Manoj7ar/Sally): available open-source macOS project combining screenshots, DOM context, browser actions, and spoken narration. Already implements the operating loop; it does not document your proposed verified submission contract.
3. [Barracua](https://devpost.com/software/baracua): hackathon Chrome-extension prototype using screenshots, Gemini, Playwright, and voice to operate logged-in websites for blind users. Broadly duplicates the assistant; its write-up does not establish trustworthy pre-submission readback.

**Assessment:** A defensible contribution remains: **a submission gate that reads actual values, binds approval to that snapshot, and blocks if values change**. I found no equivalent documented guarantee in these rivals. That is a research finding, not proof of worldwide novelty.

**Judge:** “Reading the DOM proves values exist; how do you prove they belong to the correct questions and remain unchanged?” Honest answer only for explicitly supported forms with verified field meanings, rechecks, and fail-closed behavior.

**Friday kill test:** Put wrong defaults, misleading labels, and a post-confirmation mutation into a test form. Have someone complete it without viewing the screen. Any silent wrong submission kills the safety claim; blindfolded testing does not replace blind-user testing.

**Sunday:** Yes for one or two supported workflows, including a demonstrated refusal. Generic benefits/DMV automation: no. Likeliest failure: authentication, custom widgets, or incorrect field semantics.

**D — Medi-Cal 80 hours**

**Read:** [DHCS confirms January 1, 2027 implementation for affected adults](https://www.dhcs.ca.gov/medi-cal/help/), with exemptions and alternative income/education pathways. “Everyone must document 80 work hours” would be wrong.

**Three closest rivals**

1. [Nava OSCER](https://www.navapbc.com/hr1/medicaid): available open-source implementation offering exemption screening, rules, mobile reporting, case management, and Document AI. **Substantial redundancy.** It targets state infrastructure; your proposed navigator packet could sit outside it.
2. [MedicaidKeeper](https://medicaidkeeper.com/): its page opened but yielded no readable content; browser access also failed. Consequently, this is **secondary-source verified**, through [CBPP’s actual vendor assessment](https://www.cbpp.org/research/health/assessing-the-medicaid-work-requirement-vendor-landscape), based on demos/vendor conversations: SMS/email evidence intake, AI document extraction, activity reporting, and worker review. That is an exceptionally close collision. Current deployment/open-source claims remain unverified here.
3. [SteadyIQ](https://www.steadyiq.com/implementation): commercial verification covering nontraditional income and community engagement. Its [Missouri announcement](https://steadyiq.com/resources/missouri-partners-with-steadyiq-o-implement-h-r-1-eligibility-changes) describes work, education, volunteering, and exemption verification development. Agency integration differs from an independent navigator packet.

**Assessment:** Possibly an **offline-evidence, navigator-owned workflow for people existing systems miss**. Multilingual intake, document AI, exemptions, and tallies are already covered. No demonstrated unmet gap yet.

**Judge:** “Will a county accept this packet, and does it save navigator time?” Honest answer: unknown until a navigator checks it.

**Friday kill test:** Give a navigator one messy cash/gig/volunteer case and a sample packet. Kill if it duplicates existing intake, requires full re-entry, or cannot identify acceptable evidence.

**Sunday:** Reliable bounded extraction/tally/review demo: yes. Validated eligibility or accepted government packet: no. Likeliest failure: extracting numbers correctly but applying the wrong reporting period or evidence rule.

**E — Security team for small governments**

**Read: three closest rivals**

1. [NodeZero](https://horizon3.ai/nodezero/): shipping commercial autonomous pentesting, exploit paths, fix guidance, and targeted verification. **Directly duplicates find–prove–fix–retest.**
2. [Pentera](https://pentera.io/pentera-platform/): shipping commercial adversarial validation across internal, external, and cloud environments, with remediation orchestration and revalidation. Broader enterprise platform; government specialization is distribution, not technical novelty.
3. [Strix](https://github.com/usestrix/strix): available open-source agents performing dynamic application testing, working proofs of concept, remediation guidance, and patches. More application/developer focused, but undermines “cheap autonomous security team” as a novel claim.

**Assessment:** **Nothing technically new as stated.** Affordable onboarding and explanations for a single administrator might be useful service design.

**Judge:** “Why trust two students over established tools, and can you prove a finding without disrupting operations?” Honest answer only for tightly bounded checks in an owned lab—not arbitrary municipal infrastructure.

**Friday kill test:** Compare against Strix on an owned lab containing vulnerable and patched twins. Kill if your system merely paraphrases scanner output or cannot distinguish them.

**Sunday:** Reliable lab demonstration: yes. Credible municipal security service: no. Likeliest failure: staged exploitation looks impressive but proves no advantage over existing tools.

**Grand-prize ranking — judgment, not estimated probabilities**

1. **C:** Best remaining technical distinction and strongest live demonstration of user control. Make verification the product.
2. **A:** Strong local relevance and visible evidence; fieldwork can establish something real. Data completeness is the constraint.
3. **D:** Timely, applicable, and buildable, but heavily duplicated. Could move above A with navigator validation Friday.
4. **B:** Powerful emotional pitch, almost exact rivals, and the hardest efficacy claim to substantiate.
5. **E:** Mature competitors already sell the complete promise; municipal trust cannot be manufactured over a weekend.

I do **not** know a sixth idea I can honestly claim beats all five after equivalent checks. Inventing another attractive pitch now would repeat the original mistake.

