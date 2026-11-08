> Historical: Nov 6 ideation material, superseded when FeelInk was chosen (Nov 6, about 21:35). Research preserved as written; current state is in STATUS.md.

# Capital Hacks 5.0: five product ideas

Prepared Fri Nov 6, 2026. Assumes about 44 hours to an 11 AM Sunday submission.

## Bottom line

My pick is **Caught**. You say any sentence and see it the way your grandfather hears it, with holes in it, then you learn to fill them. It is the only idea here where a judge gets something personal in seconds with no rehearsal, the loud room makes the demo better, and my searches found no talker-side rival. **Lapsit** is a close second and has the strongest human story and evidence. Test both today and decide by about 4 PM. The names are placeholders, and the direction is your call.

Nothing below has been built or run. Every threshold is a suggestion from me, and no latency or accuracy figure is a result of ours.

**Labels**
- **Read:** I opened the page, abstract, README or PDF. Pages fetched with WebFetch went through a summarizing model. I read these directly with curl or a PDF parser: AppleVis, the two UC Irvine papers, Devpost project pages and GitHub READMEs. Quotes come only from those direct reads.
- **Secondary:** search-result text only, or the page was blocked.
- **[Reasoned]:** my own reasoning or memory, not something I read.

## 1. Caught

**The person and their day now.** The obvious user is a grandfather in his 70s with high-frequency hearing loss. The real user is his daughter. Vowels still reach him, but the quiet consonants (s, f, th, t) drop out, so "speak up" barely helps, because amplifying replays the parts he already heard ([SoundSense](https://devpost.com/software/soundsense-23r5im) describes this pattern, Read). At dinner she repeats herself louder. He nods and answers the wrong question, then stops joining in, and she wonders if he is ignoring her or slipping. [Reasoned] She has no way of knowing which of her words get through. If someone tells her to slow down and articulate, she tries for a minute and drifts back, because nothing tells her whether it worked. Clear speech does help: a search snippet credits Picheny et al. (1985) with a 17-20 point intelligibility advantage for hearing-impaired adults (Secondary; I did not pin down the exact source page). Nearly every product I found works on the listener, and I found none that coaches the talker.

**One-sentence retell.** Say anything and see your sentence the way your grandfather actually hears it, with holes in it, then learn to fill them.

**90-second live demo.**
- 0:00: Pick a hearing profile, such as a typical steep high-frequency loss. A second phone sits on the empty chair as "his seat," so it captures the real room and distance.
- 0:10: A judge says any sentence, unprompted. One to two seconds later the screen shows what they said and what he got: "Did you ___ your ___ before we ___?" with "He caught 4 of 9." Headphones replay their own voice through his ears.
- 0:35: One coaching cue appears, drawn from the words lost. The judge says it again and the holes fill.
- 0:55: A second judge tries to beat the score. Move the "his seat" phone farther away and watch the score fall.
- 1:15: Close on the inversion: every hearing product tries to fix the person with the loss, and this one is for the people who love them. Say on screen that the number is an estimate.

**Riskiest technical step.** Does speech recognition on simulated hearing lose the same words a person would? It may invent plausible words or collapse entirely. [Reasoned]

**Models and APIs.**
- Hearing model: MSBG from the [Clarity toolkit](https://github.com/claritychallenge/clarity), or [HearingLossSimulator](https://github.com/samuelgarcia/HearingLossSimulator), described as near real time (repo descriptions read; speed unmeasured).
- Recognition: faster-whisper locally on the RTX 4050, or a streaming API. Run it twice, once on the near-mouth mic and once on the "his seat" mic after the hearing model, then diff the words. Treat low-confidence words as holes. [Reasoned]
- Optional check: a phoneme confusion list like SoundSense's, which would not depend on Whisper's guessing.
- Coaching cue: start from templates, and add an LLM only if it earns its place.

**How to test the risk in 2 hours.**
1. Write 20 sentences. Two people each say them in a normal voice and in deliberately clear speech, in the actual hall.
2. Run all of them through three hearing profiles.
3. Have both teammates transcribe a sample of the simulated audio by ear and compare their misses with the recognizer's holes.
4. Kill it if clear speech does not raise the catch rate by at least 10 points, or if the recognizer's holes match human misses less than about 70% of the time.

**Closest rivals.**
- [SoundSense](https://devpost.com/software/soundsense-23r5im) (Read, Sound for All hackathon, page date 2026-07-31): an audiogram builds a personal confusion list, and meaning-changing words are flagged on the listener's captions. It is the closest match in mechanism. It helps the listener and does not coach the talker.
- [Auralis WebMCP](https://devpost.com/software/auralis-webmcp) (Read, opening only): a hearing-loss listening experience built by an audiology technician. It shows the communication gap is real, and it uses synthetic profiles and reference audio.
- [iHSIM](https://apps.apple.com/app/id1421965944) and [Sensimetrics I-HeLPS](https://hearingreview.com/hearing-loss/sensimetrics-corporations-new-hearing-loss-prosthesis-simulation-products-unveiled) (Secondary): live hearing-loss simulators with no transcript or score.
- [Clearly Audiobooks](https://mwm.ai/fr/apps/clearly-audiobooks/1608953900) (Secondary): uses clear speech to train the listener.
- [Cal Hacks 13 gallery](https://cal-hacks-13-0.devpost.com/project-gallery) (Read, titles and taglines of all 651 projects): nothing talker-side.

**What is left.** Feedback to the talker, on their own sentence, through the real room path. I ran six Devpost vocabularies, three GitHub vocabularies and two web searches and found no talker-side tool. That is not proof none exists.

**Toughest judge question.** "Whisper isn't my grandfather. Is that number true?"

**Honest answer.** Not for one sentence or one person. In the Clarity Prediction Challenge, a Whisper-based predictor had an error (RMSE) of about 25 against about 28.7 for the HASPI baseline on unseen listeners ([paper](https://arxiv.org/html/2401.13611v1), Secondary), which I read as points on a 0-100 percent-correct scale [Reasoned]. So we show direction: did you get clearer? We make no clinical claim. We also have not tested this with a real listener, and we don't know whether families keep the habit.

**Local path.** The [Maryjane Rees Audiology Clinic](https://www.csus.edu/college/health-human-services/community-services/audiology-clinic.html) at Sac State (Folsom Hall, Suite 1000) is staffed by Au.D. students and supervising audiologists. A 2022 university story lists weekday hours of 8-5 (Secondary; confirm first). If that still holds, today is the only chance before Sunday. An audiologist's reaction would answer the toughest question better than anything else. I contacted no one.

**Scores.**
- Innovation 5/5: it reverses the usual target, and my searches found no talker-side rival.
- Applicability 4/5: needs only phones and an audiogram, but whether the habit lasts is unknown.
- Technical proficiency 4/5: real room path, hearing model and dual recognition in a live loop, with no new model trained.
- Potential impact 4/5: reaches every family with an older relative with hearing loss, but the benefit is unproven with real listeners.

## 2. Lapsit

**The person and their day now.** A blind mother's four-year-old brings her a picture book chosen at the library today. A [CHI '24 study of 13 visually impaired parents](https://par.nsf.gov/servlets/purl/10522061) (Read) describes this life. Print-braille books were preferred by 12 of 13, but the books have to exist in that format. Parents prepare in advance, sometimes memorizing books. Images are a particular gap. One mother kept the intimacy of "still using [her] voice" by listening to an e-book through a headphone, echoing the text aloud and coaching her child to turn the page. The authors note page turns were hard to keep in sync, and participants described this "tandem reading" only for chapter books. A blind developer wrote in 2016: "One of the most frustrating things for me was not being able to read to my kids" ([AppleVis](https://applevis.com/comment/64062), Read). A UK mother with an OrCam described using it "to read the page and then say it aloud to them" ([inkl](https://www.inkl.com/news/orcam-s-myeye-for-the-visually-impaired-it-s-opened-up-a-whole-new-world), Secondary, page returned 403). Parents with low literacy face a related wall: [NCES counts 43.0 million US adults with low literacy skills](https://nces.ed.gov/pubs2019/2019179/), including 8.2 million who could not take the survey's background questionnaire (Secondary). The market's answer is to replace the parent: [Reading Mama](https://apps.apple.com/us/app/id6751842756) (Read) clones the parent's voice so the app can read without them.

**One-sentence retell.** A parent who can't read the page hears the next line in one ear, so their child hears the story in their own parent's voice.

**90-second live demo.**
- 0:00: A judge closes their eyes and takes one earbud. A phone on a small stand looks down at a picture book they have never seen (buy it today so nobody has rehearsed with it). A second judge sits beside them as the child.
- 0:15: The judge reads aloud. A short phrase arrives each time they finish the last one, and it waits or repeats if they stop.
- 0:40: The judge turns the page and the next phrase arrives without anyone touching the phone.
- 0:55: The second judge points at something in the picture. The earbud says "she's pointing at the fox in the boat," and the first judge answers her.
- 1:15: Ask the second judge whether they could tell. Optional finish if it survives testing: the same judge reads a page in a language they don't speak.

**Riskiest technical step.** The human, more than the model. Can an untrained judge listen and speak smoothly in a loud room without practice? [Reasoned] Second risk: the delay from page turn to first phrase on hand-lettered pages.

**Models and APIs.**
- Page-turn detection: local frame difference on the phone or laptop.
- Text and picture regions: a fast vision LLM such as Gemini Flash or Claude, returning phrases and region captions.
- Pointing: MediaPipe Hands (you already have MediaPipe working).
- Pacing: Silero VAD on the reader's voice, with recognition-based alignment only if needed.
- Whisper voice: Kokoro locally, or Cartesia.

**How to test the risk in 2 hours.**
1. Use three pages of an unseen book with a teammate's eyes closed, first with a person whispering the phrases by hand. This tests the interaction before any code exists.
2. Then wire up page read and TTS, and measure time from page turn to first phrase.
3. Kill it if a person who hasn't practiced cannot finish a page with two stumbles or fewer in the hall, or if first-phrase delay stays above about 3 seconds.

**Closest rivals.**
- [OrCam MyEye](https://orcam.com/en-us/blog/orcam-myeye-2-gives-this-blind-mother-a-second-chance-at-life) (Secondary, promotional): parents already use it for this. It is a dedicated wearable, and nothing I found says it follows the parent's pace.
- [Seeing AI](https://www.seeingai.com/) (Read, thin page): a free app that assists with reading and describes photos. Nothing on the page says it paces a reader.
- [AppleVis prototype](https://applevis.com/comment/64062) (Read, 2016): a blind parent stepped through book text with VoiceOver and an earbud. It needs a transcription, and I found no shipped app.
- [TaleTail](https://devpost.com/software/taletail) at Cal Hacks 13 (Read, opening): the child reads and AI listens. [Fonetti](https://businesscloud.co.uk/news/ai-reading-apps-bid-to-reach-500000-kids/) (Secondary) gives word-by-word feedback to a reader. Neither feeds the adult lines.
- [PictuRead](https://devpost.com/software/picturead) (Read): OCR to speech on an uploaded page.
- [CHI '24 "Intimate AT"](https://par.nsf.gov/servlets/purl/10522061) (Read): a research design space that names book scanners and reading voice assistants. It's a good citation, and I saw no product in it.

**What is left.** Any print book with no e-book needed, pacing to the parent's voice, automatic page sync, pictures and the child's pointing in the ear, and no hands on the phone. This addresses the "access labor" the CHI paper names.

**Toughest judge question.** "Seeing AI is free and can read a page into an earbud today. What did you actually invent?"

**Honest answer.** The crude version exists, and parents already do it by hand, which is the evidence of need. What we add is the interaction: no handling the phone, pacing, page sync, pictures and pointing. We have not tested it with a blind parent. It does not replace print-braille, which parents prefer, and it does not teach decoding, which a second study says [blind parents care about](https://par.nsf.gov/servlets/purl/10591429) (Read).

**Local path.** [Society for the Blind](https://rrd.dor.ca.gov/Consumer/ViewProviderDetails.aspx?id=71), 1238 S Street, Sacramento (Secondary). Weekend access is unknown.

**Scores.**
- Innovation 4/5: the idea of keeping the parent as the reader is fresh, but the mechanism is familiar.
- Applicability 5/5: a phone and an earbud, usable tonight on any book.
- Technical proficiency 3/5: solid real-time integration with little visible modeling difficulty.
- Potential impact 4/5: a clear benefit for blind and low-literacy parents, though adoption is untested.

**Note.** The eyes-closed format resembles your rejected blindfold guide and pointing-narration ideas. Check you aren't rejecting it for the same reason.

## 3. Mother Tongue

**The person and their day now.** A nine-year-old who doesn't speak has a handful of consistent sounds. His mother knows that a rising "eee" means it's too loud and a short "uh" means yes. Roughly 25-30% of autistic children do not develop functional spoken language ([Tager-Flusberg and Kasari](https://pmc.ncbi.nlm.nih.gov/articles/PMC3869868), Secondary, and estimates vary by definition). Clinicians already build a paper ["gesture dictionary"](https://docs.google.com/document/d/1agPExEhex21CBq7WglBAHepWHTGjJgqPyWN6ob_HXy0/export?format=pdf) of a person's signals, including vocalizations, from caregiver interviews (Secondary; author unverified). But you can't look a sound up in a paper list. [Reasoned] So at school with a substitute, at respite or in an ER, nobody knows what he means, and things can escalate.

**One-sentence retell.** His mom teaches a phone what his sounds mean in 30 seconds, so the substitute teacher finally understands him.

**90-second live demo.**
- 0:00: Judge A invents three noises and makes each one three times while a teammate, as "mom," says what each means. This takes about 30 seconds.
- 0:40: Judge B, who didn't hear the meanings, stands in front of them. Judge A makes a noise and the phone says, "I need a break."
- 1:00: Judge A makes a brand-new noise. The phone stays silent and shows "I don't know this one yet." They teach it on the spot, and it works.

**Riskiest technical step.** Telling 3-8 non-speech sounds apart from 3-5 examples each in a loud room, and refusing unknown sounds rather than guessing.

**Models and APIs.**
- Front end: [DeepFilterNet](https://github.com/Rikorose/DeepFilterNet), with the phone held close or a lapel mic.
- Embeddings: [voc2vec](https://huggingface.co/alkiskoudounas/voc2vec) (listing read; built for non-verbal vocalizations according to Tink's write-up) or [CLAP](https://github.com/LAION-AI/CLAP).
- Baseline: MFCC with dynamic time warping.
- Decision: nearest prototype with a rejection threshold, using your existing confirm-before-speaking state machine for low confidence.

**How to test the risk in 2 hours.**
1. Record four people, six sounds each, eight repetitions each, on a phone in the hall.
2. Train on three examples and test on the rest.
3. Kill it if known-sound accuracy is below about 85% or unknown-sound rejection is below about 80%.
4. If dynamic time warping ties the embeddings, ship it, and stop claiming this is only possible now.

**Closest rivals.**
- [MIT Commalla](https://www.media.mit.edu/projects/commalla/overview/) (Read): a pilot with a caregiver labeling app, with its last dated update in October 2020. No live voice output is described. [One case study](https://www.media.mit.edu/publications/augmenting-natural-communication-in-nonverbal-individuals-with-autism/) (Read) used 13+ hours and 300+ labels from one child, for a weighted F1 of 0.67.
- [Tink](https://devpost.com/software/tink-redh34) (Read, HackTX 26, page date 2026-10-24, two weeks old): infers intent from vision, gestures, nonverbal audio and context. The write-up doesn't mention caregivers or teaching, so it is general inference and not one person's dictionary. A judge could find it.
- [Apple Vocal Shortcuts](https://www.techradar.com/phones/this-new-ios-18-voice-control-feature-could-be-even-more-useful-than-the-new-siri) (Secondary; one source says it can use a custom sound, and Apple's guide page was truncated): the most dangerous rival because it's free. A judge with an iPhone might point to it.
- [My First Voice](https://www.monks.com/case-studies/my-first-voice-innovation-generative-ai) (Read): builds a voice from a child's sounds with one-tap phrases, and doesn't map sounds to meanings.
- [BabyTalk Translator](https://apps.apple.com/us/app/babytalk-translator/id1582829586) (Read): for babies, 5-10 corrections per sound, updated once a day, and no speech output stated.
- [Omoi/Amplify](https://github.com/navishjindal/Omoi) (Read): symbols plus vocal emotion, with low to medium accuracy by its own admission. [VocaLift](https://devpost.com/software/vocalift) (Read): humming to sentences with a general trained model.
- Google's Teachable Machine audio project uses similar few-shot training [Reasoned; the page wouldn't load for the fetch tool].

**What is left.** A caregiver teaches it live, it refuses what it doesn't know, it speaks aloud to a stranger, and the dictionary travels with the child.

**Toughest judge question.** "MIT worked on this for years and got recall of 0.53-0.79 across three people ([paper](https://www.media.mit.edu/publications/personalized-modeling-of-real-world-vocalizations-from-nonverbal-individuals/), Secondary). Why would three examples work on a real child?"

**Honest answer.** We can't show that it does. A judge's deliberate noises are much easier than a child's. We limit it to sounds a caregiver already considers reliable, and it stays silent otherwise, but it is unverified with any real child. It also puts words in the mouth of someone who may not be able to correct it, so the output has to be labeled "usually means, per mom."

**Local path.** [UC Davis MIND Institute](https://en.wikipedia.org/wiki/MIND_Institute), Sacramento (Secondary). Unlikely by Sunday. [Reasoned]

**Scores.**
- Innovation 4/5: an unusual framing, but the mechanism resembles existing few-shot audio tools.
- Applicability 3/5: reliability on real children is the open question.
- Technical proficiency 3/5: careful rejection and noise handling, but a small model problem.
- Potential impact 5/5: if it works, it changes daily life for people with almost no other voice.

**Note.** It shares a family with your rejected eyebrow-to-speech. The "only possible now" claim is also its weakest point.

## 4. Faceline

**The person and their day now.** A woman in her 60s with moderate hearing loss leans on lips more than she realizes. She copes in person. On the phone the lips are gone, so when the pharmacy calls she says "sorry?" three times and hands the phone to her husband, or lets it ring. [Reasoned] Caption apps exist ([Rylo](https://rylo.com/post/best-hearing-loss-apps), Secondary), but they make her read rather than listen.

**One-sentence retell.** Every phone call gets a live face lip-syncing the caller, so you can lip-read a voice on the phone.

**90-second live demo.** A judge takes a real call in the loud room while a teammate reads short, unpredictable sentences. Five sentences play with no face and five with the face, and the judge repeats what they heard while a tally runs on screen. The result is a number about their own ears.

**Riskiest technical step.** Does a mouth generated from telephone audio, with very little lookahead, carry enough real speech information to help? There's a useful advantage here: on a call no real lips compete with the face, so you can delay the audio to line it up. In person, the [roughly 200 ms delay in OrCam Hear](https://hearinghealthmatters.org/thisweek/2024/orcam-hear-ai-sound-separation-noise/) was described as making lip cues hard (Read).

**Models and APIs.** [NVIDIA Audio2Face-3D](https://github.com/NVIDIA/Audio2Face-3D), [MuseTalk](https://github.com/TMElyralab/MuseTalk), or phoneme recognition driving [TalkingHead](https://github.com/met4citizen/TalkingHead) in the browser (repo metadata read; VRAM fit unmeasured). Twilio Media Streams or WebRTC for the call.

**How to test the risk in 2 hours.**
1. Record 30 sentences and mix them with babble at -6 to -9 dB.
2. Render the faces with the fastest model you can get running.
3. Two people score audio only against audio plus face, counterbalanced.
4. Kill it below about a 10-point gain.

Also, ten trials is too few to show an 11-point effect reliably, so a judge could score worse with the face in front of everyone. [Reasoned] Pool the tally across judges, or set the noise level carefully.

**Evidence and closest rivals.**
- [Varano et al. 2022](https://www.frontiersin.org/journals/neuroscience/articles/10.3389/fnins.2021.781196/full) (Read): 18 normal-hearing listeners at -8.82 dB. Audio only 50.8%, generated face 61.8%, real face 71.2%. Generated faces poorly disambiguated some keywords, including n, m, g and t. Hearing-impaired listeners weren't tested.
- [SynFace](https://www.isca-archive.org/interspeech_2009/moubayed09_interspeech.html) (Read, 2009 abstract): the same concept on telephones. Large trials with hearing-impaired users found no significant gain in preliminary analysis, though individual results varied and many benefited, especially in babble.
- [CORDIS SynFace](https://cordis.europa.eu/project/id/IST-2001-33327/results), [Teleface](https://www.speech.kth.se/teleface) and [LipCcell](https://rcrwireless.com/?p=31937) (Secondary): older versions of the idea.
- [HearMe](https://github.com/ThePyProgrammer/HearMe) (Read, 2022, 0 stars): a student live viseme engine for phone calls. Near-exact in concept but old and obscure. Its README is mostly problem definition, so I could not confirm how far it got.
- An avatar abstract reports +18.5 points for normal-hearing listeners and +7.5 for cochlear implant users ([Thieme](https://www.thieme-connect.de/products/ejournals/abstract/10.1055/s-0044-1784910), Secondary, page blocked).

**What is left.** I found no shipped product. A modern face on a real call, measured live on the judge. This idea passes the drop rule because its rivals are old or obscure, but a judge's search will surface SynFace, so address it up front.

**Toughest judge question.** "SynFace tried this 20 years ago and its big trial found no significant gain. Also, captions already exist."

**Honest answer.** Both are true. Better faces may change the result, but newer evidence is mixed, and in the one study I read in full, generated faces still trailed natural ones. We would show a benefit in normal-hearing judges in noise, and that doesn't prove it for hard-of-hearing users. We don't claim to beat captions.

**Local path.** [NorCal Services for Deaf and Hard of Hearing](https://rrd.dor.ca.gov/Consumer/ViewProviderDetails.aspx?id=283), 4044 N Freeway Blvd (Secondary; a state listing says the Sacramento office is closed weekends), or the Sac State clinic above.

**Scores.**
- Innovation 4/5: sounds new to almost anyone, though the concept is 20 years old.
- Applicability 3/5: captions are a strong free alternative.
- Technical proficiency 5/5: a real-time generated face on a real call, plus a live measurement.
- Potential impact 3/5: helps people with usable hearing who lip-read, and evidence is mixed.

**Note.** If the 2-hour test shows a gain of 15 points or more, this jumps to second.

## 5. Lowband

**The person and their day now.** The same grandfather, on the phone. He can follow his son, but his granddaughter's voice has gone thin and her consonants have vanished, so calls with her turn into "that's nice, here's your grandmother." [Reasoned] Hearing aids can cost about $7,000 a pair by [one article's figure](https://hearinghealthmatters.org/thisweek/2024/orcam-hear-ai-sound-separation-noise/) (Read).

**One-sentence retell.** Your grandfather can't hear your voice anymore, so his phone re-speaks you in the range he still has.

**90-second live demo.** A judge wears headphones with a simulated steep hearing loss and hears a teammate over a real call: ten rhyme words (cat, hat, sat, fat), filter off. Score it. Then turn re-voicing on and repeat with new words. Score it again.

**Riskiest technical step.** It has to beat the boring baseline. If the simulated loss is only attenuation, plain equalization will fully undo it and the demo would mislead. [Reasoned] So the simulation needs dead regions and distortion, and re-voicing must beat audiogram-fit equalization plus classic frequency lowering under those same conditions.

**Models and APIs.** [w-okada voice-changer](https://github.com/w-okada/voice-changer) (RVC-style real-time conversion) plus explicit consonant lowering in DSP, or streaming recognition into a TTS with emphasized consonants. MSBG and HASPI from the [Clarity toolkit](https://github.com/claritychallenge/clarity). OpenVoice V2 is already working for you but may not be real-time enough (unmeasured). [Reasoned]

**How to test the risk in 2 hours.** Take 50 rhyme-test words through three conditions (equalization alone, equalization plus classic lowering, re-voicing). Score with HASPI and with two human listeners. Kill it below about 10 points over the best baseline. This shares its simulator with Caught, so the work overlaps.

**Closest rivals.**
- [US11783813B1](https://patents.google.com/patent/US11783813B1/en) (Read, Abbas Rafii, granted 2023): nearly this exact invention on paper, including keeping the speaker's identity and fitting to the listener's preferences. The patent names no product. This is why it ranks last on originality.
- [Fraunhofer VoIP hearing app](https://idw-online.de/de/news559591) (Secondary, 2013): call-side compensation without neural re-voicing.
- [Chatable](https://www.med-technews.com/news/neuroscience-led-ai-leads-to-launch-of-universal-hearing-aid/) (Secondary): a phone app that repeats only the voice element, not re-voiced for a specific loss.
- [HearLoRA](https://github.com/MyGoalIsToBeFrank/HearLoRA) (description read): audiogram-conditioned speech enhancement research.
- [Parrotron](https://www.research.google/blog/parrotron-new-research-into-improving-verbal-communication-for-people-with-speech-impairments/) and [Whispp](https://www.speechtechmag.com/Articles/News/Speech-Technology-News/Whispp-to-Debut-Real-Time-Assistive-Voice-Technology-161821.aspx) (Secondary): these fix the speaker's speech, the opposite direction.

**What is left.** A working real-time demo that a judge can score themselves.

**Toughest judge question.** "She wants to hear her granddaughter, not a stranger. Hearing aids already lower frequencies [Reasoned, not opened]. And you simulated the loss."

**Honest answer.** All fair. Identity may suffer, the benefit over existing frequency lowering is unproven and might not exist, and a simulator isn't a person. This may fail its own baseline test.

**Scores.**
- Innovation 4/5: a striking idea with little public work, but a patent covers it.
- Applicability 2/5: only calls, and it changes the voice the listener wants to hear.
- Technical proficiency 5/5: real-time conversion tuned to a hearing model and measured against baselines.
- Potential impact 3/5: valuable if it beats the baseline, which is uncertain.

## Ranking and pick

| Rank | Idea | Inn | App | Tech | Impact | Total | Retell | "That's real" | Only now | Life changes | Survives toughest question |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Caught | 5 | 4 | 4 | 4 | 17 | Strong | Strong | Yes | Yes, for a family | Yes, if labeled an estimate |
| 2 | Lapsit | 4 | 5 | 3 | 4 | 16 | Strongest | Strong | Partly | Strongest | Partly (Seeing AI) |
| 3 | Mother Tongue | 4 | 3 | 3 | 5 | 15 | Strong | Skeptical on real kids | Weak | Strong if it works | Partly |
| 4 | Faceline | 4 | 3 | 5 | 3 | 15 | Strong | Yes | Yes | Moderate | Partly (SynFace) |
| 5 | Lowband | 4 | 2 | 5 | 3 | 14 | Strong | Yes | Yes | Moderate | Weak |

The two 15s are tied on total. I put Mother Tongue higher because its demo is much more likely to work live.

**I would pick Caught**, for four reasons.
1. A judge sees their own unrehearsed sentence with holes in it within seconds, and that picture reads from across a room.
2. The loud room is an ingredient of the demo. With the other ideas, the noise is something to overcome.
3. It has the cleanest answer to "hasn't this been done?" and needs no new model, so most of the 44 hours can go to reliability.
4. It asks hearing people to change, which is a memorable inversion and avoids putting words in anyone's mouth.

Its weakness is that it sounds less impossible than the Cal Hacks bar. Lapsit's "you just read a book you've never seen" sounds more impossible and has better evidence, but it depends on an untrained judge performing well.

**Next steps today.** Split up. One person tests Caught's recognizer against human ears on the RTX laptop. The other runs Lapsit's whispered-by-hand test, which needs only a book and no code. Pick by about 4 PM. If you want the audiologist check for Caught, today is the day, and that would be your call to make.

## What I dropped and why

**Dropped for a near-exact, recent, findable rival:**
- **Hear only the person you point your phone at.** This had the best raw demo and reuses your face crop. [I'm Hear](https://devpost.com/software/i-m-hear-choose-who-you-listen-to) at Cal Hacks 13 (Read; Quest 3, tackles the cocktail party problem, and its tagline says point at someone and see their transcribed speech). [Cocktail](https://devpost.com/software/cocktail-qhcal1) (Read, GatorHack 2026, page date 2026-10-25). Heriot-Watt, Edinburgh Napier and Stirling [lip-reading glasses](https://www.techspot.com/community/topics/experimental-ai-smart-glasses-can-read-lips-to-improve-hearing-aids.294324/) (Secondary, 403). [OrCam Hear](https://hearinghealthmatters.org/thisweek/2024/orcam-hear-ai-sound-separation-noise/) (Read: earbuds, dongle and app; no camera described, although [CES copy](https://www.ces.tech/articles/orcam-hear/) mentions lip reading, Secondary).
- **Mute one specific sound (misophonia, autism).** [Sona](https://www.emergentmind.com/papers/2604.00447) (Read, April 2026): 42 ms on mobile, custom sounds from short examples, and a formative study of 68 noise-sensitive people. Also [Aurchestra](https://arxiv.org/abs/2603.00395) (Read, MobiSys 2026) and [Semantic Hearing](https://github.com/vb000/SemanticHearing) (Read, open code).
- **Friends' phones as your remote mics.** [Audio-Flow](https://devpost.com/software/audio-flow) (Read, World's Largest Hackathon, page date 2025-06-13) already does exactly this: QR join, WebRTC, no install, audio to hearing aids or headphones plus captions. This was my safest demo until I opened it.
- **Guide a blind person's pen on paper forms.** [PaperPal](https://graphicsinterface.org/proceedings/gi2021/gi2021-18/) (Read: 8 blind users, 96.7% accuracy), [WiYG](https://pure.psu.edu/en/publications/write-it-yourself-empowering-blind-people-to-independently-fill-o/) (Read), [IFFA, ASSETS 2025](https://researchwith.stevens.edu/en/publications/interactive-form-filling-assistant-on-smart-glasses-for-blind-use/) (Secondary), [Forma](https://fisher.wharton.upenn.edu/wp-content/uploads/2021/08/team1forma-Final-Report.pdf) (Secondary).
- **Guide a blind person's finger on touchscreens.** [VizLens](https://afb.org/aw/18/1/15282) (Secondary), with a [2023 App Store deployment](https://doi.org/10.1145/3597638.3614493) (Secondary).
- **Stuttered or whispered speech to fluent speech on calls.** [Whispp](https://www.speechtechmag.com/Articles/News/Speech-Technology-News/Whispp-to-Debut-Real-Time-Assistive-Voice-Technology-161821.aspx) (Secondary).
- **Alert when someone calls your name.** [iOS 26 Name Recognition](https://maketecheasier.com/iphone-name-recognition-feature/) (Secondary).

**Dropped by reasoning, with no rival search:** [Reasoned]
- Balcony or concrete knock test, and phone-based N95 fit check: no ground truth available by Sunday.
- Overnight hospice guidance: a judge can't experience it, and the stakes are too high for an unvalidated demo.
- Inhaler technique coach: hygiene problem with a shared device, and not impressive enough.
- Syringe dose checker: useful, but it doesn't sound impossible.
- "Your agenda item is next" city council agent and pay-stub wage checker: real, but no personal experience for a judge and no visible life change in 90 seconds.

**Track coverage.** All five sit in Health + Accessibility. I looked for Civic and Construction ideas, and none passed the test of a judge personally experiencing it. Treat that as my judgment. I did not search those tracks exhaustively.

**Lip-reading note.** The Cal Hacks 13 gallery already has Silent Voice (Second Overall), silent calls, Silent Speech and Verba (ventilator lip reading). That space looks crowded, so reusing your lip-reading assets as the headline would be risky. Caught and Lapsit barely need them.

## Coverage and limits

- **Cal Hacks gallery:** all 651 projects across 28 pages, 90 with awards, matched on titles and taglines only. I opened only the closest pages.
- **Devpost site search:** worked with curl, and several vocabularies were run for each idea. Some returned nothing.
- **GitHub:** 14 vocabulary searches. My first 11 were malformed and returned nothing, so I reran them. They are short keyword searches with few results each.
- **YC and app stores: weak coverage.** The YC-limited search returned mostly non-YC pages. The app-store search covered mainly the sounds idea, plus incidental hits from other searches. Treat "no rival found" as "not found in these searches," especially for app stores.
- **Blocked or incomplete:**
  - 403: inkl, TechSpot, Mayo Clinic Connect
  - 404: HeardThat blog, the Köln avatar study page (an NVIDIA Audio2Face study of 38 people with hearing loss appeared only as a search snippet)
  - Interstitial: Thieme
  - Truncated: Apple's guide, Avantree
  - Teachable Machine would not load for the fetch tool. Python's urllib got a 403 from Devpost, and curl worked.
- **Not checked:** whether Sona or Aurchestra released code, and actual VRAM or latency for any model.
- **Not done:** no browser tools used, no models downloaded, nothing under `dev` read, and nobody contacted.
