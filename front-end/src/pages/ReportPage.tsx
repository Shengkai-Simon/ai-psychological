import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTheme } from "@/contexts/ThemeProvider.tsx";
import { useSurveySession } from "@/hooks/useSurveySession";
import { getReport } from "@/services/api";
import { Loader2 } from "lucide-react";

const radarData = [
  { subject: "Emotional Stability", child: 8, parent: 6, fullMark: 10 },
  { subject: "Social Skills", child: 7, parent: 9, fullMark: 10 },
  { subject: "Creativity", child: 9, parent: 7, fullMark: 10 },
  { subject: "Problem Solving", child: 6, parent: 8, fullMark: 10 },
  { subject: "Resilience", child: 8, parent: 7, fullMark: 10 },
];

const barData = [
  { name: "Week 1", child: 7, parent: 8 },
  { name: "Week 2", child: 6, parent: 7 },
  { name: "Week 3", child: 8, parent: 9 },
  { name: "Week 4", child: 9, parent: 8 },
];

const chartConfig = {
  child: {
    label: "Child",
    color: "var(--primary)",
  },
  parent: {
    label: "Parent",
    color: "var(--secondary)",
  },
} satisfies ChartConfig;

// Define the structure of the report content
interface ReportContent {
  multiPerspectiveAnalysis: {
    summary: string;
    keyDifferences: Array<{
      topic: string;
      childsPerspective: string;
      parentsPerspective:string;
      implication: string;
    }>;
  };
  depthAndBreadthEvaluation: {
    summary: string;
    traits: Array<{
      trait: string;
      level: string;
      evidence: string;
    }>;
  };
  parentingGuidance: Array<{
    area: string;
    advice: string;
  }>;
  visualizedData: {
    radarChart: Record<string, number>;
  };
}

const StatusIndicator = ({ status, error }: { status: string; error?: string | null }) => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-center gap-2">
          {status !== 'FAILED' && <Loader2 className="animate-spin" />}
          {status === 'PENDING' && "Waiting for all participants..."}
          {status === 'PROCESSING' && "Analyzing responses..."}
          {status === 'FAILED' && "Report Generation Failed"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          {status === 'FAILED'
            ? error || "Something went wrong. Please try starting a new survey."
            : "Your report is being generated. This might take a few moments. Please don't refresh the page."}
        </p>
      </CardContent>
    </Card>
  </div>
);

const ReportPage = () => {
  const { view } = useParams<{ view: 'parent' | 'child' }>();
  const { setTheme } = useTheme();
  const navigate = useNavigate();
  const { session, isSessionActive } = useSurveySession();

  const [status, setStatus] = useState<string>("PENDING");
  const [report, setReport] = useState<ReportContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (view === "child") setTheme("child");
    else setTheme("parent");
  }, [view, setTheme]);

  useEffect(() => {
    if (!isSessionActive || !session.surveySessionId) {
      setError("No active survey session found. Please start a new survey.");
      return;
    }

    const pollReport = async () => {
      try {
        const data = await getReport(session.surveySessionId!);
        setStatus(data.status);

        if (data.status === 'COMPLETED') {
          setReport(data.report);
        } else if (data.status === 'FAILED') {
          setError("Failed to generate the report. Please try again later.");
        } else {
          // If still pending or processing, poll again after a delay
          setTimeout(pollReport, 5000); // Poll every 5 seconds
        }
      } catch (err) {
        setError("An error occurred while fetching the report.");
      }
    };

    pollReport();
  }, [isSessionActive, session.surveySessionId]);


  if (error) {
    return <StatusIndicator status="FAILED" error={error} />;
  }
  
  if (status !== 'COMPLETED' || !report) {
    return <StatusIndicator status={status} />;
  }
  
  // Prepare data for charts
  const radarChartData = Object.entries(report.visualizedData.radarChart).map(([subject, value]) => ({
    subject,
    value,
    fullMark: 10,
  }));

  const chartConfig = {
    value: { label: "Score", color: "var(--color-primary)" },
  } satisfies ChartConfig;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary">Analysis Report</h1>
            <p className="text-muted-foreground">
              A comprehensive look at the assessment results.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/")}>Back to Home</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>AI Analysis Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{report.multiPerspectiveAnalysis.summary}</p>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Multi-perspective Analysis</CardTitle>
              <CardDescription>
                Comparing responses between child and parent.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="w-full h-[300px]">
                <RadarChart data={radarChartData}>
                  <CartesianGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Radar name="Score" dataKey="value" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.6} />
                </RadarChart>
              </ChartContainer>
            </CardContent>
          </Card>
          
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Key Differences in Perspective</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {report.multiPerspectiveAnalysis.keyDifferences.map((diff, index) => (
                <div key={index}>
                  <h3 className="font-semibold text-primary">{diff.topic}</h3>
                  <p><strong>Child's view:</strong> {diff.childsPerspective}</p>
                  <p><strong>Parent's view:</strong> {diff.parentsPerspective}</p>
                  <p><strong>Implication:</strong> {diff.implication}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Psychological Trait Evaluation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>{report.depthAndBreadthEvaluation.summary}</p>
              {report.depthAndBreadthEvaluation.traits.map((trait, index) => (
                <div key={index}>
                  <h3 className="font-semibold">{trait.trait}: <span className="text-primary">{trait.level}</span></h3>
                  <p className="text-muted-foreground text-sm">{trait.evidence}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle>Parenting Guidance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {report.parentingGuidance.map((guidance, index) => (
                <div key={index}>
                  <h3 className="font-semibold text-primary">{guidance.area}</h3>
                  <p>{guidance.advice}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
