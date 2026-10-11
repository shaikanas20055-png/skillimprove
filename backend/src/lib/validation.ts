import { z } from "zod";

/**
 * Server-Side Validation Schemas for SkillImprove
 */

// Login & Auth Schema
export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address")
    .max(255, "Email is too long"),
  password: z
    .string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password exceeds maximum length"),
  role: z
    .enum(["student", "industry", "college", "STUDENT", "RECRUITER", "COLLEGE_ADMIN"])
    .optional(),
});

// Firebase Token Verification Schema
export const firebaseVerifySchema = z.object({
  idToken: z
    .string({ required_error: "Firebase ID token is required" })
    .min(10, "Invalid token format"),
  role: z
    .enum(["student", "industry", "college", "STUDENT", "RECRUITER", "COLLEGE_ADMIN"])
    .optional(),
});

// Profile Update Schema
export const profileUpdateSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address").optional(),
  name: z.string().trim().min(1, "Name cannot be empty").max(100, "Name too long").optional(),
  headline: z.string().trim().max(200, "Headline too long").optional(),
  readinessScore: z.number().int().min(0).max(100).optional(),
});

// Profile Query Params Schema
export const profileQuerySchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255).optional(),
});

// Assessment Submission Schema
export const assessmentSubmitSchema = z.object({
  userId: z.string().max(128).optional(),
  assessmentId: z.string().min(1, "Assessment ID is required").max(128),
  answers: z.array(z.number().int().nonnegative()).max(100, "Too many answers submitted"),
  score: z.number().int().min(0).max(100).optional(),
});

// Opportunity Application Schema
export const opportunityApplySchema = z.object({
  userId: z.string().max(128).optional(),
  opportunityId: z.string().min(1, "Opportunity ID is required").max(128),
  company: z.string().trim().max(100).optional(),
  title: z.string().trim().max(100).optional(),
});

// AI Skill Gap Analysis Schema
export const skillGapSchema = z.object({
  currentSkills: z.array(z.string().trim().max(60)).max(50).default(["React", "JavaScript"]),
  targetRole: z.string().trim().min(1).max(100).default("Full Stack Developer"),
  readinessScore: z.number().int().min(0).max(100).default(82),
});

// AI Match Explainer Schema
export const matchExplainerSchema = z.object({
  candidateName: z.string().trim().max(100).default("Candidate"),
  roleTitle: z.string().trim().max(100).default("Software Engineer"),
  candidateSkills: z.array(z.string().trim().max(60)).max(50).default([]),
  jobSkills: z.array(z.string().trim().max(60)).max(50).default([]),
});

// Opportunity Create Schema
export const opportunityCreateSchema = z.object({
  title: z.string().trim().min(2, "Title is too short").max(120),
  company: z.string().trim().min(2, "Company is too short").max(120),
  location: z.string().trim().max(120).default("Remote"),
  type: z.string().trim().max(50).default("Full-time"),
  salary: z.string().trim().max(100).default("Competitive"),
  skills: z.union([z.string().max(500), z.array(z.string().max(60))]).optional(),
  description: z.string().trim().min(5).max(5000).default("Exciting engineering role"),
});

/**
 * Validate input with Zod and return standardized, sanitized generic error
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string; issues: string[] } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }

  // Format user-safe error summary without leaking internal paths
  const issues = result.error.errors.map((e) => {
    const field = e.path.join(".");
    return field ? `${field}: ${e.message}` : e.message;
  });

  return {
    success: false,
    error: "Invalid input provided. Please verify all required fields.",
    issues,
  };
}
