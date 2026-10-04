---
title: "Local LLMs and Research Notes on MacBook"
description: "Running a small language model on MacBook and checking whether answers and citations match retrieved excerpts from published research Notes."
lang: en
translationKey: macbook-local-llm
pubDatetime: 2026-10-05T00:00:00+09:00
tags:
  - research-journey
  - macos
  - workstation
  - development
  - ai
  - local-llm
featured: false
draft: false
---

“Verifying the Apple Silicon AI Environment” checked GPU calculations and a small training task. This time I ran an already-trained language model on the MacBook and supplied earlier research records as reference material. A local LLM runs a language model on the computer being used, rather than delegating its computation to an external service. This experiment used a MacBook Pro with an Apple M5 Pro chip and 24GB of memory. I treated downloading model files and generating answers from those files as separate stages.

I started with short material whose contents I knew, rather than a large model or many papers. Plausible wording can conceal an incorrect number or citation. The aim was to establish a small-model execution path and leave an experiment whose answers and sources could be inspected directly.

## 1. A Small Model in a Separate Project

The experiment lives in `~/Developer/research-local-llm`, with a virtual environment separate from the earlier GPU project and Python 3.13.16. `.python-version` selects the interpreter, while `uv.lock` records the packages actually selected. The `>=3.13.16,<3.14` requirement keeps the project within the Python 3.13 series.

I chose MLX-LM, a Python package that loads language models and generates text using the MLX environment checked previously. Calling it from code allowed me to record inputs, outputs and execution settings together before setting up a server. I followed the loading and generation interface in the [official MLX-LM repository](https://github.com/ml-explore/mlx-lm).

The first command was `uv add mlx-lm 'mlx==0.32.3' huggingface-hub`. I fixed only the MLX version, leaving MLX-LM unspecified, and the Python requirement was then `>=3.13.16`, without an upper bound. While resolving package requirements, uv selected MLX-LM 0.0.3, transformers 4.12.2 and tokenizers 0.10.3. Building tokenizers from source failed because the Rust compiler was absent. Leaving versions unspecified had not simply installed the latest releases.

I had not checked the Python, MLX and MLX-LM compatibility requirements thoroughly enough before installation. I then inspected the metadata for MLX-LM 0.32.0, which requires MLX 0.32.2 or later and transformers 5.7.0 or later. Narrowing the Python range to `>=3.13.16,<3.14` and specifying MLX-LM 0.32.0 produced the installed environment in the table below. I did not fully trace why the initial resolution selected that older combination, so I do not attribute the failure solely to the missing Python upper bound. I clarified the intended package combination before adding compilation tools.

```sh
uv add 'mlx-lm==0.32.0' 'mlx==0.32.3' huggingface-hub
```

| Component       | Installed version | Role                                                      |
| --------------- | ----------------- | --------------------------------------------------------- |
| Python          | 3.13.16           | Project interpreter                                       |
| MLX / mlx-metal | 0.32.3            | Apple Silicon GPU computation                             |
| MLX-LM          | 0.32.0            | Model loading and text generation                         |
| transformers    | 5.18.0            | Library used for model input processing and related tasks |
| huggingface-hub | 1.33.0            | Model downloads                                           |
| NumPy           | 2.5.3             | Numerical arrays                                          |

The model is Qwen's [Qwen3-1.7B-MLX-4bit](https://huggingface.co/Qwen/Qwen3-1.7B-MLX-4bit). `1.7B` means roughly 1.7 billion parameters: internal numerical values established during training. A higher parameter count does not by itself establish greater accuracy on these research questions.

`4bit` refers to quantisation, representing model weights with fewer bits. This reduces storage and memory requirements but approximates the original values and can affect answer quality. I chose a small model to begin the execution checks; I did not compare models or quantisation formats. The licence is Apache-2.0, and the downloaded configuration records 4 bits with a group size of 128.

## 2. Recording Files and Execution Settings

Recording only a model name makes it difficult to recover an earlier state if the files change. I fixed the download to this revision, an identifier for a particular repository state:

```text
Qwen/Qwen3-1.7B-MLX-4bit
21457c6f51ed54a7c16e988c0844db973815c137
```

The nine files, including configuration, tokenizer, weights and licence, totalled 930,270,314 bytes, about 0.93GB. I recorded each file's size and SHA-256 hash in `model-manifest.json`. A hash provides a value for comparing file contents. The weights and `tokenizer.json` also matched the expected SHA-256 values in the repository metadata. The remaining files had their hashes recorded, without a separate expected SHA-256 comparison.

Weights are under the project's `models` directory and download caches under `.runtime`. `.venv`, models, caches and generated results are excluded through `.gitignore`, separating them from source and dependency records. This does not upload model files to GitHub or automatically preserve results in Google Drive.

Execution used a local model path, Hugging Face offline settings and `uv --offline`. It used existing files and packages, but was not a test with Wi-Fi disconnected. I also specified `MLX_ENABLE_TF32=0` for this process, following the earlier precision check.

```sh
/bin/zsh ~/Developer/research-local-llm/run-verification.sh
```

Tokens are small units used by the model to process text; one token is not always one character or one word. I limited the combined question and reference input to 2,048 tokens and newly generated answers to 256 tokens. These bounds kept the execution check focused on short material and answers.

The model card lists a context length of 32,768 tokens, while the downloaded configuration has `max_position_embeddings=65536`. Context length concerns how much input and response text can be handled together. Although the two figures differ, neither maximum was verified in this experiment.

I used `temperature=0`, selecting the highest-probability next token at each step to reduce random selection in this baseline run. This was not Qwen's general recommended quality setting, nor a claim that it produces the best answer to every question.

## 3. Retrieving Material Before Answering

I extracted parts of three already-published Notes so that the model could refer to research records rather than relying only on its training. The flow retrieves relevant material and supplies it with the question. It is a small example of what is commonly called RAG, using three documents to inspect retrieval and source checking.

| Source ID | Excerpt from a published Note                                    |
| --------- | ---------------------------------------------------------------- |
| D1        | Code and research-material paths, and Google Drive sync location |
| D2        | Squares of 1–5 and their expected sum and mean                   |
| D3        | MLX precision checks and the `MLX_ENABLE_TF32=0` decision        |

The retriever compares two-character fragments in the question and documents using cosine similarity and selects the top two documents. I installed neither an embedding model nor a vector database. With so few documents, this provides a simple starting point whose rankings can be inspected. Retrieval quality with different wording or a larger collection needs separate testing.

For the folder, calculation and precision questions, the relevant source ranked first. I also compared the generated answer and its source IDs with the text, rather than treating a correct ranking as evidence of a correct answer. The model was instructed to say that information could not be found when the material lacked it.

## 4. Problems in the First Run

The device was reported as `Device(gpu, 0)` and the model generated responses. However, some responses included long `<think>` sections despite passing `enable_thinking=False`. Inspecting the pinned revision's chat template showed that it contained no branch handling that setting. Passing an option had not made it part of the actual input.

The first calculation answer reached the 256-token cap and stopped mid-sentence. The precision answer found the setting but cited D1 for information in D3. The folder answer omitted a source ID. Correct retrieval did not ensure a complete answer or an accurate citation.

I preserved the first JSON and log, left the downloaded model files unchanged and adjusted the input format. I supplied an empty, completed `<think>...</think>` block at the beginning of the assistant response so that generation could continue after it. This was an explicit adjustment in the execution code for behaviour absent from the downloaded template. I reran the same questions with the same retrieval method and output cap to inspect the resulting answers.

## 5. Checking Answers and Citations Separately

The rerun began by asking for `2 + 3` as a single number. The expected answer was `5`, and the actual response was `5`. I then compared four answers with their source text.

| Question                                     | Content observed in the rerun                                                | Citation review                                                                                |
| -------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Code and material folders, and sync location | Correctly gave `~/Developer`, `~/Research` and Computers → My Mac → Research | Produced `[Д1], [D3]`; the first character is not Latin D, and D3 does not support this answer |
| Sum and mean of the squares                  | Correctly gave 55 and 11.0                                                   | Cited D1 for information in D2                                                                 |
| MLX precision setting                        | Correctly gave `MLX_ENABLE_TF32=0`                                           | D3 matched the source                                                                          |
| Generation speed of a 70B model              | Said the material did not contain the information                            | Did not invent a speed value                                                                   |

The sum of 55 and mean of 11.0 come from the values `1, 4, 9, 16, 25` in D2. Correct numbers accompanied by a D1 citation still prevent a reader from locating their evidence. The folder answer's `[Д1]` visually resembles D1 but uses a different character, and its additional D3 citation points to material without that folder information.

The precision answer stated `MLX_ENABLE_TF32=0` and cited D3. Asked “What was the average generation speed, in tokens per second, when running a 70B model on this MacBook?”, the model responded in Korean that the material lacked the information and it could not be confirmed. This is an observation for one missing-information question, not a guarantee that every unknown question will be handled correctly.

I retained the initial and rerun responses in separate JSON files and logs. The rerun record includes each question, retrieved text and scores, actual answer, token counts and finish reason. I did not remove the initial citation errors or replace generated answers with corrected text.

## 6. Scope of This Run

In the rerun, the four questions with reference material used 610–620 input tokens and generated 20–93 tokens. All finished without reaching the output cap. MLX-LM reported approximately 231–240 generated tokens per second for these four answers, with its cumulative peak memory counter at approximately 1.75–1.81GB.

These are tool-reported observations from short inputs run sequentially in one process. They are not a repeated benchmark, and the memory counter is not total macOS memory usage. I do not extrapolate them to large models or long papers. The first numerical response, which generated only two tokens, was excluded from the speed comparison.

The experiment established a GPU execution path for a small model and a way to retrieve published research records and supply them with questions. It found the required information for short questions, but an instruction to cite sources did not ensure accurate citations. A research workflow should present retrieved sources and original links separately through code, while leaving the model's claims and citations open to review.

The material consisted of short excerpts from public Notes. I did not process private research material or long PDFs, or train the model. Execution after a restart and reconstruction in a fresh environment were also outside this stage's checks. The next Note will address the boundaries between code, material and results, and the records needed to run the work again.
