# Auto-AVSR terms, read Nov 6, 2026, about 08:25 PT

Read through a page-summarizing fetch, so re-read the sources before relying on exact wording. Not legal advice.

- **[Auto-AVSR README](https://github.com/mpc001/auto_avsr):** code is Apache 2.0. Pretrained models "may have their own licenses or terms and conditions" derived from the training dataset. No statement on commercial use.
- **Visual-only checkpoints, per README:** `vsr_trlrs3_base.pth` 438 h, WER 36.0%; `vsr_trlrs3vox2_base.pth` 1,759 h, WER 24.6%; `vsr_trlrs2lrs3vox2avsp_base.pth` 3,291 h, WER 20.3%. All 250M parameters. These WERs are on spoken video.
- **[LRS3 page, KAIST](https://mm.kaist.ac.kr/datasets/lip_reading/):** "available to download for research purposes" under CC BY 4.0; "copyright remains with the original owners of the video"; downloads no longer offered. The Oxford LRS3 page returned 404.
- **[TED usage policy](https://www.ted.com/about/our-organization/our-policies-terms/ted-talks-usage-policy):** talks are CC BY-NC-ND 4.0, not usable "to gain any type of revenue, payment or fee", no derivatives, no scraping of TED.com. Nothing on machine learning.

**Reasoned, not settled:** no term read expressly permits or forbids a pretrained checkpoint in a disclosed, non-commercial hackathon prototype. A cash prize and a product pitch are the gray area. Using it in the demo is Reeve's decision. A commercial version would need another model or a license.

## Added about 08:30 PT, for the 20.3% checkpoint

`vsr_trlrs2lrs3vox2avsp_base.pth` trains on LRS2, LRS3, VoxCeleb2 and AVSpeech.

- **[LRS2](https://www.robots.ox.ac.uk/~vgg/data/lip_reading/lrs2.html):** "available for non-commercial, academic research"; "You will need to sign a Data Sharing agreement with BBC Research & Development". The agreement text was not read.
- **[VoxCeleb2](https://www.robots.ox.ac.uk/~vgg/data/voxceleb/vox2.html):** metadata CC BY-SA 4.0; distributed as YouTube URLs with timestamps; the page does not say who owns the videos.
- **[AVSpeech](https://looking-to-listen.github.io/avspeech/):** landing page has no terms; its linked Terms page was not read.

**Open, handed to Reeve:** whether terms on training data bind someone using a checkpoint the authors published, and whether a student hackathon with a cash prize counts as non-commercial or academic. Prompt: `research/gemini-prompt-auto-avsr.md`.
