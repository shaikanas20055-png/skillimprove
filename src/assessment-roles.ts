export type RoleCategory =
  | "Software Development"
  | "Data and AI"
  | "Cloud, Security and Testing"
  | "Other Technical Roles";

export type QuestionType =
  | "fill-in-the-blank"
  | "multiple-choice"
  | "code-output"
  | "debugging"
  | "scenario";

export type DifficultyLevel = "Medium" | "Advanced" | "Mixed";

export interface AssessmentQuestion {
  id: string;
  roleId: string;
  topic: string;
  type: QuestionType;
  difficulty: "Medium" | "Advanced";
  prompt: string;
  codeSnippet?: string;
  options?: string[]; // For multiple choice
  acceptedAnswers: string[]; // For fill in the blank / code output / debugging
  explanation: string;
  marks: number;
  sourceMetadata?: {
    sourceTitle: string;
    sourceUrl?: string;
    verified: boolean;
  };
}

export interface JobRoleAssessmentConfig {
  id: string;
  title: string;
  category: RoleCategory;
  icon: string;
  badgeTone: "blue" | "purple" | "green" | "orange";
  description: string;
  technologies: string[];
  keyTopics: string[];
  defaultQuestionCount: number; // 30
  maxQuestionCount: number; // 40
  durationMinutes: number; // exactly 10 minutes
}

export const SUPPORTED_JOB_ROLES: JobRoleAssessmentConfig[] = [
  // 1. Software Development (10 roles)
  {
    id: "frontend-developer",
    title: "Frontend Developer",
    category: "Software Development",
    icon: "🌐",
    badgeTone: "purple",
    description: "HTML5, CSS3, Modern JavaScript/TypeScript, React 19, DOM, State Management, Core Web Vitals, Responsive Design & Performance.",
    technologies: ["React", "TypeScript", "JavaScript", "HTML/CSS", "Next.js", "Redux", "Tailwind CSS"],
    keyTopics: ["React Hooks", "DOM Manipulation", "CSS Grid & Flexbox", "Async/Await", "Web Performance", "Browser Storage"],
    defaultQuestionCount: 30,
    maxQuestionCount: 40,
    durationMinutes: 10,
  },
  {
    id: "backend-developer",
    title: "Backend Developer",
    category: "Software Development",
    icon: "⚙️",
    badgeTone: "blue",
    description: "REST & GraphQL APIs, Node.js, Python, Java, SQL/NoSQL, Authentication (JWT/OAuth), Caching, Microservices & Concurrency.",
    technologies: ["Node.js", "Python", "Java", "PostgreSQL", "Redis", "Docker", "Express", "Spring Boot"],
    keyTopics: ["API Design", "Database Transactions", "Authentication & JWT", "Redis Caching", "Rate Limiting", "Error Handling"],
    defaultQuestionCount: 30,
    maxQuestionCount: 40,
    durationMinutes: 10,
  },
  {
    id: "full-stack-developer",
    title: "Full Stack Developer",
    category: "Software Development",
    icon: "⚡",
    badgeTone: "purple",
    description: "End-to-end web engineering: UI architecture, backend microservices, database schemas, CI/CD, Git workflows & system integration.",
    technologies: ["React", "Node.js", "TypeScript", "PostgreSQL", "Docker", "AWS", "Git", "REST APIs"],
    keyTopics: ["Client-Server Architecture", "Full-Stack Authentication", "State Management", "SQL Queries", "API Contracts", "Deployment"],
    defaultQuestionCount: 30,
    maxQuestionCount: 40,
    durationMinutes: 10,
  },
  {
    id: "software-engineer",
    title: "Software Engineer",
    category: "Software Development",
    icon: "💻",
    badgeTone: "blue",
    description: "Data Structures & Algorithms, OOP principles, System Design, Big-O Complexity, Operating Systems, Memory Management & Multithreading.",
    technologies: ["Data Structures", "Algorithms", "C++", "Java", "Python", "Design Patterns", "OS Concepts"],
    keyTopics: ["Trees & Graphs", "Dynamic Programming", "Time Complexity", "Polymorphism", "Deadlocks & Concurrency", "Memory Pointers"],
    defaultQuestionCount: 30,
    maxQuestionCount: 40,
    durationMinutes: 10,
  },
  {
    id: "java-developer",
    title: "Java Developer",
    category: "Software Development",
    icon: "☕",
    badgeTone: "orange",
    description: "Core Java 17+, JVM Internals, Garbage Collection, Spring Boot, Spring Security, Hibernate/JPA, Stream API & Multithreading.",
    technologies: ["Java 17+", "Spring Boot", "JPA/Hibernate", "Maven/Gradle", "JVM", "JUnit 5", "SQL"],
    keyTopics: ["Collections Framework", "Streams & Lambdas", "JVM Memory Model", "Spring Dependency Injection", "Annotations", "Thread Safety"],
    defaultQuestionCount: 30,
    maxQuestionCount: 40,
    durationMinutes: 10,
  },
  {
    id: "python-developer",
    title: "Python Developer",
    category: "Software Development",
    icon: "🐍",
    badgeTone: "green",
    description: "Python 3.12 syntax, Asyncio, Decorators, Generators, FastAPI, Django, Pydantic, Metaclasses & High-Performance Data Processing.",
    technologies: ["Python 3", "FastAPI", "Django", "Pydantic", "Pytest", "Asyncio", "SQLAlchemy"],
    keyTopics: ["Decorators & Generators", "List Comprehensions", "GIL & Multiprocessing", "Async/Await", "Dunder Methods", "Virtual Environments"],
    defaultQuestionCount: 30,
    maxQuestionCount: 40,
    durationMinutes: 10,
  },
  {
    id: "cpp-developer",
    title: "C++ Developer",
    category: "Software Development",
    icon: "🚀",
    badgeTone: "blue",
    description: "Modern C++ (C++17/20), Smart Pointers, RAII, STL Containers, Templates, Memory Alignment, Move Semantics & Low-Latency Systems.",
    technologies: ["C++20", "STL", "CMake", "GDB", "Valgrind", "Memory Management", "Multithreading"],
    keyTopics: ["Unique & Shared Pointers", "Move Semantics & Rvalues", "Virtual Functions & Vtables", "Template Metaprogramming", "RAII", "Pointers vs References"],
    defaultQuestionCount: 30,
    maxQuestionCount: 40,
    durationMinutes: 10,
  },
  {
    id: "javascript-typescript-developer",
    title: "JavaScript / TypeScript Developer",
    category: "Software Development",
    icon: "📜",
    badgeTone: "orange",
    description: "ECMAScript 2024, Event Loop, Closures, Prototypal Inheritance, TypeScript Generics, Utility Types, Decorators & TSConfig optimization.",
    technologies: ["TypeScript 5", "JavaScript ESNext", "Node.js", "Vite", "ESLint", "Promise/Async", "Zod"],
    keyTopics: ["Event Loop & Microtasks", "Closures & Scopes", "TypeScript Generics", "Type Narrowing", "Prototypes", "Utility Types (Pick, Omit, Partial)"],
    defaultQuestionCount: 30,
    maxQuestionCount: 40,
    durationMinutes: 10,
  },
  {
    id: "android-developer",
    title: "Android Developer",
    category: "Software Development",
    icon: "🤖",
    badgeTone: "green",
    description: "Kotlin, Jetpack Compose, Activity/Fragment Lifecycle, Coroutines, StateFlow, Room DB, Retrofit, MVVM Architecture & Material Design 3.",
    technologies: ["Kotlin", "Jetpack Compose", "Coroutines", "Room DB", "Retrofit", "Hilt/Dagger", "Android SDK"],
    keyTopics: ["Compose State & Recomposition", "Lifecycle Observers", "Coroutines & Dispatchers", "Intent & Bundles", "Room Entities & DAOs", "Dependency Injection"],
    defaultQuestionCount: 30,
    maxQuestionCount: 40,
    durationMinutes: 10,
  },
  {
    id: "mobile-app-developer",
    title: "Mobile App Developer",
    category: "Software Development",
    icon: "📱",
    badgeTone: "purple",
    description: "Cross-platform mobile engineering with React Native, Flutter, Native Bridge, Offline Persistence, Push Notifications & App Store Deployments.",
    technologies: ["React Native", "Flutter", "Dart", "TypeScript", "Redux/Bloc", "SQLite", "Firebase"],
    keyTopics: ["Navigation Stacks", "Native Bridges", "Async Storage / Hive", "State Management", "Animations", "App Performance"],
    defaultQuestionCount: 30,
    maxQuestionCount: 40,
    durationMinutes: 10,
  },

  // 2. Data and AI (7 roles)
  {
    id: "data-analyst",
    title: "Data Analyst",
    category: "Data and AI",
    icon: "📊",
    badgeTone: "blue",
    description: "SQL Data Modeling, Advanced Aggregations, Joins, Window Functions, Python (Pandas/NumPy), Data Cleaning, Power BI, Tableau & KPI Reporting.",
    technologies: ["SQL", "PostgreSQL", "Excel", "Power BI", "Tableau", "Python (Pandas)", "Statistics"],
    keyTopics: ["Window Functions (RANK, ROW_NUMBER)", "GROUP BY & HAVING", "Data Cleansing", "Correlation vs Causation", "Cohort Analysis", "Data Visualization"],
    defaultQuestionCount: 30,
    maxQuestionCount: 40,
    durationMinutes: 10,
  },
  {
    id: "data-scientist",
    title: "Data Scientist",
    category: "Data and AI",
    icon: "🔬",
    badgeTone: "purple",
    description: "Applied Statistics, Hypothesis Testing, Machine Learning Modeling, Feature Engineering, Scikit-Learn, Regression, Classification & Model Evaluation.",
    technologies: ["Python", "Scikit-Learn", "Pandas", "NumPy", "Matplotlib", "Seaborn", "Statsmodels", "SQL"],
    keyTopics: ["P-values & Confidence Intervals", "ROC-AUC & F1-Score", "Regularization (L1/L2)", "Cross Validation", "PCA & Dimensionality Reduction", "Feature Scaling"],
    defaultQuestionCount: 30,
    maxQuestionCount: 40,
    durationMinutes: 10,
  },
  {
    id: "data-engineer",
    title: "Data Engineer",
    category: "Data and AI",
    icon: "🏗️",
    badgeTone: "orange",
    description: "ETL / ELT Pipelines, Apache Spark, Airflow, Data Warehousing (Snowflake, BigQuery), Data Lakes, Kafka Streaming & Schema Optimization.",
    technologies: ["Apache Spark", "Apache Airflow", "SQL", "Python", "Kafka", "PostgreSQL", "Snowflake", "Docker"],
    keyTopics: ["DAG Orchestration", "Partitioning & Sharding", "Spark RDDs & DataFrames", "Data Normalization (3NF vs Star)", "Kafka Consumer Groups", "Data Idempotency"],
    defaultQuestionCount: 30,
    maxQuestionCount: 40,
    durationMinutes: 10,
  },
  {
    id: "machine-learning-engineer",
    title: "Machine Learning Engineer",
    category: "Data and AI",
    icon: "🧠",
    badgeTone: "green",
    description: "Supervised/Unsupervised Learning, Neural Networks, PyTorch, TensorFlow, Loss Functions, Gradient Descent, Model Optimization & Quantization.",
    technologies: ["PyTorch", "TensorFlow", "Scikit-Learn", "NumPy", "MLflow", "CUDA", "FastAPI"],
    keyTopics: ["Backpropagation & Gradient Descent", "Activation Functions (ReLU, Softmax)", "Overfitting & Dropout", "Hyperparameter Tuning", "Loss Functions", "Model Quantization"],
    defaultQuestionCount: 30,
    maxQuestionCount: 40,
    durationMinutes: 10,
  },
  {
    id: "ai-engineer",
    title: "AI Engineer",
    category: "Data and AI",
    icon: "🤖",
    badgeTone: "purple",
    description: "Applied Deep Learning, Computer Vision, NLP, Transformers, Model Serving, ONNX, Inference Optimization & Production AI Pipelines.",
    technologies: ["Python", "PyTorch", "Transformers", "OpenCV", "HuggingFace", "Triton Server", "Docker"],
    keyTopics: ["Self-Attention Mechanism", "Embeddings & Vector Spaces", "Transfer Learning", "Inference Latency", "Batch Normalization", "Tokenizer Algorithms"],
    defaultQuestionCount: 30,
    maxQuestionCount: 40,
    durationMinutes: 10,
  },
  {
    id: "generative-ai-llm-engineer",
    title: "Generative AI / LLM Engineer",
    category: "Data and AI",
    icon: "✨",
    badgeTone: "purple",
    description: "Large Language Models, RAG Architecture, Vector DBs (Pinecone/Chroma), Prompt Engineering, Fine-Tuning (LoRA/QLoRA), LangChain & Embeddings.",
    technologies: ["LangChain", "LlamaIndex", "HuggingFace", "OpenAI/Gemini APIs", "Vector DBs", "LoRA", "Python"],
    keyTopics: ["Retrieval-Augmented Generation (RAG)", "Cosine Similarity & Vector Search", "LoRA & Parameter-Efficient Tuning", "Context Window Management", "Hallucination Mitigation", "Temperature & Top-P"],
    defaultQuestionCount: 30,
    maxQuestionCount: 40,
    durationMinutes: 10,
  },
  {
    id: "power-bi-developer",
    title: "Power BI Developer",
    category: "Data and AI",
    icon: "📈",
    badgeTone: "orange",
    description: "Power Query M Language, DAX Formulas, Calculated Columns vs Measures, Star Schema Data Modeling, RLS, Incremental Refresh & Executive Dashboards.",
    technologies: ["Power BI", "DAX", "Power Query (M)", "SQL", "Excel", "Data Modeling", "Azure"],
    keyTopics: ["DAX CALCULATE & FILTER", "Row Context vs Filter Context", "Star Schema vs Snowflake", "Row-Level Security (RLS)", "Date Dimensions", "Performance Analyzer"],
    defaultQuestionCount: 30,
    maxQuestionCount: 40,
    durationMinutes: 10,
  },

  // 3. Cloud, Security and Testing (7 roles)
  {
    id: "devops-engineer",
    title: "DevOps Engineer",
    category: "Cloud, Security and Testing",
    icon: "♾️",
    badgeTone: "blue",
    description: "CI/CD Pipelines (GitHub Actions/GitLab), Docker, Kubernetes, Linux SysAdmin, Terraform, Ansible, Monitoring (Prometheus/Grafana) & GitOps.",
    technologies: ["Docker", "Kubernetes", "Linux", "Terraform", "GitHub Actions", "Prometheus", "GitOps", "Bash"],
    keyTopics: ["Kubernetes Pods & Services", "Dockerfile Best Practices", "CI/CD Pipeline Stages", "Infrastructure as Code (IaC)", "Linux Permissions & Bash", "Log Aggregation"],
    defaultQuestionCount: 30,
    maxQuestionCount: 40,
    durationMinutes: 10,
  },
  {
    id: "cloud-engineer",
    title: "Cloud Engineer",
    category: "Cloud, Security and Testing",
    icon: "☁️",
    badgeTone: "blue",
    description: "AWS / Azure / GCP Cloud Architecture, IAM Policies, VPC & Subnets, Serverless (Lambda), S3 Object Storage, Load Balancers & Cloud Security.",
    technologies: ["AWS", "Azure", "Terraform", "CloudFormation", "IAM", "VPC", "Serverless", "S3"],
    keyTopics: ["VPC CIDR & Security Groups", "IAM Roles vs Policies", "S3 Storage Classes & Encryption", "Auto Scaling & Load Balancing", "Lambda Triggers", "High Availability (Multi-AZ)"],
    defaultQuestionCount: 30,
    maxQuestionCount: 40,
    durationMinutes: 10,
  },
  {
    id: "cybersecurity-analyst",
    title: "Cybersecurity Analyst",
    category: "Cloud, Security and Testing",
    icon: "🛡️",
    badgeTone: "green",
    description: "Network Security, OWASP Top 10, Encryption (AES/RSA/TLS), Penetration Testing, SIEM Log Analysis, Access Control (RBAC/MFA) & Threat Intelligence.",
    technologies: ["Wireshark", "Nmap", "Linux", "SIEM (Splunk)", "Cryptography", "OWASP", "Firewalls"],
    keyTopics: ["SQL Injection & XSS Mitigation", "Public vs Private Key Cryptography", "Firewall Rules & Port Scanning", "TLS Handshake", "Zero Trust Architecture", "Incident Response Phases"],
    defaultQuestionCount: 30,
    maxQuestionCount: 40,
    durationMinutes: 10,
  },
  {
    id: "network-engineer",
    title: "Network Engineer",
    category: "Cloud, Security and Testing",
    icon: "🌐",
    badgeTone: "blue",
    description: "OSI & TCP/IP Model, Subnetting (IPv4/IPv6), Routing Protocols (BGP/OSPF), VLANs, DNS, DHCP, NAT, Packet Analysis & Network Troubleshooting.",
    technologies: ["Cisco IOS", "Wireshark", "TCP/IP", "BGP", "OSPF", "VLANs", "Subnetting", "DNS/DHCP"],
    keyTopics: ["OSI 7 Layers & Protocol Mapping", "CIDR Subnet Mask Calculation", "TCP 3-Way Handshake", "VLAN Trunking (802.1Q)", "NAT & Port Forwarding", "DNS Record Types (A, CNAME, MX)"],
    defaultQuestionCount: 30,
    maxQuestionCount: 40,
    durationMinutes: 10,
  },
  {
    id: "database-administrator",
    title: "Database Administrator",
    category: "Cloud, Security and Testing",
    icon: "🗄️",
    badgeTone: "orange",
    description: "RDBMS (PostgreSQL/MySQL/Oracle), Query Indexing (B-Tree/Hash), ACID Properties, Replication, Backup & Recovery, Sharding & Lock Contention.",
    technologies: ["PostgreSQL", "MySQL", "SQL", "Indexing", "Replication", "Database Tuning", "Backup/Restore"],
    keyTopics: ["B-Tree Index Mechanism", "ACID Transaction Isolation Levels", "EXPLAIN ANALYZE Query Plans", "Deadlock Detection", "Master-Replica Replication", "Point-in-Time Recovery (PITR)"],
    defaultQuestionCount: 30,
    maxQuestionCount: 40,
    durationMinutes: 10,
  },
  {
    id: "qa-engineer",
    title: "QA Engineer",
    category: "Cloud, Security and Testing",
    icon: "🧪",
    badgeTone: "green",
    description: "Software Testing Lifecycle (STLC), Black-Box Testing, Equivalence Partitioning, Boundary Value Analysis, Bug Reporting, Postman API Testing & Test Plans.",
    technologies: ["Manual Testing", "Postman", "Jira", "TestRail", "SQL", "API Testing", "STLC"],
    keyTopics: ["Boundary Value Analysis", "Equivalence Class Partitioning", "Defect Severity vs Priority", "REST API Status Code Testing", "Regression vs Retesting", "Smoke vs Sanity Testing"],
    defaultQuestionCount: 30,
    maxQuestionCount: 40,
    durationMinutes: 10,
  },
  {
    id: "automation-test-engineer",
    title: "Automation Test Engineer",
    category: "Cloud, Security and Testing",
    icon: "🤖",
    badgeTone: "green",
    description: "Automated End-to-End Testing, Selenium WebDriver, Playwright, Cypress, Page Object Model (POM), TestNG/JUnit, CI Integration & Test Assertions.",
    technologies: ["Selenium", "Playwright", "Cypress", "Java/Python/TS", "TestNG", "Git", "Jenkins"],
    keyTopics: ["Page Object Model (POM)", "Explicit vs Implicit Waits", "XPath & CSS Locators", "Data-Driven Testing", "Headless Browser Execution", "Parallel Test Execution"],
    defaultQuestionCount: 30,
    maxQuestionCount: 40,
    durationMinutes: 10,
  },

  // 4. Other Technical Roles (5 roles)
  {
    id: "ui-ux-designer",
    title: "UI/UX Designer",
    category: "Other Technical Roles",
    icon: "🎨",
    badgeTone: "purple",
    description: "User Research, Wireframing, Figma Prototyping, Design Systems, Information Architecture, Usability Testing, Heuristic Evaluation & Accessibility (WCAG).",
    technologies: ["Figma", "Design Systems", "Prototyping", "WCAG 2.1", "User Research", "Wireframing", "UI Components"],
    keyTopics: ["Design System Component Tokens", "WCAG Color Contrast Ratios", "Usability Heuristics (Nielsen)", "Information Architecture", "Micro-Interactions", "Responsive Breakpoints"],
    defaultQuestionCount: 30,
    maxQuestionCount: 40,
    durationMinutes: 10,
  },
  {
    id: "business-analyst",
    title: "Business Analyst",
    category: "Other Technical Roles",
    icon: "📋",
    badgeTone: "blue",
    description: "BRD / FRD Documentation, User Stories, Acceptance Criteria (Given-When-Then), BPMN Process Modeling, Gap Analysis, Stakeholder Interviews & Agile Scrum.",
    technologies: ["Jira", "Confluence", "BPMN", "UML Diagrams", "SQL", "Excel", "Agile/Scrum"],
    keyTopics: ["User Story Writing & Gherkin Syntax", "Functional vs Non-Functional Requirements", "BPMN Workflow Swimlanes", "GAP Analysis Methodology", "Stakeholder RACI Matrix", "MoSCoW Prioritization"],
    defaultQuestionCount: 30,
    maxQuestionCount: 40,
    durationMinutes: 10,
  },
  {
    id: "product-manager",
    title: "Product Manager",
    category: "Other Technical Roles",
    icon: "🎯",
    badgeTone: "purple",
    description: "Product Strategy, PRDs, Roadmap Planning, North Star Metrics, User Retention, A/B Testing, Feature Prioritization (RICE/Kano) & GTM Launch.",
    technologies: ["Product Roadmapping", "PRD Writing", "RICE Scoring", "A/B Testing", "Mixpanel/Amplitude", "Agile Sprint Planning"],
    keyTopics: ["RICE Framework (Reach, Impact, Confidence, Effort)", "Product Requirement Documents (PRDs)", "A/B Testing Hypothesis & Statistical Significance", "Customer Journey Mapping", "Minimum Viable Product (MVP) Scoping", "Unit Economics & CAC/LTV"],
    defaultQuestionCount: 30,
    maxQuestionCount: 40,
    durationMinutes: 10,
  },
  {
    id: "technical-support-engineer",
    title: "Technical Support Engineer",
    category: "Other Technical Roles",
    icon: "🛠️",
    badgeTone: "orange",
    description: "Troubleshooting Methodology, Linux / Windows Log Inspection, SLA Compliance, ITIL Framework, Network Diagnostics (Ping/Traceroute), Ticket Escalation & Customer Care.",
    technologies: ["Linux/Windows CLI", "Wireshark", "Zendesk/ServiceNow", "Log Analysis", "Remote Desktop", "ITIL"],
    keyTopics: ["System Log Analysis (syslog/Event Viewer)", "Root Cause Analysis (RCA)", "SLA Management & Ticket Priority", "Network Diagnostics (traceroute, nslookup, netstat)", "Escalation Matrix", "Customer Empathy & De-escalation"],
    defaultQuestionCount: 30,
    maxQuestionCount: 40,
    durationMinutes: 10,
  },
  {
    id: "embedded-systems-engineer",
    title: "Embedded Systems Engineer",
    category: "Other Technical Roles",
    icon: "🔌",
    badgeTone: "green",
    description: "Embedded C / Assembly, Microcontrollers (ARM Cortex, STM32, ESP32), RTOS Tasks, Communication Protocols (I2C, SPI, UART, CAN), Interrupts & GPIOs.",
    technologies: ["Embedded C", "ARM Cortex", "FreeRTOS", "I2C / SPI / UART", "CAN Bus", "Oscilloscopes", "Bare-Metal C"],
    keyTopics: ["Interrupt Service Routines (ISRs)", "I2C vs SPI Protocol Timing", "Volatile Keyword in Embedded C", "RTOS Task Scheduling & Semaphores", "Pulse Width Modulation (PWM)", "Memory-Mapped I/O Registers"],
    defaultQuestionCount: 30,
    maxQuestionCount: 40,
    durationMinutes: 10,
  },
];

/**
 * Computes the adaptive difficulty track based on the student's latest score for this role.
 * - Previous score >= 79: Advanced
 * - Previous score <= 74: Medium
 * - Previous score 75 - 78: Mixed
 * - No score (first time): Medium
 */
export function getAdaptiveDifficulty(previousScore?: number | null): DifficultyLevel {
  if (previousScore === undefined || previousScore === null) {
    return "Medium"; // First-time assessment: balanced medium
  }
  if (previousScore >= 79) {
    return "Advanced"; // High-performing track
  }
  if (previousScore <= 74) {
    return "Medium"; // Needs improvement track: focused on intermediate fundamentals
  }
  return "Mixed"; // 75-78: mixed intermediate-to-advanced
}
