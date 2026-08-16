
#!/usr/bin/env python3
from __future__ import annotations

import csv
import json
import math
import os
import re
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Iterable

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
OUT = PUBLIC / "radar-data"
OUT.mkdir(parents=True, exist_ok=True)

TODAY = datetime.now(timezone.utc).date()
NOW_ISO = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
BACKFILL_FROM = "2020-01-01"
BACKFILL_TO = f"{TODAY.year}-12-31"
RECENT_DAYS = 21
RECENT_CUTOFF = TODAY - timedelta(days=RECENT_DAYS)

OPENALEX_API_KEY = os.environ.get("OPENALEX_API_KEY", "").strip()
CONTACT_EMAIL = os.environ.get("CONTACT_EMAIL", "").strip()

AREA_CONFIG = {
    "Multimodal Code Generation": {
        "queries": [
            "multimodal code generation",
            "vision language model code generation",
            "image to code generation",
            "screenshot to code",
            "UI to code",
            "GUI code generation",
            "flowchart to code",
            "diagram to code",
            "design to code",
            "visual programming code generation",
            "multimodal software engineering",
        ],
        "terms": [
            "multimodal code", "vision language", "image to code", "screenshot to code",
            "ui to code", "gui to code", "diagram to code", "flowchart to code",
            "design to code", "visual code generation", "multimodal software",
            "frontend code", "webpage generation", "screen to code",
        ],
    },
    "Agentic Software Engineering": {
        "queries": [
            "coding agent",
            "software engineering agent",
            "autonomous software engineer",
            "agentic software engineering",
            "repository level coding agent",
            "program repair agent",
            "LLM software engineering agent",
            "multi agent software development",
            "SWE-bench agent",
            "automated debugging agent",
            "software testing agent",
        ],
        "terms": [
            "coding agent", "software engineering agent", "autonomous software",
            "agentic software", "repository agent", "program repair agent",
            "multi-agent software", "multi agent software", "swe-bench",
            "debugging agent", "testing agent", "software development agent",
            "code agent", "llm agent",
        ],
    },
    "Mechanistic Interpretability": {
        "queries": [
            "mechanistic interpretability",
            "transformer circuits",
            "activation patching",
            "causal tracing language model",
            "sparse autoencoder interpretability",
            "feature steering language model",
            "representation probing language model",
            "model editing causal tracing",
            "mechanistic interpretability vision language model",
            "mechanistic interpretability code model",
            "dictionary learning language model interpretability",
        ],
        "terms": [
            "mechanistic interpretability", "transformer circuit", "activation patch",
            "causal tracing", "sparse autoencoder", "dictionary learning",
            "feature steering", "representation probing", "linear probe",
            "model editing", "causal intervention", "residual stream",
            "attention head", "superposition", "feature visualization",
        ],
    },
    "Explainable AI": {
        "queries": [
            "explainable AI",
            "interpretable machine learning",
            "explanation faithfulness",
            "counterfactual explanation",
            "concept based explanation",
            "feature attribution explainability",
            "LLM explainability",
            "vision language model explainability",
            "SHAP explainability",
            "TCAV explanation",
            "explanation robustness machine learning",
        ],
        "terms": [
            "explainable ai", "interpretable machine learning", "explanation faith",
            "counterfactual explanation", "concept-based", "concept based",
            "feature attribution", "shap", "lime", "tcav", "saliency",
            "explanation robustness", "post-hoc explanation", "post hoc explanation",
            "model explanation", "llm explainability", "language model explanation",
        ],
    },
}

WATCH_VENUES = {
    "NeurIPS": "A*",
    "ICML": "A*",
    "ICLR": "A*",
    "ACL": "A*",
    "EMNLP": "A*",
    "NAACL": "A",
    "EACL": "A",
    "TACL": "A*",
    "CVPR": "A*",
    "ICCV": "A*",
    "ECCV": "A*",
    "WACV": "A",
    "ICSE": "A*",
    "FSE": "A*",
    "ASE": "A*",
    "ISSTA": "A*",
    "MSR": "A",
    "ICSME": "A",
    "SANER": "A",
    "JMLR": "A*",
    "TMLR": "A",
    "AAAI": "A*",
    "AISTATS": "A",
    "COLM": "A",
    "PLDI": "A*",
    "OOPSLA": "A*",
    "CHI": "A*",
    "IJCAI": "A*",
    "KDD": "A*",
    "arXiv": "Preprint",
}

WATCH_INSTITUTIONS = [
    "Stanford University",
    "Carnegie Mellon University",
    "National University of Singapore",
    "Nanyang Technological University",
    "Queen's University",
    "Tsinghua University",
    "Fudan University",
    "Beihang University",
    "Google DeepMind",
    "Anthropic",
    "Princeton University",
    "ETH Zurich",
    "MIT",
    "Harvard University",
    "Duke University",
    "University College London",
    "Columbia University",
]

WATCH_RESEARCHERS = {
    "Ahmed E. Hassan": ("Queen's University", "Agentic SE / Software Analytics"),
    "Bram Adams": ("Queen's University", "Agentic SE / DevOps"),
    "Jian Yang": ("Beihang University", "Multimodal Code / Code LLM"),
    "Xingjun Ma": ("Fudan University", "Trustworthy ML / XAI"),
    "Yu-Gang Jiang": ("Fudan University", "Vision / Multimodal"),
    "Chen Qian": ("Tsinghua / OpenBMB", "Multi-Agent Software Development"),
    "Sirui Hong": ("MetaGPT / DeepWisdom", "Multi-Agent Software Development"),
    "Graham Neubig": ("Carnegie Mellon University", "Coding Agents / LLM Systems"),
    "Nicholas Carlini": ("Anthropic", "Agentic Evaluation / AI Security"),
    "Albert Gu": ("Carnegie Mellon University", "Long Context / Sequence Models"),
    "Abhik Roychoudhury": ("National University of Singapore", "Coding Agents / Program Repair"),
    "Bogdan Vasilescu": ("Carnegie Mellon University", "Empirical Agentic SE"),
    "Tao Xie": ("Peking University", "Agentic SE / Trustworthy AI"),
    "Zhendong Su": ("ETH Zurich", "SE / PL / Reliability"),
    "Percy Liang": ("Stanford University", "Foundation Models / Evaluation"),
    "David Bau": ("Northeastern University", "Mechanistic Interpretability"),
    "Neel Nanda": ("Google DeepMind", "Mechanistic Interpretability"),
    "Jacob Andreas": ("MIT", "Interpretability / Language Models"),
    "Been Kim": ("Google DeepMind", "Explainable AI / Interpretability"),
    "Cynthia Rudin": ("Duke University", "Interpretable ML"),
    "Finale Doshi-Velez": ("Harvard University", "Interpretability / Human-AI"),
    "Wenya Wang": ("Nanyang Technological University", "LLM Interpretability"),
    "Clement Neo": ("Singapore AI Safety Institute / NTU", "Mechanistic Interpretability"),
    "Zhengxuan Wu": ("Google DeepMind / Stanford", "Mechanistic Interpretability"),
    "Kenji Kawaguchi": ("National University of Singapore", "LLM / Deep Learning"),
    "Yuntong Zhang": ("National University of Singapore", "Coding Agents / Program Repair"),
    "Shyam Agarwal": ("Carnegie Mellon University", "Empirical AI Coding"),
    "Christian Kästner": ("Carnegie Mellon University", "AI Engineering / Agentic SE"),
    "Claire Le Goues": ("Carnegie Mellon University", "Program Repair / Agentic SE"),
    "Karthik Narasimhan": ("Princeton University", "Agentic AI / Coding Agents"),
    "Baishakhi Ray": ("Columbia University", "Code LLMs / Agentic SE"),
    "Michael Pradel": ("University of Stuttgart", "AI for Code / Reliability"),
    "Mark Harman": ("Meta / University College London", "Automated SE / Agentic Testing"),
    "Federica Sarro": ("University College London", "Automated / Empirical SE"),
    "Peter O'Hearn": ("Meta / University College London", "Verification / Agentic SE"),
    "Miltos Allamanis": ("Google DeepMind", "Machine Learning for Code"),
    "Ira Ceka": ("Columbia University", "Coding-Agent Failure Analysis"),
}

AUTHOR_HINTS = {name: aff for name, (aff, _) in WATCH_RESEARCHERS.items()}

VENUE_PATTERNS = [
    (r"\barxiv\b", "arXiv"),
    (r"neural information processing systems|\bneurips\b|\bnips\b", "NeurIPS"),
    (r"international conference on machine learning|\bicml\b", "ICML"),
    (r"international conference on learning representations|\biclr\b", "ICLR"),
    (r"annual meeting of the association for computational linguistics|\bacl\b", "ACL"),
    (r"empirical methods in natural language processing|\bemnlp\b", "EMNLP"),
    (r"north american chapter.*association for computational linguistics|\bnaacl\b", "NAACL"),
    (r"european chapter.*association for computational linguistics|\beacl\b", "EACL"),
    (r"transactions of the association for computational linguistics|\btacl\b", "TACL"),
    (r"computer vision and pattern recognition|\bcvpr\b", "CVPR"),
    (r"international conference on computer vision|\biccv\b", "ICCV"),
    (r"european conference on computer vision|\beccv\b", "ECCV"),
    (r"winter conference on applications of computer vision|\bwacv\b", "WACV"),
    (r"international conference on software engineering|\bicse\b", "ICSE"),
    (r"foundations of software engineering|esec.?fse|\bfse\b", "FSE"),
    (r"automated software engineering|\base\b", "ASE"),
    (r"software testing and analysis|\bissta\b", "ISSTA"),
    (r"mining software repositories|\bmsr\b", "MSR"),
    (r"software maintenance and evolution|\bicsme\b", "ICSME"),
    (r"software analysis, evolution and reengineering|\bsaner\b", "SANER"),
    (r"journal of machine learning research|\bjmlr\b", "JMLR"),
    (r"transactions on machine learning research|\btmlr\b", "TMLR"),
    (r"aaai conference on artificial intelligence|\baaai\b", "AAAI"),
    (r"artificial intelligence and statistics|\baistats\b", "AISTATS"),
    (r"conference on language modeling|\bcolm\b", "COLM"),
    (r"programming language design and implementation|\bpldi\b", "PLDI"),
    (r"object-oriented programming systems.*languages.*applications|\boopsla\b", "OOPSLA"),
    (r"human factors in computing systems|\bchi\b", "CHI"),
    (r"international joint conference on artificial intelligence|\bijcai\b", "IJCAI"),
    (r"knowledge discovery and data mining|\bkdd\b", "KDD"),
]

METHOD_TERMS = [
    ("multi-agent", ["multi-agent", "multi agent"]),
    ("agent planning", ["planning", "planner"]),
    ("tool use", ["tool use", "tools", "terminal", "browser"]),
    ("retrieval", ["retrieval", "rag"]),
    ("program repair", ["program repair", "bug repair", "patch generation"]),
    ("execution feedback", ["execution feedback", "unit test", "test feedback", "compiler feedback"]),
    ("probing", ["probe", "probing", "linear classifier"]),
    ("activation patching", ["activation patch", "path patch"]),
    ("causal tracing", ["causal tracing"]),
    ("sparse autoencoder", ["sparse autoencoder", "sae"]),
    ("dictionary learning", ["dictionary learning"]),
    ("steering", ["steering", "activation steering"]),
    ("model editing", ["model editing", "knowledge editing"]),
    ("counterfactual", ["counterfactual"]),
    ("feature attribution", ["shap", "lime", "feature attribution", "saliency"]),
    ("concept-based", ["tcav", "concept-based", "concept based"]),
]

DATASET_TERMS = [
    "SWE-bench", "SWE-bench Verified", "HumanEval", "MBPP", "APPS", "CodeContests",
    "RepoBench", "SWE-agent", "AgentBench", "WebArena", "GAIA", "MMLU",
    "ImageNet", "COCO", "VQA", "ChartQA", "Design2Code", "WebSight",
    "Screen2Words", "Mind2Web", "AndroidWorld", "OSWorld",
]

MODEL_TERMS = [
    "GPT-4", "GPT-4o", "GPT-5", "Claude", "Gemini", "Llama", "Qwen", "Mistral",
    "Gemma", "DeepSeek", "Codex", "CodeLlama", "StarCoder", "CodeT5",
    "BERT", "T5", "CLIP", "ViT", "Mamba",
]

METRIC_PATTERNS = [
    r"pass@k", r"pass@1", r"accuracy", r"f1", r"bleu", r"rouge", r"success rate",
    r"exact match", r"human evaluation", r"faithfulness", r"robustness",
]

def norm_text(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "").replace("\n", " ").replace("\r", " ")).strip()

def norm_key(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", (s or "").lower()).strip()

def contains_any(text: str, terms: Iterable[str]) -> bool:
    t = text.lower()
    return any(term.lower() in t for term in terms)

def reconstruct_abstract(inv: dict[str, list[int]] | None) -> str:
    if not inv:
        return ""
    max_pos = -1
    for positions in inv.values():
        if positions:
            max_pos = max(max_pos, max(positions))
    if max_pos < 0:
        return ""
    tokens = [""] * (max_pos + 1)
    for tok, positions in inv.items():
        for p in positions:
            if 0 <= p < len(tokens):
                tokens[p] = tok
    return norm_text(" ".join(tokens))

def first_sentence(text: str, limit: int = 320) -> str:
    text = norm_text(text)
    if not text:
        return ""
    parts = re.split(r"(?<=[.!?])\s+", text)
    s = parts[0] if parts else text
    if len(s) > limit:
        s = s[: limit - 1].rstrip() + "…"
    return s

def api_url(endpoint: str, params: dict[str, Any]) -> str:
    p = dict(params)
    if OPENALEX_API_KEY:
        p["api_key"] = OPENALEX_API_KEY
    if CONTACT_EMAIL:
        p["mailto"] = CONTACT_EMAIL
    return f"https://api.openalex.org/{endpoint}?{urllib.parse.urlencode(p)}"

def get_json(url: str, retries: int = 4) -> dict[str, Any]:
    headers = {"User-Agent": "govind-research-radar/2.0"}
    last = None
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.load(r)
        except Exception as e:
            last = e
            time.sleep(min(2 ** attempt, 8))
    raise RuntimeError(f"request failed after {retries} attempts: {url}: {last}")

def openalex_search(query: str, recent: bool = False, pages: int = 2) -> list[dict[str, Any]]:
    date_filter = (
        f"from_publication_date:{max(BACKFILL_FROM, RECENT_CUTOFF.isoformat())},to_publication_date:{BACKFILL_TO}"
        if recent
        else f"from_publication_date:{BACKFILL_FROM},to_publication_date:{BACKFILL_TO}"
    )
    cursor = "*"
    out: list[dict[str, Any]] = []
    for _ in range(pages):
        params = {
            "search": query,
            "filter": date_filter,
            "per_page": 100,
            "cursor": cursor,
        }
        if recent:
            params["sort"] = "publication_date:desc"
        data = get_json(api_url("works", params))
        out.extend(data.get("results", []))
        nxt = (data.get("meta") or {}).get("next_cursor")
        if not nxt or not data.get("results"):
            break
        cursor = nxt
    return out

def openalex_resolve_author(name: str, hint: str = "") -> dict[str, Any] | None:
    data = get_json(api_url("authors", {"search": name, "per-page": 8}))
    candidates = data.get("results", [])
    if not candidates:
        return None
    nk = norm_key(name)

    def score(a: dict[str, Any]) -> tuple[int, int, int]:
        display = norm_key(a.get("display_name", ""))
        exact = int(display == nk)
        hint_hit = 0
        if hint:
            inst = ((a.get("last_known_institutions") or [{}])[0] or {}).get("display_name", "")
            hint_hit = int(any(x in norm_key(inst) for x in norm_key(hint).split() if len(x) > 4))
        works = int(a.get("works_count") or 0)
        return (exact, hint_hit, works)
    return max(candidates, key=score)

def openalex_author_works(author_id: str, pages: int = 2) -> list[dict[str, Any]]:
    cursor = "*"
    out: list[dict[str, Any]] = []
    aid = author_id.rsplit("/", 1)[-1]
    for _ in range(pages):
        params = {
            "filter": f"authorships.author.id:{aid},from_publication_date:{BACKFILL_FROM},to_publication_date:{BACKFILL_TO}",
            "per_page": 100,
            "cursor": cursor,
            "sort": "publication_date:desc",
        }
        data = get_json(api_url("works", params))
        out.extend(data.get("results", []))
        nxt = (data.get("meta") or {}).get("next_cursor")
        if not nxt or not data.get("results"):
            break
        cursor = nxt
    return out

def normalize_venue(source: str) -> str:
    s = norm_text(source)
    low = s.lower()
    for pattern, venue in VENUE_PATTERNS:
        if re.search(pattern, low, flags=re.I):
            return venue
    return s or "Unknown"

def venue_tier(venue: str) -> str:
    return WATCH_VENUES.get(venue, "")

def classify_areas(text: str) -> tuple[str, list[str], dict[str, int]]:
    low = text.lower()
    scores: dict[str, int] = {}
    for area, cfg in AREA_CONFIG.items():
        score = 0
        for term in cfg["terms"]:
            if term in low:
                score += 2 if " " in term else 1
        scores[area] = score
    ranked = sorted(scores, key=lambda a: scores[a], reverse=True)
    primary = ranked[0] if ranked and scores[ranked[0]] > 0 else ""
    related = [a for a in ranked[1:] if scores[a] > 0]
    return primary, related, scores

def area_gate(area: str, text: str) -> bool:
    low = text.lower()
    if area == "Multimodal Code Generation":
        visual = any(x in low for x in ["multimodal", "vision", "image", "screenshot", "ui ", "gui", "diagram", "flowchart", "visual", "design"])
        code = any(x in low for x in ["code", "program", "software", "frontend", "webpage", "website"])
        return visual and code
    if area == "Agentic Software Engineering":
        agent = any(x in low for x in ["agent", "agentic", "autonomous"])
        se = any(x in low for x in ["code", "software", "program", "repository", "bug", "debug", "test", "developer", "github"])
        return agent and se
    if area == "Mechanistic Interpretability":
        return any(x in low for x in [
            "mechanistic interpret", "activation patch", "causal tracing", "sparse autoencoder",
            "transformer circuit", "dictionary learning", "residual stream", "feature steering",
            "superposition", "linear probe", "representation probing"
        ])
    if area == "Explainable AI":
        explain = any(x in low for x in [
            "explainable", "interpretability", "interpretable", "explanation", "counterfactual",
            "feature attribution", "shap", "lime", "tcav", "saliency"
        ])
        ai = any(x in low for x in [
            "machine learning", "neural", "model", "llm", "language model", "vision", "classifier",
            "artificial intelligence", "transformer"
        ])
        return explain and ai
    return False

def infer_paper_type(text: str) -> str:
    low = text.lower()
    if "survey" in low or "systematic review" in low or "literature review" in low:
        return "Survey / Review"
    if "benchmark" in low or "dataset" in low:
        return "Benchmark / Dataset"
    if any(x in low for x in ["evaluation", "empirical study", "measurement study", "analysis of"]):
        return "Evaluation / Analysis"
    if any(x in low for x in ["framework", "system", "agent", "method", "approach", "model"]):
        return "Method / System"
    return "Research Paper"

def infer_methods(text: str) -> str:
    low = text.lower()
    hits = [name for name, terms in METHOD_TERMS if any(t in low for t in terms)]
    return "; ".join(hits[:6])

def infer_models(text: str) -> str:
    hits = [m for m in MODEL_TERMS if m.lower() in text.lower()]
    return "; ".join(dict.fromkeys(hits))

def infer_datasets(text: str) -> str:
    hits = [d for d in DATASET_TERMS if d.lower() in text.lower()]
    return "; ".join(dict.fromkeys(hits))

def infer_metrics(text: str) -> str:
    low = text.lower()
    hits = []
    for p in METRIC_PATTERNS:
        if re.search(p, low):
            hits.append(p.replace("\\b", ""))
    return "; ".join(dict.fromkeys(hits))

def infer_failure(text: str) -> str:
    low = text.lower()
    terms = [
        ("hallucination", "Hallucination"),
        ("failure", "Failure analysis"),
        ("error", "Errors"),
        ("robust", "Robustness"),
        ("security", "Security"),
        ("vulnerab", "Vulnerabilities"),
        ("misalign", "Misalignment"),
        ("bias", "Bias"),
        ("incorrect", "Incorrect behavior"),
        ("unfaith", "Unfaithful explanation"),
    ]
    hits = [label for key, label in terms if key in low]
    return "; ".join(hits[:4])

def yes_signal(text: str, terms: list[str], positive: str = "Yes") -> str:
    low = text.lower()
    return positive if any(t in low for t in terms) else ""

def infer_task(area: str, text: str) -> str:
    low = text.lower()
    if area == "Multimodal Code Generation":
        for key, label in [
            ("flowchart", "Flowchart → code"),
            ("screenshot", "Screenshot → code"),
            ("ui ", "UI / design → code"),
            ("gui", "GUI → code"),
            ("diagram", "Diagram → code"),
            ("image", "Image → code"),
        ]:
            if key in low:
                return label
        return "Multimodal code generation / program synthesis"
    if area == "Agentic Software Engineering":
        for key, label in [
            ("program repair", "Program repair"),
            ("bug fix", "Bug fixing"),
            ("debug", "Debugging"),
            ("test", "Testing"),
            ("repository", "Repository-level software task"),
            ("github issue", "GitHub issue resolution"),
            ("code review", "Code review"),
        ]:
            if key in low:
                return label
        return "Autonomous software engineering"
    if area == "Mechanistic Interpretability":
        return "Understand / localize internal model computation"
    if area == "Explainable AI":
        return "Explain or interpret model predictions / behavior"
    return ""

def infer_agent_capability(text: str) -> str:
    low = text.lower()
    labels = []
    for key, label in [
        ("planning", "Planning"),
        ("tool", "Tool use"),
        ("repository", "Repository navigation"),
        ("debug", "Debugging"),
        ("repair", "Program repair"),
        ("test", "Testing"),
        ("multi-agent", "Multi-agent collaboration"),
        ("multi agent", "Multi-agent collaboration"),
        ("memory", "Memory"),
        ("code review", "Code review"),
    ]:
        if key in low:
            labels.append(label)
    return "; ".join(dict.fromkeys(labels)) or "Coding / software agent"

def infer_environment(text: str) -> str:
    low = text.lower()
    labels = []
    for key, label in [
        ("repository", "Repository"),
        ("github", "GitHub"),
        ("terminal", "Terminal"),
        ("ide", "IDE"),
        ("browser", "Browser"),
        ("web", "Web environment"),
    ]:
        if key in low:
            labels.append(label)
    return "; ".join(dict.fromkeys(labels))

def infer_feedback(text: str) -> str:
    low = text.lower()
    labels = []
    for key, label in [
        ("unit test", "Unit tests"),
        ("test feedback", "Test feedback"),
        ("execution", "Execution feedback"),
        ("compiler", "Compiler feedback"),
        ("human feedback", "Human feedback"),
        ("reward", "Reward / evaluator"),
    ]:
        if key in low:
            labels.append(label)
    return "; ".join(dict.fromkeys(labels))

def infer_target_component(text: str) -> str:
    low = text.lower()
    labels = []
    for key, label in [
        ("attention head", "Attention heads"),
        ("mlp", "MLP"),
        ("residual stream", "Residual stream"),
        ("neuron", "Neurons"),
        ("sparse autoencoder", "SAE features"),
        ("feature", "Features"),
        ("activation", "Activations"),
        ("circuit", "Circuits"),
        ("layer", "Layers"),
    ]:
        if key in low:
            labels.append(label)
    return "; ".join(dict.fromkeys(labels))

def infer_explanation_type(text: str) -> str:
    low = text.lower()
    for terms, label in [
        (["counterfactual"], "Counterfactual"),
        (["tcav", "concept-based", "concept based"], "Concept-based"),
        (["shap", "lime", "feature attribution"], "Feature attribution"),
        (["saliency", "gradient"], "Saliency / gradient"),
        (["example-based", "example based"], "Example-based"),
    ]:
        if any(t in low for t in terms):
            return label
    return "Model explanation / interpretability"

def infer_modality(text: str) -> str:
    low = text.lower()
    labels = []
    if any(x in low for x in ["vision", "image", "multimodal", "vlm"]):
        labels.append("Vision / Multimodal")
    if any(x in low for x in ["language model", "llm", "transformer", "text"]):
        labels.append("Language / LLM")
    if any(x in low for x in ["code", "program", "software"]):
        labels.append("Code")
    return "; ".join(labels) or "ML model"

def infer_limitation(area: str, text: str) -> str:
    low = text.lower()
    if area == "Mechanistic Interpretability":
        causal = any(x in low for x in ["causal", "intervention", "patching", "steering", "ablation"])
        probe = any(x in low for x in ["probe", "probing", "classifier"])
        if probe and not causal:
            return "Gap signal: representation is probed, but causal use is not explicit in title/abstract."
    if area == "Agentic Software Engineering":
        failure = any(x in low for x in ["failure", "error", "why", "root cause", "mechanism"])
        if not failure:
            return "Gap signal: agent capability/performance is studied; failure mechanism is not explicit in title/abstract."
    if area == "Multimodal Code Generation":
        grounding = any(x in low for x in ["grounding", "structure", "topology", "edge", "relation", "counterfactual"])
        if not grounding:
            return "Gap signal: generation is studied; explicit visual-structural grounding evidence is not obvious."
    if area == "Explainable AI":
        faithful = any(x in low for x in ["faithful", "faithfulness", "causal", "human evaluation", "robust"])
        if not faithful:
            return "Gap signal: explanation method is present; faithfulness/robustness evidence is not explicit."
    return ""

def why_matters(area: str, flags: list[str], limitation: str) -> str:
    base = {
        "Multimodal Code Generation": "Relevant to visual grounding, structure-aware code generation, or multimodal SE.",
        "Agentic Software Engineering": "Relevant to coding-agent capability, reliability, failure analysis, or intervention.",
        "Mechanistic Interpretability": "Relevant to representation → causal use → intervention analysis in LLM/VLM/code models.",
        "Explainable AI": "Relevant to explanation faithfulness, robustness, concepts, or human-facing interpretability.",
        "Adjacent / Watch": "Watched-author paper; review for possible transfer to your tracked research directions.",
    }.get(area, "Relevant to tracked research.")
    if "watched researcher" in " ".join(flags):
        base += " Watched-author signal."
    if limitation:
        base += " " + limitation
    return base

def priority_label(score: int) -> str:
    if score >= 85:
        return "A — Must Read"
    if score >= 70:
        return "B — High"
    return "C — Monitor"

def work_to_item(w: dict[str, Any], source_override: str = "") -> dict[str, Any] | None:
    title = norm_text(w.get("title", ""))
    if not title:
        return None
    abstract = reconstruct_abstract(w.get("abstract_inverted_index"))
    text = norm_text(f"{title}. {abstract}")
    primary, related, scores = classify_areas(text)

    # If classifier weak, try query-oriented gates.
    if primary and not area_gate(primary, text):
        candidates = [a for a in AREA_CONFIG if area_gate(a, text)]
        primary = candidates[0] if candidates else ""
        related = [a for a in candidates[1:]]

    authorships = w.get("authorships") or []
    authors = []
    institutions = []
    for a in authorships:
        name = norm_text(((a.get("author") or {}).get("display_name") or ""))
        if name and name not in authors:
            authors.append(name)
        for inst in a.get("institutions") or []:
            n = norm_text(inst.get("display_name", ""))
            if n and n not in institutions:
                institutions.append(n)

    source_raw = norm_text((((w.get("primary_location") or {}).get("source") or {}).get("display_name") or ""))
    venue = normalize_venue(source_raw)
    watched_authors = [a for a in authors if any(norm_key(a) == norm_key(r) for r in WATCH_RESEARCHERS)]
    priority_insts = [i for i in institutions if any(norm_key(p) in norm_key(i) or norm_key(i) in norm_key(p) for p in WATCH_INSTITUTIONS)]
    score = 45
    if primary:
        score += min(20, scores.get(primary, 0) * 4)
    flags = []
    if venue in WATCH_VENUES:
        score += 10
        flags.append(f"priority venue: {venue}")
    if priority_insts:
        score += 8
        flags.append("priority institution")
    if watched_authors:
        score += 12
        flags.append("watched researcher: " + ", ".join(watched_authors[:2]))

    evidence_terms = ["counterfactual", "causal", "intervention", "failure", "benchmark", "evaluation", "faithful", "mechanism", "ablation", "patching"]
    evidence_hits = sum(1 for t in evidence_terms if t in text.lower())
    score += min(8, evidence_hits * 2)
    if evidence_hits:
        flags.append("strong evidence/method signal")

    citations = int(w.get("cited_by_count") or 0)
    if citations:
        score += min(8, int(math.log10(citations + 1) * 4))
    score = min(score, 100)

    pub_date = w.get("publication_date") or ""
    doi = w.get("doi") or ""
    loc = w.get("primary_location") or {}
    url = loc.get("landing_page_url") or doi or w.get("id") or ""
    paper_type = infer_paper_type(text)
    method = infer_methods(text)
    model = infer_models(text)
    dataset = infer_datasets(text)
    metric = infer_metrics(text)
    failure = infer_failure(text)
    counterfactual = yes_signal(text, ["counterfactual"])
    mechanism = ""
    if any(x in text.lower() for x in ["causal tracing", "activation patch", "ablation", "intervention", "circuit", "mechanistic"]):
        mechanism = "Yes / causal-mechanistic signal"
    elif any(x in text.lower() for x in ["probe", "probing", "representation"]):
        mechanism = "Probe / representation evidence"
    causal = yes_signal(text, ["causal", "intervention", "activation patch", "steering", "ablation", "model editing"])
    main_claim = first_sentence(abstract) or first_sentence(title)
    limitation = infer_limitation(primary, text) if primary else ""
    item = {
        "id": (w.get("id") or "").rsplit("/", 1)[-1],
        "year": int(w.get("publication_year") or (pub_date[:4] if pub_date else 0) or 0),
        "published": pub_date,
        "primary_area": primary,
        "related_areas": related,
        "title": title,
        "authors": authors,
        "watched_authors": watched_authors,
        "institutions": institutions,
        "priority_institutions": priority_insts,
        "venue": venue,
        "venue_tier": venue_tier(venue),
        "paper_type": paper_type,
        "task": infer_task(primary, text) if primary else "",
        "method": method,
        "model": model,
        "dataset": dataset,
        "metric": metric,
        "failure": failure,
        "counterfactual": counterfactual,
        "mechanism": mechanism,
        "causal": causal,
        "main_claim": main_claim,
        "limitation": limitation,
        "why": why_matters(primary or "Adjacent / Watch", flags, limitation),
        "score": score,
        "citations": citations,
        "doi": doi,
        "url": url,
        "code_data": "",
        "source": source_override or "OpenAlex",
        "text": text,
        "flags": flags,
    }
    return item

def arxiv_recent() -> list[dict[str, Any]]:
    ns = {"a": "http://www.w3.org/2005/Atom"}
    queries = {
        "Multimodal Code Generation": 'all:"multimodal code generation" OR all:"screenshot to code" OR all:"flowchart to code" OR all:"UI to code"',
        "Agentic Software Engineering": 'all:"coding agent" OR all:"software engineering agent" OR all:"SWE-bench"',
        "Mechanistic Interpretability": 'all:"mechanistic interpretability" OR all:"sparse autoencoder" OR all:"activation patching"',
        "Explainable AI": 'all:"explainable AI" OR all:"counterfactual explanation" OR all:"concept based explanation"',
    }
    items = []
    for area, q in queries.items():
        params = {
            "search_query": q,
            "start": 0,
            "max_results": 80,
            "sortBy": "submittedDate",
            "sortOrder": "descending",
        }
        url = "https://export.arxiv.org/api/query?" + urllib.parse.urlencode(params)
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "govind-research-radar/2.0"})
            with urllib.request.urlopen(req, timeout=60) as r:
                xml = r.read()
            root = ET.fromstring(xml)
        except Exception as e:
            print("arXiv query failed:", area, e)
            continue
        for entry in root.findall("a:entry", ns):
            title = norm_text(entry.findtext("a:title", default="", namespaces=ns))
            abstract = norm_text(entry.findtext("a:summary", default="", namespaces=ns))
            published = entry.findtext("a:published", default="", namespaces=ns)[:10]
            try:
                pd = datetime.fromisoformat(published).date()
            except Exception:
                continue
            if pd < RECENT_CUTOFF:
                continue
            authors = [norm_text(x.findtext("a:name", default="", namespaces=ns)) for x in entry.findall("a:author", ns)]
            url_id = entry.findtext("a:id", default="", namespaces=ns)
            fake = {
                "id": url_id,
                "title": title,
                "abstract_inverted_index": None,
                "authorships": [{"author": {"display_name": a}, "institutions": []} for a in authors],
                "primary_location": {"source": {"display_name": "arXiv"}, "landing_page_url": url_id},
                "publication_date": published,
                "publication_year": int(published[:4]),
                "cited_by_count": 0,
                "doi": "",
            }
            item = work_to_item(fake, source_override="arXiv direct")
            if item:
                item["text"] = norm_text(f"{title}. {abstract}")
                primary, related, scores = classify_areas(item["text"])
                if primary and area_gate(primary, item["text"]):
                    item["primary_area"] = primary
                    item["related_areas"] = related
                    item["task"] = infer_task(primary, item["text"])
                    item["method"] = infer_methods(item["text"])
                    item["model"] = infer_models(item["text"])
                    item["dataset"] = infer_datasets(item["text"])
                    item["metric"] = infer_metrics(item["text"])
                    item["failure"] = infer_failure(item["text"])
                    item["counterfactual"] = yes_signal(item["text"], ["counterfactual"])
                    item["causal"] = yes_signal(item["text"], ["causal", "intervention", "activation patch", "steering", "ablation"])
                    item["main_claim"] = first_sentence(abstract)
                    item["limitation"] = infer_limitation(primary, item["text"])
                    item["why"] = why_matters(primary, item["flags"], item["limitation"])
                    item["score"] = max(item["score"], 60)
                    items.append(item)
        time.sleep(1.0)
    return items

def merge_item(old: dict[str, Any], new: dict[str, Any]) -> dict[str, Any]:
    # Prefer richer metadata; preserve the strongest score/citation count.
    best = old
    old_rich = int(bool(old.get("doi"))) + int(old.get("venue") not in ("", "Unknown", "arXiv")) + len(old.get("institutions", []))
    new_rich = int(bool(new.get("doi"))) + int(new.get("venue") not in ("", "Unknown", "arXiv")) + len(new.get("institutions", []))
    if new_rich > old_rich:
        best = new
    merged = dict(best)
    merged["score"] = max(int(old.get("score", 0)), int(new.get("score", 0)))
    merged["citations"] = max(int(old.get("citations", 0)), int(new.get("citations", 0)))
    merged["watched_authors"] = list(dict.fromkeys(old.get("watched_authors", []) + new.get("watched_authors", [])))
    merged["priority_institutions"] = list(dict.fromkeys(old.get("priority_institutions", []) + new.get("priority_institutions", [])))
    merged["related_areas"] = list(dict.fromkeys(old.get("related_areas", []) + new.get("related_areas", [])))
    merged["flags"] = list(dict.fromkeys(old.get("flags", []) + new.get("flags", [])))
    return merged

def dedupe(items: Iterable[dict[str, Any]]) -> list[dict[str, Any]]:
    by_key: dict[str, dict[str, Any]] = {}
    doi_to_key: dict[str, str] = {}
    title_to_key: dict[str, str] = {}
    for item in items:
        if not item or not item.get("title"):
            continue
        doi = norm_key(item.get("doi", ""))
        title_key = f"{norm_key(item['title'])}:{item.get('year') or ''}"

        existing_key = ""
        if doi and doi in doi_to_key:
            existing_key = doi_to_key[doi]
        elif title_key in title_to_key:
            existing_key = title_to_key[title_key]

        if existing_key:
            by_key[existing_key] = merge_item(by_key[existing_key], item)
            if doi:
                doi_to_key[doi] = existing_key
            title_to_key[title_key] = existing_key
            continue

        canonical = f"doi:{doi}" if doi else f"title:{title_key}"
        # Extremely rare canonical-key collision: make it unique without losing the title map.
        if canonical in by_key:
            canonical = canonical + ":" + str(len(by_key))
        by_key[canonical] = item
        if doi:
            doi_to_key[doi] = canonical
        title_to_key[title_key] = canonical
    return list(by_key.values())

def collect_topic_corpus() -> list[dict[str, Any]]:
    raw = []
    for area, cfg in AREA_CONFIG.items():
        print("Collecting:", area)
        for q in cfg["queries"]:
            try:
                for w in openalex_search(q, recent=False, pages=2):
                    item = work_to_item(w)
                    if item and item.get("primary_area") and area_gate(item["primary_area"], item["text"]):
                        raw.append(item)
                for w in openalex_search(q, recent=True, pages=1):
                    item = work_to_item(w)
                    if item and item.get("primary_area") and area_gate(item["primary_area"], item["text"]):
                        raw.append(item)
            except Exception as e:
                print("query failed:", q, e)
    try:
        raw.extend(arxiv_recent())
    except Exception as e:
        print("arXiv sweep failed:", e)
    return dedupe(raw)

def collect_author_corpus() -> tuple[list[dict[str, Any]], dict[str, dict[str, str]]]:
    out = []
    resolved: dict[str, dict[str, str]] = {}
    for name, (aff, category) in WATCH_RESEARCHERS.items():
        try:
            author = openalex_resolve_author(name, aff)
        except Exception as e:
            print("author resolve failed:", name, e)
            continue
        if not author:
            continue
        aid = author.get("id", "")
        resolved[name] = {
            "id": aid,
            "display_name": author.get("display_name", name),
            "affiliation": aff,
            "category": category,
        }
        try:
            works = openalex_author_works(aid, pages=2)
        except Exception as e:
            print("author works failed:", name, e)
            continue
        for w in works:
            item = work_to_item(w)
            if not item:
                continue
            if not item.get("primary_area"):
                item["primary_area"] = "Adjacent / Watch"
                item["why"] = why_matters("Adjacent / Watch", ["watched researcher"], "")
            if name not in item["watched_authors"]:
                item["watched_authors"].append(name)
            item["score"] = min(100, max(item["score"], 65) + 8)
            item["watch_researcher"] = name
            item["watch_affiliation"] = aff
            item["watch_category"] = category
            out.append(item)
    return dedupe(out), resolved

def display_join(values: Iterable[str]) -> str:
    return "; ".join([norm_text(v) for v in values if norm_text(v)])

def automated_gap(item: dict[str, Any]) -> str:
    return item.get("limitation", "")

def input_modality(text: str) -> str:
    low = text.lower()
    labels = []
    for key, label in [
        ("flowchart", "Flowchart"),
        ("screenshot", "Screenshot"),
        ("diagram", "Diagram"),
        ("ui ", "UI / Design"),
        ("gui", "GUI"),
        ("image", "Image"),
        ("vision", "Vision"),
        ("multimodal", "Multimodal"),
    ]:
        if key in low:
            labels.append(label)
    return "; ".join(dict.fromkeys(labels)) or "Visual / multimodal input"

def structural_grounding(text: str) -> str:
    return "Explicit signal" if any(x in text.lower() for x in ["grounding", "structure", "topology", "edge", "relation", "layout", "control flow"]) else "Not explicit"

def internal_state(text: str) -> str:
    return "Yes / internal representation signal" if any(x in text.lower() for x in ["activation", "hidden state", "attention", "representation", "probe", "circuit"]) else ""

def behavioral_link(text: str) -> str:
    return "Yes / behavioral link signal" if any(x in text.lower() for x in ["behavior", "performance", "steering", "task", "prediction", "generation"]) else ""

def xai_method_family(text: str) -> str:
    low = text.lower()
    if "counterfactual" in low:
        return "Counterfactual"
    if any(x in low for x in ["tcav", "concept-based", "concept based"]):
        return "Concept-based"
    if any(x in low for x in ["shap", "lime", "feature attribution"]):
        return "Attribution"
    if any(x in low for x in ["saliency", "gradient"]):
        return "Gradient / saliency"
    if any(x in low for x in ["intrinsic", "interpretable model", "rule list", "prototype"]):
        return "Intrinsic interpretable model"
    return "Post-hoc / analysis"

def intrinsic_posthoc(text: str) -> str:
    return "Intrinsic" if any(x in text.lower() for x in ["intrinsic", "inherently interpretable", "interpretable model", "rule list"]) else "Post-hoc / analysis"

def local_global(text: str) -> str:
    low = text.lower()
    if "global explanation" in low:
        return "Global"
    if "local explanation" in low or "instance-level" in low:
        return "Local"
    return ""

def bool_signal(text: str, keys: list[str]) -> str:
    return "Yes" if any(k in text.lower() for k in keys) else ""

def master_row(i: dict[str, Any]) -> list[Any]:
    return [
        i["id"], i["year"], i["published"], i["primary_area"], display_join(i["related_areas"]),
        i["title"], display_join(i["authors"]), display_join(i["watched_authors"]),
        display_join(i["institutions"]), display_join(i["priority_institutions"]),
        i["venue"], i["venue_tier"], i["paper_type"], i["task"], i["method"], i["model"],
        i["dataset"], i["metric"], i["failure"], i["counterfactual"], i["mechanism"], i["causal"],
        i["main_claim"], i["limitation"], i["why"], i["score"], i["citations"], i["doi"],
        i["url"], i["code_data"], NOW_ISO, i["source"],
    ]

def new_row(i: dict[str, Any]) -> list[Any]:
    why = ", ".join(i["flags"]) if i["flags"] else i["why"]
    return [
        i["published"], i["year"], i["primary_area"], i["title"], display_join(i["authors"]),
        display_join(i["priority_institutions"]), i["venue"], i["venue_tier"], i["score"],
        why, i["method"] or i["paper_type"], i["limitation"], i["citations"], i["url"], i["code_data"],
    ]

def multimodal_row(i: dict[str, Any]) -> list[Any]:
    t = i["text"]
    return [
        i["year"], i["title"], display_join(i["authors"]), display_join(i["institutions"]), i["venue"],
        input_modality(t), i["task"], i["model"], i["dataset"], i["metric"], structural_grounding(t),
        i["counterfactual"], i["causal"], i["failure"], i["main_claim"], i["limitation"], i["why"],
        priority_label(i["score"]), i["citations"], i["url"], i["code_data"],
    ]

def agentic_row(i: dict[str, Any]) -> list[Any]:
    t = i["text"]
    return [
        i["year"], i["title"], display_join(i["authors"]), display_join(i["institutions"]), i["venue"],
        infer_agent_capability(t), i["task"], infer_environment(t), infer_feedback(t), i["failure"],
        "", internal_state(t), i["counterfactual"], i["mechanism"], i["causal"], i["metric"],
        i["dataset"], i["main_claim"], i["limitation"], i["why"], priority_label(i["score"]),
        i["citations"], i["url"], i["code_data"],
    ]

def mech_row(i: dict[str, Any]) -> list[Any]:
    t = i["text"]
    return [
        i["year"], i["title"], display_join(i["authors"]), display_join(i["institutions"]), i["venue"],
        infer_modality(t), infer_target_component(t), i["method"], infer_target_component(t),
        bool_signal(t, ["probe", "probing", "linear classifier"]), bool_signal(t, ["causal", "activation patch", "ablation"]),
        bool_signal(t, ["steering", "intervention", "model editing", "activation patch"]), i["counterfactual"],
        i["mechanism"], behavioral_link(t), i["main_claim"], i["limitation"], i["why"],
        priority_label(i["score"]), i["citations"], i["url"], i["code_data"],
    ]

def xai_row(i: dict[str, Any]) -> list[Any]:
    t = i["text"]
    return [
        i["year"], i["title"], display_join(i["authors"]), display_join(i["institutions"]), i["venue"],
        infer_modality(t), i["task"], infer_explanation_type(t), xai_method_family(t), intrinsic_posthoc(t),
        local_global(t), bool_signal(t, ["faithful", "faithfulness"]), bool_signal(t, ["human evaluation", "user study"]),
        bool_signal(t, ["robust", "stability", "stable explanation"]), i["counterfactual"], i["causal"],
        i["main_claim"], i["limitation"], i["why"], priority_label(i["score"]), i["citations"], i["url"], i["code_data"],
    ]

def author_row(i: dict[str, Any], resolved: dict[str, dict[str, str]]) -> list[Any]:
    researcher = i.get("watch_researcher") or (i["watched_authors"][0] if i["watched_authors"] else "")
    meta = resolved.get(researcher, {})
    coauthors = [a for a in i["authors"] if norm_key(a) != norm_key(researcher)]
    return [
        researcher, meta.get("affiliation", i.get("watch_affiliation", "")), meta.get("category", i.get("watch_category", "")),
        i["year"], i["title"], display_join(coauthors), i["venue"], i["venue_tier"], i["primary_area"], i["paper_type"],
        i["task"], i["method"], i["model"], i["dataset"], i["counterfactual"], i["mechanism"], i["causal"],
        i["main_claim"], i["limitation"], i["why"], i["citations"], i["url"],
    ]

def write_rows(filename: str, rows: list[list[Any]]) -> None:
    path = OUT / filename
    with path.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.writer(f)
        writer.writerows(rows)
    print(f"wrote {filename}: {len(rows)} rows")

def main():
    topic = collect_topic_corpus()
    author_items, resolved = collect_author_corpus()
    all_items = dedupe(topic + author_items)

    # Keep domain corpus strict; watched-author adjacent papers only appear in Author Papers / Master.
    domain_items = [i for i in all_items if i["primary_area"] in AREA_CONFIG and area_gate(i["primary_area"], i["text"])]

    # Historical views use oldest→newest so new weekly papers mostly append at the bottom.
    domain_items.sort(key=lambda x: (x["published"] or "9999-99-99", x["title"].lower()))
    all_items.sort(key=lambda x: (x["published"] or "9999-99-99", x["title"].lower()))

    recent = [
        i for i in domain_items
        if i.get("published") and i["published"][:10] >= RECENT_CUTOFF.isoformat() and i["score"] >= 62
    ]
    recent.sort(key=lambda x: (-x["score"], x["published"], x["title"]), reverse=False)
    recent = recent[:15]

    write_rows("all_papers_master.csv", [master_row(i) for i in all_items])
    write_rows("new_high_priority.csv", [new_row(i) for i in recent])
    write_rows("multimodal_code_gen.csv", [multimodal_row(i) for i in domain_items if i["primary_area"] == "Multimodal Code Generation"])
    write_rows("agentic_se.csv", [agentic_row(i) for i in domain_items if i["primary_area"] == "Agentic Software Engineering"])
    write_rows("mechanistic_interpretability.csv", [mech_row(i) for i in domain_items if i["primary_area"] == "Mechanistic Interpretability"])
    write_rows("explainable_ai.csv", [xai_row(i) for i in domain_items if i["primary_area"] == "Explainable AI"])

    # Author view grouped by researcher and chronological.
    author_items.sort(key=lambda x: (norm_key(x.get("watch_researcher", "")), x["published"] or "", x["title"].lower()))
    write_rows("author_papers.csv", [author_row(i, resolved) for i in author_items])

    # Website JSON: only top recent papers, compact.
    counts = {a: sum(1 for x in recent if x["primary_area"] == a) for a in AREA_CONFIG}
    payload = {
        "generated_at": NOW_ISO,
        "window_days": RECENT_DAYS,
        "items": [
            {
                "date": i["published"],
                "area": i["primary_area"],
                "title": i["title"],
                "authors": i["authors"][:6],
                "institutions": i["institutions"][:5],
                "venue": i["venue"],
                "score": i["score"],
                "citations": i["citations"],
                "why": ", ".join(i["flags"]) if i["flags"] else i["why"],
                "url": i["url"],
            }
            for i in recent
        ],
        "counts": counts,
        "watch": {
            "researchers": len(WATCH_RESEARCHERS),
            "institutions": WATCH_INSTITUTIONS,
            "venues": sorted(WATCH_VENUES),
        },
        "corpus": {
            "all_papers": len(all_items),
            "domain_papers": len(domain_items),
            "author_papers": len(author_items),
        },
    }
    (PUBLIC / "research-radar.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    (OUT / "run_status.json").write_text(json.dumps({
        "generated_at": NOW_ISO,
        "all_papers": len(all_items),
        "domain_papers": len(domain_items),
        "author_papers": len(author_items),
        "recent_high_priority": len(recent),
        "resolved_researchers": len(resolved),
    }, indent=2), encoding="utf-8")
    print("Research radar build complete:", payload["corpus"], "recent", len(recent))

if __name__ == "__main__":
    main()
