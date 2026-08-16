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
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
OUT = PUBLIC / "radar-data"
STATE_DIR = ROOT / "data" / "research-radar"
STATE_FILE = STATE_DIR / "state.json"
OUT.mkdir(parents=True, exist_ok=True)
STATE_DIR.mkdir(parents=True, exist_ok=True)

TODAY = datetime.now(timezone.utc).date()
NOW_ISO = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
BACKFILL_FROM = "2020-01-01"
BACKFILL_TO = TODAY.isoformat()
RECENT_DAYS = 28
RECENT_FROM = (TODAY - timedelta(days=RECENT_DAYS)).isoformat()
MODE = (os.environ.get("RADAR_MODE") or "auto").strip().lower()
OPENALEX_API_KEY = (os.environ.get("OPENALEX_API_KEY") or "").strip()
CONTACT_EMAIL = (os.environ.get("CONTACT_EMAIL") or "").strip()

AREAS = {
    "Multimodal Code Generation": {
        "queries": [
            "multimodal code generation", "vision language code generation", "image to code",
            "screenshot to code", "UI to code", "flowchart to code", "diagram to code", "design to code",
        ],
    },
    "Agentic Software Engineering": {
        "queries": [
            "coding agent", "software engineering agent", "autonomous software engineer",
            "repository coding agent", "SWE-bench agent", "program repair agent",
            "debugging agent software", "testing agent software",
        ],
    },
    "Mechanistic Interpretability": {
        "queries": [
            "mechanistic interpretability", "activation patching", "causal tracing language model",
            "sparse autoencoder interpretability", "transformer circuits", "feature steering language model",
            "dictionary learning interpretability", "representation probing language model",
        ],
    },
    "Explainable AI": {
        "queries": [
            "explainable artificial intelligence", "interpretable machine learning", "explanation faithfulness",
            "counterfactual explanation machine learning", "concept based explanation", "feature attribution",
            "LLM explainability", "explanation robustness machine learning",
        ],
    },
}

WATCH_VENUES = {
    "NeurIPS": "A*", "ICML": "A*", "ICLR": "A*", "ACL": "A*", "EMNLP": "A*",
    "NAACL": "A", "EACL": "A", "TACL": "A*", "CVPR": "A*", "ICCV": "A*",
    "ECCV": "A*", "WACV": "A", "ICSE": "A*", "FSE": "A*", "ASE": "A*",
    "ISSTA": "A*", "MSR": "A", "ICSME": "A", "SANER": "A", "JMLR": "A*",
    "TMLR": "A", "AAAI": "A*", "AISTATS": "A", "COLM": "A", "PLDI": "A*",
    "OOPSLA": "A*", "CHI": "A*", "IJCAI": "A*", "KDD": "A*", "arXiv": "Preprint",
}

WATCH_INSTITUTIONS = [
    "Stanford University", "Carnegie Mellon University", "National University of Singapore",
    "Nanyang Technological University", "Queen's University", "Tsinghua University", "Fudan University",
    "Beihang University", "Google DeepMind", "Anthropic", "Princeton University", "ETH Zurich",
    "Massachusetts Institute of Technology", "Harvard University", "Duke University",
    "University College London", "Columbia University", "Northeastern University", "University of Stuttgart",
]

WATCH_RESEARCHERS = {
    "Ahmed E. Hassan": ("Queen's University", "Agentic SE / Software Analytics"),
    "Bram Adams": ("Queen's University", "Agentic SE / DevOps"),
    "Jian Yang": ("Beihang University", "Multimodal Code / Code LLM"),
    "Xingjun Ma": ("Fudan University", "Trustworthy ML / XAI"),
    "Yu-Gang Jiang": ("Fudan University", "Vision / Multimodal"),
    "Chen Qian": ("Tsinghua University", "Multi-Agent Software Development"),
    "Sirui Hong": ("DeepWisdom", "Multi-Agent Software Development"),
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
    "Jacob Andreas": ("Massachusetts Institute of Technology", "Interpretability / Language Models"),
    "Been Kim": ("Google DeepMind", "Explainable AI / Interpretability"),
    "Cynthia Rudin": ("Duke University", "Interpretable ML"),
    "Finale Doshi-Velez": ("Harvard University", "Interpretability / Human-AI"),
    "Wenya Wang": ("Nanyang Technological University", "LLM Interpretability"),
    "Clement Neo": ("Nanyang Technological University", "Mechanistic Interpretability"),
    "Zhengxuan Wu": ("Stanford University", "Mechanistic Interpretability"),
    "Kenji Kawaguchi": ("National University of Singapore", "LLM / Deep Learning"),
    "Yuntong Zhang": ("National University of Singapore", "Coding Agents / Program Repair"),
    "Shyam Agarwal": ("Carnegie Mellon University", "Empirical AI Coding"),
    "Christian Kästner": ("Carnegie Mellon University", "AI Engineering / Agentic SE"),
    "Claire Le Goues": ("Carnegie Mellon University", "Program Repair / Agentic SE"),
    "Karthik Narasimhan": ("Princeton University", "Agentic AI / Coding Agents"),
    "Baishakhi Ray": ("Columbia University", "Code LLMs / Agentic SE"),
    "Michael Pradel": ("University of Stuttgart", "AI for Code / Reliability"),
    "Mark Harman": ("University College London", "Automated SE / Agentic Testing"),
    "Federica Sarro": ("University College London", "Automated / Empirical SE"),
    "Peter O'Hearn": ("University College London", "Verification / Agentic SE"),
    "Miltos Allamanis": ("Google DeepMind", "Machine Learning for Code"),
    "Ira Ceka": ("Columbia University", "Coding-Agent Failure Analysis"),
}

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

# Strict domain gates. Broad words like "code", "attention", "interpretation", or "model"
# are intentionally insufficient on their own.
MM_VISUAL = re.compile(r"\b(multimodal|vision[- ]language|vlm|screenshot|screen[- ]to[- ]code|ui[- ]to[- ]code|gui[- ]to[- ]code|image[- ]to[- ]code|flowchart|uml|diagram[- ]to[- ]code|design[- ]to[- ]code|webpage screenshot|visual programming)\b", re.I)
MM_CODEGEN = re.compile(r"\b(code generation|generate(?:s|d|ing)? code|program synthesis|source code generation|frontend generation|html\s*/?\s*css|implementation generation|to code|code from|program from)\b", re.I)
AG_AGENT = re.compile(r"\b(coding agent|software engineering agent|software agent|swe-agent|swe bench|swe-bench|agentic software|autonomous software engineer|repository[- ]level agent|program repair agent|debugging agent|testing agent|llm agent)\b", re.I)
AG_SE = re.compile(r"\b(repository|github issue|bug fix|bug fixing|debugging|program repair|software test|unit test|code review|codebase|source code|software engineering|patch generation|issue resolution|developer task)\b", re.I)
MI_METHOD = re.compile(r"\b(mechanistic interpretability|activation patch(?:ing)?|path patch(?:ing)?|causal tracing|sparse autoencoder|sae features?|transformer circuits?|dictionary learning|superposition|feature steering|activation steering|residual stream|causal scrubbing|representation probing|linear probing)\b", re.I)
MI_MODEL = re.compile(r"\b(language model|llm|transformer|vision[- ]language|vlm|neural network|deep network|foundation model|code model|multimodal model)\b", re.I)
XAI_METHOD = re.compile(r"\b(explainable ai|explainable artificial intelligence|interpretable machine learning|model explanation|explanation faithfulness|counterfactual explanation|feature attribution|shap|lime|tcav|concept[- ]based|concept bottleneck|saliency map|rationale faithfulness|post[- ]hoc explanation|inherently interpretable)\b", re.I)
XAI_MODEL = re.compile(r"\b(machine learning|neural network|deep learning|classifier|language model|llm|transformer|vision model|foundation model|artificial intelligence|ai system)\b", re.I)
ADJACENT_WATCH = re.compile(r"\b(code model|program analysis|program repair|software testing|long context|sequence model|foundation model evaluation|agent evaluation|model robustness|ai safety|reasoning|tool use)\b", re.I)

METHODS = [
    ("multi-agent", ["multi-agent", "multi agent"]), ("planning", ["planning", "planner"]),
    ("tool use", ["tool use", "terminal", "browser tool"]), ("program repair", ["program repair", "bug repair", "patch generation"]),
    ("execution feedback", ["execution feedback", "unit test", "compiler feedback"]), ("probing", ["probe", "probing", "linear classifier"]),
    ("activation patching", ["activation patch", "path patch"]), ("causal tracing", ["causal tracing"]),
    ("sparse autoencoder", ["sparse autoencoder", "sae"]), ("dictionary learning", ["dictionary learning"]),
    ("steering", ["steering", "activation steering"]), ("model editing", ["model editing", "knowledge editing"]),
    ("counterfactual", ["counterfactual"]), ("feature attribution", ["shap", "lime", "feature attribution"]),
    ("concept-based", ["tcav", "concept-based", "concept based"]),
]
DATASETS = ["SWE-bench", "SWE-bench Verified", "HumanEval", "MBPP", "APPS", "RepoBench", "WebArena", "GAIA", "OSWorld", "AndroidWorld", "Design2Code", "WebSight", "ChartQA", "ImageNet", "COCO", "VQA"]
MODELS = ["GPT-4", "GPT-4o", "Claude", "Gemini", "Llama", "Qwen", "Mistral", "Gemma", "DeepSeek", "Codex", "CodeLlama", "StarCoder", "CodeT5", "CLIP", "ViT", "Mamba"]


def norm(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "").replace("\n", " ").replace("\r", " ")).strip()


def keytext(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", (s or "").lower()).strip()


def abstract_from(inv: dict[str, list[int]] | None) -> str:
    if not inv:
        return ""
    maxp = max((max(v) for v in inv.values() if v), default=-1)
    if maxp < 0:
        return ""
    toks = [""] * (maxp + 1)
    for tok, positions in inv.items():
        for p in positions:
            if 0 <= p < len(toks):
                toks[p] = tok
    return norm(" ".join(toks))


def first_sent(text: str, limit: int = 320) -> str:
    text = norm(text)
    if not text:
        return ""
    s = re.split(r"(?<=[.!?])\s+", text)[0]
    return s if len(s) <= limit else s[: limit - 1].rstrip() + "…"


def api_url(endpoint: str, params: dict[str, Any]) -> str:
    p = dict(params)
    if OPENALEX_API_KEY:
        p["api_key"] = OPENALEX_API_KEY
    if CONTACT_EMAIL:
        p["mailto"] = CONTACT_EMAIL
    return "https://api.openalex.org/" + endpoint + "?" + urllib.parse.urlencode(p)


def get_json(url: str, retries: int = 4) -> dict[str, Any]:
    last = None
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "govind-research-radar/3.0"})
            with urllib.request.urlopen(req, timeout=45) as r:
                return json.load(r)
        except Exception as e:
            last = e
            time.sleep(min(2 ** attempt, 8))
    raise RuntimeError(f"request failed: {last}")


def search_works(query: str, date_from: str, pages: int) -> list[dict[str, Any]]:
    cursor = "*"
    out: list[dict[str, Any]] = []
    for _ in range(pages):
        params = {
            "search": query,
            "filter": f"from_publication_date:{date_from},to_publication_date:{BACKFILL_TO}",
            "per_page": 100,
            "cursor": cursor,
            "sort": "publication_date:desc",
        }
        d = get_json(api_url("works", params))
        rows = d.get("results", [])
        out.extend(rows)
        cursor = (d.get("meta") or {}).get("next_cursor")
        if not rows or not cursor:
            break
    return out


def resolve_author(name: str, hint: str) -> dict[str, Any] | None:
    d = get_json(api_url("authors", {"search": name, "per-page": 8}))
    cand = d.get("results", [])
    if not cand:
        return None
    nk = keytext(name)
    hint_words = [x for x in keytext(hint).split() if len(x) > 4]
    def score(a: dict[str, Any]):
        exact = int(keytext(a.get("display_name", "")) == nk)
        insts = " ".join(keytext(x.get("display_name", "")) for x in (a.get("last_known_institutions") or []))
        hint_hit = sum(int(w in insts) for w in hint_words)
        return (exact, hint_hit, int(a.get("cited_by_count") or 0), int(a.get("works_count") or 0))
    return max(cand, key=score)


def author_works(author_id: str, date_from: str, pages: int = 1) -> list[dict[str, Any]]:
    aid = author_id.rsplit("/", 1)[-1]
    cursor = "*"
    out = []
    for _ in range(pages):
        params = {
            "filter": f"authorships.author.id:{aid},from_publication_date:{date_from},to_publication_date:{BACKFILL_TO}",
            "per_page": 100,
            "cursor": cursor,
            "sort": "publication_date:desc",
        }
        d = get_json(api_url("works", params))
        rows = d.get("results", [])
        out.extend(rows)
        cursor = (d.get("meta") or {}).get("next_cursor")
        if not rows or not cursor:
            break
    return out


def normalize_venue(s: str) -> str:
    s = norm(s)
    for pat, venue in VENUE_PATTERNS:
        if re.search(pat, s, re.I):
            return venue
    return s or "Unknown"


def classify(text: str) -> tuple[str, list[str], int]:
    scores: dict[str, int] = {}
    # Strict conjunctions prevent domain leakage.
    if MM_VISUAL.search(text) and MM_CODEGEN.search(text):
        scores["Multimodal Code Generation"] = 5 + len(MM_VISUAL.findall(text)) + len(MM_CODEGEN.findall(text))
    if AG_AGENT.search(text) and AG_SE.search(text):
        scores["Agentic Software Engineering"] = 5 + len(AG_AGENT.findall(text)) + len(AG_SE.findall(text))
    if MI_METHOD.search(text) and MI_MODEL.search(text):
        scores["Mechanistic Interpretability"] = 6 + len(MI_METHOD.findall(text))
    if XAI_METHOD.search(text) and XAI_MODEL.search(text):
        scores["Explainable AI"] = 5 + len(XAI_METHOD.findall(text))
    if not scores:
        return "", [], 0
    # MI wins ties over XAI because it is the more specific scientific category.
    order = {"Mechanistic Interpretability": 4, "Agentic Software Engineering": 3, "Multimodal Code Generation": 2, "Explainable AI": 1}
    ranked = sorted(scores, key=lambda a: (scores[a], order[a]), reverse=True)
    return ranked[0], ranked[1:], scores[ranked[0]]


def infer_list(text: str, pairs) -> str:
    low = text.lower()
    return "; ".join(dict.fromkeys(label for label, terms in pairs if any(t in low for t in terms)))


def infer_method(text: str) -> str:
    return infer_list(text, METHODS)


def infer_models(text: str) -> str:
    low = text.lower()
    return "; ".join(dict.fromkeys(x for x in MODELS if x.lower() in low))


def infer_datasets(text: str) -> str:
    low = text.lower()
    return "; ".join(dict.fromkeys(x for x in DATASETS if x.lower() in low))


def infer_metrics(text: str) -> str:
    low = text.lower()
    labels = []
    for k, label in [("pass@", "pass@k"), ("accuracy", "Accuracy"), ("f1", "F1"), ("success rate", "Success rate"), ("exact match", "Exact match"), ("human evaluation", "Human evaluation"), ("faithfulness", "Faithfulness"), ("robustness", "Robustness")]:
        if k in low:
            labels.append(label)
    return "; ".join(dict.fromkeys(labels))


def infer_failure(text: str) -> str:
    low = text.lower()
    labels = []
    for k, label in [("hallucination", "Hallucination"), ("failure", "Failure analysis"), ("error", "Errors"), ("robust", "Robustness"), ("security", "Security"), ("vulnerab", "Vulnerabilities"), ("bias", "Bias"), ("unfaith", "Unfaithful explanation")]:
        if k in low:
            labels.append(label)
    return "; ".join(dict.fromkeys(labels[:4]))


def paper_type(text: str) -> str:
    low = text.lower()
    if "survey" in low or "systematic review" in low or "literature review" in low:
        return "Survey / Review"
    if "benchmark" in low or "dataset" in low:
        return "Benchmark / Dataset"
    if "evaluation" in low or "empirical study" in low or "analysis" in low:
        return "Evaluation / Analysis"
    return "Method / System" if any(x in low for x in ["framework", "system", "method", "approach", "agent"]) else "Research Paper"


def task_for(area: str, text: str) -> str:
    low = text.lower()
    if area == "Multimodal Code Generation":
        for k, v in [("flowchart", "Flowchart → code"), ("screenshot", "Screenshot → code"), ("ui", "UI / design → code"), ("diagram", "Diagram → code"), ("image", "Image → code")]:
            if k in low: return v
        return "Visual / multimodal → code"
    if area == "Agentic Software Engineering":
        for k, v in [("program repair", "Program repair"), ("bug", "Bug fixing / debugging"), ("test", "Testing"), ("repository", "Repository-level task"), ("code review", "Code review")]:
            if k in low: return v
        return "Autonomous software engineering"
    if area == "Mechanistic Interpretability":
        return "Internal representation / mechanism analysis"
    if area == "Explainable AI":
        return "Model explanation / interpretability"
    return ""


def gap_signal(area: str, text: str) -> str:
    low = text.lower()
    if area == "Multimodal Code Generation" and not any(x in low for x in ["grounding", "structure", "topology", "control flow", "counterfactual"]):
        return "Generation studied; explicit visual-structural grounding evidence is not obvious."
    if area == "Agentic Software Engineering" and not any(x in low for x in ["failure", "root cause", "error analysis", "mechanism", "counterfactual"]):
        return "Capability/performance studied; failure mechanism is not explicit."
    if area == "Mechanistic Interpretability":
        probe = any(x in low for x in ["probe", "probing", "linear classifier"])
        causal = any(x in low for x in ["causal", "intervention", "patching", "steering", "ablation"])
        if probe and not causal:
            return "Representation evidence present; causal use is not explicit."
    if area == "Explainable AI" and not any(x in low for x in ["faithful", "faithfulness", "causal", "human evaluation", "robust"]):
        return "Explanation method present; faithfulness/robustness evidence is not explicit."
    return ""


def build_item(w: dict[str, Any], forced_watch: str = "") -> dict[str, Any] | None:
    title = norm(w.get("title", ""))
    if not title:
        return None
    abstract = abstract_from(w.get("abstract_inverted_index"))
    text = norm(title + ". " + abstract)
    area, related, rel_score = classify(text)
    authors, insts = [], []
    for a in (w.get("authorships") or []):
        n = norm(((a.get("author") or {}).get("display_name") or ""))
        if n and n not in authors: authors.append(n)
        for inst in (a.get("institutions") or []):
            s = norm(inst.get("display_name", ""))
            if s and s not in insts: insts.append(s)
    watched = [a for a in authors if any(keytext(a) == keytext(r) for r in WATCH_RESEARCHERS)]
    if forced_watch and forced_watch not in watched:
        watched.append(forced_watch)
    priority_insts = [i for i in insts if any(keytext(p) in keytext(i) or keytext(i) in keytext(p) for p in WATCH_INSTITUTIONS)]
    source = norm((((w.get("primary_location") or {}).get("source") or {}).get("display_name") or ""))
    venue = normalize_venue(source)
    tier = WATCH_VENUES.get(venue, "")
    pub = w.get("publication_date") or ""
    doi = (w.get("doi") or "").lower().replace("https://doi.org/", "").strip()
    url = (w.get("primary_location") or {}).get("landing_page_url") or ("https://doi.org/" + doi if doi else w.get("id", ""))

    # Author-watch papers may be retained as adjacent only in the author view.
    adjacent = False
    if not area and watched and ADJACENT_WATCH.search(text):
        area = "Adjacent / Watch"
        adjacent = True
    if not area:
        return None

    score = 48 + min(24, rel_score * 3)
    flags = []
    if tier and venue != "arXiv": score += 12; flags.append(f"priority venue: {venue}")
    elif venue == "arXiv": score += 2
    if priority_insts: score += 8; flags.append("priority institution")
    if watched: score += 12; flags.append("watched researcher: " + ", ".join(watched[:2]))
    evidence = sum(1 for x in ["counterfactual", "causal", "intervention", "failure", "benchmark", "faithfulness", "ablation", "patching", "steering"] if x in text.lower())
    if evidence: score += min(8, evidence * 2); flags.append("strong evidence/method signal")
    citations = int(w.get("cited_by_count") or 0)
    if citations: score += min(6, int(math.log10(citations + 1) * 3))
    score = min(100, score)

    method = infer_method(text)
    causal = "Yes" if any(x in text.lower() for x in ["causal", "intervention", "activation patch", "steering", "ablation", "model editing"]) else ""
    mechanism = "Yes / causal-mechanistic signal" if any(x in text.lower() for x in ["causal tracing", "activation patch", "ablation", "intervention", "circuit", "mechanistic interpretability"]) else ("Probe / representation evidence" if any(x in text.lower() for x in ["probe", "probing", "representation"]) else "")
    return {
        "id": (w.get("id") or "").rsplit("/", 1)[-1], "year": int(w.get("publication_year") or (pub[:4] if pub else 0) or 0),
        "published": pub, "primary_area": area, "related_areas": related, "title": title, "authors": authors,
        "watched_authors": watched, "institutions": insts, "priority_institutions": priority_insts,
        "venue": venue, "venue_tier": tier, "paper_type": paper_type(text), "task": task_for(area, text),
        "method": method, "model": infer_models(text), "dataset": infer_datasets(text), "metric": infer_metrics(text),
        "failure": infer_failure(text), "counterfactual": "Yes" if "counterfactual" in text.lower() else "",
        "mechanism": mechanism, "causal": causal, "main_claim": first_sent(abstract) or first_sent(title),
        "limitation": gap_signal(area, text) if not adjacent else "", "score": score, "citations": citations,
        "doi": doi, "url": url, "code_data": "", "source": "OpenAlex", "text": text, "flags": flags,
        "watch_researcher": forced_watch or (watched[0] if watched else ""),
    }


def prefer(new: dict[str, Any], old: dict[str, Any]) -> dict[str, Any]:
    # Prefer peer-reviewed venue over arXiv/unknown, then richer metadata, then citations.
    def q(i):
        reviewed = int(bool(i.get("venue_tier")) and i.get("venue") != "arXiv")
        richness = sum(bool(i.get(k)) for k in ["method", "dataset", "metric", "mechanism", "causal", "doi"])
        return (reviewed, richness, int(i.get("citations") or 0))
    best = new if q(new) >= q(old) else old
    other = old if best is new else new
    for field in ["authors", "watched_authors", "institutions", "priority_institutions", "related_areas"]:
        vals = []
        for x in (best.get(field) or []) + (other.get(field) or []):
            if x not in vals: vals.append(x)
        best[field] = vals
    best["citations"] = max(int(new.get("citations") or 0), int(old.get("citations") or 0))
    return best


def merge_papers(existing: dict[str, dict[str, Any]], incoming: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    # Rebuild title/DOI indices every run so preprint/published versions collapse.
    by_title: dict[str, str] = {}
    by_doi: dict[str, str] = {}
    for k, i in existing.items():
        by_title[keytext(i.get("title", ""))] = k
        if i.get("doi"): by_doi[i["doi"]] = k
    for item in incoming:
        tk, doi = keytext(item["title"]), item.get("doi", "")
        k = by_doi.get(doi) if doi else None
        k = k or by_title.get(tk)
        if k and k in existing:
            existing[k] = prefer(item, existing[k])
        else:
            k = "doi:" + doi if doi else "title:" + tk
            if k in existing: k += ":" + item.get("id", "")
            existing[k] = item
            by_title[tk] = k
            if doi: by_doi[doi] = k
    return existing


def load_state() -> dict[str, Any]:
    if not STATE_FILE.exists():
        return {"version": 3, "papers": {}, "authors": {}, "last_run": ""}
    try:
        return json.loads(STATE_FILE.read_text(encoding="utf-8"))
    except Exception:
        return {"version": 3, "papers": {}, "authors": {}, "last_run": ""}


def save_state(state: dict[str, Any]):
    STATE_FILE.write_text(json.dumps(state, ensure_ascii=False), encoding="utf-8")


def collect_topics(full: bool) -> list[dict[str, Any]]:
    date_from = BACKFILL_FROM if full else RECENT_FROM
    pages = 2 if full else 1
    jobs = [(area, q) for area, cfg in AREAS.items() for q in cfg["queries"]]
    raw: list[dict[str, Any]] = []
    def worker(job):
        area, q = job
        return area, q, search_works(q, date_from, pages)
    with ThreadPoolExecutor(max_workers=4) as ex:
        futs = [ex.submit(worker, j) for j in jobs]
        for fut in as_completed(futs):
            try:
                area, q, works = fut.result()
                kept = 0
                for w in works:
                    item = build_item(w)
                    if item and item["primary_area"] in AREAS:
                        raw.append(item); kept += 1
                print(f"topic {area} | {q}: {kept}/{len(works)} kept")
            except Exception as e:
                print("topic query failed:", e)
    return raw


def collect_authors(state: dict[str, Any], full: bool) -> list[dict[str, Any]]:
    authors_state = state.setdefault("authors", {})
    # Resolve only missing identities; persist IDs in cache.
    missing = [(n, aff) for n, (aff, _) in WATCH_RESEARCHERS.items() if not (authors_state.get(n) or {}).get("id")]
    if missing:
        with ThreadPoolExecutor(max_workers=4) as ex:
            fmap = {ex.submit(resolve_author, n, aff): (n, aff) for n, aff in missing}
            for fut in as_completed(fmap):
                n, aff = fmap[fut]
                try:
                    a = fut.result()
                    if a:
                        authors_state[n] = {"id": a.get("id", ""), "display_name": a.get("display_name", n), "affiliation": aff, "category": WATCH_RESEARCHERS[n][1]}
                        print("resolved author:", n, a.get("id", ""))
                except Exception as e:
                    print("author resolve failed:", n, e)
    date_from = BACKFILL_FROM if full else RECENT_FROM
    jobs = [(n, m) for n, m in authors_state.items() if m.get("id")]
    raw: list[dict[str, Any]] = []
    def worker(job):
        n, m = job
        return n, author_works(m["id"], date_from, 1)
    with ThreadPoolExecutor(max_workers=4) as ex:
        fmap = {ex.submit(worker, j): j[0] for j in jobs}
        for fut in as_completed(fmap):
            n = fmap[fut]
            try:
                _, works = fut.result()
                kept = 0
                for w in works:
                    item = build_item(w, forced_watch=n)
                    if item:
                        raw.append(item); kept += 1
                print(f"author {n}: {kept}/{len(works)} kept")
            except Exception as e:
                print("author works failed:", n, e)
    return raw


def join(xs) -> str:
    return "; ".join(norm(x) for x in xs if norm(x))


def priority_label(score: int) -> str:
    return "A — Must Read" if score >= 85 else ("B — High" if score >= 72 else "C — Monitor")


def input_modality(text: str) -> str:
    low = text.lower(); out = []
    for k, v in [("flowchart", "Flowchart"), ("screenshot", "Screenshot"), ("diagram", "Diagram"), ("ui", "UI / Design"), ("gui", "GUI"), ("image", "Image"), ("vision", "Vision"), ("multimodal", "Multimodal")]:
        if k in low and v not in out: out.append(v)
    return "; ".join(out)


def master_row(i):
    return [i["id"], i["year"], i["published"], i["primary_area"], join(i["related_areas"]), i["title"], join(i["authors"]), join(i["watched_authors"]), join(i["institutions"]), join(i["priority_institutions"]), i["venue"], i["venue_tier"], i["paper_type"], i["task"], i["method"], i["model"], i["dataset"], i["metric"], i["failure"], i["counterfactual"], i["mechanism"], i["causal"], i["main_claim"], i["limitation"], why(i), i["score"], i["citations"], i["doi"], i["url"], i["code_data"], NOW_ISO, i["source"]]


def why(i):
    base = {
        "Multimodal Code Generation": "Directly relevant to visual grounding and multimodal code generation.",
        "Agentic Software Engineering": "Directly relevant to coding-agent capability, reliability, failure analysis, or intervention.",
        "Mechanistic Interpretability": "Relevant to representation → causal use → intervention analysis.",
        "Explainable AI": "Relevant to explanation faithfulness, robustness, concepts, or human-facing interpretability.",
        "Adjacent / Watch": "Watched-author adjacent work; inspect for transfer to tracked research directions.",
    }.get(i["primary_area"], "Relevant to tracked research.")
    if i["limitation"]: base += " Gap: " + i["limitation"]
    return base


def new_row(i):
    return [i["published"], i["year"], i["primary_area"], i["title"], join(i["authors"]), join(i["priority_institutions"]), i["venue"], i["venue_tier"], i["score"], ", ".join(i["flags"]) or why(i), i["method"] or i["paper_type"], i["limitation"], i["citations"], i["url"], i["code_data"]]


def mm_row(i):
    t=i["text"]; grounding="Explicit signal" if any(x in t.lower() for x in ["grounding","structure","topology","control flow","edge","layout"]) else "Not explicit"
    return [i["year"], i["title"], join(i["authors"]), join(i["institutions"]), i["venue"], input_modality(t), i["task"], i["model"], i["dataset"], i["metric"], grounding, i["counterfactual"], i["causal"], i["failure"], i["main_claim"], i["limitation"], why(i), priority_label(i["score"]), i["citations"], i["url"], i["code_data"]]


def ag_row(i):
    t=i["text"].lower(); cap=[]
    for k,v in [("planning","Planning"),("tool","Tool use"),("repository","Repository navigation"),("debug","Debugging"),("repair","Program repair"),("test","Testing"),("multi-agent","Multi-agent collaboration"),("memory","Memory")]:
        if k in t and v not in cap: cap.append(v)
    env=[]
    for k,v in [("repository","Repository"),("github","GitHub"),("terminal","Terminal"),("ide","IDE"),("browser","Browser")]:
        if k in t: env.append(v)
    fb=[]
    for k,v in [("unit test","Unit tests"),("execution","Execution feedback"),("compiler","Compiler feedback"),("human feedback","Human feedback")]:
        if k in t: fb.append(v)
    internal="Yes / internal representation signal" if any(x in t for x in ["activation","hidden state","attention","representation","probe","circuit"]) else ""
    return [i["year"],i["title"],join(i["authors"]),join(i["institutions"]),i["venue"],"; ".join(cap) or "Coding / software agent",i["task"],"; ".join(env),"; ".join(fb),i["failure"],"",internal,i["counterfactual"],i["mechanism"],i["causal"],i["metric"],i["dataset"],i["main_claim"],i["limitation"],why(i),priority_label(i["score"]),i["citations"],i["url"],i["code_data"]]


def mi_row(i):
    t=i["text"].lower(); targets=[]
    for k,v in [("attention head","Attention heads"),("mlp","MLP"),("residual stream","Residual stream"),("neuron","Neurons"),("sparse autoencoder","SAE features"),("feature","Features"),("activation","Activations"),("circuit","Circuits"),("layer","Layers")]:
        if k in t and v not in targets: targets.append(v)
    modality=[]
    if any(x in t for x in ["vision","image","multimodal","vlm"]): modality.append("Vision / Multimodal")
    if any(x in t for x in ["language model","llm","transformer","text"]): modality.append("Language / LLM")
    if any(x in t for x in ["code","program","software"]): modality.append("Code")
    probe="Yes" if any(x in t for x in ["probe","probing","linear classifier"]) else ""
    causal="Yes" if any(x in t for x in ["causal","activation patch","ablation"]) else ""
    interv="Yes" if any(x in t for x in ["steering","intervention","model editing","activation patch"]) else ""
    behavior="Yes / behavioral link signal" if any(x in t for x in ["behavior","performance","steering","task","prediction","generation"]) else ""
    return [i["year"],i["title"],join(i["authors"]),join(i["institutions"]),i["venue"],"; ".join(modality) or "ML model","; ".join(targets),i["method"],"; ".join(targets),probe,causal,interv,i["counterfactual"],i["mechanism"],behavior,i["main_claim"],i["limitation"],why(i),priority_label(i["score"]),i["citations"],i["url"],i["code_data"]]


def xai_row(i):
    t=i["text"].lower()
    etype="Counterfactual" if "counterfactual" in t else ("Concept-based" if any(x in t for x in ["tcav","concept-based","concept based"]) else ("Feature attribution" if any(x in t for x in ["shap","lime","feature attribution"]) else ("Saliency / gradient" if any(x in t for x in ["saliency","gradient"]) else "Model explanation / interpretability")))
    family="Counterfactual" if "counterfactual" in t else ("Concept-based" if "concept" in t else ("Attribution" if any(x in t for x in ["shap","lime","feature attribution"]) else "Post-hoc / analysis"))
    intrinsic="Intrinsic" if any(x in t for x in ["inherently interpretable","interpretable model","rule list"]) else "Post-hoc / analysis"
    modality="Vision / Multimodal" if any(x in t for x in ["vision","image","multimodal","vlm"]) else ("Language / LLM" if any(x in t for x in ["language model","llm","transformer"]) else "ML model")
    return [i["year"],i["title"],join(i["authors"]),join(i["institutions"]),i["venue"],modality,i["task"],etype,family,intrinsic,"", "Yes" if "faithful" in t else "", "Yes" if any(x in t for x in ["human evaluation","user study"]) else "", "Yes" if any(x in t for x in ["robust","stability"]) else "", i["counterfactual"],i["causal"],i["main_claim"],i["limitation"],why(i),priority_label(i["score"]),i["citations"],i["url"],i["code_data"]]


def author_row(i, state):
    r=i.get("watch_researcher") or (i["watched_authors"][0] if i["watched_authors"] else "")
    meta=(state.get("authors") or {}).get(r, {})
    co=[a for a in i["authors"] if keytext(a)!=keytext(r)]
    return [r,meta.get("affiliation",WATCH_RESEARCHERS.get(r,("",""))[0]),meta.get("category",WATCH_RESEARCHERS.get(r,("",""))[1]),i["year"],i["title"],join(co),i["venue"],i["venue_tier"],i["primary_area"],i["paper_type"],i["task"],i["method"],i["model"],i["dataset"],i["counterfactual"],i["mechanism"],i["causal"],i["main_claim"],i["limitation"],why(i),i["citations"],i["url"]]


def write_csv(name: str, rows):
    with (OUT / name).open("w", encoding="utf-8-sig", newline="") as f:
        csv.writer(f).writerows(rows)
    print("wrote", name, len(rows))


def balanced_recent(items: list[dict[str, Any]], limit: int = 15) -> list[dict[str, Any]]:
    recent = [i for i in items if i["primary_area"] in AREAS and i.get("published") and i["published"] >= RECENT_FROM and i["score"] >= 72]
    recent.sort(key=lambda i: (-i["score"], -(i["citations"] or 0), i["published"]), reverse=False)
    selected=[]; used=set()
    for area in AREAS:
        for i in [x for x in recent if x["primary_area"]==area][:3]:
            k=keytext(i["title"])
            if k not in used: selected.append(i); used.add(k)
    for i in recent:
        if len(selected)>=limit: break
        k=keytext(i["title"])
        if k not in used: selected.append(i); used.add(k)
    return selected[:limit]


def main():
    state=load_state()
    full = MODE == "full" or not state.get("papers") or state.get("version") != 3
    print("Research Radar mode:", "FULL BACKFILL" if full else "INCREMENTAL")
    if full:
        state={"version":3,"papers":{},"authors":{},"last_run":""}
    incoming=collect_topics(full)
    incoming.extend(collect_authors(state, full))
    state["papers"]=merge_papers(state.get("papers",{}), incoming)
    state["last_run"]=NOW_ISO
    state["version"]=3
    save_state(state)

    all_items=list(state["papers"].values())
    domain=[i for i in all_items if i.get("primary_area") in AREAS]
    # Quality purge on every run: old cached items must still satisfy v3 gates.
    clean=[]
    for i in domain:
        a, rel, _=classify(i.get("text",i.get("title","")))
        if a:
            i["primary_area"]=a; i["related_areas"]=rel; clean.append(i)
    domain=clean
    domain.sort(key=lambda i:(i.get("published") or "9999-99-99", i["title"].lower()))
    recent=balanced_recent(domain)
    author_items=[i for i in all_items if i.get("watch_researcher") or i.get("watched_authors")]
    author_items.sort(key=lambda i:(keytext(i.get("watch_researcher","")),i.get("published") or "",i["title"].lower()))

    write_csv("all_papers_master.csv", [master_row(i) for i in domain])
    write_csv("new_high_priority.csv", [new_row(i) for i in recent])
    write_csv("multimodal_code_gen.csv", [mm_row(i) for i in domain if i["primary_area"]=="Multimodal Code Generation"])
    write_csv("agentic_se.csv", [ag_row(i) for i in domain if i["primary_area"]=="Agentic Software Engineering"])
    write_csv("mechanistic_interpretability.csv", [mi_row(i) for i in domain if i["primary_area"]=="Mechanistic Interpretability"])
    write_csv("explainable_ai.csv", [xai_row(i) for i in domain if i["primary_area"]=="Explainable AI"])
    write_csv("author_papers.csv", [author_row(i,state) for i in author_items])

    counts={a:sum(1 for i in recent if i["primary_area"]==a) for a in AREAS}
    payload={
        "generated_at":NOW_ISO,"window_days":RECENT_DAYS,
        "items":[{"date":i["published"],"area":i["primary_area"],"title":i["title"],"authors":i["authors"][:6],"institutions":i["institutions"][:5],"venue":i["venue"],"score":i["score"],"citations":i["citations"],"why":", ".join(i["flags"]) or why(i),"url":i["url"]} for i in recent],
        "counts":counts,"watch":{"researchers":len(WATCH_RESEARCHERS),"institutions":WATCH_INSTITUTIONS,"venues":sorted(WATCH_VENUES)},
        "corpus":{"domain_papers":len(domain),"author_watch_papers":len(author_items),"mode":"full" if full else "incremental"},
    }
    (PUBLIC/"research-radar.json").write_text(json.dumps(payload,ensure_ascii=False,indent=2),encoding="utf-8")
    (OUT/"run_status.json").write_text(json.dumps({"generated_at":NOW_ISO,"mode":"full" if full else "incremental","domain_papers":len(domain),"recent":len(recent),"authors_resolved":len(state.get("authors",{}))},indent=2),encoding="utf-8")
    print(json.dumps(payload["corpus"],indent=2))

if __name__ == "__main__":
    main()
