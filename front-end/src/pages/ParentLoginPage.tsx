import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/contexts/ThemeProvider.tsx";
import { genderOptions } from "@/constants/genderOptions.ts";
import { useSurveySession } from "@/hooks/useSurveySession";
import { initiateSurvey, joinSurvey } from "@/services/api";
import type { ParticipantInput } from "@/types/survey";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const ParentLoginPage = () => {
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  const { setSession } = useSurveySession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showJoinCode, setShowJoinCode] = useState<string | null>(null);

  // State for the "initiate" form
  const [initiateData, setInitiateData] = useState<ParticipantInput>({
    name: "",
    age: 18,
    gender: "",
    role: "Parent",
  });

  // State for the "join" form
  const [joinCode, setJoinCode] = useState("");
  const [joinData, setJoinData] = useState<ParticipantInput>({
    name: "",
    age: 18,
    gender: "",
    role: "Parent",
  });
  
  useEffect(() => {
    setTheme("parent");
  }, [setTheme]);

  const handleInitiateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setInitiateData((prev) => ({ ...prev, [id]: id === 'age' ? parseInt(value) : value }));
  };

  const handleInitiateGenderChange = (value: string) => {
    setInitiateData((prev) => ({ ...prev, gender: value }));
  };

  const handleJoinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setJoinData((prev) => ({ ...prev, [id]: id === 'age' ? parseInt(value) : value }));
  };

  const handleJoinGenderChange = (value: string) => {
    setJoinData((prev) => ({ ...prev, gender: value }));
  };

  const handleInitiate = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const data = await initiateSurvey(initiateData);
      setSession({
        surveySessionId: data.surveySessionId,
        participantId: data.participantId,
        joinCode: data.joinCode,
        role: "Parent",
      });
      // Don't navigate immediately. Show the join code instead.
      setShowJoinCode(data.joinCode);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const data = await joinSurvey({ ...joinData, joinCode });
      setSession({
        surveySessionId: data.surveySessionId,
        participantId: data.participantId,
        joinCode: joinCode,
        role: "Parent",
      });
      navigate("/survey/parent");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <Dialog open={!!showJoinCode} onOpenChange={() => setShowJoinCode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Session Created!</DialogTitle>
            <DialogDescription>
              Share this code with your child so they can join the survey.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-4xl font-bold tracking-widest text-center bg-muted rounded-md p-4">
              {showJoinCode}
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => navigate("/survey/parent")}>
              Continue to My Survey
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-primary">Parent Assessment</CardTitle>
            <CardDescription>
              Please provide your information to begin the evaluation.
              {/* Display Join Code for initiated sessions */}
              {/* This part will be improved later */}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="form" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="form">Start New</TabsTrigger>
                <TabsTrigger value="code">Join with Code</TabsTrigger>
              </TabsList>
              <TabsContent value="form">
                <form onSubmit={(e) => { e.preventDefault(); handleInitiate(); }}>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" placeholder="e.g., Jane Doe" value={initiateData.name} onChange={handleInitiateChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input id="age" type="number" min="18" placeholder="e.g., 35" value={initiateData.age} onChange={handleInitiateChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select onValueChange={handleInitiateGenderChange} value={initiateData.gender}>
                        <SelectTrigger id="gender">
                          <SelectValue placeholder="Select your gender" />
                        </SelectTrigger>
                        <SelectContent>
                          {genderOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                      {isLoading ? "Starting..." : "Start Assessment"}
                    </Button>
                  </div>
                </form>
              </TabsContent>
              <TabsContent value="code">
                <form onSubmit={(e) => { e.preventDefault(); handleJoin(); }}>
                  <div className="space-y-4 pt-4">
                    <p className="text-center text-muted-foreground">
                      Enter the join code and your details to begin.
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="joinCode">Join Code</Label>
                      <Input id="joinCode" placeholder="6-character code" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} maxLength={6} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name-join">Full Name</Label>
                      <Input id="name" placeholder="e.g., John Doe" value={joinData.name} onChange={handleJoinChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age-join">Age</Label>
                      <Input id="age" type="number" min="18" placeholder="e.g., 38" value={joinData.age} onChange={handleJoinChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender-join">Gender</Label>
                      <Select onValueChange={handleJoinGenderChange} value={joinData.gender}>
                        <SelectTrigger id="gender-join">
                          <SelectValue placeholder="Select your gender" />
                        </SelectTrigger>
                        <SelectContent>
                          {genderOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                      {isLoading ? "Joining..." : "Join Assessment"}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
            {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
            <div className="mt-6 text-center">
              <Button variant="link" onClick={() => navigate("/")}>
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ParentLoginPage;
