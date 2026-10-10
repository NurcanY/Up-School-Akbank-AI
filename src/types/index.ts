export interface InterviewerPersona {
  interviewerTitle: string;
  mindset: string;
  corePriorities: string[];
  coachingTip: string;
  potentialTraps: string[];
}

export interface StarGuide {
  situation: string;
  task: string;
  action: string;
  result: string;
}

export interface InterviewQuestion {
  id: string;
  category: string;
  difficulty: 'Kolay' | 'Orta' | 'Zorlu' | string;
  questionText: string;
  whatTheyLookFor: string;
  starGuide: StarGuide;
  recommendedKeywords: string[];
}

export interface GeneratedQuestionsResponse {
  interviewerPersona: InterviewerPersona;
  questions: InterviewQuestion[];
}

export interface StarScores {
  situationScore: number;
  taskScore: number;
  actionScore: number;
  resultScore: number;
  totalScore: number;
}

export interface StarAnalysis {
  situationAnalysis: string;
  taskAnalysis: string;
  actionAnalysis: string;
  resultAnalysis: string;
}

export interface CounterQuestion {
  interviewerTone: string;
  questionText: string;
  strategyTip: string;
}

export interface StarEvaluationResponse {
  scores: StarScores;
  starAnalysis: StarAnalysis;
  strengths: string[];
  areasForImprovement: string[];
  exemplaryAnswer: string;
  counterQuestion: CounterQuestion;
}

export interface SkillGap {
  skillName: string;
  severity: 'Kritik' | 'Yüksek' | 'Orta' | string;
  impactOnTargetRole: string;
}

export interface ImmediateNextTraining {
  trainingTitle: string;
  whyThisFirst: string;
  estimatedDuration: string;
  keyTopicsToMaster: string[];
  suggestedPlatformsOrCertifications: string[];
  projectIdeaToApplyKnowledge: string;
}

export interface SecondaryTraining {
  title: string;
  category: string;
  importanceReason: string;
}

export interface RoadmapMilestone {
  phase: string;
  timeline: string;
  objective: string;
  actionItems: string[];
  expectedDeliverable: string;
}

export interface CareerRoadmapResponse {
  executiveSummary: string;
  acquiredSkills: string[];
  skillGaps: SkillGap[];
  immediateNextTraining: ImmediateNextTraining;
  secondaryRecommendedTrainings: SecondaryTraining[];
  roadmapMilestones: RoadmapMilestone[];
  graduateOrJobSeekerAdvice: string;
}

export interface SimulationHistoryItem {
  id: string;
  timestamp: string;
  interviewerTitle: string;
  questionText: string;
  userAnswer: string;
  evaluation: StarEvaluationResponse;
}

export interface RoadmapHistoryItem {
  id: string;
  timestamp: string;
  targetCareerGoal: string;
  roadmap: CareerRoadmapResponse;
}
