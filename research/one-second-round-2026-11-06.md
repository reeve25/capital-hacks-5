# One-second round (Claude), Nov 6, 2026, about 21:10 PT

Bar: top update in `.plans/winning-idea-bar-spec.md`. **Claude-only. No different-vendor check has run on these.** Nothing here has been built, run, bought or tried. Names are placeholders. Codex's independent list is separate: `codex-one-second-round-2026-11-06.md`. Validation is left out at their request.

Labels: **Read** = I read the project page or passage. **Fetched** = a fetch tool summarized the full text. **Snippet** = search summary only. **Tagline** = corpus name and tagline only, which has missed rivals before. **Reasoned** = my inference. **Memory** = unverified.

Corpus scan: 54,057 Devpost projects, keyword match on name and tagline. Winner labels can be participation prizes, so prizes below come from reading the page.

## Breathless. Health + Accessibility
**"Hold your breath and talk."**

**Problem.** Someone whose voice box was removed for cancer, or whose vocal cords no longer work. The common non-surgical option is an electrolarynx, $500-1,200 (Snippet, WebMD), held to the neck, with a flat tone and a lot of background noise (Snippet, TU Graz). If it breaks or isn't affordable, they have no voice. Disparities in access to voice rehabilitation supplies are documented (Snippet, 2023 study).

**What it is.** An app on the phone they already own. The vibration motor sends a buzz into the throat, as an electrolarynx does (Reasoned; untested with a phone). The mouth shapes that buzz into words. A second mic hears it, and AI replaces the buzz with a natural voice, ideally their own from old recordings.

**How a person uses it.** 1) Open the app. 2) Press the phone under the jaw. 3) Mouth words normally with no breath behind them. 4) People nearby hear the raw buzz speech at once, and the speaker or phone call gets the natural voice.

**Demo.** The presenter holds their breath, so the vocal cords are off, presses the phone to their neck and talks. Then a switch turns the buzz into a human voice. A judge tries it.

**What's novel.** No product or hackathon project found that uses a phone's own motor as the voice source. If the motor is too weak, a cheap bone-conduction headset could play a software waveform, which would also give pitch control (Reasoned; price and stock unchecked).

**Kill test.** Under 5 minutes, no code. Make either phone vibrate continuously, press it firmly under the jaw beside the windpipe, hold your breath and slowly mouth a sentence the other person doesn't know. Pass: at arm's length the listener gets more than half the words. Then about 30 minutes: record it on the other phone and run it through the best speech-to-text available.

**Rivals.** Corpus: 0 hits for phone-haptic throat, and the 2 "electrolarynx" hits are unrelated (Tagline). One web search found no app that drives a phone motor as an electrolarynx (Snippet). TU Graz student work 2011-12 used an Android app to drive an external device (Snippet). thaimtl/Silent-Voice has the same users but uses a camera and EMG pads, not a buzz (Read).

**Hard parts.** 1) Phone motors resonate at roughly 145-300 Hz and lose output away from resonance (Snippet: patents, Android docs). A narrowband near-sine buzz may not excite the higher resonances that make words (Reasoned); this is the first thing the test answers. 2) Off-the-shelf speech recognition does badly on this kind of speech: Whisper-small scored 88.2% character error on electrolarynx input, and 41.9% after the best conversion model; naturalness rose from 1.1 to 3.3 of 5 (Fetched, arXiv 2601.03892, ICASSP 2026, 2.75 hours of electrolarynx data). So the natural-voice half likely needs to be trained on the presenter.

**Toughest question.** "Is this as good as a real electrolarynx?" Honest answer: unknown, likely weaker on volume. A razor or toothbrush working this way is Memory; a search found no credible source.

## Mitts. Health + Accessibility or Open Tech
**"Type with oven mitts."**

**Problem.** People with cerebral palsy, Parkinson's, MS, stroke or arthritis whose hands can't hit one key at a time. Typing is slow and error-filled, and many also have unclear speech, so voice typing isn't an escape (Read: Second Voice page on dysarthria in ALS and CP).

**What it is.** A keyboard layer on Windows, on any keyboard, later a phone keyboard. You type however you can, and the correct text appears.

**How a person uses it.** 1) Install it. 2) Type a few sentences for about 30 seconds so it learns your pattern. 3) Type in any app with fists, knuckles or the side of a hand. 4) Words resolve live as context arrives.

**Demo.** A judge puts on oven mitts and pounds out a sentence the audience picks. One side of the screen shows key garbage, the other shows their sentence. Then again with elbows.

**What's novel.** A decoder built for this: keyboard geometry, chord timing and a language model, trained on synthetic mashing and adapted to one person in seconds. Autocorrect assumes most keys are right; this doesn't (Reasoned).

**Kill test.** About 1 hour. Reeve types 20 unseen sentences with mitts or fists while we log raw keys, then a v0 beam-search decoder runs on them. Suggested pass: 80% of words correct; their call. Laptops may drop keys when many are pressed at once (Memory), so measure that too.

**Rivals.** No mashing project found (Tagline, one web search). Gestur (HackDavis 2026, no prize listed) is a gyroscope-driven wheel with word suggestions (Read). Research covers the idea of decoding imprecise input: tremor-tolerant QWERTY for Parkinson's (CHI 2021, touchscreen, Snippet), LowKeyEMG (reduced keys plus an LLM, Snippet).

**Toughest question.** "Isn't this autocorrect with a prompt?" That is the real risk under "novel execution vs basic wrappers". We'd have to beat a plain LLM and a phone keyboard head to head, live, on the same mash. Also "why not voice?": noise, privacy, and many users can't.

## Blood Light. Health + Accessibility
**"See your blood stop and start."**

**Problem.** With a diabetic foot wound, burn or pressure sore, whether tissue is getting blood matters to healing, and it can't be seen by eye (Reasoned). Perfusion imaging is specialized equipment; price unverified.

**What it is.** A webcam or phone, a cheap red laser pointer and an app that shows a live map of blood flow in the skin, using laser speckle contrast.

**How a person uses it.** 1) Aim the light at the skin. 2) Hold still for a moment. 3) Read the live color map. 4) Compare with the other foot or hand.

**Demo.** A judge rests a hand under the light, and their blood flow shows on the big screen. Put a rubber band around a finger: that finger goes dark. Take it off: the blood floods back. Nobody has to be told what they're looking at.

**What's novel.** A $90 webcam version with a $5 pointer exists, but it added lenses and saw only a few square millimeters (Snippet, Richards et al. 2013). A whole hand, live, with no added optics would be the leap, and it's the main risk.

**Kill test.** About 1 hour, plus a store trip for a pointer. Dim room, locked webcam exposure, one finger. Pass: a clear, repeatable drop on occlusion on both of you.

**Rivals.** 0 speckle hits (Tagline). Smartphone versions are published: 2018, and 2023 at 20 Hz (Snippet). Through Skin (your earlier list) was dead on an IR vein finder that took a medical device prize, which is similar in spirit but a different mechanism.

**Flags for your line.** Spreading the beam probably needs tape or a diffuser, which may cross "nothing modified". Point it only at hands, keep it low-power and clear it with organizers. Hall lighting may not cooperate.

**Toughest question.** "How do you know that's blood flow?" Honest answer: it responds to occlusion and is uncalibrated, so it's not a clinical measure.

## See Air. Construction + Sustainability
**"Watch a gas leak nobody can see."**

**Problem.** Gas and air leaks are invisible, so crews rely on sniffers, soap bubbles and specialist cameras (Reasoned; AeroBOS's page says cost limits optical gas imaging cameras, Read).

**What it is.** A phone on a stand facing any patterned background. The app turns tiny bends in light into live video of moving gas.

**How a person uses it.** 1) Stand the phone facing a brick wall or printed pattern. 2) Start it. 3) Move the suspect pipe or gap into view and watch for the plume.

**Demo.** Press an unlit lighter: nothing to see in the room. On screen, a stream pours out. Then a hair dryer, then a judge's hand.

**What's novel.** Little. Feasibility is the best of any idea here and novelty the worst.

**Kill test.** About 30 minutes with a script or the public Pocket Schlieren app. Pass: butane clearly visible on a webcam or phone.

**Rivals.** Pocket Schlieren (arXiv 2404.16060) already does a lighter on a smartphone, and the app is public (Snippet). AeroBOS (OpenCV AI Competition, no prize listed) makes the same gas-leak pitch with cheap cameras (Read). ORNL lists a smartphone building-leak detector (Snippet).

**Toughest question.** "Doesn't Pocket Schlieren do this?" Yes. I don't have a strong leap yet. Unlit lighter indoors needs organizer OK.

## Knock. Construction + Sustainability
**"Knock on a wall and watch what's behind it appear."**

**Problem.** Inspectors find hollow spots in concrete by hitting it and listening, which depends on their ear and leaves little record (Reasoned, typical description).

**What it is.** A phone app. The camera sees where your hand is, the mic hears each knock, and a picture of solid and hollow builds up as you go.

**How a person uses it.** 1) Prop the phone so it sees the surface. 2) Knock across it. 3) The map fills in like a scratch-off.

**Demo.** A judge secretly arranges blocks behind a panel, and someone who didn't see knocks across the front. The shape appears on screen.

**What's novel.** Camera-located knocks by knuckle, no hammer or geotagging, with a live reveal (Reasoned).

**Kill test.** About 45 minutes. 20 labeled knocks on a wall, on and off studs, then unseen knocks. Suggested pass: 90% correct.

**Rivals.** No hackathon hit (Tagline). Research is close: phone hammer sounding with a deep model and a defect map on bridge decks (Snippet, Alsulami); phone mic with a rotary hammer (Snippet).

**Toughest question.** "A stud finder costs $15." True for drywall, so the pitch must be concrete and tile. The demo prop isn't a bridge. It needs a panel under the $50 limit.

## Understood. Health + Accessibility. LOUD RIVAL FLAG
**"Bite a pen and talk."**

**Problem.** Dysarthria: people fully there, but nobody can understand them.

**What it is.** A laptop or phone that listens to unclear speech and says it clearly right away, in a voice like theirs.

**How a person uses it.** 1) Open it. 2) Talk as they talk. 3) Clear speech comes out.

**Demo.** A judge bites a pen and says something garbled; the laptop says it perfectly. The healthy-judge version of this moment didn't appear in the rival pages I read, but I read only about the first 1,000 characters of each.

**Kill test.** About 30 minutes. Record 10 bitten-pen sentences and run them through the best speech-to-text plus an LLM with context. Suggested pass: 8 of 10 meaning intact.

**Rivals: near-clones with prizes.** Second Voice: 1st Place Apps for Your Life, OpenAI Build Week, "zero training", GPT candidates with confirm (Read). VoiceBridge: Best Use of Baseten, Hack the North 2026, "in your own voice" (Read). Also ember, Vocera, Voxlift (Tagline) and Voiceitt (shipped). Under the loosened rule it stays visible. The pen demo is all that's new.

## Silent Voice, reopened
You asked for a visible leap over thaimtl/Silent-Voice. **The field is worse than we thought.** Besides thaimtl (2nd overall), Cal Hacks 13.0 also had `silent calls` (no prize listed, Read) and Silent Speech (Tagline), and Hack the North 2026 had Mute Caveman (Tagline).

**The best leap I can offer:** a judge scans a QR code, mouths at their own phone with no install and no pads, and hears it in a voice cloned on the spot, with the mouth crop sent to Nathan's GPU laptop. It looks different up close, but from the judges' seats it's still Silent Voice. I'd call that a moderate leap, not a strong one. Its real advantage is existing code, though silent accuracy has never been measured. `app/cache/m2c/silent_probe.py` in `_old-silent-voice` is ready for that test, about 10 minutes.

Breathless is the stronger answer to "a leap over Silent Voice": same person helped, but no camera.

## Cut
- Around the Corner (webcam reads a floor shadow to see a person behind a corner; Bouman et al. ICCV 2017, Snippet; no hackathon hit): biggest "wait, what", but "why not a $30 mirror?" has no good answer, and the product drifts into an alert app.
- Hearing through your teeth or jaw: a striking feeling, but bone-conduction headphones already ship.
- Keystroke-sound password recovery: a great stage trick, but it fixes nothing for anyone.

## Advisor lean, not a decision
1. **Breathless, if the 5-minute test passes.** It has your "one second, no explaining", the person-comes-back feeling, $500-1,200 made free, and no rival found on the mechanism. A judge can try it. It's also the riskiest on physics and on the voice conversion.
2. **Mitts** if it fails. Almost certain to run by Saturday noon, and very funny and clear on stage. Its risk is being read as autocorrect.
3. **Blood Light** is the best pure visual, but it depends on the room and leans on your physical line.
