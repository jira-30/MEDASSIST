import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, FileText, Stethoscope, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const ClinicalWorkflow = () => {
  const handleWorkflow = (action: string) => {
    toast.info(`${action} feature coming soon`);
  };

  const workflows = [
    {
      icon: ClipboardList,
      label: "Patient Intake",
      description: "Register new patients",
      color: "text-primary",
      action: "Patient Intake"
    },
    {
      icon: Stethoscope,
      label: "Examination Notes",
      description: "Document findings",
      color: "text-success",
      action: "Examination"
    },
    {
      icon: FileText,
      label: "Prescription Orders",
      description: "Create e-prescriptions",
      color: "text-accent",
      action: "Prescription"
    },
    {
      icon: AlertTriangle,
      label: "Critical Alerts",
      description: "View urgent cases",
      color: "text-destructive",
      action: "Alerts"
    }
  ];

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">Clinical Workflow</CardTitle>
        <CardDescription className="text-muted-foreground">
          Streamlined tools for healthcare providers
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {workflows.map((workflow, idx) => (
          <Button
            key={idx}
            variant="outline"
            onClick={() => handleWorkflow(workflow.action)}
            className="h-auto flex flex-col items-start gap-2 p-4 border-border hover:bg-accent hover:text-accent-foreground"
          >
            <workflow.icon className={`h-5 w-5 ${workflow.color}`} />
            <div className="text-left">
              <div className="font-semibold text-sm text-foreground">{workflow.label}</div>
              <div className="text-xs text-muted-foreground break-words">{workflow.description}</div>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

export default ClinicalWorkflow;
