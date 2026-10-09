import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { image, latitude, longitude, description = "" } = body;

    let category = "Civic Infrastructure";
    let severity: "low" | "medium" | "high" = "medium";

    const descLower = (description || "").toLowerCase();

    // Check Gemini API first if configured
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.length > 10) {
      try {
        const prompt = `Analyze this civic problem report description: "${description}". Categorize it into one of: ["Pothole & Road Hazard", "Water Supply & Leakage", "Electrical & Streetlights", "Sanitation & Garbage", "Drainage & Sewage", "Footpath & Sidewalk", "Traffic & Road Infrastructure"]. Also assign severity: "low", "medium", or "high". Return valid JSON only: {"category": string, "severity": "low" | "medium" | "high"}`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const cleanJson = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(cleanJson);
            if (parsed.category) category = parsed.category;
            if (["low", "medium", "high"].includes(parsed.severity)) {
              severity = parsed.severity;
            }
          }
        }
      } catch (geminiError) {
        // Fall back to heuristic classification
      }
    }

    // Heuristic Classification Fallback
    if (category === "Civic Infrastructure") {
      if (/pothole|crater|asphalt|tarmac|road cavity|uneven road/i.test(descLower)) {
        category = "Pothole & Road Hazard";
        severity = "high";
      } else if (/water|leak|pipeline|burst|hydrant|drinking water|pipe/i.test(descLower)) {
        category = "Water Supply & Leakage";
        severity = "high";
      } else if (/drain|drainage|sewer|sewage|manhole|gutter|sludge/i.test(descLower)) {
        category = "Drainage & Sewage";
        severity = "high";
      } else if (/light|streetlight|lamp|dark|electricity|wire|pole/i.test(descLower)) {
        category = "Electrical & Streetlights";
        severity = "medium";
      } else if (/garbage|trash|dump|waste|bin|litter|debris|rubbish/i.test(descLower)) {
        category = "Sanitation & Garbage";
        severity = "medium";
      } else if (/footpath|sidewalk|pavement|slab|pedestrian|curb/i.test(descLower)) {
        category = "Footpath & Sidewalk";
        severity = "low";
      } else if (/traffic|signal|barrier|divider|signboard/i.test(descLower)) {
        category = "Traffic & Road Infrastructure";
        severity = "medium";
      }
    }

    const id = `CF-${Date.now().toString(36).toUpperCase()}`;
    const locationString =
      latitude && longitude
        ? `${Number(latitude).toFixed(5)}, ${Number(longitude).toFixed(5)}`
        : "Bengaluru Central";

    return NextResponse.json({
      success: true,
      id,
      category,
      severity,
      location: locationString,
      status: "pending",
      description,
      report_count: 1,
    });
  } catch (err: any) {
    console.error("Submit issue error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to process issue" },
      { status: 500 }
    );
  }
}
