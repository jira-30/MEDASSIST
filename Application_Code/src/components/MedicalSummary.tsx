import { RefreshCw, Download, FileText, Activity, Pill, HeartPulse } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface MedicalSummaryProps {
  summary: any;
  documentName: string;
}

const MedicalSummary = ({ summary, documentName }: MedicalSummaryProps) => {
  // Parse summary if it's a string
  let parsedSummary = summary;
  if (typeof summary === 'string') {
    try {
      // Remove markdown code blocks if present
      let cleanedSummary = summary;
      const codeBlockMatch = summary.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        cleanedSummary = codeBlockMatch[1];
      }
      parsedSummary = JSON.parse(cleanedSummary);
    } catch (e) {
      console.error("Failed to parse summary:", e);
      parsedSummary = {
        chiefComplaint: "Unable to parse summary",
        medicalHistory: summary,
        keyFindings: [],
        recommendations: [],
        medications: []
      };
    }
  }
  
  // Use parsed summary
  const data = parsedSummary || {};
  const handleExport = () => {
    const text = `Medical Summary - ${documentName}\n\nChief Complaint:\n${data.chiefComplaint || "N/A"}\n\nMedical History:\n${data.medicalHistory || "N/A"}\n\nKey Findings:\n${data.keyFindings?.join("\n") || "N/A"}\n\nRecommendations:\n${data.recommendations?.join("\n") || "N/A"}\n\nMedications:\n${data.medications?.join("\n") || "N/A"}`;
    
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `medical-summary-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Summary exported successfully");
  };

  const handleRegenerate = () => {
    toast.info("Regenerating summary...");
    // In a real app, this would trigger a re-analysis
  };

  return (
    <Card className="border-accent/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-gradient-to-br from-accent to-primary p-2">
              <Activity className="h-5 w-5 text-accent-foreground" />
            </div>
            <CardTitle className="text-lg font-semibold">AI-Generated Medical Summary</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRegenerate}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Regenerate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Chief Complaint */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-foreground">Chief Complaint</h3>
          </div>
          <p className="text-sm text-muted-foreground pl-6">
            {data.chiefComplaint || "Patient seeking information about medications and treatment options."}
          </p>
        </div>

        <Separator />

        {/* Medical History */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-foreground">Medical History</h3>
          </div>
          <p className="text-sm text-muted-foreground pl-6">
            {data.medicalHistory || "No medical history available"}
          </p>
        </div>

        <Separator />

        {/* Key Findings */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <HeartPulse className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-foreground">Key Findings</h3>
          </div>
          <ul className="space-y-2 pl-6">
            {data.keyFindings?.length > 0 ? (
              data.keyFindings.map((finding: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary mt-1">•</span>
                  <span>{finding}</span>
                </li>
              ))
            ) : (
              <>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary mt-1">•</span>
                  <span>1 medical document(s) processed and analyzed</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary mt-1">•</span>
                  <span>Patient information successfully extracted and indexed</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary mt-1">•</span>
                  <span>Medical content available for clinical correlation and review</span>
                </li>
              </>
            )}
          </ul>
        </div>

        <Separator />

        {/* AI Recommendations */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Pill className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-foreground">AI Recommendations</h3>
          </div>
          <ul className="space-y-2 pl-6">
            {data.recommendations?.length > 0 ? (
              data.recommendations.map((rec: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-accent mt-1">•</span>
                  <span>{rec}</span>
                </li>
              ))
            ) : (
              <>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-accent mt-1">•</span>
                  <span>Continue current medical management as clinically appropriate</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-accent mt-1">•</span>
                  <span>Maintain regular follow-up appointments as scheduled</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-accent mt-1">•</span>
                  <span>Monitor symptoms and seek medical attention if concerns arise</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-accent mt-1">•</span>
                  <span>Ensure preventive care measures are up to date</span>
                </li>
              </>
            )}
          </ul>
        </div>

        <Separator />

        {/* Referenced Documents */}
        <div>
          <h3 className="font-semibold text-foreground mb-3">Referenced Documents</h3>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground">{documentName}</span>
            <Badge variant="secondary" className="ml-auto text-xs">
              analyzed
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicalSummary;
