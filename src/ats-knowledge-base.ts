// SkillImprove Resume Analyzer (ATS) Knowledge Base & Engine
// Implements industry-grade ATS role profiles, synonym recognition, evidence-level weighting, and gap analysis.

export type SkillCategory =
  | "Programming Language"
  | "Framework"
  | "Library"
  | "Database"
  | "Cloud"
  | "DevOps"
  | "Testing"
  | "API"
  | "Security"
  | "Data"
  | "AI/ML"
  | "Architecture"
  | "System Design"
  | "Version Control"
  | "Development Tool"
  | "Operating System"
  | "Methodology"
  | "Domain Knowledge"
  | "Soft Skill"
  | "Certification";

export type SkillImportance = "CORE" | "IMPORTANT" | "OPTIONAL";
export type EvidenceLevel = "MENTION" | "USED" | "PROJECT" | "PROFESSIONAL_EXPERIENCE" | "ADVANCED_EVIDENCE";
export type SeniorityLevel = "Junior" | "Mid" | "Senior";

export interface EvidenceRules {
  mention: number;
  used: number;
  project: number;
  professional_experience: number;
  advanced_evidence: number;
}

export interface ATSSkill {
  canonical_skill: string;
  category: SkillCategory;
  importance: SkillImportance;
  weight: number; // 1 to 10
  aliases: string[];
  common_resume_terms: string[];
  description: string;
  minimum_expected_level: "Beginner" | "Intermediate" | "Advanced";
  evidence_rules: EvidenceRules;
}

export interface SeniorityProfile {
  level: SeniorityLevel;
  expected_experience: string;
  core_skills: string[];
  important_skills: string[];
  optional_skills: string[];
}

export interface JobRoleProfile {
  id: string;
  name: string;
  category: string;
  description: string;
  common_job_titles: string[];
  seniority_levels: SeniorityProfile[];
  skills: ATSSkill[];
  ats_keywords: string[];
  role_specific_rules: string[];
  recommended_resume_sections: string[];
}

const defaultEvidenceRules: EvidenceRules = {
  mention: 0.35,
  used: 0.65,
  project: 0.85,
  professional_experience: 1.0,
  advanced_evidence: 1.2,
};

// ============================================================================
// JOB ROLE KNOWLEDGE BASE
// ============================================================================

export const JOB_ROLES_KNOWLEDGE_BASE: JobRoleProfile[] = [
  // 1. Frontend Developer
  {
    id: "frontend-developer",
    name: "Frontend Developer",
    category: "Web Engineering",
    description: "Builds responsive, high-performance, accessible user interfaces and web applications using modern web standards and frontend frameworks.",
    common_job_titles: ["Frontend Engineer", "UI Developer", "Web Application Developer", "Client-Side Engineer", "React Developer"],
    seniority_levels: [
      {
        level: "Junior",
        expected_experience: "0 - 2 years",
        core_skills: ["HTML5", "CSS3", "JavaScript", "React", "Git", "REST APIs", "Responsive Design"],
        important_skills: ["TypeScript", "Tailwind CSS", "Redux", "Vite", "Web Accessibility (a11y)"],
        optional_skills: ["Next.js", "Jest", "GraphQL", "CI/CD"],
      },
      {
        level: "Mid",
        expected_experience: "2 - 5 years",
        core_skills: ["JavaScript", "TypeScript", "React", "State Management", "Responsive Design", "REST APIs", "Git", "Unit Testing"],
        important_skills: ["Next.js", "Performance Optimization", "Web Accessibility (a11y)", "Tailwind CSS", "CI/CD"],
        optional_skills: ["GraphQL", "Docker", "Design Systems", "Micro-frontends"],
      },
      {
        level: "Senior",
        expected_experience: "5+ years",
        core_skills: ["JavaScript", "TypeScript", "React", "Frontend Architecture", "Performance Optimization", "Web Vitals", "System Design", "Testing Strategy"],
        important_skills: ["Design Systems", "Micro-frontends", "CI/CD", "Next.js", "Technical Leadership", "Mentoring"],
        optional_skills: ["GraphQL", "Cloud Deployment", "Observability", "WebSockets"],
      },
    ],
    skills: [
      {
        canonical_skill: "JavaScript",
        category: "Programming Language",
        importance: "CORE",
        weight: 10,
        aliases: ["JS", "ECMAScript"],
        common_resume_terms: ["JavaScript ES6+", "ES6/ES7", "ECMAScript 6", "Modern JavaScript", "Vanilla JS"],
        description: "Core browser scripting language, DOM manipulation, asynchronous programming, closures and event loop.",
        minimum_expected_level: "Intermediate",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "TypeScript",
        category: "Programming Language",
        importance: "CORE",
        weight: 9,
        aliases: ["TS"],
        common_resume_terms: ["TypeScript", "Typed JavaScript", "Generics", "Type Safety", "Interface definitions"],
        description: "Static type system for scalable frontend applications.",
        minimum_expected_level: "Intermediate",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "React",
        category: "Library",
        importance: "CORE",
        weight: 10,
        aliases: ["React.js", "ReactJS"],
        common_resume_terms: ["React Hooks", "Custom Hooks", "React Functional Components", "Virtual DOM", "React 18", "React 19"],
        description: "Component-driven declarative user interface development.",
        minimum_expected_level: "Intermediate",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "HTML5",
        category: "Programming Language",
        importance: "CORE",
        weight: 9,
        aliases: ["HTML"],
        common_resume_terms: ["Semantic HTML", "HTML5 markup", "DOM hierarchy", "Web accessibility tags"],
        description: "Standard markup language and semantic structure for modern web applications.",
        minimum_expected_level: "Intermediate",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "CSS3",
        category: "Programming Language",
        importance: "CORE",
        weight: 9,
        aliases: ["CSS", "Stylesheets"],
        common_resume_terms: ["Flexbox", "CSS Grid", "Responsive Design", "Media Queries", "CSS Animations", "Sass", "SCSS"],
        description: "Responsive layouts, visual styling, animations, and cross-browser styling.",
        minimum_expected_level: "Intermediate",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "Tailwind CSS",
        category: "Framework",
        importance: "IMPORTANT",
        weight: 7,
        aliases: ["Tailwind", "TailwindCSS"],
        common_resume_terms: ["Tailwind utilities", "Tailwind CSS v3", "Tailwind CSS v4"],
        description: "Utility-first CSS framework for rapid responsive interface engineering.",
        minimum_expected_level: "Intermediate",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "REST APIs",
        category: "API",
        importance: "CORE",
        weight: 8,
        aliases: ["RESTful API", "REST", "HTTP APIs"],
        common_resume_terms: ["Axios", "Fetch API", "API integration", "JSON endpoints", "Status codes"],
        description: "Consuming asynchronous backend services, handling JSON data, token authentication and network errors.",
        minimum_expected_level: "Intermediate",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "State Management",
        category: "Architecture",
        importance: "IMPORTANT",
        weight: 8,
        aliases: ["Redux", "Zustand", "Context API", "MobX", "Recoil"],
        common_resume_terms: ["Redux Toolkit", "RTK", "React Context", "Global state", "State persistence"],
        description: "Centralized client-side application state management.",
        minimum_expected_level: "Intermediate",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "Next.js",
        category: "Framework",
        importance: "IMPORTANT",
        weight: 8,
        aliases: ["NextJS", "Next"],
        common_resume_terms: ["Server-Side Rendering (SSR)", "Static Site Generation (SSG)", "App Router", "Next.js 14", "Next.js 15"],
        description: "Full-stack React framework with SSR, ISR, and modern routing.",
        minimum_expected_level: "Intermediate",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "Git",
        category: "Version Control",
        importance: "CORE",
        weight: 8,
        aliases: ["GitHub", "GitLab", "Version Control"],
        common_resume_terms: ["Git branching", "Pull Requests", "Merge conflicts", "Git CLI"],
        description: "Source code management, collaboration, pull request reviews and version control.",
        minimum_expected_level: "Intermediate",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "Testing",
        category: "Testing",
        importance: "IMPORTANT",
        weight: 7,
        aliases: ["Jest", "Vitest", "React Testing Library", "Cypress", "Playwright"],
        common_resume_terms: ["Unit Testing", "Integration Testing", "End-to-End (E2E)", "RTL", "Snapshot tests"],
        description: "Automated frontend testing ensuring regression-free user flows.",
        minimum_expected_level: "Beginner",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "Performance Optimization",
        category: "System Design",
        importance: "IMPORTANT",
        weight: 8,
        aliases: ["Web Vitals", "Lighthouse", "Code Splitting", "Lazy Loading"],
        common_resume_terms: ["Bundle optimization", "Core Web Vitals", "Memoization", "Render optimization"],
        description: "Minimizing bundle sizes, eliminating unnecessary re-renders, and improving Time-to-Interactive.",
        minimum_expected_level: "Intermediate",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "Web Accessibility",
        category: "Methodology",
        importance: "IMPORTANT",
        weight: 7,
        aliases: ["a11y", "WCAG", "ARIA"],
        common_resume_terms: ["WCAG 2.1", "Screen readers", "Keyboard navigation", "ARIA roles"],
        description: "Designing interfaces usable by all individuals in accordance with international accessibility guidelines.",
        minimum_expected_level: "Beginner",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "GraphQL",
        category: "API",
        importance: "OPTIONAL",
        weight: 6,
        aliases: ["Apollo Client", "Relay"],
        common_resume_terms: ["GraphQL queries", "Mutations", "Apollo Provider"],
        description: "Query language for fetching exact data schemas required by client components.",
        minimum_expected_level: "Beginner",
        evidence_rules: defaultEvidenceRules,
      },
    ],
    ats_keywords: [
      "Responsive Web Design", "Cross-browser compatibility", "Component Architecture",
      "Asynchronous JavaScript", "Single Page Application (SPA)", "Web Vitals", "Semantic Markup",
      "Git Flow", "Code Review", "Modular CSS", "Design Systems"
    ],
    role_specific_rules: [
      "Credit demonstrated UI/UX component building in projects over mere syntax keyword mentions.",
      "Recognize modern React patterns (functional components, hooks) as standard industry practice.",
      "Look for proof of state management and API data fetching integration."
    ],
    recommended_resume_sections: ["Technical Skills", "Engineering Projects", "Work Experience", "Education", "Certifications"],
  },

  // 2. Backend Developer
  {
    id: "backend-developer",
    name: "Backend Developer",
    category: "Server Engineering",
    description: "Designs, scales, and maintains server-side APIs, database systems, business logic, asynchronous services, and background workers.",
    common_job_titles: ["Backend Engineer", "Server-Side Developer", "API Engineer", "Node.js Developer", "Java Developer", "Python Backend Developer"],
    seniority_levels: [
      {
        level: "Junior",
        expected_experience: "0 - 2 years",
        core_skills: ["Node.js", "Express", "SQL", "PostgreSQL", "REST APIs", "Git", "Data Modeling"],
        important_skills: ["Docker", "Authentication (JWT)", "Unit Testing", "MongoDB", "Linux CLI"],
        optional_skills: ["Redis", "AWS", "CI/CD", "GraphQL"],
      },
      {
        level: "Mid",
        expected_experience: "2 - 5 years",
        core_skills: ["Node.js", "TypeScript", "PostgreSQL", "Database Indexing", "REST APIs", "Authentication", "Docker", "Caching (Redis)"],
        important_skills: ["Microservices", "CI/CD", "AWS", "Unit & Integration Testing", "Message Queues"],
        optional_skills: ["Kubernetes", "gRPC", "Kafka", "GraphQL"],
      },
      {
        level: "Senior",
        expected_experience: "5+ years",
        core_skills: ["System Architecture", "High Concurrency", "Database Optimization", "Distributed Systems", "Cloud Infrastructure", "Security & Compliance"],
        important_skills: ["Microservices", "Kafka / RabbitMQ", "Kubernetes", "Observability (Datadog/Prometheus)", "Team Leadership"],
        optional_skills: ["Multi-region deployments", "Zero-downtime migrations"],
      },
    ],
    skills: [
      {
        canonical_skill: "Node.js",
        category: "Programming Language",
        importance: "CORE",
        weight: 10,
        aliases: ["NodeJS", "Node"],
        common_resume_terms: ["Event Loop", "V8 Engine", "NPM", "Asynchronous I/O", "Express.js", "NestJS"],
        description: "JavaScript runtime environment on the server.",
        minimum_expected_level: "Intermediate",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "SQL",
        category: "Database",
        importance: "CORE",
        weight: 9,
        aliases: ["Relational Database", "RDBMS"],
        common_resume_terms: ["PostgreSQL", "MySQL", "Queries", "Joins", "Schema Design", "Transactions", "ACID"],
        description: "Structured Query Language for querying and managing relational datasets.",
        minimum_expected_level: "Intermediate",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "PostgreSQL",
        category: "Database",
        importance: "CORE",
        weight: 9,
        aliases: ["Postgres", "PSQL"],
        common_resume_terms: ["PostgreSQL", "Indexing", "Foreign Keys", "Prisma ORM", "TypeORM"],
        description: "Open-source object-relational database system known for reliability and query performance.",
        minimum_expected_level: "Intermediate",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "REST APIs",
        category: "API",
        importance: "CORE",
        weight: 9,
        aliases: ["REST", "RESTful Web Services"],
        common_resume_terms: ["API Design", "Endpoints", "JSON", "HTTP status codes", "OpenAPI", "Swagger"],
        description: "Architecting stateless, predictable API endpoints with appropriate authentication and payload validation.",
        minimum_expected_level: "Intermediate",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "Authentication & Security",
        category: "Security",
        importance: "CORE",
        weight: 8,
        aliases: ["Auth", "JWT", "OAuth", "Bcrypt"],
        common_resume_terms: ["JSON Web Tokens", "Session Management", "Role-Based Access Control (RBAC)", "CORS", "Password Hashing"],
        description: "Securing server endpoints, implementing token encryption, session expiration, and role permissions.",
        minimum_expected_level: "Intermediate",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "Docker",
        category: "DevOps",
        importance: "IMPORTANT",
        weight: 8,
        aliases: ["Containerization", "Containers"],
        common_resume_terms: ["Dockerfile", "Docker Compose", "Multi-stage builds", "Containerized deployment"],
        description: "Packaging server applications and their dependencies into portable containers.",
        minimum_expected_level: "Intermediate",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "Redis",
        category: "Database",
        importance: "IMPORTANT",
        weight: 7,
        aliases: ["In-Memory Cache", "Cache"],
        common_resume_terms: ["Redis Caching", "Pub/Sub", "Session Store", "Key-Value store"],
        description: "Fast in-memory key-value database used for caching and rate limiting.",
        minimum_expected_level: "Beginner",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "Git",
        category: "Version Control",
        importance: "CORE",
        weight: 8,
        aliases: ["GitHub", "GitLab"],
        common_resume_terms: ["Git branching", "Merge requests", "Commit history"],
        description: "Distributed version control system.",
        minimum_expected_level: "Intermediate",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "Testing",
        category: "Testing",
        importance: "IMPORTANT",
        weight: 7,
        aliases: ["Jest", "Mocha", "Supertest", "PyTest"],
        common_resume_terms: ["Unit testing", "API Integration tests", "Test-driven development (TDD)"],
        description: "Automated verification of business logic and HTTP route responses.",
        minimum_expected_level: "Beginner",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "System Design",
        category: "System Design",
        importance: "IMPORTANT",
        weight: 8,
        aliases: ["Architecture", "Scalability"],
        common_resume_terms: ["Load balancing", "Microservices", "Horizontal scaling", "Database replication", "Fault tolerance"],
        description: "Designing resilient, high-throughput architectures.",
        minimum_expected_level: "Intermediate",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "Cloud Deployment",
        category: "Cloud",
        importance: "IMPORTANT",
        weight: 7,
        aliases: ["AWS", "Azure", "GCP", "Vercel", "Heroku"],
        common_resume_terms: ["AWS EC2", "AWS S3", "Serverless Functions", "CloudWatch"],
        description: "Deploying and managing server services on cloud infrastructure.",
        minimum_expected_level: "Beginner",
        evidence_rules: defaultEvidenceRules,
      },
    ],
    ats_keywords: [
      "Database Normalization", "Indexing", "Concurrency", "Throughput", "Latency",
      "Middleware", "ORM", "Data Persistence", "Microservices", "Rate Limiting", "Asynchronous Processing"
    ],
    role_specific_rules: [
      "Prioritize candidates demonstrating hands-on database operations (schemas, migrations, joins, queries).",
      "Look for proof of secure authentication (JWT, bcrypt) and robust API error handling."
    ],
    recommended_resume_sections: ["Technical Skills", "Backend Projects", "Work Experience", "Education", "Certifications"],
  },

  // 3. Full Stack Developer
  {
    id: "full-stack-developer",
    name: "Full Stack Developer",
    category: "Full Stack Engineering",
    description: "Builds complete web applications end-to-end, spanning frontend user interfaces, backend APIs, server infrastructure, and relational/document databases.",
    common_job_titles: ["Full Stack Engineer", "Software Engineer (Full Stack)", "MERN Stack Developer", "PERN Stack Developer"],
    seniority_levels: [
      {
        level: "Junior",
        expected_experience: "0 - 2 years",
        core_skills: ["HTML5", "CSS3", "JavaScript", "React", "Node.js", "Express", "SQL / MongoDB", "Git", "REST APIs"],
        important_skills: ["TypeScript", "Tailwind CSS", "Docker", "Authentication (JWT)", "PostgreSQL"],
        optional_skills: ["Next.js", "Redis", "Cloud Deployment", "Jest"],
      },
      {
        level: "Mid",
        expected_experience: "2 - 5 years",
        core_skills: ["TypeScript", "React", "Node.js", "PostgreSQL", "REST APIs", "Docker", "Git", "System Design"],
        important_skills: ["Next.js", "Tailwind CSS", "Redis", "CI/CD", "AWS / Cloud", "Unit & Integration Testing"],
        optional_skills: ["GraphQL", "Microservices", "Kubernetes"],
      },
      {
        level: "Senior",
        expected_experience: "5+ years",
        core_skills: ["System Architecture", "TypeScript", "React / Next.js", "Distributed Backend", "Database Architecture", "Cloud Infrastructure", "DevOps Pipeline"],
        important_skills: ["Microservices", "Performance Engineering", "Observability", "Technical Leadership", "Security Audits"],
        optional_skills: ["Multi-cloud", "Event-driven architecture"],
      },
    ],
    skills: [
      {
        canonical_skill: "JavaScript",
        category: "Programming Language",
        importance: "CORE",
        weight: 10,
        aliases: ["JS", "ECMAScript"],
        common_resume_terms: ["ES6+", "Asynchronous JS", "Event loop", "Modern JavaScript"],
        description: "Primary programming language across both browser client and server runtime.",
        minimum_expected_level: "Intermediate",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "TypeScript",
        category: "Programming Language",
        importance: "CORE",
        weight: 9,
        aliases: ["TS"],
        common_resume_terms: ["TypeScript", "Type Definitions", "Shared Types", "Generics"],
        description: "End-to-end type safety across client interfaces and server route handlers.",
        minimum_expected_level: "Intermediate",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "React",
        category: "Framework",
        importance: "CORE",
        weight: 10,
        aliases: ["React.js", "ReactJS"],
        common_resume_terms: ["React Hooks", "Custom Hooks", "React Router", "JSX"],
        description: "Frontend library for interactive Single Page Applications.",
        minimum_expected_level: "Intermediate",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "Node.js",
        category: "Programming Language",
        importance: "CORE",
        weight: 10,
        aliases: ["NodeJS", "Node"],
        common_resume_terms: ["Express", "Express.js", "NPM", "Node runtime", "NestJS"],
        description: "Server-side JavaScript environment for building high-concurrency HTTP services.",
        minimum_expected_level: "Intermediate",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "SQL / PostgreSQL",
        category: "Database",
        importance: "CORE",
        weight: 9,
        aliases: ["PostgreSQL", "Postgres", "SQL", "MySQL"],
        common_resume_terms: ["Relational Database", "Prisma", "Sequelize", "Schema design", "Foreign keys"],
        description: "Relational data modeling, querying, and ORM integration.",
        minimum_expected_level: "Intermediate",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "REST APIs",
        category: "API",
        importance: "CORE",
        weight: 9,
        aliases: ["REST", "API Design"],
        common_resume_terms: ["CRUD operations", "JSON endpoints", "Fetch / Axios", "Route handlers"],
        description: "Full-cycle API contract implementation and frontend consumption.",
        minimum_expected_level: "Intermediate",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "Git",
        category: "Version Control",
        importance: "CORE",
        weight: 8,
        aliases: ["GitHub", "GitLab"],
        common_resume_terms: ["Git repository", "Pull requests", "Version control"],
        description: "Code versioning and team collaboration.",
        minimum_expected_level: "Intermediate",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "HTML & CSS",
        category: "Programming Language",
        importance: "CORE",
        weight: 8,
        aliases: ["HTML5", "CSS3", "Responsive UI"],
        common_resume_terms: ["Flexbox", "Grid", "Tailwind CSS", "Semantic HTML"],
        description: "Markup and styling foundations for client web pages.",
        minimum_expected_level: "Intermediate",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "Docker",
        category: "DevOps",
        importance: "IMPORTANT",
        weight: 7,
        aliases: ["Containerization"],
        common_resume_terms: ["Dockerfile", "Docker Compose", "Multi-container environment"],
        description: "Containerizing frontend and backend services for reproducible environments.",
        minimum_expected_level: "Beginner",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "Next.js",
        category: "Framework",
        importance: "IMPORTANT",
        weight: 8,
        aliases: ["NextJS"],
        common_resume_terms: ["Full-stack React", "Server Components", "API Routes", "SSR"],
        description: "Unified full-stack web framework bridging frontend and backend.",
        minimum_expected_level: "Intermediate",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "Authentication",
        category: "Security",
        importance: "IMPORTANT",
        weight: 8,
        aliases: ["Auth", "JWT", "OAuth", "NextAuth"],
        common_resume_terms: ["JWT tokens", "Session cookies", "Bcrypt hashing", "Protected routes"],
        description: "Secure login flows, session handling, and access control.",
        minimum_expected_level: "Intermediate",
        evidence_rules: defaultEvidenceRules,
      },
    ],
    ats_keywords: [
      "End-to-End Development", "Client-Server Architecture", "Full Stack Lifecycle",
      "Data Persistence", "State Management", "Responsive UI", "RESTful Architecture"
    ],
    role_specific_rules: [
      "Ensure candidate demonstrates competency in BOTH frontend UI and backend API/database layers.",
      "Check for evidence of full-stack projects connecting UI to database."
    ],
    recommended_resume_sections: ["Technical Skills", "Full Stack Projects", "Work Experience", "Education", "Certifications"],
  },

  // 4. Python Developer / Data & Backend
  {
    id: "python-developer",
    name: "Python Developer",
    category: "Software Engineering",
    description: "Develops scalable server applications, data pipelines, automation scripts, and RESTful APIs utilizing Python frameworks and libraries.",
    common_job_titles: ["Python Engineer", "Backend Python Developer", "Django Developer", "FastAPI Engineer"],
    seniority_levels: [
      {
        level: "Junior",
        expected_experience: "0 - 2 years",
        core_skills: ["Python", "FastAPI / Flask", "SQL", "PostgreSQL", "Git", "REST APIs", "OOP"],
        important_skills: ["Docker", "Django", "PyTest", "Pandas", "Virtualenv"],
        optional_skills: ["Redis", "Celery", "AWS", "CI/CD"],
      },
      {
        level: "Mid",
        expected_experience: "2 - 5 years",
        core_skills: ["Python", "FastAPI / Django", "SQL", "PostgreSQL", "Docker", "Asynchronous Python (asyncio)", "PyTest", "Redis / Celery"],
        important_skills: ["Microservices", "Data Pipeline", "CI/CD", "AWS", "Security Best Practices"],
        optional_skills: ["Kubernetes", "GraphQL", "Kafka"],
      },
      {
        level: "Senior",
        expected_experience: "5+ years",
        core_skills: ["Python Architecture", "System Design", "Distributed Systems", "Database Optimization", "High Performance Python", "Cloud Infrastructure"],
        important_skills: ["Microservices", "Kafka / Celery", "Kubernetes", "Observability", "Mentoring"],
        optional_skills: ["Machine Learning deployment", "Data engineering"],
      },
    ],
    skills: [
      {
        canonical_skill: "Python",
        category: "Programming Language",
        importance: "CORE",
        weight: 10,
        aliases: ["Python 3", "Python3"],
        common_resume_terms: ["Python 3.x", "Data structures", "OOP", "Asyncio", "List comprehensions", "Generators", "Decorators"],
        description: "Versatile, high-level programming language with rich ecosystem for web and data.",
        minimum_expected_level: "Intermediate",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "FastAPI / Flask / Django",
        category: "Framework",
        importance: "CORE",
        weight: 9,
        aliases: ["FastAPI", "Django", "Flask"],
        common_resume_terms: ["Django ORM", "FastAPI pydantic", "Flask blueprints", "RESTful endpoints"],
        description: "Web framework for implementing performant backend web services and REST APIs.",
        minimum_expected_level: "Intermediate",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "SQL",
        category: "Database",
        importance: "CORE",
        weight: 9,
        aliases: ["PostgreSQL", "MySQL", "SQLite"],
        common_resume_terms: ["SQLAlchemy", "ORM", "Relational database", "Queries", "Migrations"],
        description: "Relational data persistence, schema design, and query optimization.",
        minimum_expected_level: "Intermediate",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "REST APIs",
        category: "API",
        importance: "CORE",
        weight: 9,
        aliases: ["API Development", "HTTP APIs"],
        common_resume_terms: ["JSON endpoints", "Pydantic validation", "Swagger / OpenAPI docs"],
        description: "Building well-structured API endpoints with input validation.",
        minimum_expected_level: "Intermediate",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "Docker",
        category: "DevOps",
        importance: "IMPORTANT",
        weight: 8,
        aliases: ["Containerization"],
        common_resume_terms: ["Dockerfile", "Docker Compose", "Containerized deployment"],
        description: "Containerizing Python runtimes and service dependencies.",
        minimum_expected_level: "Intermediate",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "PyTest",
        category: "Testing",
        importance: "IMPORTANT",
        weight: 7,
        aliases: ["Unit Testing", "Test Suite"],
        common_resume_terms: ["PyTest fixtures", "Mocking", "Coverage reports", "TDD"],
        description: "Automated test suite execution for Python logic and API endpoints.",
        minimum_expected_level: "Beginner",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "Git",
        category: "Version Control",
        importance: "CORE",
        weight: 8,
        aliases: ["GitHub", "GitLab"],
        common_resume_terms: ["Version control", "Branching", "Pull requests"],
        description: "Source code version control.",
        minimum_expected_level: "Intermediate",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "Celery / Redis",
        category: "Architecture",
        importance: "IMPORTANT",
        weight: 7,
        aliases: ["Task Queue", "Background Jobs"],
        common_resume_terms: ["Asynchronous worker", "Message broker", "Job scheduling"],
        description: "Offloading intensive tasks to background queue workers.",
        minimum_expected_level: "Beginner",
        evidence_rules: defaultEvidenceRules,
      },
    ],
    ats_keywords: ["Object-Oriented Programming", "Asyncio", "PEP 8", "Data Serialization", "Pydantic", "SQLAlchemy", "RESTful Web Services"],
    role_specific_rules: ["Verify candidate understands clean code principles (PEP 8) and database interaction via SQLAlchemy or Django ORM."],
    recommended_resume_sections: ["Technical Skills", "Python Projects", "Experience", "Education", "Certifications"],
  },

  // 5. DevOps / Cloud Engineer
  {
    id: "devops-cloud-engineer",
    name: "DevOps / Cloud Engineer",
    category: "Infrastructure & Cloud",
    description: "Automates CI/CD deployment pipelines, provisions infrastructure as code (IaC), manages cloud infrastructure, and monitors reliability.",
    common_job_titles: ["DevOps Engineer", "Cloud Engineer", "Site Reliability Engineer (SRE)", "Platform Engineer", "AWS Engineer"],
    seniority_levels: [
      {
        level: "Junior",
        expected_experience: "0 - 2 years",
        core_skills: ["Linux", "Docker", "Git", "Bash / Shell", "AWS / Cloud Basics", "CI/CD (GitHub Actions)"],
        important_skills: ["Terraform", "Python / Go", "Networking Basics", "Prometheus / Monitoring"],
        optional_skills: ["Kubernetes", "Ansible", "Security Best Practices"],
      },
      {
        level: "Mid",
        expected_experience: "2 - 5 years",
        core_skills: ["Docker", "Kubernetes", "Terraform", "AWS / Azure / GCP", "CI/CD Pipelines", "Linux Administration", "Infrastructure as Code"],
        important_skills: ["Monitoring (Prometheus/Grafana)", "Helm", "Security (IAM, TLS)", "Python scripting"],
        optional_skills: ["Service Mesh (Istio)", "Multi-region failover", "ArgoCD"],
      },
      {
        level: "Senior",
        expected_experience: "5+ years",
        core_skills: ["Cloud Architecture", "Kubernetes Orchestration", "Terraform at Scale", "Site Reliability (SLO/SLA)", "Zero-trust Security", "Disaster Recovery"],
        important_skills: ["GitOps (ArgoCD)", "Cost Optimization", "Observability Architecture", "Compliance"],
        optional_skills: ["Chaos Engineering", "Multi-cloud architecture"],
      },
    ],
    skills: [
      {
        canonical_skill: "Docker",
        category: "DevOps",
        importance: "CORE",
        weight: 10,
        aliases: ["Containerization", "Containers"],
        common_resume_terms: ["Dockerfile", "Docker Compose", "Multi-stage builds", "Container image optimization"],
        description: "Container virtualization packaging microservices and tools.",
        minimum_expected_level: "Intermediate",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "Kubernetes",
        category: "DevOps",
        importance: "CORE",
        weight: 9,
        aliases: ["K8s"],
        common_resume_terms: ["Pods", "Deployments", "Services", "Ingress", "Helm charts", "ConfigMaps"],
        description: "Container orchestration platform for scaling, self-healing, and deploying applications.",
        minimum_expected_level: "Intermediate",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "AWS / Cloud Platform",
        category: "Cloud",
        importance: "CORE",
        weight: 10,
        aliases: ["Amazon Web Services", "AWS", "Cloud Infrastructure", "Azure", "GCP"],
        common_resume_terms: ["EC2", "S3", "VPC", "IAM", "ECS", "EKS", "Lambda", "CloudFront"],
        description: "Public cloud hosting, IAM security, storage, and managed compute services.",
        minimum_expected_level: "Intermediate",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "CI/CD",
        category: "DevOps",
        importance: "CORE",
        weight: 9,
        aliases: ["Continuous Integration", "Continuous Deployment", "GitHub Actions", "GitLab CI", "Jenkins"],
        common_resume_terms: ["Automated testing pipeline", "Deployment workflows", "Build automation", "Artifact publishing"],
        description: "Automated pipelines ensuring continuous build validation and zero-downtime deployment.",
        minimum_expected_level: "Intermediate",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "Linux & Shell Scripting",
        category: "Operating System",
        importance: "CORE",
        weight: 9,
        aliases: ["Linux", "Bash", "Shell"],
        common_resume_terms: ["Ubuntu", "CentOS", "Debian", "Bash scripting", "Systemd", "Cron", "SSH"],
        description: "Server operating system administration, networking diagnostics, and automated scripting.",
        minimum_expected_level: "Intermediate",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "Terraform",
        category: "DevOps",
        importance: "IMPORTANT",
        weight: 8,
        aliases: ["IaC", "Infrastructure as Code"],
        common_resume_terms: ["HCL", "Terraform modules", "State management", "CloudFormation"],
        description: "Declarative infrastructure provisioning as code.",
        minimum_expected_level: "Intermediate",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "Monitoring & Observability",
        category: "DevOps",
        importance: "IMPORTANT",
        weight: 8,
        aliases: ["Prometheus", "Grafana", "Datadog", "CloudWatch"],
        common_resume_terms: ["Metrics dashboards", "Log aggregation", "Alerting rules", "Tracing"],
        description: "System health telemetry, uptime monitoring, and alerting infrastructure.",
        minimum_expected_level: "Beginner",
        evidence_rules: defaultEvidenceRules,
      },
    ],
    ats_keywords: ["Infrastructure as Code", "Container Orchestration", "High Availability", "Disaster Recovery", "Zero Downtime", "GitOps", "VPC Networking"],
    role_specific_rules: ["Verify candidate has practical experience with containers (Docker) and automated CI/CD pipelines."],
    recommended_resume_sections: ["Technical Skills", "DevOps Projects", "Certifications (AWS/CKA)", "Experience", "Education"],
  },

  // 6. Data Analyst / Data Scientist / AI Engineer
  {
    id: "ai-data-engineer",
    name: "AI & Data Engineer / Data Scientist",
    category: "AI & Data",
    description: "Transforms raw data into actionable insights, engineers machine learning models, builds generative AI pipelines, and integrates data analytics solutions.",
    common_job_titles: ["Data Scientist", "Machine Learning Engineer", "AI Engineer", "Data Analyst", "Generative AI Developer"],
    seniority_levels: [
      {
        level: "Junior",
        expected_experience: "0 - 2 years",
        core_skills: ["Python", "SQL", "Pandas", "NumPy", "Data Visualization", "Git", "Scikit-Learn"],
        important_skills: ["Jupyter", "REST APIs", "Exploratory Data Analysis (EDA)", "Feature Engineering", "Tableau / PowerBI"],
        optional_skills: ["TensorFlow", "PyTorch", "Hugging Face", "LLMs"],
      },
      {
        level: "Mid",
        expected_experience: "2 - 5 years",
        core_skills: ["Python", "SQL", "Pandas", "Scikit-Learn", "PyTorch / TensorFlow", "Data Pipelines", "Model Evaluation", "Docker"],
        important_skills: ["LangChain", "Vector Databases", "Hugging Face", "Cloud Deployment (AWS/GCP)", "Data Wrangling"],
        optional_skills: ["MLOps", "Fine-tuning", "Big Data (Spark)"],
      },
      {
        level: "Senior",
        expected_experience: "5+ years",
        core_skills: ["ML System Design", "Deep Learning Architecture", "Distributed Training", "MLOps Pipelines", "LLM Fine-tuning & RAG", "Data Governance"],
        important_skills: ["Kubeflow", "Cloud Architecture", "Model Monitoring", "Business Strategy"],
        optional_skills: ["Custom neural architectures", "High-throughput inference"],
      },
    ],
    skills: [
      {
        canonical_skill: "Python",
        category: "Programming Language",
        importance: "CORE",
        weight: 10,
        aliases: ["Python3"],
        common_resume_terms: ["Python programming", "Scripting", "Data processing"],
        description: "Primary programming language for data engineering, scientific computing, and ML modeling.",
        minimum_expected_level: "Intermediate",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "SQL",
        category: "Database",
        importance: "CORE",
        weight: 9,
        aliases: ["PostgreSQL", "Database Queries"],
        common_resume_terms: ["Complex Queries", "Aggregation", "Window Functions", "Data Extraction"],
        description: "Relational database querying for extracting and transforming analytical datasets.",
        minimum_expected_level: "Intermediate",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "Pandas & NumPy",
        category: "Library",
        importance: "CORE",
        weight: 9,
        aliases: ["Pandas", "NumPy"],
        common_resume_terms: ["DataFrames", "Vectorized operations", "Data manipulation", "Missing value handling"],
        description: "Fundamental scientific computing and data manipulation libraries.",
        minimum_expected_level: "Intermediate",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "Machine Learning",
        category: "AI/ML",
        importance: "CORE",
        weight: 9,
        aliases: ["ML", "Scikit-Learn"],
        common_resume_terms: ["Classification", "Regression", "Clustering", "Supervised Learning", "Cross-validation", "Model metrics (ROC/AUC, F1-score)"],
        description: "Statistical modeling and predictive algorithm design.",
        minimum_expected_level: "Intermediate",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "Deep Learning & PyTorch/TensorFlow",
        category: "AI/ML",
        importance: "IMPORTANT",
        weight: 8,
        aliases: ["PyTorch", "TensorFlow", "Keras"],
        common_resume_terms: ["Neural Networks", "CNN", "RNN", "Transformers", "GPU training"],
        description: "Deep learning framework for advanced neural network design.",
        minimum_expected_level: "Beginner",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "Generative AI & LLMs",
        category: "AI/ML",
        importance: "IMPORTANT",
        weight: 8,
        aliases: ["GenAI", "LLM", "LangChain", "OpenAI", "Gemini API"],
        common_resume_terms: ["Prompt Engineering", "Retrieval-Augmented Generation (RAG)", "Vector Embeddings", "Hugging Face"],
        description: "Building applications powered by Large Language Models and embedding retrieval.",
        minimum_expected_level: "Beginner",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "Data Visualization",
        category: "Data",
        importance: "IMPORTANT",
        weight: 7,
        aliases: ["Matplotlib", "Seaborn", "Plotly", "PowerBI", "Tableau"],
        common_resume_terms: ["Charts", "Exploratory charts", "Business dashboards"],
        description: "Communicating trends, distributions, and insights through graphical figures.",
        minimum_expected_level: "Beginner",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "Git",
        category: "Version Control",
        importance: "CORE",
        weight: 8,
        aliases: ["GitHub"],
        common_resume_terms: ["Version control", "Code repository"],
        description: "Version control for reproducible modeling scripts.",
        minimum_expected_level: "Intermediate",
        evidence_rules: defaultEvidenceRules,
      },
    ],
    ats_keywords: ["Exploratory Data Analysis", "Feature Engineering", "Model Accuracy", "Precision & Recall", "Vector Database", "RAG Pipeline", "Data Pipeline"],
    role_specific_rules: ["Reward candidates who show both analytical data transformation and model validation metrics."],
    recommended_resume_sections: ["Technical Skills", "AI / Data Science Projects", "Experience", "Education", "Publications"],
  },

  // 7. General Software Engineer
  {
    id: "software-engineer",
    name: "Software Engineer",
    category: "Software Engineering",
    description: "Applies computer science fundamentals, data structures, algorithms, and modular design patterns to develop maintainable software systems.",
    common_job_titles: ["Software Developer", "Associate Software Engineer", "Software Development Engineer (SDE)"],
    seniority_levels: [
      {
        level: "Junior",
        expected_experience: "0 - 2 years",
        core_skills: ["Data Structures & Algorithms", "JavaScript / Python / Java", "Git", "OOP", "SQL", "REST APIs"],
        important_skills: ["Unit Testing", "Debugging", "Clean Code", "Design Patterns"],
        optional_skills: ["Docker", "Cloud Basics", "CI/CD"],
      },
      {
        level: "Mid",
        expected_experience: "2 - 5 years",
        core_skills: ["System Design", "Core Language Mastery", "SQL / Database Modeling", "Git", "Unit & Integration Testing", "Docker"],
        important_skills: ["CI/CD", "Design Patterns", "Code Review", "Agile/Scrum"],
        optional_skills: ["Cloud Architecture", "Performance Tuning"],
      },
      {
        level: "Senior",
        expected_experience: "5+ years",
        core_skills: ["Distributed System Design", "High Availability", "Architecture Patterns", "Code Governance", "Cross-functional Leadership"],
        important_skills: ["Mentorship", "Scalability", "Security Auditing"],
        optional_skills: ["Tech Strategy", "Disaster Recovery"],
      },
    ],
    skills: [
      {
        canonical_skill: "Data Structures & Algorithms",
        category: "Programming Language",
        importance: "CORE",
        weight: 10,
        aliases: ["DSA", "Algorithms", "Data Structures"],
        common_resume_terms: ["Time Complexity", "Big O notation", "Arrays", "Trees", "Graphs", "Dynamic Programming", "LeetCode", "Problem Solving"],
        description: "Algorithmic thinking, optimization of time and space complexities.",
        minimum_expected_level: "Intermediate",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "Object-Oriented Programming",
        category: "Methodology",
        importance: "CORE",
        weight: 9,
        aliases: ["OOP", "SOLID Principles"],
        common_resume_terms: ["Encapsulation", "Inheritance", "Polymorphism", "Abstraction", "Design Patterns"],
        description: "Modular software design using classes, interfaces, and SOLID architecture principles.",
        minimum_expected_level: "Intermediate",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "Programming Languages",
        category: "Programming Language",
        importance: "CORE",
        weight: 9,
        aliases: ["Java", "Python", "C++", "TypeScript", "Go"],
        common_resume_terms: ["Core Java", "Python 3", "C++ STL", "TypeScript"],
        description: "Strong command of at least one core typed or scripted general-purpose programming language.",
        minimum_expected_level: "Intermediate",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "Git & Version Control",
        category: "Version Control",
        importance: "CORE",
        weight: 8,
        aliases: ["Git", "GitHub", "GitLab"],
        common_resume_terms: ["Version control", "Branch management", "Pull requests"],
        description: "Source code collaboration and revision tracking.",
        minimum_expected_level: "Intermediate",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "SQL & Databases",
        category: "Database",
        importance: "CORE",
        weight: 8,
        aliases: ["SQL", "Relational Database", "PostgreSQL", "MySQL"],
        common_resume_terms: ["Queries", "Joins", "Data persistence", "Indexing"],
        description: "Interacting with relational databases and persisting system state.",
        minimum_expected_level: "Intermediate",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "REST APIs",
        category: "API",
        importance: "IMPORTANT",
        weight: 8,
        aliases: ["REST", "Web Services"],
        common_resume_terms: ["HTTP Methods", "JSON", "Status Codes"],
        description: "Client-server network protocol and communication interfaces.",
        minimum_expected_level: "Beginner",
        evidence_rules: defaultEvidenceRules,
      },
      {
        canonical_skill: "Unit Testing & QA",
        category: "Testing",
        importance: "IMPORTANT",
        weight: 7,
        aliases: ["Testing", "JUnit", "Jest", "PyTest"],
        common_resume_terms: ["Test Coverage", "Unit tests", "Mocking"],
        description: "Writing automated test suites to prevent regression bugs.",
        minimum_expected_level: "Beginner",
        evidence_rules: defaultEvidenceRules,
      },
    ],
    ats_keywords: ["Big-O Complexity", "SOLID Principles", "System Design", "Agile / Scrum", "Unit Testing", "Debugging", "Code Quality"],
    role_specific_rules: ["Reward candidates who exhibit strong problem solving, algorithmic foundations, and verified projects."],
    recommended_resume_sections: ["Technical Skills", "Engineering Projects", "Work Experience", "Education", "Certifications"],
  },
];

// ============================================================================
// ATS MATCH ENGINE
// ============================================================================

export interface DetectedSkillResult {
  skill: ATSSkill;
  detectedTerm: string;
  evidenceLevel: EvidenceLevel;
  evidenceScore: number;
  evidenceSnippet?: string;
  isSeniorityCore: boolean;
}

export interface ATSAnalysisResult {
  role: JobRoleProfile;
  selectedSeniority: SeniorityLevel;
  overallScore: number;
  verdict: "Strong Match" | "Competitive Match" | "Moderate Match" | "Needs Optimization";
  scoreBreakdown: {
    coreSkillScore: number;
    importantSkillScore: number;
    evidenceStrengthScore: number;
    keywordMatchScore: number;
    seniorityFitScore: number;
  };
  matchedSkills: DetectedSkillResult[];
  missingCoreSkills: ATSSkill[];
  missingImportantSkills: ATSSkill[];
  missingOptionalSkills: ATSSkill[];
  missingKeywords: string[];
  recommendations: string[];
  resumeHighlights: {
    projectsFound: number;
    experienceFound: number;
    linksFound: string[];
    certsFound: string[];
    wordCount: number;
  };
}

export function analyzeResumeATS(
  resumeText: string,
  targetRoleId: string = "frontend-developer",
  seniority: SeniorityLevel = "Junior"
): ATSAnalysisResult {
  const role =
    JOB_ROLES_KNOWLEDGE_BASE.find((r) => r.id === targetRoleId) ||
    JOB_ROLES_KNOWLEDGE_BASE[0];

  const lowerText = resumeText.toLowerCase();
  const lines = resumeText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // Identify Section boundaries
  const sections: {
    experience: string[];
    projects: string[];
    skills: string[];
    certifications: string[];
    other: string[];
  } = {
    experience: [],
    projects: [],
    skills: [],
    certifications: [],
    other: [],
  };

  let currentSection: keyof typeof sections = "other";
  for (const line of lines) {
    const lLower = line.toLowerCase();
    if (/(?:experience|work history|employment|internship)/i.test(lLower) && lLower.length < 35) {
      currentSection = "experience";
    } else if (/(?:projects|technical projects|academic projects)/i.test(lLower) && lLower.length < 35) {
      currentSection = "projects";
    } else if (/(?:skills|technical skills|technologies|proficiencies|tools)/i.test(lLower) && lLower.length < 35) {
      currentSection = "skills";
    } else if (/(?:certifications|licenses|credentials|courses)/i.test(lLower) && lLower.length < 35) {
      currentSection = "certifications";
    } else if (/(?:education|academics|summary|objective)/i.test(lLower) && lLower.length < 35) {
      currentSection = "other";
    } else {
      sections[currentSection].push(line);
    }
  }

  const expText = sections.experience.join(" ").toLowerCase();
  const projText = sections.projects.join(" ").toLowerCase();
  const skillsText = sections.skills.join(" ").toLowerCase();
  const certsText = sections.certifications.join(" ").toLowerCase();

  // Find Links
  const linksFound: string[] = [];
  const gh = resumeText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/gi);
  if (gh) linksFound.push(...Array.from(new Set(gh)));
  const li = resumeText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/gi);
  if (li) linksFound.push(...Array.from(new Set(li)));

  // Seniority specific expectations
  const seniorityConfig =
    role.seniority_levels.find((s) => s.level === seniority) ||
    role.seniority_levels[0];

  const matchedSkills: DetectedSkillResult[] = [];
  const missingCoreSkills: ATSSkill[] = [];
  const missingImportantSkills: ATSSkill[] = [];
  const missingOptionalSkills: ATSSkill[] = [];

  // Evaluate each skill in the role knowledge base
  for (const skill of role.skills) {
    // Collect all match terms: canonical + aliases + common terms
    const allSearchTerms = [
      skill.canonical_skill,
      ...skill.aliases,
      ...skill.common_resume_terms,
    ];

    let found = false;
    let detectedTerm = "";
    let bestLevel: EvidenceLevel = "MENTION";
    let highestMultiplier = 0.35;
    let snippet = "";

    for (const term of allSearchTerms) {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`\\b${escaped}\\b`, "i");

      if (regex.test(resumeText)) {
        found = true;
        detectedTerm = term;

        // Determine evidence level based on context
        // 1. Advanced evidence: architecture, optimization, scaling, leadership
        const advRegex = new RegExp(`(?:optimized|architected|scaled|designed|spearheaded|refactored)\\s+[^.\\n]*?\\b${escaped}\\b`, "i");
        if (advRegex.test(resumeText) || (expText.includes(term.toLowerCase()) && /(?:scaled|optimized|architected)/i.test(expText))) {
          bestLevel = "ADVANCED_EVIDENCE";
          highestMultiplier = skill.evidence_rules.advanced_evidence;
          snippet = "Demonstrated advanced impact/architecture in work history.";
          break;
        }

        // 2. Professional Experience: in work experience or internship section
        if (expText.includes(term.toLowerCase())) {
          bestLevel = "PROFESSIONAL_EXPERIENCE";
          highestMultiplier = skill.evidence_rules.professional_experience;
          snippet = "Demonstrated in professional work experience / internship.";
          break;
        }

        // 3. Project: in projects section
        if (projText.includes(term.toLowerCase())) {
          if (highestMultiplier < skill.evidence_rules.project) {
            bestLevel = "PROJECT";
            highestMultiplier = skill.evidence_rules.project;
            snippet = "Demonstrated in technical engineering projects.";
          }
        }

        // 4. Used: accompanied by action verb ("built", "used", "developed", "implemented")
        const actionRegex = new RegExp(`(?:built|developed|implemented|used|utilized|engineered)\\s+[^.\\n]*?\\b${escaped}\\b`, "i");
        if (actionRegex.test(resumeText)) {
          if (highestMultiplier < skill.evidence_rules.used) {
            bestLevel = "USED";
            highestMultiplier = skill.evidence_rules.used;
            snippet = "Used actively in development implementation.";
          }
        }

        // 5. Default mention (e.g. In skills section or listed once)
        if (highestMultiplier < skill.evidence_rules.mention) {
          bestLevel = "MENTION";
          highestMultiplier = skill.evidence_rules.mention;
          snippet = "Mentioned in skills or competencies summary.";
        }
      }
    }

    const isSeniorityCore = seniorityConfig.core_skills.some(
      (s) => s.toLowerCase() === skill.canonical_skill.toLowerCase() || skill.aliases.some((a) => a.toLowerCase() === s.toLowerCase())
    );

    if (found) {
      matchedSkills.push({
        skill,
        detectedTerm,
        evidenceLevel: bestLevel,
        evidenceScore: Math.min(100, Math.round(highestMultiplier * 100)),
        evidenceSnippet: snippet,
        isSeniorityCore,
      });
    } else {
      if (skill.importance === "CORE" || isSeniorityCore) {
        missingCoreSkills.push(skill);
      } else if (skill.importance === "IMPORTANT") {
        missingImportantSkills.push(skill);
      } else {
        missingOptionalSkills.push(skill);
      }
    }
  }

  // Missing ATS keywords
  const missingKeywords: string[] = [];
  for (const kw of role.ats_keywords) {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (!new RegExp(`\\b${escaped}\\b`, "i").test(resumeText)) {
      missingKeywords.push(kw);
    }
  }

  // SCORING COMPUTATION
  // A. Core Skill Match (weight = 50%)
  const totalCoreWeight = role.skills
    .filter((s) => s.importance === "CORE")
    .reduce((acc, s) => acc + s.weight, 0);

  const matchedCoreWeight = matchedSkills
    .filter((m) => m.skill.importance === "CORE")
    .reduce((acc, m) => acc + m.skill.weight, 0);

  const coreSkillScore = totalCoreWeight > 0 ? Math.round((matchedCoreWeight / totalCoreWeight) * 100) : 100;

  // B. Important Skill Match (weight = 25%)
  const totalImpWeight = role.skills
    .filter((s) => s.importance === "IMPORTANT")
    .reduce((acc, s) => acc + s.weight, 0);

  const matchedImpWeight = matchedSkills
    .filter((m) => m.skill.importance === "IMPORTANT")
    .reduce((acc, m) => acc + m.skill.weight, 0);

  const importantSkillScore = totalImpWeight > 0 ? Math.round((matchedImpWeight / totalImpWeight) * 100) : 100;

  // C. Evidence Strength (weight = 15%)
  const avgEvidenceScore =
    matchedSkills.length > 0
      ? Math.round(matchedSkills.reduce((acc, m) => acc + m.evidenceScore, 0) / matchedSkills.length)
      : 30;

  // D. Keyword Match (weight = 10%)
  const kwScore =
    role.ats_keywords.length > 0
      ? Math.round(((role.ats_keywords.length - missingKeywords.length) / role.ats_keywords.length) * 100)
      : 80;

  // E. Seniority Fit
  const seniorityCoreCount = seniorityConfig.core_skills.length;
  const matchedSeniorityCore = matchedSkills.filter((m) => m.isSeniorityCore).length;
  const seniorityFitScore = seniorityCoreCount > 0 ? Math.round((matchedSeniorityCore / seniorityCoreCount) * 100) : 100;

  // Composite ATS Match Score
  const rawScore = Math.round(
    coreSkillScore * 0.45 +
      importantSkillScore * 0.25 +
      avgEvidenceScore * 0.15 +
      kwScore * 0.15
  );

  const overallScore = Math.min(99, Math.max(25, rawScore));

  let verdict: ATSAnalysisResult["verdict"] = "Moderate Match";
  if (overallScore >= 85) verdict = "Strong Match";
  else if (overallScore >= 72) verdict = "Competitive Match";
  else if (overallScore >= 55) verdict = "Moderate Match";
  else verdict = "Needs Optimization";

  // GENERATE ACTIONABLE RECOMMENDATIONS
  const recommendations: string[] = [];

  if (missingCoreSkills.length > 0) {
    const topMissing = missingCoreSkills.slice(0, 3).map((s) => s.canonical_skill).join(", ");
    recommendations.push(
      `Critical Core Skills Missing: Employers expecting a ${role.name} strongly prioritize ${topMissing}. Add practical evidence or completed projects featuring these.`
    );
  }

  const mentionOnly = matchedSkills.filter((m) => m.evidenceLevel === "MENTION");
  if (mentionOnly.length >= 2) {
    const skillsList = mentionOnly.slice(0, 3).map((m) => m.skill.canonical_skill).join(", ");
    recommendations.push(
      `Upgrade Evidence Strength: ${skillsList} appear only as isolated keyword mentions. An ATS and hiring manager give significantly more credit when integrated into project bullets (e.g., "Built ... using ${mentionOnly[0].skill.canonical_skill} to achieve ...").`
    );
  }

  if (missingKeywords.length > 0) {
    recommendations.push(
      `Incorporate Target ATS Keywords: Enrich your resume bullets with natural phrases like "${missingKeywords.slice(0, 3).join('", "')}".`
    );
  }

  if (linksFound.length === 0) {
    recommendations.push(
      `Add Verifiable Links: Include active GitHub repository links and LinkedIn to validate your software projects.`
    );
  }

  if (seniority === "Junior" && sections.projects.length === 0) {
    recommendations.push(
      `Include Dedicated Projects Section: For Junior ${role.name} roles, project evidence is the primary differentiator when professional experience is limited.`
    );
  }

  if (recommendations.length < 3) {
    recommendations.push(
      `Quantify Impact: Add measurable metrics to your project bullets (e.g., "reduced latency by 35%", "scaled to 500+ users").`
    );
  }

  return {
    role,
    selectedSeniority: seniority,
    overallScore,
    verdict,
    scoreBreakdown: {
      coreSkillScore,
      importantSkillScore,
      evidenceStrengthScore: avgEvidenceScore,
      keywordMatchScore: kwScore,
      seniorityFitScore,
    },
    matchedSkills,
    missingCoreSkills,
    missingImportantSkills,
    missingOptionalSkills,
    missingKeywords,
    recommendations,
    resumeHighlights: {
      projectsFound: sections.projects.length > 0 ? 2 : (resumeText.match(/project|repository|github/gi)?.length || 0),
      experienceFound: sections.experience.length > 0 ? 1 : 0,
      linksFound,
      certsFound: sections.certifications.length > 0 ? ["Found in text"] : [],
      wordCount: resumeText.split(/\s+/).length,
    },
  };
}
