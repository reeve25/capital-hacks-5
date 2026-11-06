# Spot-check of the Gemini answer, Nov 6, 2026, about 08:50 PT

Read through a page-summarizing fetch, so re-read sources before quoting. arXiv checks covered abstracts only. Not legal advice.

## Wrong or unsupported
- **F5-TTS "MIT, commercial OK": wrong for the weights.** README: code is MIT; "The pre-trained models are licensed under the CC-BY-NC license due to the training data Emilia".
- **Auto-AVSR weights "mirrored under MIT" in Chaplin: unsupported.** Chaplin's README states no weight license. Hushkey's says weights "carry the terms of their training data (research use)". A wrapper's license does not relicense weights.
- **`WER_OOD = 10.4 x WER_LRS3 + 8.1`: not in the abstract of arXiv:2606.07259, and implausible.** At 20% WER it gives over 200%. The abstract does report "a universal performance collapse" across five architectures, which is a real caution. The 15.0% short-utterance figure is not in the abstract either.
- **Silent WER 32.3-39.6%: not supported by the cited abstract.** arXiv:2601.18177 (Lip-Siri) is a Wi-Fi backscatter system; its abstract names no such figures. Full paper not read. Treat every silent-speech number here as unverified.
- **`LRS3_V_WER19.1` = `vsr_trlrs2lrs3vox2avsp_base.pth`: unverified.** Chaplin describes its weights as trained on LRS3. They may be a different file, possibly from the sister repo, whose stricter terms Gemini quotes. Check before relying on either.
- **"`vsr_trlrs3_base` is strictly CC BY" and "`jh-y/dllm-vsr` is MIT, so safe": too strong.** LRS3's source videos are TED, CC BY-NC-ND. A model-card tag does not settle upstream data terms.

## Confirmed
- **Chaplin is real:** reads lips "in real-time", "types whatever you silently mouth", locally, using `LRS3_V_WER19.1` plus Ollama `qwen3:4b` correction. No speed, hardware or accuracy numbers. Does not speak aloud.
- **Hushkey is real:** macOS, frozen Auto-AVSR plus LoRA adapters and a kinematic branch, about 40 silent prompts to personalize. Says silent results are "clearly worse" and gives no silent number. Types only.
- **OpenVoice V1 and V2 MIT:** "Free for both commercial and research use." README does not separate code from weights and gives no CPU speed.
- **AVSpeech CC BY 4.0:** "licensed by Google LLC". Ownership of the YouTube videos is not stated. This resolves the gap in `auto-avsr-terms-2026-11-06.md`.

## Not checked
USR 2.0 speed tip and figures, dLLM-VSR, FLARE, Chatterbox license, ElevenLabs price, `aaahmet/silent-lip-reader-model`, the sister repo quote, Gemini's legal reasoning on privity and on "non-commercial".

## Still open, Reeve's
Rights remain unsettled. Nobody has read the BBC agreement. Gemini's reasoning is a lead, not advice. Ask the organizers.
