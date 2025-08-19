import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/contexts/ThemeProvider";
import { ConfettiBurst } from "@/components/ui/confetti";
import { KidStickers } from "@/components/ui/kid-stickers";

const CompletionPage = () => {
  const navigate = useNavigate();
  const { view } = useParams(); // 'parent' | 'child'
  const { setTheme } = useTheme();

  // 根据路由视图设置主题
  useEffect(() => {
    if (view === "child") setTheme("child");
    else setTheme("parent");
  }, [view, setTheme]);

  const message =
    view === "child"
      ? "Awesome job! Your answers are being analyzed by our friendly AI. Your report will be ready to view in just a moment."
      : "Thank you for completing the assessment. The AI is now processing the responses to generate a comprehensive report. This may take a moment.";

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <ConfettiBurst fire={true} />
      <Card className="w-full max-w-lg mx-4 text-center child:bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(255,255,255,0.9)),radial-gradient(800px_300px_at_50%_-50%,oklch(0.98_0.05_200/.6),transparent)]">
        <CardHeader>
          <CardTitle className="text-3xl text-primary animate-in fade-in slide-in-from-top-2">
            {view === 'child' ? 'All Done! ✨' : 'Assessment Submitted!'}
          </CardTitle>
          <CardDescription className="text-lg animate-in fade-in delay-150">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in zoom-in-95 delay-200">
          <Button onClick={() => navigate(`/report/${view === 'child' ? 'child' : 'parent'}`)} className="flex-1">
            Check Report Status
          </Button>
          <Button onClick={() => navigate("/")} variant="outline" className="flex-1">
            Back to Home
          </Button>
        </CardContent>
        {view === 'child' && <KidStickers className="p-6 pt-0" />}
      </Card>
    </div>
  );
};

export default CompletionPage;
