export const SITE_CONFIG = {
  name: 'Govind Kumar Soni',
  shortName: 'GS',
  title: 'PhD Researcher · Multimodal Code Generation · NLP',
  institution: 'IIT Bombay',
  department: 'Computer Science & Engineering',
  email: 'govindksoni17@gmail.com',
  linkedin: 'https://www.linkedin.com/in/sonigovind07',
  github: 'https://github.com/sonigovind',
  scholar: 'https://scholar.google.com/citations?user=REPLACE_WITH_YOUR_ID',
  description:
    'PhD Research Scholar at IIT Bombay working on Multimodal Code Generation, Neural Machine Translation, NLP for low-resource languages, and Transformer architectures.',
  keywords:
    'Govind Kumar Soni, IIT Bombay, NLP, Multimodal Code Generation, Neural Machine Translation, Low-resource NLP, Hindi Chinese NMT, Named Entity Recognition, BERT, Transformer, PhD researcher',
  lastUpdated: 'May 2026',
};

export const STATS = [
  { label: 'Publications', value: 3, decimals: 0, suffix: '' },
  { label: 'Projects', value: 4, decimals: 0, suffix: '+' },
  { label: 'PhD CPI', value: 8.33, decimals: 2, suffix: '' },
  { label: 'Years Research', value: 3, decimals: 0, suffix: '+' },
];

export const RESEARCH_INTERESTS = [
  'Multimodal Code Generation',
  'NLP',
  'Neural Machine Translation',
  'Transformers',
  'Low-Resource Languages',
  'Named Entity Recognition',
  'Deep Learning',
  'Code LLMs',
];

export const BIO = [
  'I am a PhD research scholar at <strong>IIT Bombay</strong>, currently working on <strong>Multimodal Code Generation</strong> — building AI systems that combine visual, textual, and structured inputs to generate code. I was formerly a Research Assistant at the <strong>CFILT Lab, IIT Bombay</strong>.',
  'My earlier research focused on neural machine translation for low-resource language pairs like Hindi–Chinese, applying romanization and data augmentation to bridge the gap where parallel data is scarce.',
  'My work has been published at ICON 2024 and Springer, and I contributed to national multilingual AI initiatives under Bhashini/MeitY.',
];

export type SkillCategory = {
  label: string;
  skills: string[];
};

export const SKILLS: SkillCategory[] = [
  {
    label: 'Machine Learning & NLP',
    skills: [
      'NLP',
      'Machine Learning',
      'Deep Learning',
      'BERT',
      'GPT',
      'LLaMA',
      'SFT',
      'LoRA',
      'XAI',
      'Transfer Learning',
    ],
  },
  {
    label: 'Tools & Frameworks',
    skills: ['PyTorch', 'TensorFlow', 'HuggingFace', 'NumPy', 'Anaconda'],
  },
  {
    label: 'Platforms & Infrastructure',
    skills: ['HPC Clusters (Slurm)', 'Docker', 'Python', 'MySQL', 'LaTeX'],
  },
];

export type ResearchArea = {
  id: string;
  title: string;
  status?: 'Current' | 'Active' | 'Past';
  description: string;
  tags: string[];
  iconKey: string;
};

export const RESEARCH_AREAS: ResearchArea[] = [
  {
    id: 'multimodal-code',
    title: 'Multimodal Code Generation',
    status: 'Current',
    description:
      'Building AI systems that generate code from multiple input modalities — combining natural language, visual diagrams, and structured specifications to automate software development.',
    tags: ['Code LLMs', 'Vision-Language', 'Program Synthesis'],
    iconKey: 'code',
  },
  {
    id: 'nmt',
    title: 'Neural Machine Translation',
    description:
      'Built encoder-decoder NMT systems for low-resource language pairs (Hindi–Chinese). Applied romanization (Romantra) to improve translation quality where parallel data is scarce.',
    tags: ['Hi-Zh NMT', 'Romanization', 'Back-Translation'],
    iconKey: 'translate',
  },
  {
    id: 'ner',
    title: 'Named Entity Recognition',
    description:
      'Developed BioBERT-based NER models for biomedical entity extraction from COVID-19 corpora — identifying medical terms, symptoms, and treatments from clinical text.',
    tags: ['BioBERT', 'Biomedical NLP', 'COVID-19'],
    iconKey: 'entity',
  },
  {
    id: 'sentiment',
    title: 'Sarcasm & Sentiment Detection',
    description:
      'Designed hybrid sarcasm detection combining rule-based, ML, and deep learning. Fine-tuned RoBERTa and fused contextual embeddings with LSTM for nuanced classification.',
    tags: ['RoBERTa', 'LSTM', 'Sentiment'],
    iconKey: 'sentiment',
  },
  {
    id: 'transformers',
    title: 'Transformer Architectures',
    description:
      'Working across BERT, GPT, and LLaMA variants with experience in fine-tuning (SFT, LoRA), parameter-efficient adaptation, and explainability (XAI) techniques.',
    tags: ['BERT / GPT', 'LoRA', 'XAI'],
    iconKey: 'transformer',
  },
  {
    id: 'bhashini',
    title: 'Multilingual AI (Bhashini)',
    description:
      "Contributed to Ishaan and Vidyaapati multilingual AI projects under MeitY's Bhashini initiative — bringing AI capabilities to Indic languages at national scale.",
    tags: ['Bhashini', 'MeitY', 'Indic NLP'],
    iconKey: 'multilingual',
  },
];

export type Publication = {
  id: string;
  type: 'Conference' | 'Book Chapter' | 'Book';
  featured?: boolean;
  title: string;
  authors: string;
  venue: string;
  year: number;
  doi?: string;
  doiUrl?: string;
  bibtex: string;
  tags: string[];
};

export const PUBLICATIONS: Publication[] = [
  {
    id: 'romantra-2024',
    type: 'Conference',
    featured: true,
    title:
      'Romantra: Optimizing Neural Machine Translation for Low-Resource Languages through Romanization',
    authors: 'G. Soni and P. Bhattacharyya',
    venue:
      'Proceedings of the 21st International Conference on Natural Language Processing (ICON) · AU-KBC Research Centre, Chennai · NLP Association of India · pp. 157–168',
    year: 2024,
    bibtex: `@inproceedings{soni2024romantra,
  title     = {Romantra: Optimizing neural machine translation for
               low-resource languages through romanization},
  author    = {Soni, Govind and Bhattacharyya, Pushpak},
  booktitle = {Proceedings of the 21st International Conference on
               Natural Language Processing (ICON)},
  pages     = {157--168},
  year      = {2024},
  publisher = {NLP Association of India (NLPAI)},
  address   = {AU-KBC Research Centre, Chennai, India}
}`,
    tags: ['NMT', 'Low-Resource NLP', 'Romanization'],
  },
  {
    id: 'biobert-2023',
    type: 'Book Chapter',
    title: 'BioBERT-Based Model for COVID-Related Named Entity Recognition',
    authors: 'G. Soni',
    venue:
      'Advances in IoT and Security with Computational Intelligence · Springer · pp. 333–346',
    year: 2023,
    doi: '10.1007/978-981-99-5085-0_32',
    doiUrl: 'https://doi.org/10.1007/978-981-99-5085-0_32',
    bibtex: `@incollection{soni2023biobert,
  title     = {BioBERT-Based Model for COVID-Related Named Entity Recognition},
  author    = {Soni, Govind},
  booktitle = {Advances in IoT and Security with Computational Intelligence},
  pages     = {333--346},
  year      = {2023},
  publisher = {Springer},
  doi       = {10.1007/978-981-99-5085-0_32}
}`,
    tags: ['BioBERT', 'NER', 'COVID-19'],
  },
  {
    id: 'deeplearning-2024',
    type: 'Book',
    title:
      'Deep Learning for Extracting Biomedical Entities from COVID-19 Dataset: A Case Study',
    authors: 'G. Soni',
    venue: 'Springer · September 2024',
    year: 2024,
    bibtex: `@book{soni2024deeplearning,
  title     = {Deep Learning for Extracting Biomedical Entities
               from COVID-19 Dataset: A Case Study},
  author    = {Soni, Govind},
  publisher = {Springer},
  year      = {2024},
  month     = {September}
}`,
    tags: ['Deep Learning', 'NER', 'Biomedical'],
  },
];

export type TimelineItem = {
  title: string;
  org: string;
  period: string;
  meta?: string;
  description?: string;
  bullets?: string[];
};

export const EXPERIENCE: TimelineItem[] = [
  {
    title: 'Research Assistant',
    org: 'CFILT Lab, IIT Bombay',
    period: 'Jul 2023 – May 2025',
    meta: 'Former',
    bullets: [
      'Built and trained Transformer-based NMT models',
      'Applied back-translation and data augmentation',
      'Curated and preprocessed parallel/monolingual corpora',
      'Evaluated performance using BLEU and standard metrics',
      'Contributed to Ishaan & Vidyaapati (Bhashini / MeitY)',
    ],
  },
  {
    title: 'Project SRF',
    org: 'IIT (ISM) Dhanbad',
    period: 'Oct 2022 – Jan 2023',
    description:
      'Auto-Evaluation of Tenders using AI/ML — OCR extraction from scanned documents and AI-based evaluation framework.',
  },
  {
    title: 'Content Writer',
    org: 'GATE Coaching',
    period: 'Jul 2020 – Dec 2020',
    description: 'Created technical content for competitive engineering examinations.',
  },
];

export const EDUCATION: TimelineItem[] = [
  {
    title: 'PhD, Computer Science',
    org: 'Indian Institute of Technology (IIT) Bombay',
    period: '2023 – Present',
    description:
      'CPI: 8.33 · Research in Multimodal Code Generation and NLP for low-resource languages.',
  },
  {
    title: 'M.Tech, Statistical Computing (Data Science)',
    org: 'Jawaharlal Nehru University, Delhi',
    period: '2020 – 2022',
    description:
      'Aggregate: 87.40% · Thesis: Deep Learning for COVID-Related Named Entity Recognition.',
  },
  {
    title: 'B.Tech, Computer Science Engineering',
    org: 'Rajasthan Technical University',
    period: '',
    description: 'Foundation in algorithms, software engineering, and computer systems.',
  },
  {
    title: 'National Examinations',
    org: 'GATE & UGC NET',
    period: 'Qualifications',
    description: 'GATE Qualified (2020, 2021, 2024) · UGC NET Qualified (2023)',
  },
];

export type CommandItem = {
  id: string;
  label: string;
  description?: string;
  group: string;
  href: string;
  external?: boolean;
};

export const COMMAND_ITEMS: CommandItem[] = [
  { id: 'nav-about', label: 'About', description: 'Who I am and my research focus', group: 'Navigate', href: '#about' },
  { id: 'nav-research', label: 'Research Areas', description: 'My active research directions', group: 'Navigate', href: '#research' },
  { id: 'nav-pubs', label: 'Publications', description: 'Papers, books, and book chapters', group: 'Navigate', href: '#publications' },
  { id: 'nav-exp', label: 'Experience & Education', description: 'Career and academic journey', group: 'Navigate', href: '#experience' },
  { id: 'nav-contact', label: 'Contact', description: 'Get in touch', group: 'Navigate', href: '#contact' },
  { id: 'pub-romantra', label: 'Romantra: Optimizing NMT...', description: 'ICON 2024 · Conference Paper', group: 'Publications', href: '#publications' },
  { id: 'pub-biobert', label: 'BioBERT-Based NER Model', description: 'Springer 2023 · Book Chapter', group: 'Publications', href: '#publications' },
  { id: 'pub-dl', label: 'Deep Learning for Biomedical NER', description: 'Springer 2024 · Book', group: 'Publications', href: '#publications' },
  { id: 'link-email', label: 'Send Email', description: 'govindksoni17@gmail.com', group: 'Links', href: 'mailto:govindksoni17@gmail.com', external: true },
  { id: 'link-linkedin', label: 'LinkedIn', description: 'linkedin.com/in/sonigovind07', group: 'Links', href: 'https://www.linkedin.com/in/sonigovind07', external: true },
  { id: 'link-github', label: 'GitHub', description: 'github.com/sonigovind', group: 'Links', href: 'https://github.com/sonigovind', external: true },
];
