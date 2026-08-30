import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Common CORS headers for all responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

Deno.serve(async (req) => {
  // Allow frontend CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Only POST requests are allowed" }),
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Receive data from frontend as JSON
    const body = await req.json();

    let base64Image: string = body.image || body.imageBase64 || "";
    let mimeType: string = body.mimeType || body.imageType || "image/jpeg";
    const latitude = Number(body.latitude);
    const longitude = Number(body.longitude);
    const description = body.description?.toString() || "";

    // Automatically parse Data URL if provided (e.g. "data:image/png;base64,iVBORw0KGgo...")
    if (base64Image.startsWith("data:")) {
      const matches = base64Image.match(/^data:(.+?);base64,(.+)$/);
      if (matches) {
        mimeType = matches[1];
        base64Image = matches[2];
      }
    }

    // Validate input fields
    if (!base64Image || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return new Response(
        JSON.stringify({
          error: "image (Base64), latitude, and longitude are required",
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    // 2. Upload image binary to Supabase Storage
    const extMap: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
    };
    const fileExt = body.fileName?.split(".").pop() || extMap[mimeType] || "jpg";
    const fileName = `${crypto.randomUUID()}.${fileExt}`;

    const imageBuffer = base64ToUint8Array(base64Image);

    const { error: uploadError } = await supabase.storage
      .from("issue-images")
      .upload(fileName, imageBuffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Image upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("issue-images")
      .getPublicUrl(fileName);

    const imageUrl = publicUrlData.publicUrl;

    // 3. Send base64 image directly to Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `
You are CivicFix AI, an AI system for detecting civic infrastructure issues.

Analyze the uploaded image carefully.

IMPORTANT RULES:

1. Identify the civic issue category.
2. Determine severity ONLY from visible evidence in the image.
3. Do NOT guess severity based only on the category.
4. Do NOT automatically choose "Medium".
5. If the image is unclear, blurry, too dark, or does not clearly show the issue, reduce confidence.
6. If the image does NOT contain a civic issue, return category as "Other".
7. Return ONLY valid JSON. No markdown. No explanation outside the JSON.

AVAILABLE CATEGORIES:
- Pothole
- Garbage
- Streetlight
- Water Leakage
- Other

SEVERITY ANALYSIS:

Evaluate these six factors from 1 to 3:

1. size_extent
   1 = Small or isolated
   2 = Moderate size
   3 = Large area affected

2. structural_damage
   1 = Minor visible damage
   2 = Noticeable damage
   3 = Severe damage, collapse, deep breakage, or major failure

3. safety_risk
   1 = Low immediate danger
   2 = Moderate danger
   3 = High danger to pedestrians, vehicles, or the public

4. functional_impact
   1 = Little impact on normal use
   2 = Noticeable disruption
   3 = Major disruption to normal public use

5. obstruction
   1 = No significant obstruction
   2 = Partial obstruction
   3 = Major obstruction

6. area_affected
   1 = Very localized
   2 = Moderate area affected
   3 = Large area affected

CATEGORY-SPECIFIC RULES:

For Pothole:
Evaluate visible size, depth, road damage, lane obstruction, and danger to vehicles.

For Garbage:
Evaluate quantity, spread, obstruction of public space, and amount of waste accumulated.

For Streetlight:
Evaluate whether it is damaged, broken, leaning, missing, exposed, or clearly non-functional.

For Water Leakage:
Evaluate amount of visible water, spread, flooding, obstruction, and potential danger.

For Other:
Analyze the visible public infrastructure problem using the same safety and impact criteria.

Calculate:

severity_score =
size_extent +
structural_damage +
safety_risk +
functional_impact +
obstruction +
area_affected

FINAL SEVERITY:

6 to 8 = Low
9 to 13 = Medium
14 to 18 = High

Return EXACTLY this JSON format:

{
  "category": "Pothole",
  "severity": "Medium",
  "severity_score": 10,
  "confidence": 0.85,
  "factors": {
    "size_extent": 2,
    "structural_damage": 2,
    "safety_risk": 2,
    "functional_impact": 1,
    "obstruction": 1,
    "area_affected": 2
  },
  "reason": "Brief explanation based only on what is visibly present in the image."}
`,
},



                  
              
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Image,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    const geminiData = await geminiResponse.json();

    if (!geminiResponse.ok) {
      throw new Error(JSON.stringify(geminiData));
    }

    let aiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiText) {
      throw new Error("Gemini did not return an analysis");
    }

    // Remove markdown code fence formatting if present
    aiText = aiText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const aiResult = JSON.parse(aiText);
    const validCategories = [
  "Pothole",
  "Garbage",
  "Streetlight",
  "Water Leakage",
  "Other",
];

const validSeverities = ["Low", "Medium", "High"];

if (!validCategories.includes(aiResult.category)) {
  throw new Error("AI returned an invalid category");
}

if (
  aiResult.category !== "Other" &&
  !validSeverities.includes(aiResult.severity)
) {
  throw new Error("AI returned an invalid severity");
}

    const category = aiResult.category;
const severity = aiResult.severity;
const severityScore = Number(aiResult.severity_score);
const confidence = Number(aiResult.confidence);
const factors = aiResult.factors;
const aiReason = aiResult.reason;

    // 4. DUPLICATE CHECK
    const { data: existingIssues, error: searchError } = await supabase
      .from("issues")
      .select("*")
      .eq("category", category)
      .is("duplicate_of", null);

    if (searchError) {
      throw new Error(searchError.message);
    }

    // Nearby location check
    const nearbyIssue = existingIssues?.find((issue) => {
      if (issue.latitude == null || issue.longitude == null) {
        return false;
      }

      const latDifference = Math.abs(issue.latitude - latitude);
      const lngDifference = Math.abs(issue.longitude - longitude);

      return latDifference < 0.001 && lngDifference < 0.001;
    });

    // 5A. DUPLICATE FOUND
    if (nearbyIssue) {
      const { error: updateError } = await supabase
        .from("issues")
        .update({
          report_count: (nearbyIssue.report_count || 1) + 1,
        })
        .eq("id", nearbyIssue.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      const { error: duplicateError } = await supabase
        .from("issues")
        .insert({
          image_url: imageUrl,
          latitude,
          longitude,
          category,
          severity,
          ai_confidence: confidence,
          description,
          status: "REPORTED",
          duplicate_of: nearbyIssue.id,
          report_count: 1,
        });

      if (duplicateError) {
        throw new Error(duplicateError.message);
      }

      return new Response(
        JSON.stringify({
          success: true,
          is_duplicate: true,
          issue_id: nearbyIssue.id,
          category,
          severity,
          message: "Report added to an existing civic issue",
        }),
        { headers: corsHeaders }
      );
    }

    // 5B. NO DUPLICATE → CREATE NEW MASTER ISSUE
    const { data: newIssue, error: insertError } = await supabase
      .from("issues")
      .insert({
        image_url: imageUrl,
        latitude,
        longitude,
        category,
        severity,
        ai_confidence: confidence,
        description,
        status: "REPORTED",
        report_count: 1,
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(insertError.message);
    }

    return new Response(
      JSON.stringify({
        success: true,
        is_duplicate: false,
        issue_id: newIssue.id,
        category,
        severity,
        confidence,
        message: "New civic issue reported successfully",
      }),
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error(error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});

// Helper: Convert Base64 string to Uint8Array for Supabase Storage upload
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}