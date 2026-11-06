# Encoder audit evidence — 2026-11-06

Scope: read-only source and lightweight HTTP/hardware checks; no model installed, checkpoint fully downloaded, inference run, or product built. **Measured** means observed in this audit; **Read** means upstream statement/code; **Reasoned** means assessment, not a benchmark.

## Findings and concrete fixes

### 1. LipLearner's portable checkpoint link is broken; its working artifact is Apple-only

**Measured:** unauthenticated GET to the [README's pretrained PyTorch Drive file](https://drive.google.com/file/d/1RK7no1QH8QFZzjVrmg64X8wuCLRfJzu3/view) and `/uc?export=download&id=...` both returned HTTP 404. GitHub API lists no releases. All seven public fork default-branch recursive trees contain zero `.pt`, `.pth`, `.onnx`, or `.safetensors` paths; Hugging Face model search `LipLearner` returned zero matches. This is a bounded search, not proof no mirror exists.

**Measured:** HEAD of [the actual CoreML weight archive](https://raw.githubusercontent.com/rkmtlab/LipLearner/main/LipLearner_iOS/LipLearner/LipEncoder.mlpackage/Data/com.apple.CoreML/weights/weight.bin.tar.gz) returned HTTP 200, octet-stream, Content-Length 88,982,435. The README extraction path omits an extra `LipLearner` directory present in the actual repository.

**Read:** [LipLearner README](https://github.com/rkmtlab/LipLearner) declares MIT and supplies pretraining plus iOS source, not a Windows inference application. [Model](https://github.com/rkmtlab/LipLearner/blob/main/pretraining/model/model.py) has a ResNet18-style video frontend, three-layer bidirectional GRU and projection; [main_visual.py](https://github.com/rkmtlab/LipLearner/blob/main/pretraining/main_visual.py) hardcodes CUDA at construction/input paths and extracts `video_model` from its checkpoint. [Requirements](https://github.com/rkmtlab/LipLearner/blob/main/pretraining/requirements.txt) pin torch 1.11.0+cu113/torchvision 0.12.0+cu113 and older scientific packages, despite README saying PyTorch 1.12. [Apple documentation](https://apple.github.io/coremltools/docs-guides/source/model-prediction.html) says prediction requires macOS Core ML framework.

**Reasoned/fix:** do not promise LipLearner runnable on Windows within hours. CoreML-to-PyTorch reconstruction is a conversion project with parity risk, not an emergency fallback. Timebox portable checkpoint discovery to 30–60 minutes; if none with clear allowed use, retain landmark/DTW baseline and explicitly report the missing encoder. Do not retrain LRW or install the CUDA training environment.

### 2. Auto-AVSR weights really are accessible, but rights and CPU speed remain gates

**Measured:** [official README's `vsr_trlrs3_base.pth` Drive file](https://drive.google.com/file/d/12PNM5szUsk_CuaV1yB9dL_YWvSM1zvAd/view) is publicly viewable. Its ordinary download leads to a virus-scan warning (955M), not a login. Following the page's download form without authentication and requesting bytes 0–15 returned HTTP **206**, `application/octet-stream`, `Content-Range: bytes 0-15/1001892616`, prefix `50-4B-03-04` (ZIP/PyTorch archive). Only 16 payload bytes were read; full integrity/loading was not checked. Both HTTP and HTTPS Imperial URLs hardcoded in the tutorial returned 404.

**Read:** [Auto-AVSR README](https://github.com/mpc001/auto_avsr) lists a 250M-parameter visual model. Code is Apache 2.0, but explicitly says pretrained model terms may derive from training datasets; Apache does not settle checkpoint rights. [Feature extraction tutorial](https://github.com/mpc001/auto_avsr/blob/main/tutorials/feature_extraction.ipynb) loads a checkpoint to CPU, constructs frontend/projection/conformer encoder, freezes it and calls inference on `(10,1,88,88)` tensors. This is a plausible feature API, not a few-shot phrase recognition implementation.

**Reasoned/fix:** this is the most concrete inspected portable encoder candidate if its model/data-derived use terms are established for the competition demo. Roughly 1 GB FP32 parameters are plausible within 15.7 GiB RAM, but intermediates, loading copies and server/browser consume more. Run one model, bounded clips, batch one, capped threads; no training or beam-search decoder. Before UI polish, require checkpoint load, two real clips, deterministic nonconstant embeddings, peak memory and CPU end-to-end latency measured on this laptop. A two-hour attempt budget is a planning limit, not a runtime claim. If terms remain unclear, skip instead of treating availability as permission.

### 3. AV-HuBERT and smaller TCN alternatives do not remove the license/install risk

**Read:** [AV-HuBERT](https://github.com/facebookresearch/av_hubert) is archived, expects Python 3.8 and its fairseq submodule; [checkpoint page](https://facebookresearch.github.io/av_hubert/) displays an explicit acceptance button. [License](https://github.com/facebookresearch/av_hubert/blob/main/LICENSE) limits use to noncommercial research and restricts commercial/production and biometric processing. A direct CDN URL does not erase those conditions. No acceptance was clicked and no checkpoint downloaded.

**Read:** [TCN lipreading repository](https://github.com/mpc001/Lipreading_using_Temporal_Convolutional_Networks) offers 512-D ResNet18 feature extraction, 139–201 MB models and 11–36 MB lightweight models. However [license](https://github.com/mpc001/Lipreading_using_Temporal_Convolutional_Networks/blob/master/LICENSE) adds research/private-study and comparative/benchmarking conditions; README explicitly limits usage to comparative/benchmarking purposes. Not a clearly licensed demo escape hatch.

**Reasoned/fix:** remove AV-HuBERT from the default unattended path and do not automatically substitute TCN into the product. Source/weight permissions must be recorded separately. A prize competition demonstration's compatibility is not established merely by calling it research.

### 4. Hardware allows a CPU attempt, not a real-time claim

**Measured:** `nvidia-smi` command absent (root audit). CIM `Win32_VideoController` reports **Intel(R) Graphics**, driver `32.0.101.7082`; no NVIDIA controller enumerated. `Win32_ComputerSystem` reports 16,858,472,448 physical RAM bytes (~15.70 GiB) and **12 logical processors**, not necessarily 12 physical cores. No CUDA inference benchmark was run.

**Reasoned/fix:** CPU-only is the operational assumption. Do not claim every encoder is impossible, or that it meets 1.5 seconds. Gate by observed latency/memory early; no cloud upload to rescue a local/privacy promise without a new explicit product decision.

### 5. Published few-shot results support a research hypothesis, not the requested medical demo targets

**Read:** [LipLearner paper](https://arxiv.org/html/2302.05907v3) reports 0.8947 F1 in a 25-command one-shot model test, while its live study reports 81.7% one-shot and 96.5% three-shot for 30 commands, improving with further examples. It uses a fitted linear classifier, rather than establishing prototype+DTW equivalence. Enrollment can use audible speech for automatic text labels; that convenience is unavailable for a voiceless user.

**Reasoned/fix:** state this as encouraging prior research with different speakers, capture, command sets and enrollment. Do not promise a judge's 60-second calibration, OOV rejection or patient transfer. Typed phrase labels, truly silent enrollment and held-out human takes must precede the stage commitment; accuracy targets remain aspirations until measured. Confirmation does not establish that an unseen phrase was correctly rejected.
