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
import { FloatingBubbles } from "@/components/ui/floating-bubbles";
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

const ChildLoginPage = () => {
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  const { setSession } = useSurveySession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showJoinCode, setShowJoinCode] = useState<string | null>(null);

  // State for the "initiate" form
  const [initiateData, setInitiateData] = useState<ParticipantInput>({
    name: "",
    age: 6,
    gender: "",
    role: "Child",
  });

  // State for the "join" form
  const [joinCode, setJoinCode] = useState("");
    const [joinData, setJoinData] = useState<ParticipantInput>({
    name: "",
    age: 6,
    gender: "",
    role: "Child",
  });

  useEffect(() => {
    setTheme("child");
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
        role: "Child",
      });
      setShowJoinCode(data.joinCode); // Show the join code
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
        role: "Child",
      });
      navigate("/survey/child");
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
            <DialogTitle>Adventure Code!</DialogTitle>
            <DialogDescription>
              Share this secret code with your parent so they can join our adventure.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-4xl font-bold tracking-widest text-center bg-muted rounded-md p-4 text-primary">
              {showJoinCode}
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => navigate("/survey/child")}>
              Continue to My Survey! 🚀
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-[radial-gradient(1000px_400px_at_15%_-10%,rgba(99,102,241,0.25),transparent),radial-gradient(900px_500px_at_90%_110%,rgba(236,72,153,0.25),transparent)]">
        <FloatingBubbles />
        {/* 角落装饰 */}
        <span className="absolute left-3 top-3 select-none text-xl opacity-70 animate-float-slow leading-none">🌈</span>
        <span className="absolute right-6 top-10 select-none text-xl opacity-70 animate-float-slower leading-none">⭐</span>
        <span className="absolute left-8 bottom-6 select-none text-xl opacity-70 animate-float-slower leading-none">🦄</span>
        <span className="absolute right-10 bottom-8 select-none text-xl opacity-70 animate-float-slow leading-none">🪐</span>
        <Card className="w-full max-w-lg mx-4 backdrop-blur-sm bg-white/85 animate-in fade-in zoom-in-95">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto mb-1 grid size-20 sm:size-24 place-items-center rounded-full bg-gradient-to-b from-amber-300 to-orange-400 text-4xl sm:text-5xl leading-none ring-4 ring-white/60 shadow-xl">🙂</div>
            <CardTitle className="text-2xl sm:text-3xl text-primary">Hi there, friend!</CardTitle>
            <CardDescription>
              Choose how you'd like to start! 🎮
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="form" className="w-full">
              <div className="mb-3 flex items-center justify-center">
                <div className="inline-flex rounded-full bg-white/70 p-1 shadow-inner">
                  <TabsList className="grid grid-cols-2 rounded-full bg-transparent p-0">
                    <TabsTrigger className="rounded-full px-4 py-2" value="form">New Friend</TabsTrigger>
                    <TabsTrigger className="rounded-full px-4 py-2" value="code">Join with Code</TabsTrigger>
                  </TabsList>
                </div>
              </div>
              <TabsContent value="form">
                <form onSubmit={(e) => { e.preventDefault(); handleInitiate(); }}>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="name-initiate">What's your name?</Label>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 select-none">💖</span>
                        <Input id="name" className="pl-9 rounded-2xl" placeholder="Type your awesome name here! ✏️" value={initiateData.name} onChange={handleInitiateChange} required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age-initiate">How old are you?</Label>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 select-none">✨</span>
                        <Input id="age" type="number" min="6" max="17" className="pl-9 rounded-2xl" placeholder="Your age (like 8, 12, or 15) 🎂" value={initiateData.age} onChange={handleInitiateChange} required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender-initiate">Tell us about yourself!</Label>
                      <Select onValueChange={handleInitiateGenderChange} value={initiateData.gender}>
                        <SelectTrigger id="gender-initiate" className="rounded-2xl">
                          <SelectValue placeholder="Pick what describes you best! 👆" />
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
                    <Button type="submit" className="w-full mt-4 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white shadow-md hover:brightness-105 btn-glow" disabled={isLoading}>
                      {isLoading ? "Starting..." : "🚀 Start Our Fun Adventure! ✨"}
                    </Button>
                  </div>
                </form>
              </TabsContent>
              <TabsContent value="code">
                <form onSubmit={(e) => { e.preventDefault(); handleJoin(); }}>
                  <div className="space-y-4 pt-4">
                     <p className="text-center text-muted-foreground">
                      Got a 6-character secret code? Enter it here!
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="joinCode">Secret Code</Label>
                      <Input id="joinCode" className="text-center tracking-widest text-lg" placeholder="ABCXYZ" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} maxLength={6} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name-join">What's your name?</Label>
                      <Input id="name" placeholder="Your name again!" value={joinData.name} onChange={handleJoinChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age-join">How old are you?</Label>
                      <Input id="age" type="number" min="6" max="17" placeholder="Your age" value={joinData.age} onChange={handleJoinChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender-join">And you are?</Label>
                      <Select onValueChange={handleJoinGenderChange} value={joinData.gender}>
                        <SelectTrigger id="gender-join">
                          <SelectValue placeholder="Pick one!" />
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
                      {isLoading ? "Joining..." : "Join the Adventure!"}
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

export default ChildLoginPage;
