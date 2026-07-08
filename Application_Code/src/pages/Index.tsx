import { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import DocumentUpload from "@/components/DocumentUpload";
import ProcessingStatus from "@/components/ProcessingStatus";
import ChatInterface from "@/components/ChatInterface";
import MedicalSummary from "@/components/MedicalSummary";
import RecentDocuments from "@/components/RecentDocuments";
import ThemeToggle from "@/components/ThemeToggle";
import HealthInsights from "@/components/HealthInsights";
import HospitalOperations from "@/components/HospitalOperations";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [currentDocument, setCurrentDocument] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Create or load session
  useEffect(() => {
    const initSession = async () => {
      // Always start fresh on reload: do not reuse previous session or documents
      try {
        localStorage.removeItem("medical_rag_session");
        setDocuments([]);
        setCurrentDocument(null);

        const { data, error } = await supabase
          .from("chat_sessions")
          .insert({})
          .select()
          .single();

        if (error) {
          console.error("Failed to create session", error);
        }
        if (data) {
          setSessionId(data.id);
        }
      } catch (e) {
        console.error("Session init error", e);
      }
    };

    initSession();
  }, []);

  const loadDocuments = async (sesId: string) => {
    const { data } = await supabase
      .from("document_sessions")
      .select(`
        documents (
          id,
          filename,
          file_type,
          file_size,
          status,
          summary,
          created_at
        )
      `)
      .eq("session_id", sesId);

    if (data) {
      const docs = data.map((d: any) => d.documents);
      setDocuments(docs);
      if (docs.length > 0) {
        setCurrentDocument(docs[0]);
      }
    }
  };

  const handleFileSelect = async (files: File[]) => {
    // Helper to extract text from various file types without external API keys
    const extractTextFromFile = async (file: File): Promise<string> => {
      const type = file.type || "";
      const name = file.name.toLowerCase();
      try {
        if (type.startsWith("text/") || name.endsWith(".txt") || name.endsWith(".csv") || type === "application/json") {
          return await file.text();
        }
        if (type === "application/pdf" || name.endsWith(".pdf")) {
          const pdfjs = await import("pdfjs-dist");
          const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
          (pdfjs as any).GlobalWorkerOptions.workerSrc = (worker as any).default;
          const ab = await file.arrayBuffer();
          const doc = await (pdfjs as any).getDocument({ data: ab }).promise;
          let text = "";
          for (let i = 1; i <= doc.numPages; i++) {
            const page = await doc.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map((it: any) => it.str).join(" ") + "\n";
          }
          return text;
        }
        if (type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || name.endsWith(".docx")) {
          const mammoth = await import("mammoth/mammoth.browser");
          const ab = await file.arrayBuffer();
          const result = await (mammoth as any).convertToPlainText({ arrayBuffer: ab });
          return result.value || "";
        }
        if (type.startsWith("image/") || /\.(png|jpg|jpeg)$/i.test(name)) {
          const Tesseract = await import("tesseract.js");
          const { data } = await (Tesseract as any).recognize(file, "eng");
          return data.text || "";
        }
        // Fallback
        return "";
      } catch (e) {
        console.error("extractTextFromFile error", e);
        return "";
      }
    };

    try {
      setIsProcessing(true);
      toast.loading(`Uploading ${files.length} document(s)...`, { id: "upload" });

      for (const file of files) {
        const extracted = await extractTextFromFile(file);

        // Insert document with truncated content to avoid payload limits
        const { data: docData, error: docError } = await supabase
          .from("documents")
          .insert({
            filename: file.name,
            file_type: file.type || "application/octet-stream",
            file_size: file.size,
            content: extracted ? extracted.slice(0, 200000) : null,
            status: "processing",
          })
          .select()
          .single();

        if (docError || !docData) {
          console.error("Insert document error", docError);
          toast.error(`Failed to save ${file.name}`);
          continue; // Move on to next file instead of aborting all
        }

        // Link document to session
        if (sessionId) {
          await supabase
            .from("document_sessions")
            .insert({
              session_id: sessionId,
              document_id: docData.id,
            });
        }

        toast.success(`${file.name} uploaded!`, { id: `upload-${file.name}` });
        toast.loading(`Analyzing ${file.name}...`, { id: `analyze-${file.name}` });

        // Process document with extracted text
        const { error: processError } = await supabase.functions.invoke("process-document", {
          body: {
            documentId: docData.id,
            content: extracted || "",
            fileType: file.type || file.name.split(".").pop(),
          },
        });

        if (processError) {
          console.error("Process error", processError);
          toast.error(`Failed to analyze ${file.name}`, { id: `analyze-${file.name}` });
        } else {
          toast.success(`${file.name} analyzed!`, { id: `analyze-${file.name}` });
        }
      }

      toast.success("All documents processed!", { id: "upload" });

      if (sessionId) {
        await loadDocuments(sessionId);
      }
    } catch (error) {
      console.error("Error handling files:", error);
      toast.error("Failed to process documents", { id: "upload" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNewSession = async () => {
    localStorage.removeItem("medical_rag_session");
    const { data } = await supabase
      .from("chat_sessions")
      .insert({})
      .select()
      .single();
    
    if (data) {
      setSessionId(data.id);
      localStorage.setItem("medical_rag_session", data.id);
      setDocuments([]);
      setCurrentDocument(null);
      toast.success("New session created");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-br from-primary to-accent p-2">
              <FileText className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Medical RAG Assistant</h1>
              <p className="text-sm text-muted-foreground">
                Intelligent medical document analysis with patient data integration
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <DocumentUpload 
              onFileSelect={handleFileSelect}
              isProcessing={isProcessing}
            />
            <RecentDocuments 
              documents={documents}
              onSelectDocument={setCurrentDocument}
              selectedDocument={currentDocument}
            />
            <ProcessingStatus documents={documents} />
            <HealthInsights documents={documents} />
            <HospitalOperations documents={documents} />
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chat Interface - Primary Section */}
            {sessionId && (
              <div>
                <ChatInterface 
                  sessionId={sessionId}
                  hasDocuments={documents.length > 0}
                />
              </div>
            )}
            
            {/* Medical Summary - Secondary Section */}
            {currentDocument?.summary && (
              <div className="mt-6">
                <MedicalSummary 
                  summary={currentDocument.summary}
                  documentName={currentDocument.filename}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
