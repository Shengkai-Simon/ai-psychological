import type { SurveyQuestion } from "@/types/survey.ts";

export const childSurveyQuestions: SurveyQuestion[] = [
  {
    id: "child-q1",
    type: "multiple-choice-single",
    question: "What is your favorite activity at school?",
    options: [
      { id: "q1-opt1", label: "Playing during recess" },
      { id: "q1-opt2", label: "Learning new things in class" },
      { id: "q1-opt3", label: "Art and drawing" },
      { id: "q1-opt4", label: "Story time" },
    ],
  },
  {
    id: "child-q2",
    type: "multiple-choice-multi",
    question: "Which of these superpowers would you like to have? (Select up to two)",
    maxSelections: 2,
    options: [
      { id: "q2-opt1", label: "Flying" },
      { id: "q2-opt2", label: "Invisibility" },
      { id: "q2-opt3", label: "Super strength" },
      { id: "q2-opt4", label: "Talking to animals" },
    ],
  },
  {
    id: "child-q3",
    type: "rating-scale",
    question: "How much do you enjoy reading books?",
    options: [
      { id: "q3-opt1", label: "Not at all" },
      { id: "q3-opt2", label: "A little bit" },
      { id: "q3-opt3", label: "It's okay" },
      { id: "q3-opt4", label: "I like it" },
      { id: "q3-opt5", label: "I love it!" },
    ],
  },
  {
    id: "child-q4",
    type: "emoji-rating-scale",
    question: "How do you feel when you meet new friends?",
    options: [
      { id: "q4-opt1", label: "😭", value: 1 }, // Crying
      { id: "q4-opt2", label: "😟", value: 2 }, // Worried
      { id: "q4-opt3", label: "😐", value: 3 }, // Neutral
      { id: "q4-opt4", label: "😊", value: 4 }, // Smiling
      { id: "q4-opt5", label: "🤩", value: 5 }, // Star-struck
    ],
  },
    {
    id: "child-q5",
    type: "multiple-choice-single",
    question: "If you could have any pet, what would it be?",
    options: [
      { id: "q5-opt1", label: "A dog" },
      { id: "q5-opt2", label: "A cat" },
      { id: "q5-opt3", label: "A dragon" },
      { id: "q5-opt4", label: "A unicorn" },
    ],
  },
];
