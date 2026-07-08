import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ProcessingStatusProps {
  documents: any[];
}

const ProcessingStatus = ({ documents }: ProcessingStatusProps) => {
  const processingDoc = documents.find(d => d.status === "processing");
  const completedCount = documents.filter(d => d.status === "completed").length;
  const errorCount = documents.filter(d => d.status === "error").length;

  const steps = [
    { label: "Document Upload", icon: CheckCircle2, status: "complete" },
    { label: "Text Extraction", icon: processingDoc ? Loader2 : CheckCircle2, status: processingDoc ? "active" : "complete" },
    { label: "AI Analysis", icon: processingDoc ? Loader2 : CheckCircle2, status: processingDoc ? "active" : "complete" },
    { label: "Knowledge Indexing", icon: CheckCircle2, status: "complete" },
    { label: "Ready for Chat", icon: completedCount > 0 ? CheckCircle2 : Loader2, status: completedCount > 0 ? "complete" : "pending" },
  ];

  if (documents.length === 0) {
    return null;
  }

  return (
    <Card className="border-success/20">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Processing Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {processingDoc && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Processing document...</span>
              <span className="text-muted-foreground">50%</span>
            </div>
            <Progress value={50} className="h-2" />
          </div>
        )}

        <div className="space-y-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.status === "active";
            const isComplete = step.status === "complete";

            return (
              <div
                key={index}
                className="flex items-center gap-3 text-sm"
              >
                <div className={`rounded-full p-1 ${
                  isComplete
                    ? "bg-success/20 text-success"
                    : isActive
                    ? "bg-primary/20 text-primary animate-pulse-glow"
                    : "bg-muted text-muted-foreground"
                }`}>
                  <Icon className={`h-4 w-4 ${isActive ? "animate-spin" : ""}`} />
                </div>
                <span className={isComplete ? "text-foreground" : "text-muted-foreground"}>
                  {step.label}
                </span>
                {isComplete && (
                  <span className="ml-auto text-success text-xs font-medium">Complete</span>
                )}
              </div>
            );
          })}
        </div>

        {completedCount > 0 && (
          <div className="mt-4 rounded-lg bg-success/10 border border-success/20 p-3">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-success">Processing Complete</p>
                <p className="text-xs text-muted-foreground mt-1">
                  All steps completed • Document ready for analysis
                </p>
              </div>
            </div>
          </div>
        )}

        {errorCount > 0 && (
          <div className="mt-4 rounded-lg bg-destructive/10 border border-destructive/20 p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">Processing Error</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {errorCount} document{errorCount !== 1 ? "s" : ""} failed to process
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProcessingStatus;
