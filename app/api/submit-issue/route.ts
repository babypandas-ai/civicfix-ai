
import { NextResponse } from "next/server";

const CATEGORIES = [
  "Pothole & Road Hazard",
  "Water Supply & Leakage",
  "Electrical & Streetlights",
  "Sanitation & Garbage",
  "Drainage & Sewage",
  "Footpath & Sidewalk",
  "Traffic & Road Infrastructure",
] as const;

type Category = (typeof CATEGORIES)[number];
type Severity = "low" | "medium" | "high";

const FALLBACK_CATEGORY = "Civic Infrastructure";

function parseImage(image: unknown): {
  mimeType: string;
  data: string;
} | null {
  if (typeof image !== "string" || !image.trim()) {
    return null;
  }

  // Supports data URLs such as:
  // data:image/jpeg;base64,/9j/4AAQ...
  const dataUrlMatch = image.match(
    /^data:(image\/(?:jpeg|png|webp));base64,([\s\S]+)$/i
  );

  let mimeType = "image/jpeg";
  let data = image.trim();

  if (dataUrlMatch) {
    mimeType = dataUrlMatch[1].toLowerCase();
    data = dataUrlMatch[2].replace(/\s/g, "");
  } else {
    // Also supports raw base64 image data.
    data = data.replace(/\s/g, "");
  }

  // Reject invalid or unexpectedly large image payloads.
  if (
    !/^([A-Za-z0-9+/]+={0,2})$/.test(data) ||
    data.length % 4 === 1 ||
    data.length > 14_000_000
  ) {
    return null;
  }

  return { mimeType, data };
}

function classifyFallback(description: string): {
  category: string;
  severity: Severity;
} {
  const text = description.toLowerCase();

  if (/pothole|crater|road cavity|uneven road|broken road|road damage/.test(text)) {
    return {
      category: "Pothole & Road Hazard",
      severity: /large|deep|severe|accident|dangerous|multiple/.test(text)
        ? "high"
        : "medium",
    };
  }

  if (/water leak|water leakage|burst pipe|broken pipe|pipeline leak|water wastage/.test(text)) {
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

  if (/streetlight|street light|lamp post|electric pole|exposed wire|electrical wire|traffic light/.test(text)) {
    return {
      category: /exposed wire|live wire|sparking|electric shock/.test(text)
        ? "Electrical & Streetlights"
        : "Electrical & Streetlights",
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
    category: FALLBACK_CATEGORY,
    severity: "medium",
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
    let severity: Severity = "medium";
    let confidence = 0;
    let analysisSource: "gemini" | "fallback" = "fallback";

    const apiKey = process.env.GEMINI_API_KEY;
    const parsedImage = parseImage(image);

    // Gemini can classify either an uploaded image, a description,
    // or both together.
    if (apiKey && apiKey.length > 10 && (parsedImage || safeDescription.trim())) {
      try {
        const prompt = `
You are a careful civic-infrastructure issue classifier.

Analyze the provided image and report description, if available.
Use visible evidence from the image as the primary source.
Use the description only as supporting context. Do not treat claims
in the description as visually confirmed facts.

Allowed categories:
${CATEGORIES.map((item) => `- ${item}`).join("\n")}
- Civic Infrastructure (use only when no category clearly fits or the
  image does not show a recognizable civic issue)

Severity definitions:
- low: Minor, localized issue with little immediate safety impact.
- medium: Clearly noticeable issue that affects public convenience,
  accessibility, sanitation, or normal infrastructure use.
- high: Major hazard, extensive damage, exposed electrical danger,
  dangerous open manhole, substantial flooding, or a serious risk to
  people or essential services.

Rules:
1. Choose exactly one allowed category.
2. Judge severity from the visible scale, extent, and likely public risk.
3. Do not label an issue high merely because the description says so.
4. Do not invent hidden damage, causes, measurements, or circumstances.
5. If the image is unclear or no issue is identifiable, use
   "Civic Infrastructure", severity "medium", and low confidence.
6. Confidence must be a number from 0 to 1. Use lower confidence when
   evidence is weak or the image and description disagree.
7. The description field must briefly state only what is supported.

Return JSON only, using exactly these fields:
{
  "category": "Pothole & Road Hazard",
  "severity": "medium",
  "confidence": 0.85,
  "description": "A damaged section of road is visible."
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
            text: `User-provided report description: ${safeDescription}`,
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

            const validCategory =
              CATEGORIES.includes(parsed.category as Category) ||
              parsed.category === FALLBACK_CATEGORY;

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
              severity = parsed.severity;
              confidence = validConfidence ? parsed.confidence : 0.5;
              analysisSource = "gemini";
            }
          }
        } else {
          // Log the status, but never expose the API key to the client.
          console.error("Gemini request failed:", geminiRes.status);
        }
      } catch (error) {
        // Invalid model output, timeout, or API error:
        // continue with the fallback classifier.
        console.error(
          "Gemini analysis failed; using fallback classification."
        );
      }
    }

    // Use keyword classification if Gemini was unavailable or returned
    // an invalid response.
    if (analysisSource === "fallback") {
      const fallback = classifyFallback(safeDescription);
      category = fallback.category;
      severity = fallback.severity;
      confidence = 0.3;
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
