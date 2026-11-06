**My pick is ThisMeans, with NextLight offering the bigger—but riskier—stage moment.** Below is my ranking for the grand prize, balancing innovation, human impact, technical substance and a reliable two-person demo. These are judgments, not estimated winning probabilities.

I privately screened more than 25 ideas across all four tracks, then attacked the survivors through product sites, app stores, GitHub, academic papers, Devpost and procurement records. Permit checking failed particularly hard: Austin’s actual procurement document describes a proposed **$6 million Archistar contract**. [Record](https://services.austintexas.gov/edims/document.cfm?id=434566)

**Evidence labels:** Linked rival descriptions and numbers are **read**; proposed demos, differentiation and rankings are **reasoned**, untested. No customers were contacted. None honestly passes “historically impossible before now.” Their defensible **why now** is adaptable multimodal AI replacing specialized setup or training.

**1. ThisMeans — Health + Accessibility**

*“It tells blind students exactly what the teacher means by ‘this goes here.’”*

**Day now:** A blind student hears the explanation but misses the pointing that carries its meaning. Slidecho’s evaluated material contained substantial unnarrated content: its system exposed another 20% of text elements and 30% of image elements. That is study-specific, not a universal lecture statistic. [Paper](https://www.cs.cmu.edu/~jbigham/pubs/pdfs/2021/slidecho.pdf)

**90 seconds:** 0–15: teach using ambiguous pointing. 15–40: enable narration: “the solar panel connects to the battery.” 40–65: judge rearranges diagram cards. 65–90: listener facing away correctly identifies the changed connection. **Reaction:** it understood the finger, not just the sentence.

**Real/shell:** Synchronized speech, camera grounding, concise audio and uncertainty refusal must work. Accounts and course integration can be shells. Use large cards, not distant dense equations.

**Closest three, opened:** [EyeQ](https://devpost.com/software/eyeq-bafu4n), **hackathon**: infers likely visuals from transcripts; camera vision is future work. [VeasyGuide](https://arxiv.org/html/2507.21837v1), **research**: highlights instructor actions visually. [AD4Edu](https://arxiv.org/html/2610.17042v1), **research**: resolves references in recorded lectures. Innovation is **live, proactive, frame-grounded spoken reference replacement**.

**Buy/go/reach:** Webcam, lapel mic, single-ear headset. Walk to Sac State’s [AT Lab, AIRC 2011](https://www.csus.edu/student-affairs/centers-programs/disability-access-center/disability-center.html), Friday 8–5; atl@csus.edu.

**Hardest question:** “Why not Gemini Live?” “We must outperform it on timely, precise references; otherwise we have no differentiation.”

**Failure/Friday kill:** Wrong referent or narration lag. Test 12 unseen pointing utterances; kill below 10 correct or above three-second median latency. Obtain blind-user feedback.

**2. NextLight — Health + Accessibility**

*“Show it a routine once; it lights up the actual objects and catches skipped steps.”*

**Day now:** Someone with executive-function difficulties can perform individual actions but lose their sequence; a caregiver repeatedly prompts them.

**90 seconds:** 0–25: demonstrate packing lunch. 25–40: software extracts checkpoints. 40–65: another person follows projected object outlines. 65–80: deliberately omit an item; correction appears. 80–90: relocate objects; guidance follows. **Reaction:** one demonstration becomes a physical interface.

**Real/shell:** One-shot task extraction, object tracking and completion detection must work. Limit to one safe routine; caregiver history can be a shell. Secretly prewriting the sequence destroys the claim.

**Closest three, opened:** [SPICE](https://arxiv.org/html/2412.03551v1), **research**: projected cooking guidance using specialized tracking. [JMIR cognitive prosthesis](https://games.jmir.org/2025/1/e74157), **research**: recognizes cooking actions and corrects errors, but new modules require substantial preparation. [MapHabit](https://maphabit.com/), **established**: personalized visual routines. Innovation is **teaching a camera-verified routine once without retraining**, using ordinary devices.

**Buy/go/reach:** Bright consumer projector, overhead webcam, white mat and lunch props; same Sac State AT Lab for accessibility feedback. Local inventory unverified.

**Hardest question:** “Could it hurt someone?” “This demonstrates supervised, bounded task assistance—not clinical safety or caregiver replacement.”

**Failure/Friday kill:** Occlusion confuses task state. Teach three steps without editing, induce omissions, then move objects. Kill if progress requires hidden manual triggers or projection washes out under venue lighting.

**3. ScrapProof — Construction + Sustainability**

*“It designs something buildable from your actual scraps—and redesigns when a piece disappears.”*

**Day now:** Small crews and makers measure leftovers, puzzle over joints, then buy new stock. EPA estimates **600 million tons of US construction/demolition debris in 2018**; most was concrete, so don’t pretend this wood demo addresses all of it. [EPA](https://www.epa.gov/facts-and-figures-about-materials-waste-and-recycling/construction-and-demolition-debris-material)

**90 seconds:** 0–20: inventory numbered scraps; confirm dimensions. 20–40: generate an exact-stock shelf. 40–55: judge removes a critical board. 55–90: solver revises; assemble using ordinary brackets. **Reaction:** the revised object physically exists.

**Real/shell:** Stock allocation, geometry, joints and replanning must work. One shelf family, confirmed measurements and disclosed prepared brackets are acceptable. Avoid onstage cutting.

**Closest three, opened:** [XR-penter](https://arxiv.org/html/2501.15413v1), **research**: scrap twins, XR design and real builds. [Phoenix3D](https://github.com/StructuralXplorationLab/Phoenix3D), **research/open source**: inventory-constrained structural optimization. [Offcut](https://offcut.diy/), **small shipped commercial tool**: AI woodworking using existing stock. Innovation is the **camera-to-replan-to-physical-assembly loop**; novelty is medium.

**Buy/go/reach:** Tags, tape measure, clamps, brackets. Visit [Urban Wood Rescue](https://sactree.org/programs/urban-wood-rescue/), 6045 Midway Street, Friday/Saturday 9–3; ask yard staff about usable offcuts.

**Hardest question:** “Offcut plus a camera?” “The contribution is verified adaptation to changing physical inventory.”

**Failure/Friday kill:** Plausible plans have impossible joints. Build two different arrangements from 8–12 pieces after removing one. Any invented dimension, missing component or manual redesign kills it.

**4. ShelterFit — Civic + GovTech**

*“It rearranges a temporary shelter so someone can reach their cot without losing their caregiver.”*

**Day now:** Shelter staff must fit beds, belongings and access routes into unfamiliar rooms. California guidance explicitly says survivors should remain with caregivers and service animals. [Cal OES](https://www.caloes.ca.gov/office-of-the-director/policy-administration/access-functional-needs/sheltering/)

**90 seconds:** 0–20: show three cots blocking wheelchair access. 20–40: capture confirmed geometry and resident needs. 40–60: compute minimal moves preserving caregiver adjacency. 60–90: move cots; participant rolls through; judge adds luggage and triggers replanning. **Reaction:** an inaccessible bed becomes reachable.

**Real/shell:** Clearance, route checking, adjacency and replanning must work. One calibrated room is acceptable; emergency-system integration can be a shell.

**Closest three, opened:** [CLEARWAY](https://devpost.com/software/clearway-gwabvi), **hackathon**: wheelchair simulation and home fixes. [Crowdy](https://devpost.com/software/crowdy-xitju6), **hackathon**: evacuation/layout simulation. [Shelter-camp placement paper](https://arxiv.org/html/2609.39682v1), **research**: optimizes facility access. Differentiation is **individual cot assignment plus physically verified rearrangement**, not another evacuation animation.

**Buy/go/reach:** Folding cots, luggage, laser measure, tape and borrowed/rented wheelchair. Seek a shelter volunteer through [Red Cross Gold Country](https://www.redcross.org/local/california/gold-country.html), 1565 Exposition Boulevard; availability unconfirmed.

**Hardest question:** “What if your geometry strands someone?” “Measured inputs, conservative buffers and physical verification; advisory, not certification.”

**Failure/Friday kill:** Turning geometry is wrong. Test an unseen layout with an actual chair. One falsely approved route kills it.

**5. RuleCrash — Civic + GovTech**

*“It finds the specific family your proposed rule accidentally excludes.”*

**Day now:** Policy authors reason through prose; applicants discover edge cases later. Sacramento’s utility assistance application advertises annual savings **over $611**, depending on services. [Application](https://www.cityofsacramento.gov/content/dam/portal/dou/utilities/customer-service/2026-sura-applications/SURA%20Application%20(English)%20JAN2026.pdf)

**90 seconds:** 0–20: show the actual assistance rule. 20–40: introduce a **clearly hypothetical** amendment requiring unnecessary income documents. 40–60: solver produces an excluded qualifying household. 60–90: repair the clause and replay its application. **Reaction:** one sentence visibly changes a family’s outcome.

**Real/shell:** Executable rules, counterexample search and regression checks must work. Small reviewed rule domain; simulated households and application interface disclosed.

**Closest three, opened:** [Catala](https://arxiv.org/abs/2103.03198), **research/open source**: executable law. [CUTECat](https://arxiv.org/html/2410.18212v2), **research**: computational-law testing. [Oracle Intelligent Advisor](https://blogs.oracle.com/ia/intelligent-advisor-highlights-2024), **established**: rule authoring/testing. Innovation is approachable **draft-amendment-to-human-counterexample interaction**. Scientifically modest; technically strong.

**Buy/go/reach:** API credits only. Ask a public-benefits advocate at [LSNC Sacramento](https://lsnc.net/office/sacramento), 515 12th Street, to review one encoding.

**Hardest question:** “You proved your own mistranslation?” “Correctness is conditional on reviewed encoding, displayed beside source clauses.”

**Failure/Friday kill:** Wrong legal formalization. Independently hand-check ten households and a withheld amendment. Kill if results disagree or reviewers cannot agree on meaning.

**6. SayExactly — Open Tech + Accessibility**

*“A blind user approves spoken form details; the agent can submit only those exact details.”*

**Day now:** A voice agent can navigate a form, but the user must trust that its final action matches what they heard.

**90 seconds:** 0–25: complete a civic-form replica by voice. 25–45: read back and approve. 45–65: judge changes the address or hidden checkbox. 65–90: outgoing request is blocked, changes spoken, fresh approval requested. **Reaction:** the agent cannot silently betray approval.

**Real/shell:** Bind actual outgoing payload and destination—not merely DOM values. Support one request schema; disclose the replica.

**Closest three, opened:** [Zoya](https://devpost.com/software/zoya), **hackathon**: voice browsing with confirmation. [AP2](https://ap2-protocol.org/ap2/agent_authorization/), **open protocol**: trusted payment authorization. [Temporal UI inconsistency](https://arxiv.org/html/2604.18860v1), **research**: pre-action state verification. Innovation is a narrow **accessible civic-form adapter**, not a new authorization principle. Weakest novelty, strongest fit with your security background.

**Buy/go/reach:** Headset/API credits; seek feedback from [Society for the Blind](https://societyfortheblind.org/programs-services/classes-services/), 1238 S Street.

**Hardest question:** “Guarantee every website?” “Only supported schemas; unknown requests fail closed.”

**Failure/Friday kill:** JavaScript changes data after approval. Mutate DOM, application state, payload, duplicate fields and destination. Any silently changed request reaching the test server kills it.

