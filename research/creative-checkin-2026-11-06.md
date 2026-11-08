> Historical: Nov 6 ideation material, superseded when FeelInk was chosen (Nov 6, about 21:35). Research preserved as written; current state is in STATUS.md.

# Creative check-in, opened Nov 6, 2026, 08:35 PT

Reeve's call. First pass by the advisor, reasoned only, to be redone properly with him. Goal: win the $1,500 grand prize. Judging: innovation, applicability, technical proficiency, potential impact. Test: retell in one sentence; "that's real"; only possible now; a life visibly changes; survives the toughest question.

**What he picked (OPTIONS.md):** "Someone who can't make sound mouths words at a phone and it speaks in their cloned voice after they confirm." The plan audit deferred the clone, and the build drifted to six fixed phrases in a generic voice. Nobody asked him. He has since consented to his own voice use.

| Option | Retell | "That's real" | Only now | Life changes | Toughest question |
|---|---|---|---|---|---|
| 1. Six fixed phrases, generic voice (current build) | Easy | Modest | Weak: LipLearner, SRAVI exist | Modest | "Why not a laminated card?" No strong answer |
| 2. Type your own phrases | Easy | Same as 1 | Weak | Modest | Same as 1; it changes setup, not the moment. Reeve doubts it would impress |
| 3. Mouth anything, correct and confirm | Strongest | Strongest | Strong | Strong | "How often is it wrong?" 20.3% WER on spoken video at best; silent unknown; live failure risk; CPU speed unknown |
| 4. Add his cloned voice to any of these | Strong | Strongest emotional moment | Strong | Strong | "Patients who lost their voice have no samples?" Needs voice banking or old recordings |
| 5. Fix readings from conversation context with an LLM | Harder | Strong if visible | Strong | Strong | Breaks local-only, needs a key; accuracy gain unmeasured |

**First-pass lean, not settled:** 3 plus 4, keeping fixed phrases as the stage fallback, if M2c shows acceptable speed. Depends on M2c, rights and a silent test.

**Evidence so far:** M2b on spoken GRID, 3 train and 2 test speakers, numbers in `app/EVIDENCE.md`: no-enrollment top-1 103/144 learned vs 71/144 DTW; three-takes top-1 83/108 learned vs 91/108 DTW. Thin, unreviewed, no silent data.

**Only Reeve can answer:**
- Rights: run `research/gemini-prompt-auto-avsr.md`; ask organizers whether a research-licensed model is acceptable.
- Hardware: does Nathan or anyone have an NVIDIA laptop? Is a cloud GPU acceptable, given the local-only promise?
- Voice: is an external cloning service acceptable, and what would it cost?
- Organizer facts in Discord: deadline, pitch length, platform.

## Update 08:50 PT, after the Gemini answer

Sources and verdicts: `research/gemini-auto-avsr-spot-check.md`.

- **Rivals changed the picture.** Chaplin and Hushkey already do silent mouthing to typed text with these models, locally and open source. So "mouth anything" alone is not new, and a judge could find them. Per their READMEs neither speaks aloud, neither is aimed at people who cannot speak, and neither has confirm-then-speak or a cloned voice. That gap is the innovation case. It is also good feasibility news, and their code could be reused with disclosure. Their speed on this laptop is unknown.
- **Context repair can stay local.** Chaplin uses a local Ollama model, so option 5 need not break the local-only promise; its speed on this CPU is unmeasured.
- **Middle checkpoint.** `vsr_trlrs3vox2_base.pth`, 24.6% WER, avoids LRS2 and its BBC agreement. VoxCeleb2's terms still need checking.
- **Voice can be free and local.** OpenVoice V2 is MIT; speed and clone quality are unmeasured. F5-TTS weights are non-commercial, so it is not the safe pick.
- **No silent accuracy figure is verified.** The silent test remains the main unknown.

## Decided 08:55 PT
Reeve decided; see "Direction" in PLAN.md. Mouth anything, cloned voice, best model, light confirmation, no fallback, weak-spot question dropped. Umang cleared research-licensed weights on conditions. Open: confirmation design, go/no-go bar, GPU.
