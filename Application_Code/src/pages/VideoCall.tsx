import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  MessageSquare,
  Hand,
  Smile,
  PenTool,
  Users,
  X,
  Send,
  ArrowLeft,
  Monitor,
  Circle,
  Maximize2,
  Copy,
  Link2,
} from "lucide-react";
import { toast } from "sonner";
import ThemeToggle from "@/components/ThemeToggle";

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
}

interface Participant {
  id: string;
  name: string;
  role: "doctor" | "patient" | "frontdesk";
  handRaised: boolean;
}

const VideoCall = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const callId = searchParams.get("callId") || `call-${Date.now()}`;
  const guestName = searchParams.get("guestName");
  const guestEmail = searchParams.get("guestEmail");
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [handRaised, setHandRaised] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [isPiPActive, setIsPiPActive] = useState(false);
  const [showCallLink, setShowCallLink] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([
    { id: "1", name: "Dr. Smith", role: "doctor", handRaised: false },
    { id: "2", name: "John Doe", role: "patient", handRaised: false },
    { id: "3", name: "Sarah Connor", role: "frontdesk", handRaised: false },
  ]);

  // Add guest as participant if joining via link
  useEffect(() => {
    if (guestName && guestEmail) {
      const guestParticipant: Participant = {
        id: Date.now().toString(),
        name: guestName,
        role: "patient",
        handRaised: false,
      };
      setParticipants((prev) => [...prev, guestParticipant]);
      toast.success(`${guestName} joined the meeting`);
    }
  }, [guestName, guestEmail]);

  const emojis = ["👍", "👏", "❤️", "😊", "🎉", "👋", "🤔", "💯"];

  useEffect(() => {
    if (showWhiteboard && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
      }
    }
  }, [showWhiteboard]);

  useEffect(() => {
    const initVideo = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        
        // Set up media recorder for call recording
        const recorder = new MediaRecorder(mediaStream);
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            setRecordedChunks((prev) => [...prev, event.data]);
          }
        };
        setMediaRecorder(recorder);
      } catch (error) {
        console.error("Error accessing media devices:", error);
        toast.error("Could not access camera/microphone");
      }
    };

    initVideo();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
      }
    };
  }, []);

  const handleEndCall = () => {
    toast.success("Call ended");
    navigate("/");
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
        toast.info(videoTrack.enabled ? "Video turned on" : "Video turned off");
      }
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
        toast.info(audioTrack.enabled ? "Unmuted" : "Muted");
      }
    }
  };

  const toggleHandRaise = () => {
    const newHandRaised = !handRaised;
    setHandRaised(newHandRaised);
    
    if (newHandRaised) {
      // Play notification sound
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = "sine";
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      
      toast.info("Hand raised");
    } else {
      toast.info("Hand lowered");
    }
  };

  const sendMessage = () => {
    if (!chatMessage.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "You",
      text: chatMessage,
      timestamp: new Date(),
    };
    
    setMessages([...messages, newMessage]);
    setChatMessage("");
  };

  const sendEmoji = (emoji: string) => {
    toast.success(`Sent ${emoji}`);
    setShowEmojis(false);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas) {
      const rect = canvas.getBoundingClientRect();
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas) {
      const rect = canvas.getBoundingClientRect();
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearWhiteboard = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = screenStream;
        }
        
        setIsScreenSharing(true);
        toast.success("Screen sharing started");
        
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          if (stream && videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          toast.info("Screen sharing stopped");
        };
      } catch (error) {
        console.error("Error sharing screen:", error);
        toast.error("Could not share screen");
      }
    } else {
      if (stream && videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsScreenSharing(false);
      toast.info("Screen sharing stopped");
    }
  };

  const toggleRecording = () => {
    if (!mediaRecorder) {
      toast.error("Recording not available");
      return;
    }

    if (!isRecording) {
      setRecordedChunks([]);
      mediaRecorder.start();
      setIsRecording(true);
      toast.success("Recording started");
    } else {
      mediaRecorder.stop();
      setIsRecording(false);
      toast.success("Recording stopped");
      
      // Save recording
      setTimeout(() => {
        if (recordedChunks.length > 0) {
          const blob = new Blob(recordedChunks, { type: "video/webm" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `call-recording-${Date.now()}.webm`;
          a.click();
          URL.revokeObjectURL(url);
          toast.success("Recording downloaded");
        }
      }, 100);
    }
  };

  const togglePiP = async () => {
    if (!videoRef.current) return;

    try {
      if (!isPiPActive && document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
        setIsPiPActive(true);
        toast.success("Picture-in-Picture enabled");
      } else if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPiPActive(false);
        toast.info("Picture-in-Picture disabled");
      }
    } catch (error) {
      console.error("PiP error:", error);
      toast.error("Picture-in-Picture not supported");
    }
  };

  const copyCallLink = () => {
    const callLink = `${window.location.origin}/join-call?id=${callId}`;
    navigator.clipboard.writeText(callLink);
    toast.success("Call link copied to clipboard");
  };

  const handleRemoveParticipant = (participantId: string) => {
    const participant = participants.find(p => p.id === participantId);
    if (participant) {
      setParticipants(prev => prev.filter(p => p.id !== participantId));
      toast.info(`${participant.name} left the meeting`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Video Conference</h1>
              <p className="text-sm text-muted-foreground">Connected Call</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-success/10 text-success">
              Live
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCallLink(!showCallLink)}
            >
              <Link2 className="h-4 w-4 mr-2" />
              Share Link
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Call Link Dialog */}
        {showCallLink && (
          <Card className="mb-4">
            <CardContent className="py-4">
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={`${window.location.origin}/join-call?id=${callId}`}
                  className="flex-1"
                />
                <Button onClick={copyCallLink} size="icon">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Share this link with anyone to invite them to the call
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Video Area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Primary Video Feed */}
            <Card className="overflow-hidden">
              <CardContent className="p-0 relative aspect-video bg-muted flex items-center justify-center">
                {showWhiteboard ? (
                  <div className="w-full h-full relative">
                    <canvas
                      ref={canvasRef}
                      width={1280}
                      height={720}
                      className="w-full h-full bg-white cursor-crosshair"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute top-4 right-4"
                      onClick={clearWhiteboard}
                    >
                      Clear
                    </Button>
                  </div>
                ) : (
                  <div className="w-full h-full relative">
                    {isVideoOn ? (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-primary/10 mb-4">
                            <VideoOff className="w-16 h-16 text-muted-foreground" />
                          </div>
                          <p className="text-lg font-medium">Video Paused</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Hand Raised Indicator */}
                {handRaised && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-warning text-warning-foreground animate-pulse">
                      <Hand className="w-4 h-4 mr-1" />
                      Hand Raised
                    </Badge>
                  </div>
                )}

                {/* Participant Thumbnails */}
                <div className="absolute bottom-4 right-4 flex gap-2">
                  {participants.slice(0, 2).map((participant) => (
                    <div
                      key={participant.id}
                      className="w-32 h-24 rounded-lg bg-muted border-2 border-border overflow-hidden relative"
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-8 h-8 rounded-full bg-primary/20 mx-auto mb-1 flex items-center justify-center">
                            <span className="text-xs font-medium">
                              {participant.name.charAt(0)}
                            </span>
                          </div>
                          <p className="text-xs">{participant.name}</p>
                        </div>
                      </div>
                      {participant.handRaised && (
                        <div className="absolute top-1 right-1">
                          <Hand className="w-3 h-3 text-warning" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Control Bar */}
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <Button
                    variant={isAudioOn ? "default" : "destructive"}
                    size="lg"
                    onClick={toggleAudio}
                  >
                    {isAudioOn ? <Mic className="mr-2" /> : <MicOff className="mr-2" />}
                    {isAudioOn ? "Mute" : "Unmuted"}
                  </Button>

                  <Button
                    variant={isVideoOn ? "default" : "secondary"}
                    size="lg"
                    onClick={toggleVideo}
                  >
                    {isVideoOn ? <Video className="mr-2" /> : <VideoOff className="mr-2" />}
                    Video
                  </Button>

                  <Separator orientation="vertical" className="h-10" />

                  <Button
                    variant={showChat ? "secondary" : "outline"}
                    size="lg"
                    onClick={() => setShowChat(!showChat)}
                  >
                    <MessageSquare className="mr-2" />
                    Chat
                  </Button>

                  <Button
                    variant={handRaised ? "secondary" : "outline"}
                    size="lg"
                    onClick={toggleHandRaise}
                  >
                    <Hand className="mr-2" />
                    Raise Hand
                  </Button>

                  <Button
                    variant={showEmojis ? "secondary" : "outline"}
                    size="lg"
                    onClick={() => setShowEmojis(!showEmojis)}
                  >
                    <Smile className="mr-2" />
                    Emoji
                  </Button>

                  <Button
                    variant={showWhiteboard ? "secondary" : "outline"}
                    size="lg"
                    onClick={() => setShowWhiteboard(!showWhiteboard)}
                  >
                    <PenTool className="mr-2" />
                    Whiteboard
                  </Button>

                  <Button
                    variant={showParticipants ? "secondary" : "outline"}
                    size="lg"
                    onClick={() => setShowParticipants(!showParticipants)}
                  >
                    <Users className="mr-2" />
                    Participants
                  </Button>

                  <Separator orientation="vertical" className="h-10" />

                  <Button
                    variant={isScreenSharing ? "secondary" : "outline"}
                    size="lg"
                    onClick={toggleScreenShare}
                  >
                    <Monitor className="mr-2" />
                    Share Screen
                  </Button>

                  <Button
                    variant={isRecording ? "destructive" : "outline"}
                    size="lg"
                    onClick={toggleRecording}
                  >
                    <Circle className={`mr-2 ${isRecording ? "fill-current" : ""}`} />
                    {isRecording ? "Stop Recording" : "Record"}
                  </Button>

                  <Button
                    variant={isPiPActive ? "secondary" : "outline"}
                    size="lg"
                    onClick={togglePiP}
                  >
                    <Maximize2 className="mr-2" />
                    Picture-in-Picture
                  </Button>

                  <Separator orientation="vertical" className="h-10" />

                  <Button variant="destructive" size="lg" onClick={handleEndCall}>
                    <Phone className="mr-2 rotate-[135deg]" />
                    End Call
                  </Button>
                </div>

                {/* Emoji Picker */}
                {showEmojis && (
                  <div className="mt-4 flex gap-2 justify-center">
                    {emojis.map((emoji) => (
                      <Button
                        key={emoji}
                        variant="ghost"
                        size="lg"
                        onClick={() => sendEmoji(emoji)}
                        className="text-2xl"
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Chat Panel */}
            {showChat && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Chat</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowChat(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto">
                    {messages.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No messages yet
                      </p>
                    ) : (
                      messages.map((msg) => (
                        <div key={msg.id} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">{msg.sender}</span>
                            <span className="text-xs text-muted-foreground">
                              {msg.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm bg-muted rounded-lg p-2">{msg.text}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type a message..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      className="min-h-[60px]"
                    />
                    <Button onClick={sendMessage} size="icon">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Participants Panel */}
            {showParticipants && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Participants ({participants.length})</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowParticipants(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {participants.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-xs font-medium">
                              {participant.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{participant.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {participant.role}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {participant.handRaised && (
                            <Hand className="w-4 h-4 text-warning" />
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleRemoveParticipant(participant.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default VideoCall;
