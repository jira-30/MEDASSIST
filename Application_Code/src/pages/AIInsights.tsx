import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Brain, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const AIInsights = () => {
  const navigate = useNavigate();

  const insights = [
    {
      type: "Recommendation",
      icon: CheckCircle,
      color: "text-green-500",
      title: "Regular Health Maintenance",
      description: "Based on your records, you're maintaining good overall health. Continue with regular check-ups and current medication regimen."
    },
    {
      type: "Trend Analysis",
      icon: TrendingUp,
      color: "text-blue-500",
      title: "Positive Health Trends",
      description: "Your vital signs show stable and healthy trends over the past 3 months. Blood pressure and heart rate are within optimal ranges."
    },
    {
      type: "Alert",
      icon: AlertCircle,
      color: "text-orange-500",
      title: "Upcoming Screening",
      description: "It's been 11 months since your last comprehensive blood work. Consider scheduling a routine screening in the next month."
    },
    {
      type: "AI Analysis",
      icon: Brain,
      color: "text-purple-500",
      title: "Health Pattern Recognition",
      description: "AI analysis of your medical history shows consistent adherence to prescribed medications and appointments, which is excellent for long-term health outcomes."
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

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-foreground">AI-Powered Health Insights</CardTitle>
            <CardDescription>
              Intelligent analysis of your medical records and health patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className="p-4 border border-border rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <insight.icon className={`h-6 w-6 ${insight.color}`} />
                      <h3 className="font-semibold text-foreground">{insight.title}</h3>
                    </div>
                    <Badge variant="secondary">{insight.type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Personalized Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Continue current medication schedule - adherence is excellent</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Schedule annual physical examination</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Consider adding vitamin D screening to next blood work</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIInsights;
