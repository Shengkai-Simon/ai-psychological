export type QuestionType =
  | "multiple-choice-single"
  | "multiple-choice-multi"
  | "rating-scale"
  | "emoji-rating-scale"
  | "agreement-scale";

export type QuestionOption = {
  id: string;
  label: string;
  value?: number | string;
};

export type SurveyQuestion = {
  id: string;
  type: QuestionType;
  question: string;
  options: QuestionOption[];
  maxSelections?: number;
};

export type SurveyAnswer = {
  questionId: string;
  answer: string | string[];
};

// --- API Request Payloads ---

export type ParticipantInput = {
  name: string;
  age: number;
  gender: string;
  role: "Parent" | "Child";
};

export type JoinSurveyInput = ParticipantInput & {
  joinCode: string;
};

export type AnswerInput = {
  questionId: string;
  answer: string;
};