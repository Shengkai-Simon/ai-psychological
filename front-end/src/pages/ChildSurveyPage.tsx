import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useTheme } from "@/contexts/ThemeProvider.tsx";
import { childSurveyQuestions } from "@/constants/childSurveyQuestions.ts";
import type { SurveyAnswer, SurveyQuestion, AnswerInput } from "@/types/survey.ts";
import { useSurveySession } from "@/hooks/useSurveySession";
import { submitAnswers } from "@/services/api";

//
// fixed cartoon theme: no external preferences

const ChildSurveyPage = () => {
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  const { session, isSessionActive } = useSurveySession();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<SurveyAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTheme("child");
    if (!isSessionActive) {
      navigate("/survey/child/login");
    }
  }, [setTheme, isSessionActive, navigate]);

  const handleNext = () => {
    if (currentQuestionIndex < childSurveyQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!session.surveySessionId || !session.participantId) {
      setError("Oops! We lost your session. Please start over.");
      return;
    }

    setIsLoading(true);
    setError(null);

    // Format answers for the API, handling both single and multi-select answers
    const formattedAnswers: AnswerInput[] = answers.flatMap(a => {
      if (Array.isArray(a.answer)) {
        return a.answer.map(ans => ({ questionId: a.questionId, answer: ans }));
      }
      return { questionId: a.questionId, answer: a.answer };
    });

    try {
      await submitAnswers(session.surveySessionId, session.participantId, formattedAnswers);
      navigate("/complete/child");
    } catch (err) {
      setError("Something went wrong! Please try submitting again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    const existingAnswerIndex = answers.findIndex(a => a.questionId === questionId);
    if (existingAnswerIndex > -1) {
      const newAnswers = [...answers];
      newAnswers[existingAnswerIndex] = { questionId, answer };
      setAnswers(newAnswers);
    } else {
      setAnswers([...answers, { questionId, answer }]);
    }
  };

  const currentQuestion: SurveyQuestion = childSurveyQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / childSurveyQuestions.length) * 100;

  const questionFontClass = "text-3xl";
  const optionFontClass = "text-xl";

  function optionIdToEmoji(id: string): string {
    const pool = ["🦄", "🐯", "🐳", "🚀", "🌈", "🦊", "🐨", "🍭", "🎈", "🛝"];
    const num = parseInt(id.replace(/\D/g, "").slice(-1) || "0", 10);
    return pool[num % pool.length];
  }

  function stageEmoji(qIndex: number): string {
    const stages = ["🌟", "🧩", "🎯", "🧠", "🎉"];
    return stages[qIndex % stages.length];
  }

  const renderQuestion = () => {
    const answer = answers.find(a => a.questionId === currentQuestion.id)?.answer;

    switch (currentQuestion.type) {
      case "multiple-choice-single":
        return (
          <div className="grid grid-cols-2 gap-3">
            {currentQuestion.options.map((option) => (
              <Button
                key={option.id}
                variant={answer === option.id ? "default" : "outline"}
                className={`h-20 ${optionFontClass} animate-in fade-in zoom-in-95 hover:scale-105 transition-transform shadow-md`}
                onClick={() => handleAnswerChange(currentQuestion.id, option.id)}
              >
                <span className="mr-2">{optionIdToEmoji(option.id)}</span>
                {option.label}
              </Button>
            ))}
          </div>
        );
      case "multiple-choice-multi":
        const currentAnswers = (answer as string[]) || [];
        const atLimit = currentQuestion.maxSelections && currentAnswers.length >= currentQuestion.maxSelections;
        return (
          <div className="grid grid-cols-2 gap-3">
            {currentQuestion.options.map((option) => {
              const isChecked = currentAnswers.includes(option.id);
              const disabled = !isChecked && !!atLimit;
              return (
                <Button
                  key={option.id}
                  variant={isChecked ? "default" : "outline"}
                  className={`h-20 ${optionFontClass} animate-in fade-in zoom-in-95 hover:scale-105 transition-transform shadow-md`}
                  onClick={() => {
                    const willSelect = !isChecked;
                    if (willSelect) {
                      if (atLimit) return;
                      handleAnswerChange(currentQuestion.id, [...currentAnswers, option.id]);
                    } else {
                      handleAnswerChange(
                        currentQuestion.id,
                        currentAnswers.filter((id) => id !== option.id)
                      );
                    }
                  }}
                  disabled={disabled}
                >
                  <span className="mr-2">{optionIdToEmoji(option.id)}</span>
                  {option.label}
                </Button>
              );
            })}
          </div>
        );
      case "rating-scale":
         return (
          <div className="flex justify-between">
            {currentQuestion.options.map((option, index) => (
              <Button
                key={option.id}
                variant={answer === option.id ? "default" : "outline"}
                onClick={() => handleAnswerChange(currentQuestion.id, option.id)}
                className={`flex-1 ${optionFontClass}`}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        );
      case "emoji-rating-scale":
        return (
          <div className="flex justify-around">
            {currentQuestion.options.map((option) => (
              <button
                key={option.id}
                className={`text-5xl p-2 rounded-full transition-transform transform hover:scale-125 ${answer === option.id ? 'bg-primary/20 scale-125' : ''}`}
                onClick={() => handleAnswerChange(currentQuestion.id, option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-2xl child:bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(255,255,255,0.9)),radial-gradient(800px_300px_at_50%_-50%,oklch(0.98_0.05_200/.6),transparent)]">
        <CardHeader>
          <Progress value={progress} className="mb-4" />
          <CardTitle className={`${questionFontClass} text-center text-primary animate-in fade-in slide-in-from-top-2`}>
            <div className="mb-3 text-4xl animate-float-slow">{stageEmoji(currentQuestionIndex)}</div>
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="min-h-[200px] flex items-center justify-center">
          <div className="w-full">{renderQuestion()}</div>
        </CardContent>
        <div className="flex justify-between p-6">
          <Button variant="outline" onClick={handlePrev} disabled={currentQuestionIndex === 0 || isLoading}>
            Go Back
          </Button>
          <Button
            className="btn-glow"
            onClick={handleNext}
            disabled={
              isLoading ||
              !answers.find(
                (a) =>
                  a.questionId === currentQuestion.id &&
                  (Array.isArray(a.answer) ? a.answer.length > 0 : a.answer)
              )
            }
          >
            {isLoading
              ? "Sending..."
              : currentQuestionIndex === childSurveyQuestions.length - 1
              ? "All Done! 🎉"
              : "Next Question!"}
          </Button>
        </div>
        {error && <p className="text-destructive text-center pb-4">{error}</p>}
      </Card>
    </div>
  );
};

export default ChildSurveyPage;
