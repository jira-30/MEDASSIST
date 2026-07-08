import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Video } from "lucide-react";
import { toast } from "sonner";
import ThemeToggle from "@/components/ThemeToggle";

const JoinCall = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const callId = searchParams.get("id");
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleJoinCall = () => {
    if (!name.trim() || !email.trim()) {
      toast.error("Please enter your name and email");
      return;
    }

    if (!email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }

    // Store guest info and navigate to video call
    navigate(`/video-call?callId=${callId}&guestName=${encodeURIComponent(name)}&guestEmail=${encodeURIComponent(email)}`);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4">
            <Video className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Join Video Call</CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter your details to join the meeting
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {callId && (
            <p className="text-xs text-muted-foreground">
              Call ID: {callId}
            </p>
          )}

          <Button 
            onClick={handleJoinCall}
            className="w-full"
            size="lg"
          >
            Join Call
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default JoinCall;
