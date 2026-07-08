import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Activity, Droplet, Heart, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const LabResultsPage = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    const sessionId = localStorage.getItem("sessionId");
    if (!sessionId) return;

    const loadDocuments = async () => {
      const { data } = await supabase
        .from("document_sessions")
        .select("documents(*)")
        .eq("session_id", sessionId);

      if (data) {
        setDocuments(data.map(d => d.documents));
      }
    };

    loadDocuments();
  }, []);

  const extractLabData = () => {
    const allLabData: any[] = [];
    documents.forEach(doc => {
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
          date: new Date(doc.created_at).toLocaleDateString()
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
          date: new Date(doc.created_at).toLocaleDateString()
        });
      }
    });
    return allLabData;
  };

  const labData = extractLabData();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Lab Results - Detailed View</CardTitle>
          </CardHeader>
          <CardContent>
            {labData.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No lab results available. Upload documents to see results.
              </p>
            ) : (
              <div className="space-y-6">
                {labData.map((lab, index) => (
                  <div key={index} className="p-4 border border-border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <lab.icon className={`h-5 w-5 ${lab.color}`} />
                        <span className="font-semibold text-foreground">{lab.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{lab.date}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-foreground">
                        {lab.value} {lab.unit}
                      </span>
                      <span className="text-sm text-muted-foreground">Range: {lab.range}</span>
                    </div>
                    <Progress value={lab.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LabResultsPage;
