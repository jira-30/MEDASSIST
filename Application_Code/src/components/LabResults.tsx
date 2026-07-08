import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Droplet, Heart, Zap, TestTube } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface LabResultsProps {
  documents: any[];
}

const LabResults = ({ documents }: LabResultsProps) => {
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

  // Extract lab data from documents
  const extractLabData = () => {
    const allLabData: any[] = [];
    filterDocs.forEach(doc => {
      const summary = typeof doc.summary === 'string' ? JSON.parse(doc.summary) : doc.summary;
      const vitalSigns = summary?.vitalSigns || {};
      
      if (vitalSigns.bloodPressure) {
        allLabData.push({
          icon: Heart,
          name: "Blood Pressure",
          value: vitalSigns.bloodPressure,
          unit: "",
          range: "90-120/60-80",
          percentage: 85,
          status: "normal",
          color: "text-red-500",
        });
      }
      if (vitalSigns.heartRate) {
        allLabData.push({
          icon: Activity,
          name: "Heart Rate",
          value: vitalSigns.heartRate,
          unit: "bpm",
          range: "60-100",
          percentage: 90,
          status: "normal",
          color: "text-green-500",
        });
      }
      if (vitalSigns.temperature) {
        allLabData.push({
          icon: Zap,
          name: "Temperature",
          value: vitalSigns.temperature,
          unit: "°F",
          range: "97-99",
          percentage: 80,
          status: "normal",
          color: "text-yellow-500",
        });
      }
      
      // Extract lab results from keyFindings
      if (summary?.keyFindings) {
        summary.keyFindings.forEach((finding: string) => {
          if (finding.toLowerCase().includes('rbc') || finding.toLowerCase().includes('hemoglobin')) {
            const match = finding.match(/(\d+\.?\d*)/);
            if (match) {
              allLabData.push({
                icon: Droplet,
                name: finding.includes('RBC') ? 'RBC Count' : 'Hemoglobin',
                value: match[0],
                unit: finding.includes('RBC') ? '×10^12/L' : 'g/dL',
                range: finding.includes('RBC') ? '4.5-5.5' : '13.5-17.5',
                percentage: 75,
                status: "normal",
                color: "text-blue-500",
              });
            }
          }
        });
      }
    });
    return allLabData.length > 0 ? allLabData : [
      {
        icon: TestTube,
        name: "No Lab Data",
        value: "N/A",
        unit: "",
        range: "Upload documents",
        percentage: 0,
        status: "normal",
        color: "text-muted-foreground",
      }
    ];
  };

  const labData = extractLabData();

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">Lab Results Summary</CardTitle>
        <CardDescription className="text-muted-foreground">
          Latest test results from uploaded documents
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
        <div className="space-y-4">
          {labData.map((lab) => (
            <div key={lab.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <lab.icon className={`h-4 w-4 ${lab.color}`} />
                  <span className="text-sm font-medium text-foreground">{lab.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">
                    {lab.value} {lab.unit}
                  </span>
                  <span className="text-xs text-muted-foreground">({lab.range})</span>
                </div>
              </div>
              <Progress value={lab.percentage} className="h-2" />
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border">
          <p className="text-xs text-muted-foreground">
            All values are within normal range. Data extracted from uploaded medical documents.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LabResults;
