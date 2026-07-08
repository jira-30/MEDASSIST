import { FileText, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RecentDocumentsProps {
  documents: any[];
  onSelectDocument: (doc: any) => void;
  selectedDocument: any;
}

const RecentDocuments = ({ documents, onSelectDocument, selectedDocument }: RecentDocumentsProps) => {
  const handleDelete = async (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    
    const { error } = await supabase
      .from("documents")
      .delete()
      .eq("id", docId);
    
    if (error) {
      toast.error("Failed to delete document");
    } else {
      toast.success("Document deleted");
      window.location.reload();
    }
  };

  if (documents.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Recent Uploads</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground"
          onClick={() => window.location.reload()}
        >
          Clear All
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {documents.map((doc) => (
          <div
            key={doc.id}
            onClick={() => onSelectDocument(doc)}
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:border-primary/50 ${
              selectedDocument?.id === doc.id
                ? "border-primary bg-primary/5"
                : "border-border hover:bg-muted/50"
            }`}
          >
            <div className="rounded-lg bg-primary/10 p-2">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {doc.filename}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-muted-foreground">
                  {(doc.file_size / 1024).toFixed(1)} KB
                </p>
                <Badge 
                  variant={doc.status === "completed" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {doc.status === "completed" ? (
                    <span className="text-success">Complete</span>
                  ) : (
                    doc.status
                  )}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={(e) => handleDelete(e, doc.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default RecentDocuments;
