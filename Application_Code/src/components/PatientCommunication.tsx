import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Phone, Video, Mail } from "lucide-react";
import { toast } from "sonner";
import MessagingDialog from "./MessagingDialog";

interface PatientCommunicationProps {
  sessionId: string | null;
}

const PatientCommunication = ({ sessionId }: PatientCommunicationProps) => {
  const [messagingOpen, setMessagingOpen] = useState(false);

  const handleCommunication = (type: string) => {
    if (type === "Secure Messaging") {
      setMessagingOpen(true);
    } else {
      toast.info(`${type} feature coming soon`);
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">Patient Communication</CardTitle>
        <CardDescription className="text-muted-foreground">
          Connect with patients through multiple channels
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          variant="outline"
          className="w-full justify-start gap-3"
          onClick={() => handleCommunication("Secure Messaging")}
        >
          <MessageSquare className="h-5 w-5 text-primary" />
          <div className="text-left flex-1">
            <div className="font-semibold text-sm">Secure Messaging</div>
            <div className="text-xs text-muted-foreground">Send encrypted messages</div>
          </div>
        </Button>
        
        <Button
          variant="outline"
          className="w-full justify-start gap-3"
          onClick={() => handleCommunication("Phone Call")}
        >
          <Phone className="h-5 w-5 text-success" />
          <div className="text-left flex-1">
            <div className="font-semibold text-sm">Phone Call</div>
            <div className="text-xs text-muted-foreground">HIPAA-compliant calls</div>
          </div>
        </Button>
        
        <Button
          variant="outline"
          className="w-full justify-start gap-3"
          onClick={() => handleCommunication("Video Consultation")}
        >
          <Video className="h-5 w-5 text-accent" />
          <div className="text-left flex-1">
            <div className="font-semibold text-sm">Video Consultation</div>
            <div className="text-xs text-muted-foreground">Schedule telehealth visits</div>
          </div>
        </Button>
        
        <Button
          variant="outline"
          className="w-full justify-start gap-3"
          onClick={() => handleCommunication("Email")}
        >
          <Mail className="h-5 w-5 text-destructive" />
          <div className="text-left flex-1">
            <div className="font-semibold text-sm">Email Updates</div>
            <div className="text-xs text-muted-foreground">Send automated summaries</div>
          </div>
        </Button>
      </CardContent>
      <MessagingDialog 
        open={messagingOpen} 
        onOpenChange={setMessagingOpen}
        sessionId={sessionId}
      />
    </Card>
  );
};

export default PatientCommunication;
