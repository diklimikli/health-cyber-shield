// Edge function: generate boardroom-ready executive summary via Lovable AI Gateway
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT_HU = `Te egy szenior kiberbiztonsági és megfelelőségi tanácsadó vagy. A feladatod, hogy a kapott technikai audit adatokból (NIS2, NIST, GDPR, SOC-CMM) egy 100%-ban üzleti fókuszú, zsargonmentes Vezetői Összefoglalót generálj a felsővezetés (C-level) számára magyar nyelven.

Formázási és tartalmi szabályok:
- Szigorúan kerüld a technikai zsargont (pl. CVE, port, SIEM, specifikus kódok helyett használj "ismert biztonsági rés", "nyitott kapu a hálózaton", "automatizált riasztórendszer" kifejezéseket).
- Fókuszálj az üzleti hatásokra (leállási idő, hírnévromlás, jogi felelősség, valamint a NIS2 és GDPR szerinti súlyos bírságok kockázata).
- Törekedj a pontokba szedett, jól skandálható listákra a hosszú szövegtömbök helyett.
- Strukturáld a választ pontosan az alábbi főcímekkel (Markdown formátumban):

## 1. Jelenlegi státusz és Érettségi szint

## 2. A 3 legfőbb üzleti kockázat

## 3. Megfelelőségi mátrix (Táblázat formátumban)

## 4. Szükséges vezetői döntések és Erőforrás-igény`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { auditData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const userContent =
      "Az alábbi technikai audit adatok alapján készítsd el a Vezetői Összefoglalót:\n\n```json\n" +
      JSON.stringify(auditData, null, 2) +
      "\n```";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT_HU },
          { role: "user", content: userContent },
        ],
      }),
    });

    if (response.status === 429) {
      return new Response(
        JSON.stringify({ error: "Túl sok kérés, próbáld újra később." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (response.status === 402) {
      return new Response(
        JSON.stringify({ error: "A Lovable AI keret kimerült. Tölts fel kreditet a workspace beállításokban." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI átjáró hiba" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content ?? "";

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("executive-summary error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Ismeretlen hiba" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
