import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, TrendingDown, Activity, AlertTriangle } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const PatientForecast = () => {
  const navigate = useNavigate();
  const [selectedPatient, setSelectedPatient] = useState("John Doe");

  const patients = ["John Doe", "Sarah Smith", "Mike Johnson"];

  const forecasts = {
    "John Doe": {
      riskLevel: "moderate",
      predictions: [
        {
          metric: "Blood Pressure",
          current: "130/85 mmHg",
          forecast: "135/90 mmHg",
          trend: "up",
          confidence: 85,
          timeframe: "Next 3 months",
          recommendation: "Consider lifestyle modifications and monitor closely"
        },
        {
          metric: "Glucose Levels",
          current: "110 mg/dL",
          forecast: "105 mg/dL",
          trend: "down",
          confidence: 78,
          timeframe: "Next 3 months",
          recommendation: "Continue current medication regimen"
        },
        {
          metric: "Weight",
          current: "185 lbs",
          forecast: "180 lbs",
          trend: "down",
          confidence: 72,
          timeframe: "Next 3 months",
          recommendation: "Maintain diet and exercise program"
        }
      ],
      alerts: [
        "Risk of hypertension progression - recommend increased monitoring",
        "Positive trend in metabolic markers - continue current treatment"
      ]
    }
  };

  const currentForecast = forecasts[selectedPatient] || forecasts["John Doe"];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Patient Forecast</h1>
              <p className="text-sm text-muted-foreground">Predictive Health Insights</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Patient Selection */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {patients.map((patient) => (
            <Button
              key={patient}
              variant={selectedPatient === patient ? "default" : "outline"}
              onClick={() => setSelectedPatient(patient)}
            >
              {patient}
            </Button>
          ))}
        </div>

        {/* Risk Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Overall Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Badge 
                variant={currentForecast.riskLevel === "high" ? "destructive" : "secondary"}
                className="text-lg px-4 py-2 capitalize"
              >
                {currentForecast.riskLevel} Risk
              </Badge>
              <p className="text-muted-foreground">
                Based on historical data and current health trends
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Health Predictions */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          {currentForecast.predictions.map((prediction, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{prediction.metric}</span>
                  {prediction.trend === "up" ? (
                    <TrendingUp className="h-5 w-5 text-destructive" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-success" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Value</p>
                    <p className="text-lg font-semibold">{prediction.current}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Predicted Value</p>
                    <p className="text-lg font-semibold">{prediction.forecast}</p>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Confidence</span>
                    <span>{prediction.confidence}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary rounded-full h-2"
                      style={{ width: `${prediction.confidence}%` }}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Timeframe</p>
                  <p className="font-medium">{prediction.timeframe}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Recommendation</p>
                  <p className="text-sm">{prediction.recommendation}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Clinical Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {currentForecast.alerts.map((alert, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-warning mt-1">•</span>
                  <span>{alert}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PatientForecast;
