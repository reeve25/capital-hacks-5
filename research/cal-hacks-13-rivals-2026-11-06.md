# Cal Hacks 13.0 rivals to Silent Voice, checked Nov 6, 2026, about 13:20 PT

Reeve spotted this. The advisor's and Codex's earlier rival searches missed it, and `research/creative-checkin-2026-11-06.md` wrongly called "speaks aloud in a cloned voice" the innovation gap. Labels: **Read** = opened the source. All placement and accuracy figures are the teams' own claims.

## thaimtl/Silent-Voice: near-exact match, same name
- **Read**, README: "You mouth the words without a sound, and Silent Voice speaks them in your own voice while you're still mouthing, even on a phone call." Laryngectomy users. Auto-AVSR, MediaPipe, Claude repair, Cartesia clone, Twilio, EMG, RTX 5060. MIT.
- **Read**, README and writeup (thaimtl.github.io/cal-hacks-13): 2nd overall and 1st in Cartesia's challenge, of 3K+ hackers and 650+ projects; four McGill students, 36 hours. Repo created Oct 24, 2026, pushed Nov 4. A startup is being explored. Devpost marks "Silent Voice" as a winner.
- **Read**, `dashboard/benchmark_session3.json`: 100 held-out sentences in demo conditions, one trained speaker, WER lips 21.4, lips + muscles 21.6, + conversational language model 17.8. `docs/SVR1_SPEC.md` line 193: on held-out session 2, EMG was worth 0.0 points (23.00% vs 23.04%).
- **Read**, PR #46: known demo lines were added as candidates (`fusion/script.txt`); dashboard muscle signals were hard-coded on; Claude did not change voice words.
- What won, per the writeup (no official reasons given): judges understood the problem "in one sentence"; a real phone call with a judge in front of the table, with no audible speech.

## Other Cal Hacks 13.0 entries
Gallery scanned through Chrome: 651 of a listed 652 projects, 90 carry a Winner label. Keyword scan of name and tagline only, not project pages.
- **Silent Speech** (`silent-speech-z9on2r`), tagline only: lips to emotional speech, phone calls, practice mode. No winner label.
- **Verba** (`a-sr78pq`), tagline only: ventilator patients, phone reads lips, speaks in their own voice. No winner label.
- **I'm Hear** (`i-m-hear-choose-who-you-listen-to`), **Read**: deaf and hard-of-hearing users point at someone and get live captions in noisy places. Quest 3, MossFormer. Captions only, no lip input listed. No winner label. Partial rival to any look-to-listen pivot.
- Same-event winners near the accessibility space, tagline only: Arigami (websites adapted to gaze, voice or switch), FortWatch (deaf sound alerts), TouchSpace (tactile maps), Standard Response (mass evacuation), BrainSync.

## Others read this session
- **Subvocal Company**, YC Fall 2026, TechTimes Nov 3: RF-radar glasses, silent text input, claimed 200+ WPM unverified, Q1 2027. No voice-loss focus in the article. Secondary.
- **Voice Back**, voicebackapp.com: AAC board with a voice clone from about 10 seconds of audio, ALS and surgery, 50,000+ downloads. No lip input. Read.

## Dolphin, candidate model for a look-to-listen pivot
- **Read**, repo: code Apache-2.0, ICLR 2026. HF `JusperLee/Dolphin`, 28,391,276 B.
- **Read**, `MODEL_PROVENANCE.md`: weights are NOT covered by Apache; distilled from AV-HuBERT; authors "do not represent the current checkpoint as cleared for commercial or production use". Umang's Nov 6 ruling on research weights looks applicable, with disclosure.
- **Read**, paper, tested on 1 s audio: Table 1 lists DP-LipCoder CPU 2,117.96 ms, GPU 23.24 ms. The Dolphin row of its later table holds 2,117.96 and 33.24; columns not fully parsed, hardware not confirmed. So CPU is too slow for live on the paper's numbers and a GPU looks required (reasoned). Benchmarks mostly use synthetic mixtures.
- Lead, unread: Swift-Net, arXiv:2506.06689, causal audio-visual separation from the same group.
- Not run. Nothing measured on this laptop or the RTX 4050.

## Pivot shortlist status
From a fresh Claude agent, `rivals-pivot-2026-11-06.md`: mostly Secondary, not spot-checked, and not the different-vendor second opinion the project rule wants (Codex was at its limit until 14:30 PT). It scanned only 8 of 28 gallery pages, so its "no look-to-listen project at Cal Hacks" is wrong; see I'm Hear above.
- Look-to-listen: crowded. Verified web agent: crowded on the user story, open on the mechanism. ThisMeans: open, pointing-to-region is the hard step. ADA room scan: close to killed. Silent 911: killed.
- Bose RAVEN, **Read**: no license shown, no weights in the repo, README is a training recipe. Out for this weekend.
- Not scanned: TreeHacks, HackMIT, Hack the North, PennApps, LA Hacks galleries, YC, app stores.

## Reading Devpost
Re-checked Nov 6, 13:30 PT: no spoofed browser user agent is needed. Default curl and a named research user agent both got 200, and `robots.txt` has no general disallow. Python urllib works with a named user agent plus an `Accept` header; one request without `Accept` got 403 (cause inferred, not tested further).
- List hackathons: `https://devpost.com/api/hackathons?status[]=ended&order_by=recently-added&page=N` (JSON, includes registrations and gallery URL).
- Search all of Devpost: `https://devpost.com/software/search?query=...&page=N` (JSON, includes winner flag).
- Galleries: `<gallery_url>?page=N` (HTML; split on `gallery-item`, read `h5` and tagline). Cal Hacks 13.0 is `cal-hacks-13-0.devpost.com`.
Winner data is unreliable both ways, so read the project page before quoting a win: ForgeHacks labels include participation prizes, and an agent found the site-search `winner` field false on five projects whose pages show a Winner line (agent report, not re-checked). `gh search repos "a b c"` with one quoted argument searches the exact phrase; pass keywords unquoted.
Chrome also works: from the gallery page, same-origin `fetch('/project-gallery?page=N')`, but JS results truncate at about 1,000 characters.

## Lesson
Rival checks must walk the galleries of recent big hackathons, not only search by concept. Searches found Chaplin and Hushkey and stopped at the "nearest" gap. The Cal Hacks gallery has three lip-to-voice entries.
