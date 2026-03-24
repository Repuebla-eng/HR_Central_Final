// src/lib/types.ts

import type { Timestamp } from 'firebase/firestore';

export type UserRole = 'admin' | 'manager' | 'employee';

export type Employee = {
  id: string; // document id
  uid: string;
  name: string;
  email: string;
  jobTitle: string;
  department: string;
  status: 'Active' | 'On Leave' | 'Terminated';
  hireDate: Date; // Changed from Timestamp to Date for easier client-side handling
  avatarUrl: string;
  role?: UserRole;
};

export type CompetencyCategory = 'Técnica' | 'Blanda' | 'De Gestión' | 'Estratégica';

export type Competency = {
  id: string; // document id
  name: string;
  description: string;
  category: CompetencyCategory;
  // This is now managed in the job title's competency link
  // requiredLevel: number; 
  evidenceRequired: string;
};

// Represents the link between a JobTitle and a Competency, with a required level
export type JobTitleCompetency = {
  id: string; // competencyId
  name: string;
  description: string;
  category: CompetencyCategory;
  requiredLevel: number;
}

export type JobTitle = {
  id: string; // document id
  title: string;
  description: string;
  mission: string;
  mainFunctions?: string[];
  responsibilities?: string[];
  requirements?: string[];
  // This will now store references, not the full competency
  competencies?: { competencyId: string; requiredLevel: number }[];
};

export type CompetencyAssessment = {
  id: string; // document id (same as competencyId)
  competencyId: string;
  competencyName: string;
  achievedLevel: number;
  requiredLevel: number;
  assessmentDate: Timestamp;
  assessorId: string;
};

export type EvaluationRelation = 'Superior' | 'Par' | 'Subordinado' | 'Autoevaluación';
export type EvaluationStatus = 'Pendiente' | 'Completada';
export type EvaluationType = '360' | 'Desempeño';

// New structured survey type
export type SurveyCompetencyItem = {
    id: string;
    title: string;
    descriptions: string[];
};

export type SurveyCategory = {
    id: string;
    name: string;
    items: SurveyCompetencyItem[];
};

export type SurveyParagraphQuestion = {
    id: string;
    title: string;
};

export type Survey = {
    title: string;
    competencyCategories: SurveyCategory[];
    paragraphQuestions: SurveyParagraphQuestion[];
};

export type Evaluation = {
    id: string; // document id
    title: string; // "Evaluación de Competencias 2024" or "Evaluación de Inspector NDT Nivel 2"
    type: EvaluationType;
    cycleId: string; // e.g., '2024-H1'
    evaluadoId: string; // Employee being evaluated
    evaluadorId: string; // Employee doing the evaluation
    relation: EvaluationRelation;
    status: EvaluationStatus;
    isConfidential: boolean;
    deadline: Timestamp;
    submittedAt?: Timestamp;
    // Updated answers structure for mixed types
    answers?: {
        competencies?: {
            [competencyId: string]: {
                score: number;
                comment: string;
            }
        };
        paragraphs?: {
            [questionId: string]: string;
        }
    };
    // Denormalized data for easier display
    evaluadoName?: string;
    evaluadorName?: string;
};


export type TrainingPlan = {
  id: string; // document id
  employeeId: string;
  competencyId?: string; // Optional, may not be linked to a specific competency
  trainingReason: string; // Replaces competencyName and gapDescription
  assignedCourseId?: string;
  deadline?: Timestamp;
  status: 'Pending' | 'Completed';
};

export type Course = {
  id:string; // document id
  title: string;
  provider: string;
  url: string;
  description: string;
};

export type UserDocument = {
    id: string;
    name: string;
    url: string;
    uploadedAt: Date;
    expiresAt?: Date;
}

export type SurveyResult = {
  id: string;
  evaluatorId: string;
  evaluatedName: string;
  answers: Record<string, number>; // itemId: score
  totalScore: number;
  percentage: number;
  submittedAt: Timestamp;
  surveyTitle: string;
  originalEvaluationId: string;
}

// --- New Types for Technical Audits ---
export type TechnicalAuditType = 
    | 'Inspección con Partículas Magnéticas'
    | 'Medición de espesores con UT'
    | 'Inspección Visual y Dimensional'
    | 'Inspección con Ultrasonido'
    | 'Inspección con Tintas Penetrantes';

export type TechnicalAuditStatus = 'Pendiente' | 'Completada';

export type AuditCompetency = {
    id: string;
    statement: string;
    requirement: string;
};

export type TechnicalAudit = {
    id: string;
    auditType: TechnicalAuditType;
    status: TechnicalAuditStatus;
    
    // Section I
    evaluadoId: string;
    evaluatedName: string;
    evaluationDate: Timestamp;
    independenceCriterion: 'tipo_a' | 'tipo_b' | 'tipo_c';
    certificateNumber: string;

    // Section II
    scores: Record<string, number>; // { competencyId: score }

    // Section IV
    overallScore: number;
    finalConclusion: 'competente' | 'requiere_formacion' | 'no_competente';
    improvementActions?: string;
    evaluadorId: string; // Person who filled the form
    evaluatorName: string;
    
    // Metadata
    creatorId: string; // Person who assigned the audit
    deadline: Timestamp;
    submittedAt?: Timestamp;
};

export type LeaveRequest = {
  id: string; // document id
  requesterId: string;
  requesterName: string;
  requestType: 'hourly' | 'daily' | 'vacation';
  startDate: Timestamp;
  endDate: Timestamp;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Delegated';
  approvers: {
    operationsSuperintendent: {
      approverId: string;
      status: 'Pending' | 'Approved' | 'Rejected';
      delegatedTo?: string;
    };
    hrManager?: {
      approverId: string;
      status: 'Pending' | 'Approved' | 'Rejected';
    };
  };
  createdAt: Timestamp;
};

export type Delegation = {
  id: string; // The ID of the original approver (e.g., Superintendent's UID)
  delegateId: string; // The UID of the employee to whom the authority is delegated
  delegateName: string;
  delegatedAt: Timestamp;
  active: boolean;
};
