import { Calendar, Activity, FileText, AlertCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface TimelineEvent {
  date: Date;
  type: "upload" | "vitals" | "diagnosis" | "medication";
  title: string;
  description: string;
  status: string;
}

interface MedicalTimelineProps {
  documents: any[];
}

const MedicalTimeline = ({ documents }: MedicalTimelineProps) => {
  // Extract timeline events from all documents
  const getTimelineEvents = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [];
    
    documents.forEach(doc => {
      // Add document upload event
      events.push({
        type: 'upload',
        date: new Date(doc.created_at),
        title: 'Document Uploaded',
        description: doc.filename,
        status: doc.status,
      });

      // Extract events from summary if available
      if (doc.summary) {
        try {
          const summary = typeof doc.summary === 'string' ? JSON.parse(doc.summary) : doc.summary;
          
          // Add vital signs as events
          if (summary.vitalSigns) {
            events.push({
              type: 'vitals',
              date: new Date(doc.created_at),
              title: 'Vital Signs Recorded',
              description: `BP: ${summary.vitalSigns.bloodPressure || 'N/A'}, HR: ${summary.vitalSigns.heartRate || 'N/A'}`,
              status: 'complete',
            });
          }

          // Add diagnosis as events
          if (summary.diagnosis) {
            events.push({
              type: 'diagnosis',
              date: new Date(doc.created_at),
              title: 'Diagnosis Recorded',
              description: summary.diagnosis,
              status: 'complete',
            });
          }
          
          // Add medications as events
          if (summary.medications && summary.medications.length > 0) {
            events.push({
              type: 'medication',
              date: new Date(doc.created_at),
              title: 'Medications Prescribed',
              description: summary.medications.join(', '),
              status: 'complete',
            });
          }
        } catch (e) {
          console.error('Error parsing summary:', e);
        }
      }
    });

    // Sort by date, most recent first
    return events.sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  const events = getTimelineEvents();

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'upload': return <FileText className="h-4 w-4 text-primary-foreground" />;
      case 'vitals': return <Activity className="h-4 w-4 text-primary-foreground" />;
      case 'diagnosis': return <AlertCircle className="h-4 w-4 text-primary-foreground" />;
      case 'medication': return <Clock className="h-4 w-4 text-primary-foreground" />;
      default: return <Activity className="h-4 w-4 text-primary-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "complete": return "bg-success";
      case "processing": return "bg-primary";
      case "pending": return "bg-muted";
      default: return "bg-border";
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Medical Timeline
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Chronological view of medical events
        </CardDescription>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No timeline events</p>
            <p className="text-xs">Upload medical documents to see patient history</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event, idx) => (
              <div key={idx} className="flex gap-4 relative">
                {/* Timeline line */}
                {idx < events.length - 1 && (
                  <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-border" />
                )}
                
                {/* Icon */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full ${getStatusColor(event.status)} flex items-center justify-center z-10`}>
                  {getEventIcon(event.type)}
                </div>
                
                {/* Event details */}
                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-sm text-foreground">{event.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {format(event.date, 'MMM d, yyyy')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MedicalTimeline;
