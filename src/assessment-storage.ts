import { useEffect, useState } from "react";
import { AssessmentQuestion, DifficultyLevel, getAdaptiveDifficulty } from "./assessment-roles";

export interface SkillPerformanceMetric {
  skill: string;
  correct: number;
  total: number;
  percentage: number;
}

export interface AssessmentAttempt {
  id: string;
  roleId: string;
  roleTitle: string;
  difficulty: DifficultyLevel;
  totalQuestions: number;
  score: number; // 0 - 100
  passed: boolean;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  timeSpentSeconds: number; // e.g. 480 out of 600
  completedAt: string;
  questions: AssessmentQuestion[];
  answers: Record<number, string>;
  skillPerformance: SkillPerformanceMetric[];
  weakSkills: string[];
  recommendedTopics: string[];
}

export interface RoleAssessmentMeta {
  roleId: string;
  isDone: boolean;
  latestScore?: number;
  highestScore?: number;
  currentDifficulty: DifficultyLevel;
  attemptCount: number;
  lastCompletedAt?: string;
}

export const ASSESSMENT_STORAGE_KEY = "skillimprove-assessment-attempts-v2";
export const ROLE_META_KEY = "skillimprove-assessment-role-meta-v2";
export const ACTIVE_SESSION_KEY = "skillimprove-active-assessment-session-v2";
export const ASSESSMENT_EVENT = "skillimprove-assessment-updated-v2";

/**
 * Seed initial completed assessment records so student sees active progress on initial load
 */
const defaultRoleMeta: Record<string, RoleAssessmentMeta> = {
  "frontend-developer": {
    roleId: "frontend-developer",
    isDone: true,
    latestScore: 84,
    highestScore: 88,
    currentDifficulty: "Advanced",
    attemptCount: 2,
    lastCompletedAt: "2026-10-08T14:30:00.000Z",
  },
  "full-stack-developer": {
    roleId: "full-stack-developer",
    isDone: true,
    latestScore: 78,
    highestScore: 78,
    currentDifficulty: "Mixed",
    attemptCount: 1,
    lastCompletedAt: "2026-10-07T11:15:00.000Z",
  },
};

export function getStoredRoleMeta(): Record<string, RoleAssessmentMeta> {
  try {
    const raw = localStorage.getItem(ROLE_META_KEY);
    if (!raw) return defaultRoleMeta;
    const parsed = JSON.parse(raw);
    return { ...defaultRoleMeta, ...parsed };
  } catch {
    return defaultRoleMeta;
  }
}

export function saveRoleMeta(map: Record<string, RoleAssessmentMeta>) {
  try {
    localStorage.setItem(ROLE_META_KEY, JSON.stringify(map));
    window.dispatchEvent(new Event(ASSESSMENT_EVENT));
  } catch (err) {
    console.warn("Failed to persist role meta", err);
  }
}

export function getStoredAttempts(): AssessmentAttempt[] {
  try {
    const raw = localStorage.getItem(ASSESSMENT_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) || [];
  } catch {
    return [];
  }
}

export function saveAssessmentAttempt(attempt: AssessmentAttempt) {
  try {
    // 1. Save attempt record
    const list = getStoredAttempts();
    const updatedList = [attempt, ...list];
    localStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify(updatedList));

    // 2. Update role meta
    const metaMap = getStoredRoleMeta();
    const prev = metaMap[attempt.roleId];
    const prevHighest = prev?.highestScore || 0;
    const nextHighest = Math.max(prevHighest, attempt.score);

    // Calculate next adaptive difficulty
    const nextDifficulty = getAdaptiveDifficulty(attempt.score);

    metaMap[attempt.roleId] = {
      roleId: attempt.roleId,
      isDone: true,
      latestScore: attempt.score,
      highestScore: nextHighest,
      currentDifficulty: nextDifficulty,
      attemptCount: (prev?.attemptCount || 0) + 1,
      lastCompletedAt: attempt.completedAt,
    };

    saveRoleMeta(metaMap);

    // 3. Clear active session if any
    localStorage.removeItem(ACTIVE_SESSION_KEY);

    // 4. Asynchronously notify backend database if available
    syncAttemptToBackend(attempt).catch(() => {
      /* Safe fallback to client storage */
    });

    window.dispatchEvent(new Event(ASSESSMENT_EVENT));
  } catch (err) {
    console.error("Failed to save assessment attempt", err);
  }
}

async function syncAttemptToBackend(attempt: AssessmentAttempt) {
  try {
    await fetch("/api/assessments/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assessmentId: attempt.roleId,
        score: attempt.score,
        passed: attempt.passed,
        answersJson: JSON.stringify({
          roleTitle: attempt.roleTitle,
          difficulty: attempt.difficulty,
          correctCount: attempt.correctCount,
          timeSpentSeconds: attempt.timeSpentSeconds,
        }),
      }),
    });
  } catch {
    // Backend offline fallback handled cleanly
  }
}

export function getLatestAttemptForRole(roleId: string): AssessmentAttempt | null {
  const list = getStoredAttempts();
  return list.find((a) => a.roleId === roleId) || null;
}

export function getAllAttemptsForRole(roleId: string): AssessmentAttempt[] {
  const list = getStoredAttempts();
  return list.filter((a) => a.roleId === roleId);
}

export function useAssessmentRoleMeta() {
  const [meta, setMeta] = useState<Record<string, RoleAssessmentMeta>>(getStoredRoleMeta);

  useEffect(() => {
    const update = () => setMeta(getStoredRoleMeta());
    window.addEventListener(ASSESSMENT_EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(ASSESSMENT_EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);

  return meta;
}
