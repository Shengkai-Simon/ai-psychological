import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-primary mb-2">AI Psychological</h1>
        <p className="text-xl text-muted-foreground">
          An assessment questionnaire for children and parents.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full px-8 items-stretch">
        <Card className="hover:shadow-lg transition-shadow h-full">
          <CardHeader>
            <CardTitle>For Children</CardTitle>
            <CardDescription>
              A fun and engaging psychological assessment.
            </CardDescription>
          </CardHeader>
          <CardFooter className="mt-auto">
            <Button size="lg" className="w-full h-10" onClick={() => navigate("/survey/child/login")}>
              Start Child Survey
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-lg transition-shadow h-full">
          <CardHeader>
            <CardTitle>For Parents</CardTitle>
            <CardDescription>
              A professional and insightful evaluation.
            </CardDescription>
          </CardHeader>
          <CardFooter className="mt-auto">
            <Button size="lg" className="w-full h-10" onClick={() => navigate("/survey/parent/login")}>
              Start Parent Survey
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-lg transition-shadow h-full">
          <CardHeader>
            <CardTitle>View Report</CardTitle>
            <CardDescription>
              Check the comprehensive analysis report (Parent / Child).
            </CardDescription>
          </CardHeader>
          <CardFooter className="mt-auto">
            <div className="grid grid-cols-2 gap-2 w-full">
              <Button size="lg" className="h-10" onClick={() => navigate("/report/parent")}>
                Parent Report
              </Button>
              <Button size="lg" className="h-10" onClick={() => navigate("/report/child")}>
                Child Report
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
