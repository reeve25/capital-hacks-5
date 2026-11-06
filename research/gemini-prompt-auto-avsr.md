Paste into Gemini Deep Research. Save the answer as `research/gemini-auto-avsr-UNVERIFIED.md`.

I'm a student at a three-day hackathon with a cash prize, building a laptop demo that reads silently mouthed speech from video and speaks it after the user confirms. Quote primary sources and link them. Say what you could not verify.

1. Rights: Auto-AVSR (github.com/mpc001/auto_avsr) publishes vsr_trlrs2lrs3vox2avsp_base.pth, trained on LRS2, LRS3, VoxCeleb2 and AVSpeech. Its README says model terms may derive from the training data. Quote the actual terms of each dataset, including the BBC R&D LRS2 Data Sharing agreement. Do those terms bind someone who only downloads the published checkpoint? Does a hackathon demo with a prize and a product pitch count as non-commercial or academic? Have the authors or others addressed this?
2. Alternatives: which pretrained visual-only lip-reading models from 2023-2026 have the lowest word error rate, and which have explicitly permissive weight licenses? Give WER, test set, size and license.
3. Silent speech: how much worse do these models do on silently mouthed speech than voiced speech? Give measured numbers, and methods that reduce the gap.
4. Speed: published or reported inference time for these models on a laptop CPU without a GPU, and practical ways to reduce it such as ONNX or quantization, with measured effects on accuracy.
5. Voice: which options can clone one consenting person's voice from a short sample, locally or by API, with licenses that permit a public demo?
