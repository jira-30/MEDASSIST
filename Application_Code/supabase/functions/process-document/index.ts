import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentId, content, fileType } = await req.json();
    console.log("Processing document:", documentId, "Type:", fileType);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Generate medical summary using AI
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a medical document analysis AI. Analyze the provided medical document and extract key information in a structured format. 

CRITICAL: You MUST respond with ONLY a valid JSON object, no markdown formatting, no code blocks, no explanations. Just the raw JSON.

Return this exact structure:
{
  "chiefComplaint": "Brief summary of main concern",
  "medicalHistory": "Relevant medical history",
  "keyFindings": ["Finding 1", "Finding 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "medications": ["Medication 1", "Medication 2"],
  "vitalSigns": {
    "bloodPressure": "value or null",
    "heartRate": "value or null",
    "temperature": "value or null"
  }
}`
          },
          { role: "user", content: `Analyze this medical document (${fileType}):\n\n${content}` }
        ],
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", await response.text());
      throw new Error("Failed to analyze document");
    }

    const aiData = await response.json();
    const summaryText = aiData.choices[0].message.content;
    
    console.log("AI Response:", summaryText);
    
    // Parse JSON from the response - handle markdown code blocks
    let summary;
    try {
      // Try to extract JSON from markdown code blocks first
      let jsonText = summaryText;
      const codeBlockMatch = summaryText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        jsonText = codeBlockMatch[1];
      } else {
        // Try to find raw JSON object
        const jsonMatch = summaryText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonText = jsonMatch[0];
        }
      }
      
      summary = JSON.parse(jsonText.trim());
      console.log("Parsed summary:", summary);
    } catch (e) {
      console.error("Failed to parse AI response as JSON:", e);
      console.error("Raw response:", summaryText);
      // Create a fallback structured summary
      summary = {
        chiefComplaint: "Document uploaded successfully",
        medicalHistory: summaryText.substring(0, 500),
        keyFindings: ["Document content extracted"],
        recommendations: ["Review document details"],
        medications: [],
        vitalSigns: {}
      };
    }

    // Update document with summary
    const { error: updateError } = await supabase
      .from("documents")
      .update({
        summary,
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", documentId);

    if (updateError) {
      console.error("Failed to update document:", updateError);
      throw updateError;
    }

    console.log("Document processed successfully:", documentId);

    return new Response(
      JSON.stringify({ success: true, summary }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing document:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
