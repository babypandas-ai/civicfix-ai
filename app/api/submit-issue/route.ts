import { NextResponse } from "next/server";

const CATEGORIES = [
  "Pothole & Road Hazard",
  "Water Supply & Leakage",
  "Electrical & Streetlights",
  "Sanitation & Garbage",
  "Drainage & Sewage",
  "Footpath & Sidewalk",
  "Traffic & Road Infrastructure",
  "Other",
] as const;

type Category = (typeof CATEGORIES)[number];
type Severity = "low" | "medium" | "high";

const FALLBACK_CATEGORY = "Other";

function parseImage(image: unknown): {
  mimeType: string;
  data: string;
} | null {
  if (typeof image !== "string" || !image.trim()) {
    return null;
  }

  // Extract base64 and mime type from data URLs (e.g. data:image/jpeg;base64,...)
  const commaIdx = image.indexOf(",");
  if (commaIdx !== -1) {
    const meta = image.slice(0, commaIdx);
    const rawData = image.slice(commaIdx + 1).replace(/\s/g, "");
    let mimeType = "image/jpeg";
    const mimeMatch = meta.match(/data:([^;]+);base64/i);
    if (mimeMatch) {
      mimeType = mimeMatch[1].toLowerCase();
      if (mimeType === "image/jpg") mimeType = "image/jpeg";
    }
    if (rawData.length > 0 && rawData.length < 25_000_000) {
      return { mimeType, data: rawData };
    }
  }

  // Raw base64 string
  const cleanData = image.replace(/\s/g, "");
  if (cleanData.length > 0 && cleanData.length < 25_000_000) {
    return { mimeType: "image/jpeg", data: cleanData };
  }

  return null;
}

function classifyFallback(description: string): {
  category: Category;
  severity: Severity;
} {
  const text = description.toLowerCase();

  // If description mentions personal or non-civic terms
  if (/person|human|selfie|face|me|photo of me|indoor|dog|cat|pet|food|random|test/.test(text)) {
    return {
      category: "Other",
      severity: "low",
    };
  }

  if (/pothole|crater|road cavity|uneven road|broken road|road damage|asphalt/.test(text)) {
    return {
      category: "Pothole & Road Hazard",
      severity: /large|deep|severe|accident|dangerous|multiple/.test(text)
        ? "high"
        : "medium",
    };
  }

  if (/water leak|water leakage|burst pipe|broken pipe|pipeline leak|water wastage|pipeline/.test(text)) {
    return {
      category: "Water Supply & Leakage",
      severity: /major|flood|burst|heavy|large|continuous/.test(text)
        ? "high"
        : "medium",
    };
  }

  if (/drain|drainage|sewer|sewage|manhole|gutter|sludge/.test(text)) {
    return {
      category: "Drainage & Sewage",
      severity: /overflow|blocked|open manhole|contaminat|flood/.test(text)
        ? "high"
        : "medium",
    };
  }

  if (/streetlight|street light|lamp post|electric pole|exposed wire|electrical wire/.test(text)) {
    return {
      category: "Electrical & Streetlights",
      severity: /exposed wire|live wire|sparking|fallen pole/.test(text)
        ? "high"
        : "medium",
    };
  }

  if (/garbage|trash|dump|waste|litter|rubbish|overflowing bin/.test(text)) {
    return {
      category: "Sanitation & Garbage",
      severity: /massive|large dump|overflow|rotting|hazardous/.test(text)
        ? "high"
        : "medium",
    };
  }

  if (/footpath|sidewalk|pavement|broken slab|pedestrian path|curb/.test(text)) {
    return {
      category: "Footpath & Sidewalk",
      severity: /collapsed|large hole|dangerous|unusable/.test(text)
        ? "high"
        : "low",
    };
  }

  if (/traffic signal|road sign|divider|barrier|missing sign|damaged sign/.test(text)) {
    return {
      category: "Traffic & Road Infrastructure",
      severity: /signal failure|missing signal|collision|dangerous|blocked road/.test(text)
        ? "high"
        : "medium",
    };
  }

  return {
    category: "Other",
    severity: "low",
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      image,
      latitude,
      longitude,
      description = "",
    } = body ?? {};

    const safeDescription =
      typeof description === "string"
        ? description.slice(0, 2000)
        : "";

    let category: string = FALLBACK_CATEGORY;
    let severity: Severity = "low";
    let confidence = 0;
    let analysisSource: "gemini" | "fallback" = "fallback";

    const apiKey = process.env.GEMINI_API_KEY;
    const parsedImage = parseImage(image);

    // Call Gemini 3.8 Flash multimodal API
    if (apiKey && apiKey.length > 10 && (parsedImage || safeDescription.trim())) {
      try {
        const prompt = `
You are an advanced municipal vision AI for CivicFix.
Analyze the provided image and citizen report description to categorize and triage public urban issues.

Allowed Categories:
- Pothole & Road Hazard (craters, road cracks, asphalt damage, cave-ins)
- Water Supply & Leakage (broken pipe, water line burst, gushing potable water, leaking main)
- Electrical & Streetlights (dark streetlights, exposed wires, broken electric poles, sparking transformer)
- Sanitation & Garbage (overflowing dumpster, illegal trash dump, garbage piles on road)
- Drainage & Sewage (overflowing gutter, clogged drain, open/missing manhole, foul sewage leak)
- Footpath & Sidewalk (broken pavement slabs, missing walkway blocks, pedestrian trip hazard)
- Traffic & Road Infrastructure (broken traffic light, damaged divider, missing road sign)
- Other (MANDATORY for: human beings, faces, selfies, crowds, indoor rooms, pets, animals, documents, vehicles without civic accidents, food, personal photos, or anything that is NOT a municipal infrastructure defect)

Severity Rules:
- low: MANDATORY for category "Other" (humans, selfies, non-civic photos), or minor cosmetic issues with no safety risk.
- medium: Noticeable problem causing public inconvenience, unsanitary conditions, or disruption (e.g. standard potholes, unlit streetlights, garbage pile).
- high: Urgent hazard posing immediate physical risk to citizens (e.g. open/missing manholes, exposed live electrical wires, major water pipe bursts, large deep road cave-ins).

CRITICAL INSTRUCTIONS:
1. If the image depicts a person, human face, selfie, pet, indoor setting, or personal item, you MUST return category: "Other" and severity: "low".
2. Prioritize visual evidence from the image above all else.
3. If an issue is classified as "Other", severity MUST be "low".

Return JSON only with exactly these fields:
{
  "category": "Pothole & Road Hazard",
  "severity": "medium",
  "confidence": 0.95,
  "description": "Short factual summary of what is visible in the image"
}
        `.trim();

        const parts: Array<Record<string, unknown>> = [
          { text: prompt },
        ];

        if (parsedImage) {
          parts.push({
            inline_data: {
              mime_type: parsedImage.mimeType,
              data: parsedImage.data,
            },
          });
        }

        if (safeDescription.trim()) {
          parts.push({
            text: `Citizen description: ${safeDescription}`,
          });
        }

        const geminiRes = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": apiKey,
            },
            body: JSON.stringify({
              contents: [{ parts }],
              generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.1,
              },
            }),
            signal: AbortSignal.timeout(15000),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const rawText =
            geminiData?.candidates?.[0]?.content?.parts
              ?.map((part: { text?: string }) => part.text ?? "")
              .join("")
              .trim();

          if (rawText) {
            const parsed = JSON.parse(rawText);

            const validCategory = CATEGORIES.includes(parsed.category as Category);

            const validSeverity = ["low", "medium", "high"].includes(
              parsed.severity
            );

            const validConfidence =
              typeof parsed.confidence === "number" &&
              Number.isFinite(parsed.confidence) &&
              parsed.confidence >= 0 &&
              parsed.confidence <= 1;

            if (validCategory && validSeverity) {
              category = parsed.category;
              severity = parsed.category === "Other" ? "low" : parsed.severity;
              confidence = validConfidence ? parsed.confidence : 0.9;
              analysisSource = "gemini";
            }
          }
        } else {
          console.error("Gemini request failed status:", geminiRes.status);
        }
      } catch (error) {
        console.error("Gemini analysis error; using fallback classifier.", error);
      }
    }

    // Use keyword classification if Gemini was unavailable
    if (analysisSource === "fallback") {
      const fallback = classifyFallback(safeDescription);
      category = fallback.category;
      severity = fallback.severity;
      confidence = 0.4;
    }

    const id = `CF-${Date.now().toString(36).toUpperCase()}`;

    const hasCoordinates =
      latitude !== null &&
      latitude !== undefined &&
      longitude !== null &&
      longitude !== undefined &&
      latitude !== "" &&
      longitude !== "" &&
      Number.isFinite(Number(latitude)) &&
      Number.isFinite(Number(longitude)) &&
      Number(latitude) >= -90 &&
      Number(latitude) <= 90 &&
      Number(longitude) >= -180 &&
      Number(longitude) <= 180;

    const locationString = hasCoordinates
      ? `${Number(latitude).toFixed(5)}, ${Number(longitude).toFixed(5)}`
      : "Bengaluru Central";

    return NextResponse.json({
      success: true,
      id,
      category,
      severity,
      confidence,
      analysisSource,
      location: locationString,
      status: "pending",
      description: safeDescription,
      report_count: 1,
    });
  } catch (err: unknown) {
    console.error("Submit issue error:", err);
    return NextResponse.json(
      { error: "Failed to process issue" },
      { status: 500 }
    );
  }
}
