import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useTheme } from "@/contexts/ThemeProvider.tsx";
import { parentSurveyQuestions } from "@/constants/parentSurveyQuestions.ts";
import type { SurveyAnswer, SurveyQuestion, AnswerInput } from "@/types/survey.ts";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useSurveySession } from "@/hooks/useSurveySession";
import { submitAnswers } from "@/services/api";

const ParentSurveyPage = () => {
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  const { session, isSessionActive } = useSurveySession();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<SurveyAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTheme("parent");
    if (!isSessionActive) {
      // If there's no active session, redirect to the login page.
      navigate("/survey/parent/login");
    }
  }, [setTheme, isSessionActive, navigate]);

  const handleNext = () => {
    if (currentQuestionIndex < parentSurveyQuestions.length - 1) {
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
      setError("Session information is missing. Please log in again.");
      return;
    }

    setIsLoading(true);
    setError(null);

    // Format answers for the API
    const formattedAnswers: AnswerInput[] = answers.flatMap(a => {
      if (Array.isArray(a.answer)) {
        // For multi-choice questions, create an entry for each selected option
        return a.answer.map(ans => ({ questionId: a.questionId, answer: ans }));
      }
      // For single-choice questions
      return { questionId: a.questionId, answer: a.answer };
    });

    try {
      await submitAnswers(session.surveySessionId, session.participantId, formattedAnswers);
      navigate("/complete/parent");
    } catch (err) {
      setError((err as Error).message);
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

  const currentQuestion: SurveyQuestion = parentSurveyQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / parentSurveyQuestions.length) * 100;

  const renderQuestion = () => {
    const answer = answers.find(a => a.questionId === currentQuestion.id)?.answer;

    switch (currentQuestion.type) {
      case "multiple-choice-single":
        return (
          <RadioGroup
            value={answer as string}
            onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
            className="space-y-2"
          >
            {currentQuestion.options.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.id} id={option.id} />
                <Label htmlFor={option.id} className="text-base">{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      case "multiple-choice-multi":
        const currentAnswers = (answer as string[]) || [];
        return (
          <div className="space-y-2">
            {currentQuestion.options.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={option.id}
                  checked={currentAnswers.includes(option.id)}
                  onCheckedChange={(checked) => {
                    const newAnswers = checked
                      ? [...currentAnswers, option.id]
                      : currentAnswers.filter((id) => id !== option.id);
                    handleAnswerChange(currentQuestion.id, newAnswers);
                  }}
                />
                <Label htmlFor={option.id} className="text-base">{option.label}</Label>
              </div>
            ))}
          </div>
        );
      case "rating-scale":
      case "agreement-scale":
         return (
          <div className="flex flex-col sm:flex-row justify-between gap-2">
            {currentQuestion.options.map((option) => (
              <Button
                key={option.id}
                variant={answer === option.id ? "default" : "outline"}
                onClick={() => handleAnswerChange(currentQuestion.id, option.id)}
                className="flex-1"
              >
                {option.label}
              </Button>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <Progress value={progress} className="mb-4" />
          <CardTitle className="text-2xl text-center text-primary">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="min-h-[200px] flex items-center justify-center">
          <div className="w-full">{renderQuestion()}</div>
        </CardContent>
        <div className="flex justify-between p-6">
          <Button variant="outline" onClick={handlePrev} disabled={currentQuestionIndex === 0 || isLoading}>
            Previous
          </Button>
          <Button onClick={handleNext} disabled={isLoading}>
            {isLoading
              ? "Submitting..."
              : currentQuestionIndex === parentSurveyQuestions.length - 1
              ? "Submit"
              : "Next"}
          </Button>
        </div>
        {error && <p className="text-red-500 text-sm text-center pb-4">{error}</p>}
      </Card>
    </div>
  );
};

export default ParentSurveyPage;
