import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pill, Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Medications = () => {
  const navigate = useNavigate();

  const medications = [
    {
      id: 1,
      name: "Lisinopril",
      dosage: "10mg",
      frequency: "Once daily",
      prescribedBy: "Dr. Sarah Johnson",
      startDate: "2024-01-15",
      status: "active"
    },
    {
      id: 2,
      name: "Metformin",
      dosage: "500mg",
      frequency: "Twice daily",
      prescribedBy: "Dr. Michael Chen",
      startDate: "2024-03-20",
      status: "active"
    },
    {
      id: 3,
      name: "Aspirin",
      dosage: "81mg",
      frequency: "Once daily",
      prescribedBy: "Dr. Sarah Johnson",
      startDate: "2024-02-10",
      status: "completed"
    }
  ];

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
            <CardTitle className="text-foreground">Medications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {medications.map((med) => (
                <div
                  key={med.id}
                  className="p-4 border border-border rounded-lg space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Pill className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-semibold text-foreground">{med.name}</h3>
                        <p className="text-sm text-muted-foreground">{med.dosage} - {med.frequency}</p>
                      </div>
                    </div>
                    <Badge variant={med.status === "active" ? "default" : "secondary"}>
                      {med.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Prescribed by: {med.prescribedBy}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="h-4 w-4" />
                      Started: {med.startDate}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
              <p className="text-xs text-muted-foreground">
                Always consult your healthcare provider before making changes to your medication regimen.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Medications;
