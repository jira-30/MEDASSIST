import { useState, useEffect, useRef } from "react";
import { Send, Mic, Loader2, BookOpen, Download, Wifi, WifiOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  sessionId: string;
  hasDocuments: boolean;
}

const quickQuestions = [
  "What medications are listed?",
  "What are the patient's symptoms?",
  "What is the medical history?",
  "What are the latest lab results?",
];

const ChatInterface = ({ sessionId, hasDocuments }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load messages from database
  useEffect(() => {
    const loadMessages = async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at");

      if (data) {
        setMessages(data.map(m => ({ role: m.role as "user" | "assistant", content: m.content })));
      }
    };

    loadMessages();
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const streamChat = async (userMessages: Message[]) => {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: userMessages, sessionId }),
    });

    if (!resp.ok) {
      if (resp.status === 429) {
        toast.error("Rate limits exceeded, please try again later.");
      } else if (resp.status === 402) {
        toast.error("Payment required. Please add funds to your workspace.");
      } else {
        toast.error("Failed to get response from AI");
      }
      throw new Error("Failed to start stream");
    }

    if (!resp.body) throw new Error("No response body");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let streamDone = false;
    let assistantContent = "";

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantContent += content;
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant") {
                return prev.map((m, i) =>
                  i === prev.length - 1 ? { ...m, content: assistantContent } : m
                );
              }
              return [...prev, { role: "assistant", content: assistantContent }];
            });
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    return assistantContent;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result?.toString().split(',')[1];
          if (base64Audio) {
            try {
              toast.loading("Transcribing audio...", { id: "transcribe" });
              const { data, error } = await supabase.functions.invoke('transcribe-audio', {
                body: { audio: base64Audio }
              });
              
              if (error) {
                console.error('Transcription error:', error);
                throw error;
              }
              
              if (data?.text) {
                setInput(data.text);
                toast.success("Transcription complete!", { id: "transcribe" });
              } else if (data?.error) {
                throw new Error(data.error);
              } else {
                throw new Error("No transcription returned");
              }
            } catch (error) {
              console.error('Transcription error:', error);
              toast.error(error instanceof Error ? error.message : "Failed to transcribe audio", { id: "transcribe" });
            }
          }
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success("Recording started");
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error("Failed to access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success("Recording stopped");
    }
  };

  const handleSend = async (question?: string) => {
    const messageText = question || input;
    if (!messageText.trim() || isLoading) return;

    if (!hasDocuments) {
      toast.error("Please upload a document first to start chatting");
      return;
    }

    const userMsg: Message = { role: "user", content: messageText };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Save user message to database
    await supabase.from("chat_messages").insert({
      session_id: sessionId,
      role: "user",
      content: messageText,
    });

    try {
      const assistantContent = await streamChat([...messages, userMsg]);

      // Save assistant message to database
      await supabase.from("chat_messages").insert({
        session_id: sessionId,
        role: "assistant",
        content: assistantContent,
      });
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text("Medical Chat History", 14, 22);
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
    
    // Prepare table data
    const tableData = messages.map((msg, idx) => [
      idx + 1,
      msg.role === "user" ? "User" : "AI Assistant",
      msg.content
    ]);
    
    // Add table
    autoTable(doc, {
      startY: 35,
      head: [['#', 'Role', 'Message']],
      body: tableData,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [33, 150, 243] },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 30 },
        2: { cellWidth: 140 }
      }
    });
    
    // Save PDF
    doc.save(`medical-chat-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success("Chat exported to PDF successfully!");
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-gradient-to-br from-primary to-accent p-2">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <CardTitle className="text-lg font-semibold">AI Medical Assistant</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportToPDF}
              disabled={messages.length === 0}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
            <Badge variant={isOnline ? "default" : "destructive"} className="gap-1">
              {isOnline ? (
                <>
                  <Wifi className="h-3 w-3" />
                  Online
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3" />
                  Offline
                </>
              )}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {hasDocuments 
                  ? "Hello! I'm your AI Medical Assistant" 
                  : "No Documents Uploaded Yet"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {hasDocuments
                  ? "Upload medical documents and I'll analyze them using intelligent document memory. All documents are stored securely for this session and I can reference multiple documents simultaneously to answer your questions."
                  : "Please upload a medical document to get started with the AI-powered analysis and chat features."}
              </p>
              
              {hasDocuments && (
                <>
                  <div className="mt-8">
                    <p className="text-xs text-muted-foreground mb-3 font-medium">
                      Quick Questions:
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
                      {quickQuestions.map((q, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSend(q)}
                          disabled={isLoading}
                          className="text-xs"
                        >
                          {q}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 rounded-lg bg-card border border-border p-3 max-w-md mx-auto">
                    <p className="text-xs text-muted-foreground flex items-center gap-2 justify-center">
                      <BookOpen className="h-4 w-4" />
                      <span className="font-medium">{hasDocuments ? "1 docs stored" : "Document Memory"}</span>
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 animate-slide-in ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "assistant" && (
                <Avatar className="h-8 w-8 border-2 border-primary/20">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-xs">
                    AI
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              {msg.role === "user" && (
                <Avatar className="h-8 w-8 border-2 border-accent/20">
                  <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                    U
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={isRecording ? stopRecording : startRecording}
              className={isRecording ? "text-red-500" : ""}
            >
              <Mic className="h-5 w-5" />
            </Button>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={hasDocuments ? "Ask about your documents or type a message..." : "Upload a document to start chatting..."}
              className="min-h-[60px] resize-none"
              disabled={isLoading || !hasDocuments}
            />
            <Button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim() || !hasDocuments}
              className="self-end"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatInterface;
