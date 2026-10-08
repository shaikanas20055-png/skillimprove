// Comprehensive, reusable Job Role Requirements & Learning Recommendations Dataset
// Supports any job role search with built-in library + dynamic generator for arbitrary roles.

export type ProficiencyLevel = "None" | "Beginner" | "Intermediate" | "Advanced";
export type SkillImportance = "Critical" | "High" | "Medium";

export type RoleSkillRequirement = {
  name: string;
  requiredLevel: "Beginner" | "Intermediate" | "Advanced";
  importance: SkillImportance;
  category: "Technical" | "Tool" | "Analytical" | "Professional";
  description?: string;
};

export type CourseRecommendation = {
  id: string;
  title: string;
  skill: string;
  requiredLevel: "Intermediate" | "Advanced";
  priority: "HIGH" | "MEDIUM" | "FOUNDATIONAL";
  estimatedDuration: string;
  why: string;
  platform?: string;
  keyTopics: string[];
};

export type ProjectRecommendation = {
  id: string;
  title: string;
  skills: string[];
  difficulty: "Intermediate" | "Advanced" | "Capstone";
  estimatedTime: string;
  why: string;
  deliverables: string[];
};

export type CareerRoleData = {
  id: string;
  title: string;
  category: string;
  description: string;
  averageSalary: string;
  marketDemand: "Very High" | "High" | "Growing";
  requiredSkills: RoleSkillRequirement[];
  recommendedCourses: CourseRecommendation[];
  recommendedProjects: ProjectRecommendation[];
  learningSequence: string[]; // Ordered skill names
  careerRoadmapSteps: string[];
};

export const POPULAR_ROLES: string[] = [
  "Data Analyst",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "AI/ML Engineer",
  "Data Scientist",
  "Cloud Engineer",
  "Cybersecurity Analyst",
  "DevOps Engineer",
  "UI/UX Designer",
  "Business Analyst",
  "Mobile App Developer",
];

export const PRESET_CAREER_ROLES: Record<string, CareerRoleData> = {
  "data-analyst": {
    id: "data-analyst",
    title: "Data Analyst",
    category: "Data & Analytics",
    description: "Data Analysts collect, clean, analyze and visualize data to support business decisions and drive operational strategy.",
    averageSalary: "₹6.5L – ₹11.5L / year",
    marketDemand: "Very High",
    requiredSkills: [
      { name: "SQL", requiredLevel: "Advanced", importance: "High", category: "Technical", description: "Complex queries, window functions, CTEs, and schema joins." },
      { name: "Power BI", requiredLevel: "Intermediate", importance: "High", category: "Tool", description: "Interactive dashboards, DAX expressions, and data modeling." },
      { name: "Statistics", requiredLevel: "Intermediate", importance: "Medium", category: "Analytical", description: "Descriptive statistics, hypothesis testing, and variance analysis." },
      { name: "Python", requiredLevel: "Intermediate", importance: "Medium", category: "Technical", description: "Data manipulation with Pandas, NumPy, and automation scripts." },
      { name: "Excel", requiredLevel: "Intermediate", importance: "High", category: "Tool", description: "Pivot tables, advanced lookup functions, and financial summaries." },
      { name: "Data Visualization", requiredLevel: "Intermediate", importance: "Medium", category: "Analytical", description: "Effective chart selection, storytelling, and KPI reporting." }
    ],
    recommendedCourses: [
      {
        id: "da-course-1",
        title: "SQL Fundamentals → Advanced SQL for Analytics",
        skill: "SQL",
        requiredLevel: "Advanced",
        priority: "HIGH",
        estimatedDuration: "4 weeks",
        why: "SQL is one of the most important skills required for your selected role and is currently your largest skill gap.",
        platform: "SkillImprove Academy",
        keyTopics: ["Multi-table Joins & Subqueries", "Window Functions (RANK, OVER)", "CTEs & Performance Optimization", "Aggregation & Grouping Analysis"]
      },
      {
        id: "da-course-2",
        title: "Power BI Business Intelligence Masterclass",
        skill: "Power BI",
        requiredLevel: "Intermediate",
        priority: "HIGH",
        estimatedDuration: "3 weeks",
        why: "Power BI is a required visualization skill for this role to transform raw queries into executive dashboards.",
        platform: "Microsoft Partner Track",
        keyTopics: ["Data Modeling & Relationships", "DAX Formulas & Measures", "Interactive Drill-throughs", "Publishing & Scheduled Refreshes"]
      },
      {
        id: "da-course-3",
        title: "Applied Statistics for Data Analysis",
        skill: "Statistics",
        requiredLevel: "Intermediate",
        priority: "MEDIUM",
        estimatedDuration: "2 weeks",
        why: "Statistics is required to interpret analytical results, validate sample cohorts, and avoid sampling bias.",
        platform: "Analytics Institute",
        keyTopics: ["Descriptive Metrics & Distributions", "Hypothesis Testing & P-values", "Correlation vs Causation", "A/B Experiment Evaluation"]
      },
      {
        id: "da-course-4",
        title: "Python Data Analysis with Pandas & Seaborn",
        skill: "Python",
        requiredLevel: "Intermediate",
        priority: "MEDIUM",
        estimatedDuration: "3 weeks",
        why: "Python provides scalable automation for data cleaning and exploratory data analysis beyond spreadsheets.",
        platform: "Open Source Lab",
        keyTopics: ["DataFrames & Series Wrangling", "Handling Missing Values", "Matplotlib & Seaborn Visualizations", "Exporting Insights to Parquet"]
      }
    ],
    recommendedProjects: [
      {
        id: "da-proj-1",
        title: "Customer Sales Analytics & Retention Dashboard",
        skills: ["SQL", "Power BI", "Statistics", "Data Visualization"],
        difficulty: "Capstone",
        estimatedTime: "2-3 weeks",
        why: "This project allows you to demonstrate the skills required for the Data Analyst role by ingesting raw transactional data and synthesizing revenue KPIs.",
        deliverables: ["Optimized SQL query script with window functions", "Interactive multi-page Power BI dashboard with DAX", "Executive insight summary report"]
      },
      {
        id: "da-proj-2",
        title: "E-Commerce User Cohort & Churn Exploration",
        skills: ["Python", "SQL", "Statistics", "Data Visualization"],
        difficulty: "Intermediate",
        estimatedTime: "1-2 weeks",
        why: "Showcases exploratory data analysis (EDA) and cohort retention curves, proving analytical interpretation skills.",
        deliverables: ["Jupyter Notebook with reproducible analysis", "Retention matrix visualization", "Data-backed business recommendations"]
      }
    ],
    learningSequence: ["SQL", "Power BI", "Statistics", "Python", "Data Visualization"],
    careerRoadmapSteps: [
      "Current Skills Benchmark",
      "Identify SQL & BI Skill Gaps",
      "Master Advanced SQL Queries",
      "Build Power BI Dashboards",
      "Complete Capstone Project",
      "Pass Technical SQL Assessment",
      "Verify Project with Placement Cell",
      "Attain Industry-Ready Status"
    ]
  },

  "frontend-developer": {
    id: "frontend-developer",
    title: "Frontend Developer",
    category: "Software Engineering",
    description: "Frontend Developers build high-performance, accessible and interactive user interfaces for modern web and mobile-responsive applications.",
    averageSalary: "₹7.0L – ₹14.0L / year",
    marketDemand: "Very High",
    requiredSkills: [
      { name: "React", requiredLevel: "Advanced", importance: "High", category: "Technical", description: "Hooks, custom hooks, context, state management, and component architecture." },
      { name: "JavaScript", requiredLevel: "Advanced", importance: "High", category: "Technical", description: "ES6+, closures, async/await, event loop, and DOM manipulation." },
      { name: "TypeScript", requiredLevel: "Intermediate", importance: "High", category: "Technical", description: "Static typing, generics, utility types, and strict interface safety." },
      { name: "HTML & CSS", requiredLevel: "Advanced", importance: "High", category: "Technical", description: "Semantic markup, flexbox, CSS grid, responsiveness, and Tailwind CSS." },
      { name: "Testing", requiredLevel: "Intermediate", importance: "Medium", category: "Technical", description: "Unit and integration testing with Vitest, Jest, and React Testing Library." },
      { name: "Git & Version Control", requiredLevel: "Intermediate", importance: "Medium", category: "Tool", description: "Branching workflows, rebasing, pull requests, and merge conflict resolution." }
    ],
    recommendedCourses: [
      {
        id: "fe-course-1",
        title: "TypeScript Essentials for React Engineers",
        skill: "TypeScript",
        requiredLevel: "Intermediate",
        priority: "HIGH",
        estimatedDuration: "3 weeks",
        why: "Modern frontend teams require TypeScript to build type-safe, maintainable component trees.",
        platform: "SkillImprove Engineering",
        keyTopics: ["Type Annotations & Interfaces", "Generics in React Components", "Narrowing & Discriminated Unions", "Typing Hooks & Context"]
      },
      {
        id: "fe-course-2",
        title: "Frontend Automated Testing with Vitest & RTL",
        skill: "Testing",
        requiredLevel: "Intermediate",
        priority: "HIGH",
        estimatedDuration: "2 weeks",
        why: "Testing is currently a missing skill on your profile and is required to verify code reliability in production.",
        platform: "Frontend Masters Track",
        keyTopics: ["Component Rendering Tests", "Mocking API Calls with MSW", "User Event Simulations", "Coverage Reports & CI Pipelines"]
      },
      {
        id: "fe-course-3",
        title: "Advanced React: Performance & Architectural Patterns",
        skill: "React",
        requiredLevel: "Advanced",
        priority: "MEDIUM",
        estimatedDuration: "3 weeks",
        why: "Elevates your React level from intermediate to advanced with custom state management and memoization.",
        platform: "SkillImprove Advanced Lab",
        keyTopics: ["useMemo & useCallback Profiling", "Compound Components", "Suspense & Concurrent Rendering", "Server State Caching"]
      }
    ],
    recommendedProjects: [
      {
        id: "fe-proj-1",
        title: "Responsive E-Commerce Dashboard with Analytics",
        skills: ["React", "TypeScript", "HTML & CSS", "Testing"],
        difficulty: "Capstone",
        estimatedTime: "2-3 weeks",
        why: "This project allows you to demonstrate modular UI components, TypeScript type safety, and automated test coverage.",
        deliverables: ["Accessible catalog & cart interface", "Fully typed state with TypeScript", "Test suite with >80% code coverage"]
      },
      {
        id: "fe-proj-2",
        title: "Real-time Collaborative Kanban Board",
        skills: ["React", "TypeScript", "Git & Version Control"],
        difficulty: "Intermediate",
        estimatedTime: "2 weeks",
        why: "Proves drag-and-drop mechanics, optimistic UI updates, and clean state synchronization.",
        deliverables: ["Drag & drop card workflow", "Persistent local/cloud storage", "Live activity feed"]
      }
    ],
    learningSequence: ["TypeScript", "Testing", "React", "HTML & CSS", "Git & Version Control"],
    careerRoadmapSteps: [
      "Benchmark Existing JS & React Knowledge",
      "Adopt TypeScript Static Typing",
      "Implement Automated Unit & Integration Tests",
      "Architect Production E-Commerce Capstone",
      "Submit Repository for College Verification",
      "Attain Verified Industry Readiness",
      "Apply for Frontend Engineering Roles"
    ]
  },

  "backend-developer": {
    id: "backend-developer",
    title: "Backend Developer",
    category: "Software Engineering",
    description: "Backend Developers architect resilient server-side applications, data storage pipelines, and secure REST/GraphQL APIs.",
    averageSalary: "₹7.5L – ₹15.0L / year",
    marketDemand: "Very High",
    requiredSkills: [
      { name: "Node.js", requiredLevel: "Advanced", importance: "High", category: "Technical", description: "Event loop, streams, Express/Fastify frameworks, and async error handling." },
      { name: "SQL", requiredLevel: "Advanced", importance: "High", category: "Technical", description: "Relational database schema modeling, indexing, transactions, and ACID compliance." },
      { name: "REST APIs", requiredLevel: "Advanced", importance: "High", category: "Technical", description: "API contract design, status codes, pagination, rate limiting, and security." },
      { name: "Docker", requiredLevel: "Intermediate", importance: "Medium", category: "Tool", description: "Containerizing services, multi-stage builds, and Docker Compose." },
      { name: "System Design", requiredLevel: "Intermediate", importance: "High", category: "Analytical", description: "Load balancing, horizontal scaling, caching strategies, and database sharding." },
      { name: "Redis & Caching", requiredLevel: "Intermediate", importance: "Medium", category: "Technical", description: "In-memory key-value caching, session stores, and pub/sub queues." }
    ],
    recommendedCourses: [
      {
        id: "be-course-1",
        title: "Relational Database Design & High-Performance SQL",
        skill: "SQL",
        requiredLevel: "Advanced",
        priority: "HIGH",
        estimatedDuration: "4 weeks",
        why: "Backend systems rely heavily on robust data layer architecture, query execution plans, and transaction boundaries.",
        platform: "SkillImprove Data Track",
        keyTopics: ["PostgreSQL Schema Normalization", "B-Tree Indexes & Explain Analyze", "Distributed Transactions & Isolation", "Connection Pooling"]
      },
      {
        id: "be-course-2",
        title: "Docker & Container Orchestration for Developers",
        skill: "Docker",
        requiredLevel: "Intermediate",
        priority: "HIGH",
        estimatedDuration: "2 weeks",
        why: "Containerization is required by modern backend teams to ensure consistent builds across dev and production.",
        platform: "DevOps Academy",
        keyTopics: ["Dockerfile Best Practices", "Multi-stage Builds", "Docker Compose Multi-container Networks", "Volume Persistence"]
      },
      {
        id: "be-course-3",
        title: "System Design Foundations: Scalability & Caching",
        skill: "System Design",
        requiredLevel: "Intermediate",
        priority: "MEDIUM",
        estimatedDuration: "3 weeks",
        why: "Crucial for understanding how to scale applications from 1,000 to 1,000,000 concurrent requests.",
        platform: "Architecture Lab",
        keyTopics: ["Horizontal vs Vertical Scaling", "Redis Cache Invalidation", "Message Queues (RabbitMQ/Kafka)", "API Rate Limiting & Auth"]
      }
    ],
    recommendedProjects: [
      {
        id: "be-proj-1",
        title: "Secure Multi-Tenant API Gateway with Auth & Rate Limiting",
        skills: ["Node.js", "SQL", "REST APIs", "Redis & Caching"],
        difficulty: "Capstone",
        estimatedTime: "3 weeks",
        why: "Proves your ability to handle authentication (JWT/OAuth), role-based access control, and redis-backed token bucket rate limits.",
        deliverables: ["Production-ready Express/Fastify service", "PostgreSQL migrations and seed scripts", "Swagger/OpenAPI documentation"]
      },
      {
        id: "be-proj-2",
        title: "Distributed Background Job Queue with Docker",
        skills: ["Node.js", "Docker", "Redis & Caching", "System Design"],
        difficulty: "Intermediate",
        estimatedTime: "2 weeks",
        why: "Demonstrates asynchronous worker architecture for email/video processing with retry telemetry.",
        deliverables: ["Docker Compose orchestrating worker & redis", "Job status telemetry dashboard", "Failure recovery handling"]
      }
    ],
    learningSequence: ["SQL", "Docker", "System Design", "Node.js", "REST APIs", "Redis & Caching"],
    careerRoadmapSteps: [
      "Benchmark Backend Competencies",
      "Upgrade Relational SQL & Indexing Skills",
      "Master Docker Container Workflows",
      "Learn Scalable System Design Patterns",
      "Build Secure Multi-Tenant API Capstone",
      "Complete Backend Assessment",
      "Get College Project Verification",
      "Ready for Backend & Cloud Roles"
    ]
  },

  "full-stack-developer": {
    id: "full-stack-developer",
    title: "Full Stack Developer",
    category: "Software Engineering",
    description: "Full Stack Developers create end-to-end web architectures, bridging fluid UI engineering with scalable backend services and databases.",
    averageSalary: "₹8.0L – ₹16.5L / year",
    marketDemand: "Very High",
    requiredSkills: [
      { name: "React", requiredLevel: "Advanced", importance: "High", category: "Technical", description: "Component state, routing, hooks, and responsive UX." },
      { name: "Node.js", requiredLevel: "Advanced", importance: "High", category: "Technical", description: "REST server endpoints, middleware, and business logic." },
      { name: "TypeScript", requiredLevel: "Intermediate", importance: "High", category: "Technical", description: "End-to-end type safety between client and server APIs." },
      { name: "SQL", requiredLevel: "Intermediate", importance: "High", category: "Technical", description: "Relational data modeling, Prisma/TypeORM, and query joins." },
      { name: "Docker", requiredLevel: "Intermediate", importance: "Medium", category: "Tool", description: "Containerized development environments and deployment." },
      { name: "REST APIs", requiredLevel: "Advanced", importance: "High", category: "Technical", description: "Standardized request/response contracts, auth, and error handling." }
    ],
    recommendedCourses: [
      {
        id: "fs-course-1",
        title: "Full Stack TypeScript with React & Node.js",
        skill: "TypeScript",
        requiredLevel: "Intermediate",
        priority: "HIGH",
        estimatedDuration: "3 weeks",
        why: "Shared types across frontend and backend eliminate runtime mismatch bugs.",
        platform: "SkillImprove FullStack Track",
        keyTopics: ["Shared DTO Types", "tRPC / Typed REST Clients", "Zod Validation Pipelines", "Serverless Functions"]
      },
      {
        id: "fs-course-2",
        title: "Database Modeling with PostgreSQL & Prisma",
        skill: "SQL",
        requiredLevel: "Intermediate",
        priority: "HIGH",
        estimatedDuration: "3 weeks",
        why: "Full stack engineers must design reliable relational schemas that support frontend state requirements.",
        platform: "Data Systems Institute",
        keyTopics: ["Schema Migrations", "One-to-Many & Many-to-Many Relations", "Transactions", "Optimized Query Pagination"]
      }
    ],
    recommendedProjects: [
      {
        id: "fs-proj-1",
        title: "Enterprise SaaS Workspace with Role-Based Access Control",
        skills: ["React", "Node.js", "TypeScript", "SQL", "Docker"],
        difficulty: "Capstone",
        estimatedTime: "3-4 weeks",
        why: "Demonstrates your capability to architect an end-to-end commercial software product with modern stack standards.",
        deliverables: ["Interactive React dashboard", "Authenticated Node.js API with PostgreSQL", "Docker Compose configuration"]
      }
    ],
    learningSequence: ["TypeScript", "SQL", "Node.js", "React", "Docker", "REST APIs"],
    careerRoadmapSteps: [
      "Review Frontend & Backend Strengths",
      "Adopt Unified TypeScript Architecture",
      "Strengthen Relational Database Schema Design",
      "Build End-to-End Enterprise SaaS Capstone",
      "Verify Codebase with Placement Faculty",
      "Attain Full-Stack Industry Readiness"
    ]
  },

  "ai-ml-engineer": {
    id: "ai-ml-engineer",
    title: "AI/ML Engineer",
    category: "AI & Machine Learning",
    description: "AI/ML Engineers train, evaluate, fine-tune, and deploy machine learning models, neural networks, and generative AI systems into production.",
    averageSalary: "₹9.0L – ₹18.0L / year",
    marketDemand: "Very High",
    requiredSkills: [
      { name: "Python", requiredLevel: "Advanced", importance: "High", category: "Technical", description: "Advanced Python, OOP, vectorized operations, and performance tuning." },
      { name: "Machine Learning", requiredLevel: "Advanced", importance: "High", category: "Technical", description: "Supervised & unsupervised learning, ensemble trees, and feature engineering." },
      { name: "PyTorch & Deep Learning", requiredLevel: "Intermediate", importance: "High", category: "Technical", description: "Neural network layers, backpropagation, and tensor transformations." },
      { name: "Model Evaluation & Tuning", requiredLevel: "Intermediate", importance: "High", category: "Analytical", description: "Cross-validation, ROC-AUC, Precision-Recall, and hyperparameter search." },
      { name: "Pandas & Data Wrangling", requiredLevel: "Advanced", importance: "High", category: "Technical", description: "Handling high-dimensional feature matrices, imputing, and normalizations." },
      { name: "MLOps & Model Deployment", requiredLevel: "Intermediate", importance: "Medium", category: "Tool", description: "FastAPI inference serving, model registries, and Docker deployment." }
    ],
    recommendedCourses: [
      {
        id: "ai-course-1",
        title: "Applied Machine Learning with Scikit-Learn & XGBoost",
        skill: "Machine Learning",
        requiredLevel: "Advanced",
        priority: "HIGH",
        estimatedDuration: "4 weeks",
        why: "Machine learning algorithms and validation methodologies form the core foundation for AI engineering roles.",
        platform: "SkillImprove AI Track",
        keyTopics: ["Gradient Boosted Trees (XGBoost/LightGBM)", "Feature Selection & Scaling", "Handling Class Imbalance", "Cross-Validation Protocols"]
      },
      {
        id: "ai-course-2",
        title: "Deep Learning & Neural Networks with PyTorch",
        skill: "PyTorch & Deep Learning",
        requiredLevel: "Intermediate",
        priority: "HIGH",
        estimatedDuration: "4 weeks",
        why: "PyTorch is the industry-standard framework for modern deep learning, embeddings, and transformer models.",
        platform: "PyTorch Foundation Partner",
        keyTopics: ["Tensors & Autograd", "Custom Dataset & DataLoader", "Convolutional & Recurrent Layers", "Transfer Learning & Fine-tuning"]
      },
      {
        id: "ai-course-3",
        title: "Production MLOps: Serving Models with FastAPI & Docker",
        skill: "MLOps & Model Deployment",
        requiredLevel: "Intermediate",
        priority: "MEDIUM",
        estimatedDuration: "2 weeks",
        why: "Companies hire engineers who can turn trained .pkl or .pt weights into monitored production endpoints.",
        platform: "Applied AI Lab",
        keyTopics: ["FastAPI Inference Endpoints", "Batch vs Real-time Predictions", "Dockerizing ML Runtimes", "Latency Benchmarking"]
      }
    ],
    recommendedProjects: [
      {
        id: "ai-proj-1",
        title: "Machine Learning Prediction & Risk Scoring System",
        skills: ["Python", "Machine Learning", "Pandas & Data Wrangling", "Model Evaluation & Tuning"],
        difficulty: "Capstone",
        estimatedTime: "3 weeks",
        why: "Build a Machine Learning Prediction System that evaluates customer churn or loan risk with production-level ROC-AUC and feature importance.",
        deliverables: ["End-to-end data pipeline notebook", "Tuned model artifact with evaluation report", "Interactive Streamlit or FastAPI demo"]
      },
      {
        id: "ai-proj-2",
        title: "LLM-Powered Retrieval-Augmented Generation (RAG) Engine",
        skills: ["Python", "PyTorch & Deep Learning", "MLOps & Model Deployment"],
        difficulty: "Capstone",
        estimatedTime: "2-3 weeks",
        why: "Demonstrates modern generative AI capability with vector databases and semantic search.",
        deliverables: ["Vector store embedding pipeline", "Contextual query answering engine", "Evaluation metric for hallucination mitigation"]
      }
    ],
    learningSequence: ["Machine Learning", "PyTorch & Deep Learning", "Model Evaluation & Tuning", "MLOps & Model Deployment"],
    careerRoadmapSteps: [
      "Assess Mathematical & Python Foundations",
      "Master Supervised & Ensemble ML",
      "Train Neural Models in PyTorch",
      "Deploy Predictive Inference System",
      "Benchmark Inference Latency & Accuracy",
      "Submit College-Verified AI Artifacts",
      "Become Qualified for AI/ML Roles"
    ]
  },

  "data-scientist": {
    id: "data-scientist",
    title: "Data Scientist",
    category: "Data & Analytics",
    description: "Data Scientists leverage statistical modeling, predictive algorithms, and experimental analysis to solve complex analytical problems.",
    averageSalary: "₹8.5L – ₹16.0L / year",
    marketDemand: "Very High",
    requiredSkills: [
      { name: "Python", requiredLevel: "Advanced", importance: "High", category: "Technical", description: "Pandas, NumPy, Scipy, and scientific computing." },
      { name: "Statistics & Probability", requiredLevel: "Advanced", importance: "High", category: "Analytical", description: "Bayesian reasoning, regression modeling, and experimental design." },
      { name: "Machine Learning", requiredLevel: "Intermediate", importance: "High", category: "Technical", description: "Classification, clustering, regression, and dimensionality reduction." },
      { name: "SQL", requiredLevel: "Intermediate", importance: "High", category: "Technical", description: "Data extraction, feature queries, and cohort filtering." },
      { name: "Data Visualization", requiredLevel: "Intermediate", importance: "Medium", category: "Analytical", description: "Translating complex statistical distributions into actionable business charts." },
      { name: "A/B Testing", requiredLevel: "Intermediate", importance: "Medium", category: "Analytical", description: "Power calculations, sample sizes, and p-value validation." }
    ],
    recommendedCourses: [
      {
        id: "ds-course-1",
        title: "Statistical Modeling & Experimental Design",
        skill: "Statistics & Probability",
        requiredLevel: "Advanced",
        priority: "HIGH",
        estimatedDuration: "4 weeks",
        why: "Data science roles demand mathematical rigor to design clean experiments and avoid false positives.",
        platform: "SkillImprove Science Track",
        keyTopics: ["Multiple Linear & Logistic Regression", "ANOVA & Variance Analysis", "Confidence Intervals & Power Analysis", "Non-parametric Testing"]
      },
      {
        id: "ds-course-2",
        title: "Applied Machine Learning for Data Science",
        skill: "Machine Learning",
        requiredLevel: "Intermediate",
        priority: "HIGH",
        estimatedDuration: "3 weeks",
        why: "Predictive algorithms allow you to quantify trends and forecast key business outcomes.",
        platform: "Coursera / SkillImprove",
        keyTopics: ["Random Forests & Gradient Boosting", "K-Means & Hierarchical Clustering", "PCA Dimensionality Reduction", "Model Interpretability with SHAP"]
      }
    ],
    recommendedProjects: [
      {
        id: "ds-proj-1",
        title: "Customer Lifetime Value Prediction & Factor Analysis",
        skills: ["Python", "Statistics & Probability", "Machine Learning", "Data Visualization"],
        difficulty: "Capstone",
        estimatedTime: "3 weeks",
        why: "Demonstrates practical statistical modeling that directly impacts commercial business decisions.",
        deliverables: ["Reproducible statistical EDA notebook", "Regression & Survival Analysis model", "SHAP feature attribution charts"]
      }
    ],
    learningSequence: ["Statistics & Probability", "Machine Learning", "Python", "SQL", "Data Visualization"],
    careerRoadmapSteps: [
      "Review Current Data Profile",
      "Deepen Statistical & Probability Rigor",
      "Implement Predictive ML Models",
      "Publish Data Science Project Evidence",
      "Attain Verified Data Scientist Readiness"
    ]
  },

  "cloud-engineer": {
    id: "cloud-engineer",
    title: "Cloud Engineer",
    category: "Cloud & DevOps",
    description: "Cloud Engineers build and maintain resilient, cost-effective infrastructure and cloud services across AWS, Azure, or Google Cloud.",
    averageSalary: "₹7.5L – ₹15.0L / year",
    marketDemand: "High",
    requiredSkills: [
      { name: "AWS Architecture", requiredLevel: "Advanced", importance: "High", category: "Technical", description: "EC2, S3, VPC networking, IAM security, Lambda, and RDS." },
      { name: "Linux Administration", requiredLevel: "Intermediate", importance: "High", category: "Technical", description: "Bash shell, permissions, systemd services, SSH, and networking tools." },
      { name: "Docker & Containers", requiredLevel: "Intermediate", importance: "High", category: "Tool", description: "Containerized application packaging and port routing." },
      { name: "Terraform (IaC)", requiredLevel: "Intermediate", importance: "High", category: "Tool", description: "Infrastructure as code, state management, and declarative modules." },
      { name: "CI/CD Pipelines", requiredLevel: "Intermediate", importance: "Medium", category: "Tool", description: "Automated deployment workflows via GitHub Actions." },
      { name: "Cloud Security & IAM", requiredLevel: "Intermediate", importance: "High", category: "Technical", description: "Least-privilege policies, security groups, and encryption keys." }
    ],
    recommendedCourses: [
      {
        id: "cloud-course-1",
        title: "AWS Solutions Architecture & Core Infrastructure",
        skill: "AWS Architecture",
        requiredLevel: "Advanced",
        priority: "HIGH",
        estimatedDuration: "4 weeks",
        why: "AWS is the primary cloud provider demanded by hiring partners for this role.",
        platform: "AWS Training & Certification",
        keyTopics: ["Multi-AZ VPC Architecture", "Auto Scaling & Application Load Balancers", "IAM Policies & Role Delegation", "S3 Storage Classes & Lifecycle"]
      },
      {
        id: "cloud-course-2",
        title: "Infrastructure as Code with Terraform",
        skill: "Terraform (IaC)",
        requiredLevel: "Intermediate",
        priority: "HIGH",
        estimatedDuration: "3 weeks",
        why: "Terraform allows repeatable, automated provisioning of cloud environments without manual console mistakes.",
        platform: "HashiCorp Partner Track",
        keyTopics: ["Terraform HCL Syntax", "Remote State in S3/DynamoDB", "Reusable VPC & Compute Modules", "Plan & Apply Workflows"]
      }
    ],
    recommendedProjects: [
      {
        id: "cloud-proj-1",
        title: "Highly Available Multi-Tier Web Architecture on AWS with Terraform",
        skills: ["AWS Architecture", "Terraform (IaC)", "Linux Administration", "Cloud Security & IAM"],
        difficulty: "Capstone",
        estimatedTime: "2-3 weeks",
        why: "Demonstrates production cloud provisioning including VPC subnets, bastion host, load balancer, and secure database tiers.",
        deliverables: ["Modular Terraform repository", "Architecture diagram with security boundaries", "Cost estimation & disaster recovery plan"]
      }
    ],
    learningSequence: ["AWS Architecture", "Terraform (IaC)", "Linux Administration", "Cloud Security & IAM"],
    careerRoadmapSteps: [
      "Review Current Cloud Knowledge",
      "Architect AWS Multi-Tier VPCs",
      "Automate with Terraform IaC",
      "Provision Capstone Infrastructure",
      "Verify Cloud Certifications",
      "Attain Industry-Ready Status"
    ]
  },

  "cybersecurity-analyst": {
    id: "cybersecurity-analyst",
    title: "Cybersecurity Analyst",
    category: "Security",
    description: "Cybersecurity Analysts monitor threat vectors, audit vulnerability surfaces, protect sensitive assets, and investigate security incidents.",
    averageSalary: "₹7.0L – ₹14.0L / year",
    marketDemand: "Very High",
    requiredSkills: [
      { name: "Network Security", requiredLevel: "Advanced", importance: "High", category: "Technical", description: "TCP/IP, firewalls, Wireshark packet inspection, and VPN topologies." },
      { name: "Vulnerability Assessment", requiredLevel: "Intermediate", importance: "High", category: "Technical", description: "Port scanning with Nmap, CVE tracking, and OWASP Top 10." },
      { name: "SIEM & Incident Response", requiredLevel: "Intermediate", importance: "High", category: "Tool", description: "Log aggregation in Splunk/ELK, threat hunting, and alerts." },
      { name: "Linux & Bash", requiredLevel: "Intermediate", importance: "Medium", category: "Technical", description: "Security log inspection, permissions, and grep/awk parsing." },
      { name: "Cryptography Basics", requiredLevel: "Intermediate", importance: "Medium", category: "Technical", description: "Public-key infrastructure, hashing, TLS/SSL, and digital certificates." },
      { name: "Security Compliance", requiredLevel: "Intermediate", importance: "Medium", category: "Professional", description: "ISO 27001, SOC 2, and data protection regulations." }
    ],
    recommendedCourses: [
      {
        id: "sec-course-1",
        title: "Network Defense & Wireshark Traffic Analysis",
        skill: "Network Security",
        requiredLevel: "Advanced",
        priority: "HIGH",
        estimatedDuration: "4 weeks",
        why: "Network visibility is the frontline requirement for detecting intrusions and anomalous exfiltration.",
        platform: "SkillImprove Cyber Lab",
        keyTopics: ["Deep Packet Inspection with Wireshark", "DNS/DHCP Threat Vectors", "Firewall Rule Configuration", "Mitigating Man-in-the-Middle Attacks"]
      },
      {
        id: "sec-course-2",
        title: "SOC Operations & Threat Hunting with SIEM",
        skill: "SIEM & Incident Response",
        requiredLevel: "Intermediate",
        priority: "HIGH",
        estimatedDuration: "3 weeks",
        why: "Security Operations Centers require analysts skilled at correlating log signals into actionable incident responses.",
        platform: "SOC Analyst Track",
        keyTopics: ["Syslog & Windows Event Log Auditing", "Splunk Search Processing Language", "Creating Alert Playbooks", "Containment Strategies"]
      }
    ],
    recommendedProjects: [
      {
        id: "sec-proj-1",
        title: "Home Lab Intrusion Detection & SIEM Monitoring System",
        skills: ["Network Security", "SIEM & Incident Response", "Linux & Bash"],
        difficulty: "Capstone",
        estimatedTime: "2-3 weeks",
        why: "Proves hands-on configuration of network sensors, log ingestion pipelines, and alert detection rules.",
        deliverables: ["Documented virtualized network lab", "Configured Suricata/Wazuh alert rules", "Incident response walkthrough report"]
      }
    ],
    learningSequence: ["Network Security", "SIEM & Incident Response", "Vulnerability Assessment", "Linux & Bash"],
    careerRoadmapSteps: [
      "Benchmark Security Knowledge",
      "Master Network Protocol Inspection",
      "Configure SIEM Log Detection",
      "Execute Vulnerability Assessment Project",
      "Pass Security Assessment",
      "Ready for SOC & Analyst Roles"
    ]
  },

  "devops-engineer": {
    id: "devops-engineer",
    title: "DevOps Engineer",
    category: "Cloud & DevOps",
    description: "DevOps Engineers bridge software development and operations by building continuous delivery pipelines, monitoring, and scalable infrastructure.",
    averageSalary: "₹8.0L – ₹16.0L / year",
    marketDemand: "Very High",
    requiredSkills: [
      { name: "Docker & Kubernetes", requiredLevel: "Advanced", importance: "High", category: "Tool", description: "Pods, services, deployments, ingress controllers, and Helm charts." },
      { name: "CI/CD Automation", requiredLevel: "Advanced", importance: "High", category: "Tool", description: "GitHub Actions, GitLab CI, pipeline caching, and automated testing." },
      { name: "Linux Systems", requiredLevel: "Advanced", importance: "High", category: "Technical", description: "System tuning, kernel parameters, process monitoring, and Bash." },
      { name: "Cloud Infrastructure", requiredLevel: "Intermediate", importance: "High", category: "Technical", description: "Provisioning cloud resources and managed container services (EKS/ECS)." },
      { name: "Monitoring & Observability", requiredLevel: "Intermediate", importance: "Medium", category: "Tool", description: "Prometheus metrics collection, Grafana dashboards, and alert managers." },
      { name: "Python / Bash Scripting", requiredLevel: "Intermediate", importance: "Medium", category: "Technical", description: "Automation scripts for health checks, backups, and deployment hooks." }
    ],
    recommendedCourses: [
      {
        id: "devops-course-1",
        title: "Kubernetes from Basics to Production Clusters",
        skill: "Docker & Kubernetes",
        requiredLevel: "Advanced",
        priority: "HIGH",
        estimatedDuration: "4 weeks",
        why: "Kubernetes is the de facto standard container orchestration platform in modern DevOps roles.",
        platform: "CNCF Aligned Curriculum",
        keyTopics: ["Kubernetes Architecture & Control Plane", "Declarative YAML Manifests", "ConfigMaps, Secrets & Volumes", "Rolling Updates & Health Probes"]
      },
      {
        id: "devops-course-2",
        title: "Production CI/CD Pipelines with GitHub Actions",
        skill: "CI/CD Automation",
        requiredLevel: "Advanced",
        priority: "HIGH",
        estimatedDuration: "2 weeks",
        why: "Automating build, test, and zero-downtime deployment workflows eliminates human deployment errors.",
        platform: "DevOps Automation Lab",
        keyTopics: ["Matrix Builds & Caching", "Docker Container Publishing", "Secrets Management", "GitOps Workflows with ArgoCD"]
      }
    ],
    recommendedProjects: [
      {
        id: "devops-proj-1",
        title: "Automated GitOps CI/CD Pipeline with Kubernetes & Prometheus",
        skills: ["Docker & Kubernetes", "CI/CD Automation", "Monitoring & Observability", "Linux Systems"],
        difficulty: "Capstone",
        estimatedTime: "3 weeks",
        why: "Builds a complete deployment lifecycle where a code push automatically tests, containerizes, deploys, and monitors telemetry.",
        deliverables: ["GitHub Actions workflow YAML", "Kubernetes manifests with ingress", "Grafana dashboard showing cluster latency and CPU"]
      }
    ],
    learningSequence: ["Docker & Kubernetes", "CI/CD Automation", "Monitoring & Observability", "Linux Systems"],
    careerRoadmapSteps: [
      "Benchmark Infrastructure Fundamentals",
      "Master Kubernetes Manifests & Clusters",
      "Build End-to-End CI/CD Pipelines",
      "Deploy Observability & Alerting Stack",
      "Verify Project with Placement Cell",
      "Attain DevOps Industry Readiness"
    ]
  },

  "ui-ux-designer": {
    id: "ui-ux-designer",
    title: "UI/UX Designer",
    category: "Design & Product",
    description: "UI/UX Designers conduct user research, craft wireframes and design systems, and prototype delightful digital product experiences.",
    averageSalary: "₹6.0L – ₹13.0L / year",
    marketDemand: "High",
    requiredSkills: [
      { name: "Figma & Prototyping", requiredLevel: "Advanced", importance: "High", category: "Tool", description: "Auto-layout, interactive variants, components, and variables." },
      { name: "Design Systems", requiredLevel: "Advanced", importance: "High", category: "Technical", description: "Design tokens, atomic design, typography scales, and WCAG accessibility." },
      { name: "User Research & Testing", requiredLevel: "Intermediate", importance: "High", category: "Analytical", description: "User interviews, persona synthesis, usability audits, and task analysis." },
      { name: "Wireframing & IA", requiredLevel: "Intermediate", importance: "High", category: "Analytical", description: "Information architecture, sitemaps, low-fidelity paper and digital wireframes." },
      { name: "Visual Design & Typography", requiredLevel: "Intermediate", importance: "Medium", category: "Analytical", description: "Visual hierarchy, spacing grids, micro-interactions, and contrast ratios." },
      { name: "Frontend Basics (HTML/CSS)", requiredLevel: "Beginner", importance: "Medium", category: "Technical", description: "Understanding CSS box model and flexbox to design developer-friendly specs." }
    ],
    recommendedCourses: [
      {
        id: "ux-course-1",
        title: "Advanced Figma: Design Systems & Component Architecture",
        skill: "Figma & Prototyping",
        requiredLevel: "Advanced",
        priority: "HIGH",
        estimatedDuration: "3 weeks",
        why: "Figma is the industry-standard design tool; mastering auto-layout and component variants is mandatory for modern teams.",
        platform: "Design Systems Academy",
        keyTopics: ["Auto-layout 5.0 & Responsive Constraints", "Component Property Sets & Variants", "Design Tokens & Variable Modes", "Interactive Micro-prototypes"]
      },
      {
        id: "ux-course-2",
        title: "User Experience Research & Usability Testing Methods",
        skill: "User Research & Testing",
        requiredLevel: "Intermediate",
        priority: "HIGH",
        estimatedDuration: "2 weeks",
        why: "Ensures your designs solve verified user pain points rather than aesthetic guesses.",
        platform: "Interaction Design Institute",
        keyTopics: ["Qualitative User Interviews", "Usability Test Scripting & Scoring", "Affinity Mapping", "Journey Mapping & Personas"]
      }
    ],
    recommendedProjects: [
      {
        id: "ux-proj-1",
        title: "End-to-End Fintech Mobile & Web Design System",
        skills: ["Figma & Prototyping", "Design Systems", "User Research & Testing", "Wireframing & IA"],
        difficulty: "Capstone",
        estimatedTime: "2-3 weeks",
        why: "A comprehensive case study showcasing discovery research, wireframes, accessible tokens, and an interactive clickable prototype.",
        deliverables: ["Figma design system library with 50+ components", "Clickable high-fidelity prototype", "Published Behance/Notion design case study"]
      }
    ],
    learningSequence: ["Figma & Prototyping", "Design Systems", "User Research & Testing", "Wireframing & IA"],
    careerRoadmapSteps: [
      "Review Design Fundamentals",
      "Master Figma Component Architecture",
      "Conduct User Research & Usability Tests",
      "Publish End-to-End Design Case Study",
      "Review Portfolio with Design Mentors",
      "Ready for Product Design Interviews"
    ]
  },

  "business-analyst": {
    id: "business-analyst",
    title: "Business Analyst",
    category: "Business & Management",
    description: "Business Analysts translate operational goals into functional specifications, process flow diagrams, and data-backed business solutions.",
    averageSalary: "₹6.5L – ₹12.5L / year",
    marketDemand: "High",
    requiredSkills: [
      { name: "Requirements Gathering", requiredLevel: "Advanced", importance: "High", category: "Professional", description: "BRD/FRD authoring, user story writing, and acceptance criteria." },
      { name: "Process Flow Mapping (BPMN)", requiredLevel: "Intermediate", importance: "High", category: "Analytical", description: "Current-state (As-Is) and future-state (To-Be) swimlane diagrams." },
      { name: "SQL & Data Analysis", requiredLevel: "Intermediate", importance: "High", category: "Technical", description: "Querying transactional tables to validate business problem statements." },
      { name: "Stakeholder Communication", requiredLevel: "Advanced", importance: "High", category: "Professional", description: "Executive presentations, cross-functional alignment, and workshop facilitation." },
      { name: "Agile & Scrum Practices", requiredLevel: "Intermediate", importance: "Medium", category: "Professional", description: "Jira backlog grooming, sprint planning, and sprint reviews." },
      { name: "Excel & Financial Summaries", requiredLevel: "Intermediate", importance: "Medium", category: "Tool", description: "Cost-benefit analysis, ROI projections, and KPI modeling." }
    ],
    recommendedCourses: [
      {
        id: "ba-course-1",
        title: "Business Requirements Documentation & Agile Stories",
        skill: "Requirements Gathering",
        requiredLevel: "Advanced",
        priority: "HIGH",
        estimatedDuration: "3 weeks",
        why: "Writing crisp, unambiguous functional requirements bridges business executives and technical development teams.",
        platform: "IIBA Aligned Program",
        keyTopics: ["BRD & PRD Frameworks", "INVEST User Story Principles", "Gherkin Acceptance Criteria", "Traceability Matrices"]
      },
      {
        id: "ba-course-2",
        title: "Business Process Modeling with BPMN 2.0",
        skill: "Process Flow Mapping (BPMN)",
        requiredLevel: "Intermediate",
        priority: "HIGH",
        estimatedDuration: "2 weeks",
        why: "Visual process flows allow organizations to pinpoint operational bottlenecks and plan automated efficiencies.",
        platform: "Process Optimization Lab",
        keyTopics: ["Swimlane Diagramming", "Decision Gateways & Events", "As-Is vs To-Be Gap Identification", "Process Metric Measurement"]
      }
    ],
    recommendedProjects: [
      {
        id: "ba-proj-1",
        title: "Digital Loan Onboarding Process Transformation Case Study",
        skills: ["Requirements Gathering", "Process Flow Mapping (BPMN)", "SQL & Data Analysis", "Stakeholder Communication"],
        difficulty: "Capstone",
        estimatedTime: "2-3 weeks",
        why: "Demonstrates full lifecycle business analysis from problem statement to To-Be process diagram and user story backlog.",
        deliverables: ["Complete Business Requirement Document (BRD)", "BPMN 2.0 As-Is and To-Be swimlane models", "Jira-ready epic and user story backlog"]
      }
    ],
    learningSequence: ["Requirements Gathering", "Process Flow Mapping (BPMN)", "SQL & Data Analysis", "Agile & Scrum Practices"],
    careerRoadmapSteps: [
      "Benchmark Analytical & Communication Skills",
      "Master Business Requirements & User Stories",
      "Model Enterprise Processes with BPMN",
      "Deliver Capstone Transformation Document",
      "Verify Portfolio with Placement Cell",
      "Qualify for Business Analyst Roles"
    ]
  },

  "mobile-app-developer": {
    id: "mobile-app-developer",
    title: "Mobile App Developer",
    category: "Software Engineering",
    description: "Mobile App Developers design and ship intuitive, performant native or cross-platform mobile experiences on iOS and Android.",
    averageSalary: "₹7.0L – ₹14.5L / year",
    marketDemand: "High",
    requiredSkills: [
      { name: "React Native", requiredLevel: "Advanced", importance: "High", category: "Technical", description: "Cross-platform mobile components, navigation, and native bridge APIs." },
      { name: "JavaScript / TypeScript", requiredLevel: "Advanced", importance: "High", category: "Technical", description: "ES6+, asynchronous event handling, and typed models." },
      { name: "Mobile UI Patterns", requiredLevel: "Intermediate", importance: "High", category: "Technical", description: "Touch gestures, safe area insets, keyboard avoidance, and animations." },
      { name: "State Management", requiredLevel: "Intermediate", importance: "High", category: "Technical", description: "Redux Toolkit, Zustand, or Context for global offline/online sync." },
      { name: "REST APIs & Offline Storage", requiredLevel: "Intermediate", importance: "Medium", category: "Technical", description: "AsyncStorage, SQLite, and caching network responses." },
      { name: "App Store & Play Store Deployment", requiredLevel: "Beginner", importance: "Medium", category: "Tool", description: "Build signing, provisioning profiles, and bundle generation." }
    ],
    recommendedCourses: [
      {
        id: "mob-course-1",
        title: "React Native & Expo: Build Cross-Platform Mobile Apps",
        skill: "React Native",
        requiredLevel: "Advanced",
        priority: "HIGH",
        estimatedDuration: "4 weeks",
        why: "React Native enables you to leverage JavaScript/React skills to deploy native apps to both iOS and Android stores.",
        platform: "Mobile Masters Academy",
        keyTopics: ["React Navigation v6", "Native Device APIs (Camera, Location)", "Reanimated Micro-animations", "EAS Build & Submissions"]
      }
    ],
    recommendedProjects: [
      {
        id: "mob-proj-1",
        title: "Fitness & Habit Tracking Mobile App with Offline Sync",
        skills: ["React Native", "JavaScript / TypeScript", "State Management", "REST APIs & Offline Storage"],
        difficulty: "Capstone",
        estimatedTime: "2-3 weeks",
        why: "Proves ability to handle native sensors, offline caching, push notifications, and buttery-smooth gestures.",
        deliverables: ["Production-ready Expo / React Native codebase", "Offline SQLite synchronization", "Interactive video demo on iOS & Android simulators"]
      }
    ],
    learningSequence: ["React Native", "Mobile UI Patterns", "State Management", "REST APIs & Offline Storage"],
    careerRoadmapSteps: [
      "Review Core JavaScript Competencies",
      "Master React Native Layout & Navigation",
      "Implement Offline-First Mobile Storage",
      "Ship Native Mobile Capstone",
      "Verify Mobile Artifacts with College",
      "Ready for Mobile Engineering Roles"
    ]
  }
};

// Aliases mapping for common student search inputs
export const ROLE_ALIASES: Record<string, string> = {
  "data analyst": "data-analyst",
  "data analysis": "data-analyst",
  "business data analyst": "data-analyst",
  "bi analyst": "data-analyst",
  "analytics": "data-analyst",
  "frontend": "frontend-developer",
  "front end": "frontend-developer",
  "frontend developer": "frontend-developer",
  "react developer": "frontend-developer",
  "ui developer": "frontend-developer",
  "web developer": "frontend-developer",
  "backend": "backend-developer",
  "back end": "backend-developer",
  "backend developer": "backend-developer",
  "node developer": "backend-developer",
  "api developer": "backend-developer",
  "fullstack": "full-stack-developer",
  "full stack": "full-stack-developer",
  "full stack developer": "full-stack-developer",
  "full-stack developer": "full-stack-developer",
  "software engineer": "frontend-developer", // default mapped, or synthesized
  "ai engineer": "ai-ml-engineer",
  "ml engineer": "ai-ml-engineer",
  "ai/ml engineer": "ai-ml-engineer",
  "machine learning engineer": "ai-ml-engineer",
  "data scientist": "data-scientist",
  "cloud engineer": "cloud-engineer",
  "aws engineer": "cloud-engineer",
  "cloud architect": "cloud-engineer",
  "cybersecurity": "cybersecurity-analyst",
  "cyber security": "cybersecurity-analyst",
  "cybersecurity analyst": "cybersecurity-analyst",
  "security analyst": "cybersecurity-analyst",
  "devops": "devops-engineer",
  "devops engineer": "devops-engineer",
  "sre": "devops-engineer",
  "ui/ux": "ui-ux-designer",
  "ui ux": "ui-ux-designer",
  "ui/ux designer": "ui-ux-designer",
  "product designer": "ui-ux-designer",
  "ux designer": "ui-ux-designer",
  "business analyst": "business-analyst",
  "ba": "business-analyst",
  "mobile developer": "mobile-app-developer",
  "mobile app developer": "mobile-app-developer",
  "android developer": "mobile-app-developer",
  "ios developer": "mobile-app-developer",
  "react native developer": "mobile-app-developer"
};

/**
 * Normalizes query string to find best matching role in library,
 * or dynamically synthesizes a complete, credible role requirement
 * if the user searches for any custom or novel career role!
 */
export function resolveJobRole(query: string): CareerRoleData {
  const clean = query.trim().toLowerCase();
  if (!clean) {
    return PRESET_CAREER_ROLES["data-analyst"];
  }

  // Exact alias match
  if (ROLE_ALIASES[clean] && PRESET_CAREER_ROLES[ROLE_ALIASES[clean]]) {
    return PRESET_CAREER_ROLES[ROLE_ALIASES[clean]];
  }

  // Exact ID match
  const slug = clean.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (PRESET_CAREER_ROLES[slug]) {
    return PRESET_CAREER_ROLES[slug];
  }

  // Substring match in keys or titles
  for (const [key, role] of Object.entries(PRESET_CAREER_ROLES)) {
    if (key.includes(clean) || role.title.toLowerCase().includes(clean) || clean.includes(key.replace("-", " "))) {
      return role;
    }
  }

  // Title keywords match
  for (const role of Object.values(PRESET_CAREER_ROLES)) {
    const roleWords = role.title.toLowerCase().split(" ");
    const queryWords = clean.split(" ");
    if (queryWords.some(w => w.length > 3 && roleWords.includes(w))) {
      return role;
    }
  }

  // Dynamic Synthesis for ANY arbitrary role!
  // e.g. "Game Developer", "Blockchain Engineer", "Robotics Specialist"
  const title = query
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  return synthesizeDynamicRole(title);
}

function synthesizeDynamicRole(title: string): CareerRoleData {
  const lower = title.toLowerCase();
  const id = lower.replace(/[^a-z0-9]+/g, "-");

  // Determine intelligent category and core requirements based on keywords
  let category = "Technology & Engineering";
  let skills: RoleSkillRequirement[] = [];
  let description = `${title}s design, develop, and optimize specialized systems to solve domain problems and deliver reliable outcomes.`;

  if (lower.includes("game") || lower.includes("unity") || lower.includes("unreal")) {
    category = "Game Development";
    description = "Game Developers build interactive 2D/3D gameplay mechanics, graphics rendering pipelines, physics simulations, and player experiences.";
    skills = [
      { name: "C++ or C#", requiredLevel: "Advanced", importance: "High", category: "Technical" },
      { name: "Unity / Unreal Engine", requiredLevel: "Advanced", importance: "High", category: "Tool" },
      { name: "3D Math & Physics", requiredLevel: "Intermediate", importance: "High", category: "Analytical" },
      { name: "Shader Programming", requiredLevel: "Intermediate", importance: "Medium", category: "Technical" },
      { name: "Performance Profiling", requiredLevel: "Intermediate", importance: "Medium", category: "Technical" },
      { name: "Git & Asset Pipelines", requiredLevel: "Intermediate", importance: "Medium", category: "Tool" },
    ];
  } else if (lower.includes("blockchain") || lower.includes("web3") || lower.includes("crypto") || lower.includes("solidity")) {
    category = "Web3 & Distributed Systems";
    description = "Blockchain Engineers build decentralized applications, smart contract protocols, and cryptographically verified transaction ledgers.";
    skills = [
      { name: "Solidity", requiredLevel: "Advanced", importance: "High", category: "Technical" },
      { name: "Smart Contract Security", requiredLevel: "Advanced", importance: "High", category: "Technical" },
      { name: "Ethers.js / Web3.js", requiredLevel: "Intermediate", importance: "High", category: "Tool" },
      { name: "Ethereum & EVM Internals", requiredLevel: "Intermediate", importance: "High", category: "Technical" },
      { name: "Cryptography & Hashing", requiredLevel: "Intermediate", importance: "Medium", category: "Analytical" },
      { name: "Hardhat / Foundry", requiredLevel: "Intermediate", importance: "Medium", category: "Tool" },
    ];
  } else if (lower.includes("product") || lower.includes("manager")) {
    category = "Product Management";
    description = "Product Managers lead product discovery, align stakeholder requirements, prioritize roadmaps, and measure launch metrics.";
    skills = [
      { name: "Product Strategy & Roadmapping", requiredLevel: "Advanced", importance: "High", category: "Professional" },
      { name: "User Research & Customer Interviews", requiredLevel: "Advanced", importance: "High", category: "Analytical" },
      { name: "Metrics & Product Analytics", requiredLevel: "Intermediate", importance: "High", category: "Analytical" },
      { name: "Agile / Scrum Execution", requiredLevel: "Intermediate", importance: "High", category: "Professional" },
      { name: "Technical Feasibility Assessment", requiredLevel: "Intermediate", importance: "Medium", category: "Technical" },
      { name: "Wireframing & Spec Writing", requiredLevel: "Intermediate", importance: "Medium", category: "Tool" },
    ];
  } else if (lower.includes("qa") || lower.includes("test") || lower.includes("quality")) {
    category = "Quality Assurance";
    description = "QA Automation Engineers write automated test frameworks, validate API & UI contracts, and ensure high reliability before release.";
    skills = [
      { name: "Automated Testing Frameworks", requiredLevel: "Advanced", importance: "High", category: "Technical" },
      { name: "Playwright / Cypress", requiredLevel: "Advanced", importance: "High", category: "Tool" },
      { name: "API Testing (Postman/REST)", requiredLevel: "Intermediate", importance: "High", category: "Technical" },
      { name: "JavaScript / Python Scripting", requiredLevel: "Intermediate", importance: "High", category: "Technical" },
      { name: "CI/CD Integration", requiredLevel: "Intermediate", importance: "Medium", category: "Tool" },
      { name: "Test Planning & Bug Tracking", requiredLevel: "Intermediate", importance: "Medium", category: "Professional" },
    ];
  } else {
    // Default smart synthesis for any engineering/analytical title
    skills = [
      { name: "Core Domain Foundations", requiredLevel: "Advanced", importance: "High", category: "Technical" },
      { name: "Problem Solving & Algorithms", requiredLevel: "Advanced", importance: "High", category: "Analytical" },
      { name: "Tools & Frameworks", requiredLevel: "Intermediate", importance: "High", category: "Tool" },
      { name: "System Architecture", requiredLevel: "Intermediate", importance: "Medium", category: "Technical" },
      { name: "Automated Quality & Verification", requiredLevel: "Intermediate", importance: "Medium", category: "Technical" },
      { name: "Technical Communication", requiredLevel: "Intermediate", importance: "Medium", category: "Professional" },
    ];
  }

  const primarySkill = skills[0].name;
  const secondarySkill = skills[1].name;

  return {
    id,
    title,
    category,
    description,
    averageSalary: "₹7.0L – ₹15.0L / year",
    marketDemand: "High",
    requiredSkills: skills,
    recommendedCourses: [
      {
        id: `${id}-c1`,
        title: `${primarySkill} Mastery for ${title}`,
        skill: primarySkill,
        requiredLevel: "Advanced",
        priority: "HIGH",
        estimatedDuration: "4 weeks",
        why: `${primarySkill} is a high-priority requirement for this role and forms your primary competency foundation.`,
        platform: "SkillImprove Specialized Track",
        keyTopics: ["Core Principles & Standards", "Real-World Application", "Best Practices & Optimization", "Common Pitfalls & Debugging"]
      },
      {
        id: `${id}-c2`,
        title: `${secondarySkill} Deep Dive`,
        skill: secondarySkill,
        requiredLevel: "Intermediate",
        priority: "HIGH",
        estimatedDuration: "3 weeks",
        why: `${secondarySkill} is required to build reliable, scalable implementations in ${title} workflows.`,
        platform: "SkillImprove Advanced Lab",
        keyTopics: ["Architecture Patterns", "Tool Integration", "Hands-on Exercises", "Production Readiness"]
      }
    ],
    recommendedProjects: [
      {
        id: `${id}-p1`,
        title: `${title} End-to-End Capstone Implementation`,
        skills: [primarySkill, secondarySkill, skills[2].name],
        difficulty: "Capstone",
        estimatedTime: "3 weeks",
        why: `Allows you to demonstrate practical evidence and industry-aligned competencies for ${title} roles.`,
        deliverables: ["Complete open-source repository", "Architecture documentation & live demo", "Verification report"]
      }
    ],
    learningSequence: skills.map(s => s.name),
    careerRoadmapSteps: [
      "Current Skills Benchmark",
      `Target ${primarySkill} Requirements`,
      "Structured Learning & Practice",
      "Build Domain Capstone Project",
      "Pass Technical Assessment",
      "Verify Project with Placement Cell",
      "Become Qualified for Job Applications"
    ]
  };
}

// Student's baseline profile skills (Alex Johnson default, extensible)
export const DEFAULT_STUDENT_SKILLS: Record<string, ProficiencyLevel> = {
  "React": "Advanced",
  "JavaScript": "Advanced",
  "HTML & CSS": "Advanced",
  "Git & Version Control": "Intermediate",
  "Python": "Intermediate",
  "Node.js": "Intermediate",
  "SQL": "Beginner",
  "TypeScript": "Beginner",
  "Statistics": "Beginner",
  "Power BI": "None",
  "Data Visualization": "Intermediate",
  "Docker": "Beginner",
  "AWS Architecture": "Beginner",
  "Testing": "None",
  "System Design": "Beginner",
  "Communication": "Intermediate"
};

export const PROFICIENCY_SCORES: Record<ProficiencyLevel, number> = {
  "None": 0,
  "Beginner": 40,
  "Intermediate": 75,
  "Advanced": 100
};

export type SkillComparison = {
  skill: string;
  studentLevel: ProficiencyLevel;
  requiredLevel: "Beginner" | "Intermediate" | "Advanced";
  studentScore: number;
  requiredScore: number;
  status: "Ready" | "Improve" | "Gap";
  gapDifference: number; // percentage difference
  importance: SkillImportance;
};

export type CareerAnalysisResult = {
  role: CareerRoleData;
  comparisons: SkillComparison[];
  overallMatch: number;
  currentReadiness: number;
  potentialReadiness: number;
  missingSkills: SkillComparison[];
  improvingSkills: SkillComparison[];
  readySkills: SkillComparison[];
  recommendedSteps: Array<{
    stepNumber: number;
    title: string;
    skill: string;
    currentLevel: ProficiencyLevel | string;
    requiredLevel: string;
    priority: "HIGH" | "MEDIUM" | "CAPSTONE";
    estimatedTime: string;
    why: string;
    type: "course" | "project";
    actionLabel: string;
    details?: string[];
  }>;
  aiExplanation: string;
};

/**
 * Computes deep comparison, match %, readiness, and personalized learning path
 * for ANY job role against a student's skills!
 */
export function analyzeCareerRole(
  role: CareerRoleData,
  studentSkills: Record<string, ProficiencyLevel> = DEFAULT_STUDENT_SKILLS,
  baseStudentReadiness: number = 82
): CareerAnalysisResult {
  const comparisons: SkillComparison[] = role.requiredSkills.map(req => {
    // Check direct match or normalized lowercase match
    let studentLevel: ProficiencyLevel = "None";
    const reqLower = req.name.toLowerCase();

    for (const [sKey, sLevel] of Object.entries(studentSkills)) {
      const keyLower = sKey.toLowerCase();
      if (keyLower === reqLower || keyLower.includes(reqLower) || reqLower.includes(keyLower)) {
        studentLevel = sLevel;
        break;
      }
    }

    const studentScore = PROFICIENCY_SCORES[studentLevel];
    const requiredScore = PROFICIENCY_SCORES[req.requiredLevel];

    let status: "Ready" | "Improve" | "Gap" = "Gap";
    if (studentScore >= requiredScore) {
      status = "Ready";
    } else if (studentScore > 0) {
      status = "Improve";
    } else {
      status = "Gap";
    }

    const gapDifference = Math.max(0, requiredScore - studentScore);

    return {
      skill: req.name,
      studentLevel,
      requiredLevel: req.requiredLevel,
      studentScore,
      requiredScore,
      status,
      gapDifference,
      importance: req.importance
    };
  });

  // Calculate Weighted Overall Match
  let totalWeight = 0;
  let earnedWeight = 0;

  comparisons.forEach(c => {
    const weight = c.importance === "Critical" ? 3 : c.importance === "High" ? 2 : 1;
    totalWeight += weight;
    const ratio = Math.min(1, c.studentScore / Math.max(1, c.requiredScore));
    earnedWeight += ratio * weight;
  });

  const overallMatch = Math.round((earnedWeight / (totalWeight || 1)) * 100);

  // Industry Readiness computation
  // Current readiness blends the student's profile baseline with role match
  const currentReadiness = Math.round(baseStudentReadiness * 0.4 + overallMatch * 0.6);

  // Potential readiness after closing all gaps: can reach 88 - 96%
  const potentialReadiness = Math.min(97, Math.max(currentReadiness + 15, Math.round(92 + (overallMatch > 80 ? 4 : 0))));

  const missingSkills = comparisons.filter(c => c.status === "Gap");
  const improvingSkills = comparisons.filter(c => c.status === "Improve");
  const readySkills = comparisons.filter(c => c.status === "Ready");

  // Generate Personalized Learning Path Steps based on actual gaps
  const steps: CareerAnalysisResult["recommendedSteps"] = [];
  let stepIndex = 1;

  // 1. High-priority missing or improving skills
  const priorityGaps = [...missingSkills, ...improvingSkills].sort((a, b) => {
    const scoreA = (a.importance === "High" ? 2 : 1) * 100 + a.gapDifference;
    const scoreB = (b.importance === "High" ? 2 : 1) * 100 + b.gapDifference;
    return scoreB - scoreA;
  });

  // Pick top 2-3 courses aligned with actual gaps
  priorityGaps.slice(0, 3).forEach(gap => {
    // Find matching course recommendation
    const matchingCourse = role.recommendedCourses.find(c =>
      c.skill.toLowerCase().includes(gap.skill.toLowerCase()) || gap.skill.toLowerCase().includes(c.skill.toLowerCase())
    );

    const title = matchingCourse ? matchingCourse.title : `${gap.skill} Fundamentals → ${gap.requiredLevel} Mastery`;
    const duration = matchingCourse ? matchingCourse.estimatedDuration : "3-4 weeks";
    const why = matchingCourse
      ? matchingCourse.why
      : `${gap.skill} is a ${gap.importance.toLowerCase()}-importance requirement for ${role.title}. Your current level is ${gap.studentLevel.toLowerCase()}, so closing this gap will rapidly advance your readiness.`;

    steps.push({
      stepNumber: stepIndex++,
      title,
      skill: gap.skill,
      currentLevel: gap.studentLevel,
      requiredLevel: gap.requiredLevel,
      priority: gap.importance === "High" ? "HIGH" : "MEDIUM",
      estimatedTime: duration,
      why,
      type: "course",
      actionLabel: "Start Learning",
      details: matchingCourse?.keyTopics || ["Core Syntax & Architecture", "Guided Hands-on Labs", "Assessment Preparation"]
    });
  });

  // If student is already ready in most skills, provide an advanced specialization step!
  if (steps.length === 0 && role.recommendedCourses[0]) {
    const c = role.recommendedCourses[0];
    steps.push({
      stepNumber: stepIndex++,
      title: c.title,
      skill: c.skill,
      currentLevel: "Advanced",
      requiredLevel: "Advanced",
      priority: "MEDIUM",
      estimatedTime: c.estimatedDuration,
      why: `You already meet basic requirements. This advanced course sharpens your edge for competitive placements.`,
      type: "course",
      actionLabel: "Start Learning",
      details: c.keyTopics
    });
  }

  // Next: Practical Capstone Project
  const capstoneProject = role.recommendedProjects[0] || {
    id: "capstone",
    title: `${role.title} Industry Portfolio Project`,
    skills: role.requiredSkills.slice(0, 4).map(s => s.name),
    difficulty: "Capstone" as const,
    estimatedTime: "3 weeks",
    why: `Demonstrates full-cycle mastery across the core requirements of the ${role.title} role.`,
    deliverables: ["Working repository", "Live deployment", "College verification evidence"]
  };

  steps.push({
    stepNumber: stepIndex++,
    title: `${capstoneProject.title} (Capstone Project)`,
    skill: capstoneProject.skills.slice(0, 3).join(", "),
    currentLevel: "In Progress",
    requiredLevel: "Production Evidence",
    priority: "CAPSTONE",
    estimatedTime: capstoneProject.estimatedTime,
    why: capstoneProject.why,
    type: "project",
    actionLabel: "Start Project",
    details: capstoneProject.deliverables
  });

  // Dynamic AI Explanation tailored to role, gaps, and profile
  let aiExplanation = "";
  if (priorityGaps.length > 0) {
    const topGapNames = priorityGaps.slice(0, 2).map(g => g.skill).join(" and ");
    const readyNames = readySkills.length > 0 ? readySkills.slice(0, 2).map(s => s.skill).join(" and ") : "";

    aiExplanation = `Based on your target role (${role.title}), current verified skills, assessment scores and project portfolio, ${topGapNames} are your highest-priority gaps. ${readyNames ? `You already have strong foundations in ${readyNames}, which gives you a great head start. ` : ""}We recommend learning ${priorityGaps[0].skill} first because it is a ${priorityGaps[0].importance.toLowerCase()}-importance requirement. After completing the foundational learning, building the "${capstoneProject.title}" project will provide verifiable evidence that boosts your Industry Readiness Score to an estimated ${potentialReadiness}/100.`;
  } else {
    aiExplanation = `Outstanding fit! Your existing verified profile covers all primary requirements for ${role.title} with a ${overallMatch}% match score. We recommend completing the Capstone Project and verifying your technical assessment to maximize your readiness score for top-tier hiring partners.`;
  }

  return {
    role,
    comparisons,
    overallMatch,
    currentReadiness,
    potentialReadiness,
    missingSkills,
    improvingSkills,
    readySkills,
    recommendedSteps: steps,
    aiExplanation
  };
}

export const CAREER_GOALS_KEY = "skillimprove-saved-career-goals";

export type SavedCareerGoal = {
  id: string;
  roleTitle: string;
  matchScore: number;
  readinessScore: number;
  savedAt: string;
  isPrimary?: boolean;
};

export const INITIAL_CAREER_GOALS: SavedCareerGoal[] = [
  { id: "goal-fe", roleTitle: "Frontend Developer", matchScore: 88, readinessScore: 84, savedAt: "Active goal", isPrimary: true },
  { id: "goal-da", roleTitle: "Data Analyst", matchScore: 68, readinessScore: 68, savedAt: "Saved yesterday" },
  { id: "goal-ai", roleTitle: "AI/ML Engineer", matchScore: 54, readinessScore: 62, savedAt: "Saved last week" },
];
