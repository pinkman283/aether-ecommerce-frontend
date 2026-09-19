import { NextRequest, NextResponse } from "next/server";
import { purgeCacheByPattern, purgeCacheByTags, purgeKeys } from "@/lib/redis";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { secret, tags, keys, pattern } = body;

    const configuredSecret =
      process.env.CACHE_REVALIDATE_SECRET || process.env.REVALIDATE_SECRET;

    // Check authorization if a secret is configured in environment
    if (configuredSecret && secret !== configuredSecret) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid revalidation secret" },
        { status: 401 }
      );
    }

    let totalPurged = 0;

    if (Array.isArray(tags) && tags.length > 0) {
      const purged = await purgeCacheByTags(tags);
      totalPurged += purged;
    }

    if (Array.isArray(keys) && keys.length > 0) {
      const purged = await purgeKeys(...keys);
      totalPurged += purged;
    }

    if (typeof pattern === "string" && pattern.trim() !== "") {
      const purged = await purgeCacheByPattern(pattern.trim());
      totalPurged += purged;
    }

    // Default if no parameters provided: purge all
    if (!tags && !keys && !pattern) {
      const purged = await purgeCacheByPattern("aether:*");
      totalPurged += purged;
    }

    return NextResponse.json({
      success: true,
      message: "Cache revalidated successfully",
      purged_count: totalPurged,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[Revalidate] Error processing purge request:", err);
    return NextResponse.json(
      { error: "Failed to revalidate cache", details: err?.message },
      { status: 500 }
    );
  }
}
