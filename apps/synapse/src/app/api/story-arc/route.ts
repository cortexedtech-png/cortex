import { NextResponse } from "next/server";

const DEFAULT_CORE_API_URL = "http://localhost:3001";

export async function POST(req: Request) {
    try {
        const rawUrl = process.env.CORTEX_CORE_API_URL || DEFAULT_CORE_API_URL;

        let normalizedUrl = rawUrl;
        if (!rawUrl.startsWith("http://") && !rawUrl.startsWith("https://")) {
            normalizedUrl = `https://${rawUrl}`;
        }
        const coreApiUrl = normalizedUrl.endsWith("/")
            ? normalizedUrl.slice(0, -1)
            : normalizedUrl;

        const body = await req.json() as { loreId?: string; missionId?: string };

        console.log(`[StoryArcProxy] Fetching arc from: ${coreApiUrl}/synapse/story-arc`);

        const upstream = await fetch(`${coreApiUrl}/synapse/story-arc`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ loreId: body.loreId, missionId: body.missionId }),
            cache: "no-store",
        });

        const text = await upstream.text();

        if (!upstream.ok) {
            console.error(`[StoryArcProxy] Upstream error (${upstream.status}):`, text);
            return NextResponse.json(
                { error: text || `Upstream error: ${upstream.status}` },
                { status: upstream.status },
            );
        }

        try {
            return NextResponse.json(JSON.parse(text));
        } catch {
            console.error("[StoryArcProxy] Failed to parse upstream JSON:", text);
            return NextResponse.json(
                { error: "Upstream returned invalid JSON" },
                { status: 502 },
            );
        }
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error("[StoryArcProxy] Critical Error:", errorMessage);
        return NextResponse.json(
            { error: "Internal Server Error in StoryArc Proxy" },
            { status: 500 },
        );
    }
}
