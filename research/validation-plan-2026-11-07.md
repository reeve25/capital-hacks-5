# FeelInk validation plan: who to talk to and what to ask (Sat Nov 7 2026, 15:30 PT)

Written for Reeve and Nathan. Slides are planned for about 11 AM Sunday, so there are roughly 19 hours. `USERS.md` is empty, and the rubric scores "did a customer or user try it", so one real conversation with a blind person beats ten blindfolded teammates. Both are worth doing.

**Labels.** Read = read on the cited page today. Snippet = seen in a search result only. Reasoned = our inference.

## 1. Who the user is, in three segments

| Segment | Role in FeelInk | Why they matter for Sunday |
|---|---|---|
| A. Blind or low-vision students (high school, college) who have taken math or science | The feeler | The primary user. One 15-minute phone or Zoom call counts as user validation. |
| B. Teachers of the visually impaired (TVIs), tutors, parents of blind kids | The drawer | They buy and set up tools. They know what happens today when a teacher draws on the board. |
| C. Adults who lost sight later, assistive-tech (AT) instructors | Proxy feelers and experts | Easier to reach; can judge whether phone vibration is usable, and know the Monarch and tactile graphics world. |

## 2. People we can reach this weekend, ranked

Volunteer chapter contacts list personal phones on the public NFB of California chapters page (Read, https://www.nfbcal.org/chapters-and-divisions/, fetched 15:20 Sat). Volunteers often answer on weekends. Professional offices (Society for the Blind, state library, Sac State DAC) are closed until Monday.

### Tier 1: call or text today (Saturday afternoon or early evening)

| Who | Contact | Why them | Ask |
|---|---|---|---|
| **NFB of California, River City Chapter (Sacramento)**, contact Tiffany Manosh | (916) 241-3274, nfbcrivercity@gmail.com. Meets 2nd Saturday 10:30 AM on Zoom (next is Nov 14, too late). | Local blind adults, segment C, possibly students too. | A 15-minute call tonight or Sunday 9 AM; ask if any member has an Android phone and would try it over Zoom. |
| **California Association of Blind Students (CABS)**, contact Valeria Garcia Vallejo | (510) 434-4532, valeria.garciav2024@gmail.com. Usually 3rd Saturday 3 PM on Zoom. | Blind college students: exactly segment A. | Same ask. One student on Android is the ideal remote test. |
| **California Parents of Blind Children**, contact Jamie Principato Crane (also NFB San Jose chapter) | (720) 919-6846, blackbyrdfly@gmail.com. Meets 4th Wednesday 7:30 PM on Zoom. | Segment B: parents who sit next to a kid doing geometry homework. | How does your child get a diagram today? Would they try a phone-vibration drawing over Zoom? |
| **NFB of California state president Tim Elder** | (916) 382-0372, president@nfbcal.org (Read, nfbcal.org home page) | Sacramento area code. Can point to a member fast. | "We're two Sac State students with a prototype. Who in Sacramento would give us 15 minutes this weekend?" |
| **People already at the venue** | Organizers (Umang), mentors, other teams | Fastest. Ask every mentor: "Do you know anyone blind or low vision, or a TVI, who'd take a call tonight?" Also ask if any participant has a vision impairment. | Also recruit blindfolded testers here for the shape test (section 4). |

### Tier 2: post tonight, read replies Sunday morning

Posting in the team's name is an outward action and needs both of you to say yes (CLAUDE.md hard rules). Draft text is in section 6.

| Channel | Why | Rules seen |
|---|---|---|
| **Blind Android Users** community: groups.io list `blindandroidusers+subscribe@groups.io`, Telegram group, Discord, voicemail +1-307-202-9797, email myandroidjourney@blindandroidusers.com (Snippet, from podcast show notes; links may be stale) | FeelInk only works on Android Chrome. These are the blind people who already own the right phone. Best online channel for an actual remote test. | Not checked. Join, read a few posts, then ask. |
| **r/AskABlindPerson** | Founding post says good-faith, respectful questions from sighted people are welcome (Snippet). | Ask about experience, not for survey clicks. |
| **r/blindsurveys** | r/Blind sends research and feedback requests here (Snippet). Do not post the ask in r/Blind itself. | Structured asks go here. |
| **NFB-Cal listserv** (nfbc-info at nfbnet.org) | Statewide members. Posting may need membership; ask Tim Elder or Tiffany Manosh to forward instead. | Members-only, unverified. |

### Tier 3: Monday and later (roadmap slide, not Sunday's validation)

| Who | Contact | Notes |
|---|---|---|
| **Society for the Blind**, 1238 S Street, Sacramento | (916) 452-8271; Mon-Fri 8:00-4:30 (Read, classes page). Programs: Computers and Assistive Technology class, Braille Literacy, Braille Production & Training Program, CareersPLUS Youth (ages 14-22, Snippet), North State Assistive Technology Store. Instructors are blind or low vision (Read). | Best local partner. 2.5 miles from campus. Ask for the AT instructor and the youth program coordinator. |
| **California State Library, Braille and Talking Book Library**, 900 N Street | (916) 654-0640, btbl@library.ca.gov, Mon-Fri 9:30-4:00 (Snippet, 2022 handbook) | Staff know patrons and local TVIs. |
| **Sac State Disability Access Center**, Lassen Hall 1008 | (916) 278-6955, dac@csus.edu, Mon-Fri 8-5 (Snippet) | Can forward an invitation to registered blind or low-vision students. They won't give names. |
| **California Council of the Blind** (state office in Sacramento, 2143 Hurley Way Ste 250) and its **ACB Capitol Chapter** | (916) 441-2100, ccotb@ccbnet.org (Snippet; chapter page contacts look outdated) | Second blind consumer group in town. |
| **Sacramento County Office of Education** vision educators and orientation & mobility teachers | Job descriptions exist on scoe.net; no named contact found. Call SCOE Special Education main line Monday. | Segment B, the people who would actually run FeelInk in a lesson. |

## 3. What we are trying to learn (the hypotheses)

Write the answer to each after every conversation. A "no" is a result too, and judges respect it.

1. **Problem exists.** When a sighted teacher or tutor draws something, a blind student currently gets it late, by words only, or not at all.
2. **Current workaround is bad.** Pre-made tactile graphics, raised-line drawing kits, or verbal description are slow, need preparation, or need a $15,500 device.
3. **Live matters.** Feeling the stroke as it's drawn (not a finished shape later) is what people want.
4. **Phone vibration is enough** to tell a line, a corner and an end apart, after a minute of practice.
5. **The phone is the right device.** Target users own an Android phone, or would borrow one. (If every student we talk to is on iPhone, that is a serious finding for the slide.)
6. **The drawer would use a browser on a laptop** with no install.

## 4. Test protocol for anyone who tries it (blind user or blindfolded tester)

Already built: 5-shape blind test in `feel.html` (`startTest`), results to `results.jsonl` on Reeve's laptop. Set the pass bar before the run (issue #33 step 2).

1. Give the phone face up, finger on the glass. Say: "A line is drawn on the screen. You'll feel a steady buzz when your finger is on it, a double tap at a corner, a triple tap at an end."
2. One practice shape with the answer told. 60 seconds max.
3. Five test shapes, no help. Record right or wrong, seconds, core and fade settings, initials, and whether they are blind, low vision or blindfolded. Separate the two groups in every number you report.
4. Then the live step: one of you draws a shape on the stage while they feel it. Ask them to say what you drew.
5. Ask the follow-up questions in section 5, block D.

For a remote blind user on Zoom: the relay is on localhost, so it needs a public tunnel (for example `cloudflared tunnel --url http://localhost:8765`, no account needed) so their Android phone can open the feel page over the internet. Set this up before calling anyone. Label the result "remote, over internet".

## 5. Interview script outline (15 minutes)

Rules: don't describe FeelInk until block C. Ask about the last time something happened, not whether they would like something. Silence is fine. One person asks, the other types.

**A. Open and consent (1 min)**
- "We're Reeve and Nathan, students at Sac State in a weekend hackathon. We're building something for blind students in math and science classes, and we want to know if the problem is real before we pitch it tomorrow. Fifteen minutes."
- "Can we take notes? Can we quote you? With your name, or anonymous? Can we record audio or video?" Write down exactly what they said yes to.
- "Tell us a little about you: are you blind or low vision, since when, and are you a student, a teacher, a parent?"

**B. Their world today (5 min)**
- "Think of the last time a teacher or tutor explained something that was a picture: a graph, a triangle, a diagram of a cell. What happened?"
- "How did you get the shape? Words? A tactile sheet someone made earlier? Someone's hand guiding yours? Nothing?"
- "How long did that take compared to the sighted students?"
- "What happens when the teacher draws something new on the fly, not prepared ahead?"
- "Have you used a tactile drawing board, swell paper, a Monarch or other refreshable tactile display? What was good and bad about it?"
- "What phone do you use? Android or iPhone? Do you use vibration for anything today?"
- For teachers and parents: "How many hours a week go into preparing tactile materials? What do you skip because there's no time?"

**C. Show FeelInk (2 min)**
- "Here's what we built. A tutor draws in a web browser on a laptop. As they draw, you feel each line through the vibration of your own Android phone: steady buzz on the line, a double tap at a corner, a triple tap at the end. No app, no hardware, works in Chrome."
- Stop. Let them react first. Write the first sentence they say word for word.

**D. Try it, if they can (5 min)**
- Run section 4. If remote and without Android, skip to E and say so in the log.
- "What did that feel like? Could you tell a corner from a line?"
- "What would make it clearer?"
- "If this were on the desk in your next class, would you pick it up or leave it? Why?"

**E. Hard questions (2 min)**
- "What's the strongest reason this wouldn't work for you?"
- "Who else would need to say yes: a teacher, a school, a parent?"
- "If you could change one thing, what?"
- "Who else should we talk to? Can we say you sent us?"

**F. Close (30 s)**
- Repeat back the consent: "So we can quote you as [name / anonymous], and [can / can't] use the recording."
- "Can we follow up after the weekend?"

## 6. Draft outreach messages (send only after both of you approve)

**Phone or text to a chapter contact**
"Hi, my name is ___, I'm a Sac State student. My teammate and I are in a 48-hour hackathon building a tool that lets a blind student feel a diagram through their own phone's vibration as a tutor draws it. We've never had a blind person try it and we don't want to pitch tomorrow without hearing from someone who would actually use it. Would you, or someone in your chapter, have 15 minutes tonight or tomorrow morning for a call? If they have an Android phone they could even try it over Zoom. Thank you."

**Online post (r/AskABlindPerson, Blind Android Users)**
Title: "Blind students: how do you get a diagram when a teacher draws one live?"
Body: "Two students here, weekend hackathon. We're prototyping a web page where a tutor draws on a laptop and a blind student feels each stroke through phone vibration (Android Chrome only right now, since iOS has no vibration API). Before we present it we'd like to hear: when a teacher drew something on the board, how did you get it? What do you use now? Would phone vibration be worth anything to you, or is this solving the wrong problem? If anyone on Android would try it live over a call tonight or tomorrow morning, we'd be grateful. Honest 'this won't work' replies welcome. We will not use anyone's name without asking."

## 7. Logging template for `USERS.md`

```
## <date time> <name or "anonymous"> (<blind / low vision / blindfolded>, <student / TVI / parent / adult>)
How reached: <chapter / venue / reddit>
Consent: notes <yes/no>, quote <yes/no>, name <yes/no>, audio <yes/no>, video <yes/no>
Phone: <Android model / iPhone / none>
Their words on the problem today: "..."
First reaction to FeelInk: "..."
Tried it: <no / blind 5-shape: N of 5, median s / live stroke: what they said you drew>
Strongest objection: "..."
Hypotheses (section 3): 1 <y/n/?> 2 <> 3 <> 4 <> 5 <> 6 <>
Follow-up allowed: <yes/no>
```

## 8. What this lets the slide say

- With one blind conversation: "We spoke with ___, a blind ___ in Sacramento, who told us ___" (with consent).
- With one blind feel test: "A blind user identified N of 5 shapes by vibration alone on first try."
- With blindfolded testers only: "N sighted, blindfolded testers identified X of Y shapes, median Z s." Say blindfolded. Do not call it user validation.
- With nothing: say "No blind user has tried it yet; our first scheduled conversation is ___ on Monday" and name the organization. Honesty scores better than a hole.

## Sources read or seen today
- NFB of California chapters and divisions (Read): https://www.nfbcal.org/chapters-and-divisions/
- NFB of California home, president contact (Read): https://www.nfbcal.org/
- Society for the Blind classes page (Read): https://societyfortheblind.org/programs-services/classes-services/
- Society for the Blind directory listings (Snippet): https://rrd.dor.ca.gov/Consumer/ViewProviderDetails.aspx?id=71
- Braille and Talking Book Library patron handbook (Snippet): https://library.ca.gov/wp-content/uploads/2021/08/BTBLPatronHandbook.pdf
- Sac State Disability Access Center (Snippet): https://www.csus.edu/student-affairs/centers-programs/disability-access-center/
- California Council of the Blind on acb.org (Snippet): https://www.acb.org/affiliate-california ; ACB Capitol Chapter profile: http://ccbnet.org/drupal7/node/144
- Blind Android Users podcast (Snippet): https://shows.acast.com/blind-android-users-podcast/about
- r/Blind research policy pointing to r/blindsurveys (Snippet): https://rblind.com/post/3098409
- r/AskABlindPerson welcome post (Snippet): https://redlib.groet-infra.nl/r/AskABlindPerson/s/oB2XKLmGEu
- SCOE vision educator job description (Snippet): https://www.scoe.net/media/zkek1vsi/vision_educator.pdf
