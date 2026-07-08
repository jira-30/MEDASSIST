import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface HealthInsightsProps {
  documents: any[];
}

const HealthInsights = ({ documents }: HealthInsightsProps) => {
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  // Extract unique patients from documents
  const patients = Array.from(new Set(documents.map(d => {
    const summary = typeof d.summary === 'string' ? JSON.parse(d.summary) : d.summary;
    return summary?.patientName || 'Unknown Patient';
  })));

  const filterDocs = selectedPatient 
    ? documents.filter(d => {
        const summary = typeof d.summary === 'string' ? JSON.parse(d.summary) : d.summary;
        return (summary?.patientName || 'Unknown Patient') === selectedPatient;
      })
    : documents;
  const insights = [
    {
      icon: TrendingUp,
      label: "Documents Analyzed",
      value: filterDocs.length,
      trend: "Active",
      description: "Total documents uploaded",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: CheckCircle,
      label: "Complete Records",
      value: filterDocs.filter(d => d.status === "completed").length,
      trend: "Processed",
      description: "Successfully processed documents",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      icon: Clock,
      label: "Processing",
      value: filterDocs.filter(d => d.status === "processing").length,
      trend: "In Progress",
      description: "Documents currently being analyzed",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      icon: AlertCircle,
      label: "Requires Review",
      value: filterDocs.filter(d => d.status === "error").length,
      trend: "Attention",
      description: "Documents with processing errors",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
  ];

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">Health Insights</CardTitle>
        <CardDescription className="text-muted-foreground">
          Overview of your medical documents
        </CardDescription>
        {patients.length > 1 && (
          <div className="flex gap-2 mt-4 flex-wrap">
            <Button
              size="sm"
              variant={selectedPatient === null ? "default" : "outline"}
              onClick={() => setSelectedPatient(null)}
            >
              All Patients
            </Button>
            {patients.map(patient => (
              <Button
                key={patient}
                size="sm"
                variant={selectedPatient === patient ? "default" : "outline"}
                onClick={() => setSelectedPatient(patient)}
              >
                {patient}
              </Button>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {insights.map((insight) => (
            <div
              key={insight.label}
              className={`rounded-lg p-4 ${insight.bgColor} border border-border`}
            >
              <div className="flex items-center gap-3 mb-2">
                <insight.icon className={`h-5 w-5 ${insight.color}`} />
                <Badge variant="secondary" className="text-xs">
                  {insight.trend}
                </Badge>
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">
                {insight.value}
              </div>
              <div className="text-xs font-medium text-foreground">{insight.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{insight.description}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthInsights;
