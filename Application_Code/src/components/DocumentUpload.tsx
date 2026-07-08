import { Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCallback } from "react";
import { toast } from "sonner";

interface DocumentUploadProps {
  onFileSelect: (files: File[]) => void;
  isProcessing: boolean;
}

const DocumentUpload = ({ onFileSelect, isProcessing }: DocumentUploadProps) => {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        const validTypes = [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "text/plain",
          "text/csv",
          "image/jpeg",
          "image/png",
          "image/jpg",
        ];
        
        const validFiles = files.filter(file => {
          const isValidType = validTypes.includes(file.type) || 
            file.name.match(/\.(txt|doc|docx|pdf|jpg|jpeg|png|csv)$/i);
          const isValidSize = file.size <= 20 * 1024 * 1024;
          
          if (!isValidType) {
            toast.error(`${file.name}: Unsupported file type`);
            return false;
          }
          if (!isValidSize) {
            toast.error(`${file.name}: File size exceeds 20MB limit`);
            return false;
          }
          return true;
        });
        
        if (validFiles.length > 0) {
          onFileSelect(validFiles);
        }
      }
    },
    [onFileSelect]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      onFileSelect(files);
    }
  };

  return (
    <Card className="border-primary/20 shadow-medium hover:shadow-glow transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Upload & Convert Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/20"
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">
            Drag & drop files here
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            or click to browse
          </p>
          <label htmlFor="file-input">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={isProcessing}
              asChild
            >
              <span>Choose Files</span>
            </Button>
          </label>
          <input
            id="file-input"
            type="file"
            multiple
            className="hidden"
            onChange={handleFileInput}
            accept=".pdf,.doc,.docx,.txt,.csv,.jpg,.jpeg,.png"
            disabled={isProcessing}
          />
          <p className="text-xs text-muted-foreground mt-4">
            Supports: PDF, DOC, DOCX, TXT, CSV, JPG, JPEG, PNG (Multiple files)
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;
