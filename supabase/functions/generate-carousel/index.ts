import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, style } = await req.json();

    const MINIMAX_API_KEY = Deno.env.get("MINIMAX_API_KEY");
    if (!MINIMAX_API_KEY) {
      throw new Error("MINIMAX_API_KEY not configured");
    }

    const systemPrompt = `Você é um especialista em marketing digital para a agência de viagens Orlando Fast Pass (OFP). 
Gere conteúdo para um carrossel do Instagram sobre viagens para Orlando.
Tom: autoridade + amigável. Linguagem: português brasileiro.

O carrossel deve ter o formato JSON com um array "slides" contendo:
1. Primeiro slide: type "cover" com um título impactante para a capa
2. De 5 a 8 slides: type "content" com título curto, body explicativo (2-3 frases), emoji relevante, e number (sequencial começando em 1)
3. Último slide: type "cta" com title "Gostou? Salva e compartilha!"

Retorne APENAS o JSON válido, sem markdown. Formato:
{"slides":[{"type":"cover","title":"..."},{"type":"content","title":"...","body":"...","emoji":"...","number":1},{"type":"cta","title":"Gostou? Salva e compartilha!"}]}`;

    const response = await fetch("https://api.minimax.io/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MINIMAX_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "MiniMax-M2.5",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Gere um carrossel no estilo "${style}" sobre o tema: "${topic}"`,
          },
        ],
        temperature: 0.8,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("MiniMax error:", response.status, error);
      throw new Error("Failed to generate content");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const parsed = JSON.parse(content);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
