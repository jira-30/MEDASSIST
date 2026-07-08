import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pill, Activity, Heart, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";

const QuickActions = () => {
  const navigate = useNavigate();
  
  const actions = [
    {
      icon: Pill,
      label: "Medications",
      description: "Manage prescriptions",
      color: "text-success",
      path: "/medications"
    },
    {
      icon: Activity,
      label: "Lab Results",
      description: "View test outcomes",
      color: "text-primary",
      path: "/lab-results"
    },
    {
      icon: Heart,
      label: "Vital Signs",
      description: "Track health metrics",
      color: "text-destructive",
      path: "/vital-signs"
    },
    {
      icon: Brain,
      label: "AI Insights",
      description: "Get health analysis",
      color: "text-accent",
      path: "/ai-insights"
    },
  ];

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">Quick Actions</CardTitle>
        <CardDescription className="text-muted-foreground">
          Common tasks and features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              onClick={() => navigate(action.path)}
              className="h-auto flex flex-col items-start gap-2 p-4 border-border hover:bg-accent hover:text-accent-foreground"
            >
              <action.icon className={`h-5 w-5 ${action.color}`} />
              <div className="text-left">
                <div className="font-semibold text-sm text-foreground">{action.label}</div>
                <div className="text-xs text-muted-foreground break-words">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
