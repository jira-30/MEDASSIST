import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, sessionId } = await req.json();
    console.log("Chat request for session:", sessionId);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get document context for this session
    const { data: docData } = await supabase
      .from("document_sessions")
      .select(`
        documents (
          content,
          summary,
          filename
        )
      `)
      .eq("session_id", sessionId);

    const documentContext = docData?.map((d: any) => ({
      filename: d.documents.filename,
      content: d.documents.content,
      summary: d.documents.summary
    })) || [];

    // Build system prompt with document context
    const systemPrompt = `You are an AI Medical Assistant specialized in analyzing medical documents and answering questions about patient health information.

${documentContext.length > 0 ? `You have access to the following medical documents:

${documentContext.map((doc: any, i: number) => 
  `Document ${i + 1}: ${doc.filename}
Summary: ${JSON.stringify(doc.summary, null, 2)}
Full Content: ${doc.content?.substring(0, 2000)}...
`).join('\n\n')}` : 'No documents have been uploaded yet.'}

Your role is to:
1. Answer questions about the uploaded medical documents accurately
2. Provide medical insights based on the document content
3. Suggest relevant follow-up questions or actions
4. Maintain patient confidentiality and professionalism
5. If uncertain about any medical information, clearly state that

Be concise, professional, and helpful. Always reference specific information from the documents when answering questions.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
