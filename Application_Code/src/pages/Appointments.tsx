import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, MapPin } from "lucide-react";

const Appointments = () => {
  const navigate = useNavigate();

  const appointments = [
    {
      id: 1,
      type: "General Checkup",
      doctor: "Dr. Sarah Johnson",
      date: "2024-11-25",
      time: "10:00 AM",
      location: "Main Clinic - Room 301"
    },
    {
      id: 2,
      type: "Follow-up Visit",
      doctor: "Dr. Michael Chen",
      date: "2024-12-02",
      time: "2:30 PM",
      location: "Cardiology Department"
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
            <CardTitle className="text-foreground">Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 border border-border rounded-lg space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">{apt.type}</h3>
                    <Button size="sm">Reschedule</Button>
                  </div>
                  <p className="text-sm text-muted-foreground">{apt.doctor}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {apt.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {apt.time}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {apt.location}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Appointments;
