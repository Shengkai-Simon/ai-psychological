import type { SurveyQuestion } from "@/types/survey.ts";

export const parentSurveyQuestions: SurveyQuestion[] = [
  {
    id: "parent-q1",
    type: "multiple-choice-single",
    question: "How often do you set aside dedicated time for family activities each week?",
    options: [
      { id: "q1-opt1", label: "Daily" },
      { id: "q1-opt2", label: "A few times a week" },
      { id: "q1-opt3", label: "Once a week" },
      { id: "q1-opt4", label: "Rarely or never" },
    ],
  },
  {
    id: "parent-q2",
    type: "agreement-scale",
    question: "Statement: 'I find it easy to understand my child's emotional needs.'",
    options: [
      { id: "q2-opt1", label: "Strongly Disagree" },
      { id: "q2-opt2", label: "Disagree" },
      { id: "q2-opt3", label: "Neutral" },
      { id: "q2-opt4", label: "Agree" },
      { id: "q2-opt5", label: "Strongly Agree" },
    ],
  },
  {
    id: "parent-q3",
    type: "multiple-choice-multi",
    question: "Which of the following parenting resources have you found helpful? (Select all that apply)",
    options: [
      { id: "q3-opt1", label: "Parenting books or articles" },
      { id: "q3-opt2", label: "Online forums or social media groups" },
      { id: "q3-opt3", label: "Advice from family or friends" },
      { id: "q3-opt4", label: "Workshops or parenting classes" },
      { id: "q3-opt5", label: "Professional counseling or therapy" },
    ],
  },
  {
    id: "parent-q4",
    type: "rating-scale",
    question: "On a scale of 1 to 5, how confident are you in managing your child's screen time?",
    options: [
      { id: "q4-opt1", label: "1 (Not Confident)" },
      { id: "q4-opt2", label: "2" },
      { id: "q4-opt3", label: "3 (Somewhat Confident)" },
      { id: "q4-opt4", label: "4" },
      { id: "q4-opt5", label: "5 (Very Confident)" },
    ],
  },
];
