import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Users, Bed, Calendar, Video, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HospitalOperationsProps {
  documents: any[];
}

const HospitalOperations = ({ documents }: HospitalOperationsProps) => {
  const navigate = useNavigate();
  const totalPatients = documents.length;
  const activeRecords = documents.filter(d => d.status === "completed").length;
  
  const metrics = [
    {
      icon: Users,
      label: "Active Patients",
      value: totalPatients.toString(),
      trend: "Total records",
      color: "text-primary"
    },
    {
      icon: Building2,
      label: "Records Processed",
      value: activeRecords.toString(),
      trend: "Completed",
      color: "text-success"
    },
    {
      icon: Building2,
      label: "System Status",
      value: "Online",
      trend: "All services operational",
      color: "text-success"
    },
    {
      icon: Calendar,
      label: "Average Processing",
      value: "2.3s",
      trend: "Per document",
      color: "text-accent"
    }
  ];

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Hospital Operations
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Real-time facility management dashboard
            </CardDescription>
          </div>
          <Button
            onClick={() => navigate("/video-call")}
            className="gap-2"
          >
            <Video className="h-4 w-4" />
            Schedule Call
          </Button>
          <Button
            onClick={() => navigate("/patient-forecast")}
            variant="outline"
            className="gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Patient Forecast
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric, idx) => (
            <div key={idx} className="p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <metric.icon className={`h-5 w-5 ${metric.color}`} />
                <span className="text-xs text-muted-foreground">{metric.label}</span>
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">{metric.value}</div>
              <Badge variant="outline" className="text-xs">
                {metric.trend}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default HospitalOperations;
