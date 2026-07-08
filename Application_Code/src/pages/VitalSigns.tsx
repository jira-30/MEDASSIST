import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, Activity, Thermometer, Wind } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const VitalSigns = () => {
  const navigate = useNavigate();

  const heartRateData = [
    { time: "8:00", value: 72 },
    { time: "10:00", value: 75 },
    { time: "12:00", value: 78 },
    { time: "14:00", value: 74 },
    { time: "16:00", value: 76 },
  ];

  const vitals = [
    {
      icon: Heart,
      label: "Blood Pressure",
      value: "118/76",
      unit: "mmHg",
      color: "text-red-500"
    },
    {
      icon: Activity,
      label: "Heart Rate",
      value: "72",
      unit: "bpm",
      color: "text-green-500"
    },
    {
      icon: Thermometer,
      label: "Temperature",
      value: "98.6",
      unit: "°F",
      color: "text-orange-500"
    },
    {
      icon: Wind,
      label: "Respiratory Rate",
      value: "16",
      unit: "breaths/min",
      color: "text-blue-500"
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

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Current Vital Signs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {vitals.map((vital) => (
                  <div key={vital.label} className="p-4 border border-border rounded-lg">
                    <vital.icon className={`h-6 w-6 mb-2 ${vital.color}`} />
                    <p className="text-sm text-muted-foreground mb-1">{vital.label}</p>
                    <p className="text-2xl font-bold text-foreground">
                      {vital.value}
                      <span className="text-sm font-normal ml-1">{vital.unit}</span>
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Heart Rate Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={heartRateData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VitalSigns;
