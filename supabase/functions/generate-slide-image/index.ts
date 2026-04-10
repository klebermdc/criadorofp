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
    const { topic, slideType } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const prompts: Record<string, string> = {
      cover: `A stunning cinematic wide-angle photo of Orlando Florida theme parks at golden hour, featuring a magical castle silhouette with dramatic sky, fireworks, and palm trees. Dark navy blue and deep purple tones. Topic context: "${topic}". Style: professional Instagram carousel cover, moody dark atmosphere, 4:5 aspect ratio.`,
      content: `A beautiful atmospheric photo related to Orlando Florida travel and theme parks. Dark moody tones with navy blue and deep purple gradients. Soft bokeh lights in background. Topic context: "${topic}". Style: dark elegant background for text overlay, subtle and not too busy, 4:5 aspect ratio.`,
      cta: `A vibrant photo of Orlando Florida at night with colorful lights, theme park attractions glowing, and a magical atmosphere. Dark navy tones with warm accent lights. Topic context: "${topic}". Style: eye-catching Instagram slide background, dark with pops of color, 4:5 aspect ratio.`,
    };

    const prompt = prompts[slideType] || prompts.content;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("AI Gateway image error:", response.status, error);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited", imageUrl: null }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("Failed to generate image");
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url || null;

    return new Response(JSON.stringify({ imageUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Image generation error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error", imageUrl: null }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
