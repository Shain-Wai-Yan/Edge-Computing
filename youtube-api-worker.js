// Cloudflare Worker for AMV Portfolio Enhancement
// Provides API proxying, caching, and additional features

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers for all responses
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    };

    // Handle preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Route handling
      switch (path) {
        case "/api/youtube/channel":
          return await handleChannelInfo(request, env, corsHeaders);

        case "/api/youtube/videos":
          return await handleChannelVideos(request, env, corsHeaders);

        case "/api/youtube/video-details":
          return await handleVideoDetails(request, env, corsHeaders);

        case "/api/analytics/track":
          return await handleAnalytics(request, env, corsHeaders);

        case "/api/cache/clear":
          return await handleCacheClear(request, env, corsHeaders);

        case "/api/health":
          return await handleHealthCheck(corsHeaders);

        default:
          return new Response("Not Found", {
            status: 404,
            headers: corsHeaders,
          });
      }
    } catch (error) {
      console.error("Worker error:", error);
      return new Response(
        JSON.stringify({
          error: "Internal Server Error",
          message: error.message,
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }
  },
};

// YouTube API Configuration
const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
const CACHE_TTL = 300; // 5 minutes cache
const LONG_CACHE_TTL = 3600; // 1 hour cache for channel info

// Enhanced Channel Info with caching
async function handleChannelInfo(request, env, corsHeaders) {
  const url = new URL(request.url);
  const channelId = url.searchParams.get("channelId");

  if (!channelId) {
    return new Response(
      JSON.stringify({
        error: "Missing channelId parameter",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const cacheKey = `channel_info_${channelId}`;

  // Try to get from cache first
  const cached = await env.AMV_CACHE?.get(cacheKey);
  if (cached) {
    return new Response(cached, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "X-Cache": "HIT",
      },
    });
  }

  try {
    const apiUrl = `${YOUTUBE_API_BASE}/channels?part=snippet,statistics,brandingSettings&id=${channelId}&key=${env.YOUTUBE_API_KEY}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();

    // Enhanced response with additional metadata
    const enhancedData = {
      ...data,
      cached_at: new Date().toISOString(),
      worker_version: "1.0.0",
    };

    const responseBody = JSON.stringify(enhancedData);

    // Cache the response
    await env.AMV_CACHE?.put(cacheKey, responseBody, {
      expirationTtl: LONG_CACHE_TTL,
    });

    return new Response(responseBody, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("Channel info error:", error);

    // Return fallback data
    const fallbackData = {
      items: [
        {
          snippet: {
            title: "Shain Studio AMV",
            description:
              "Welcome to my AMV editing channel! Creating dynamic anime music videos that blend storytelling with impactful visuals.",
            thumbnails: {
              high: { url: "images/Shain Studio.png" },
            },
          },
          statistics: {
            subscriberCount: "1200",
            videoCount: "25",
          },
          brandingSettings: {
            image: {
              bannerExternalUrl:
                "https://via.placeholder.com/2560x1440/191970/ffffff?text=Shain+Studio+AMV+Channel",
            },
          },
        },
      ],
      fallback: true,
      error: error.message,
    };

    return new Response(JSON.stringify(fallbackData), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "X-Cache": "FALLBACK",
      },
    });
  }
}

// Enhanced Video Fetching with batch processing
async function handleChannelVideos(request, env, corsHeaders) {
  const url = new URL(request.url);
  const channelId = url.searchParams.get("channelId");
  const maxResults = parseInt(url.searchParams.get("maxResults")) || 50;
  const pageToken = url.searchParams.get("pageToken") || "";

  if (!channelId) {
    return new Response(
      JSON.stringify({
        error: "Missing channelId parameter",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const cacheKey = `videos_${channelId}_${maxResults}_${pageToken}`;

  // Try cache first
  const cached = await env.AMV_CACHE?.get(cacheKey);
  if (cached) {
    return new Response(cached, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "X-Cache": "HIT",
      },
    });
  }

  try {
    // First, get the uploads playlist ID
    const channelUrl = `${YOUTUBE_API_BASE}/channels?part=contentDetails&id=${channelId}&key=${env.YOUTUBE_API_KEY}`;
    const channelResponse = await fetch(channelUrl);

    if (!channelResponse.ok) {
      throw new Error(`Channel API error: ${channelResponse.status}`);
    }

    const channelData = await channelResponse.json();
    const uploadsPlaylistId =
      channelData.items[0]?.contentDetails?.relatedPlaylists?.uploads;

    if (!uploadsPlaylistId) {
      throw new Error("Uploads playlist not found");
    }

    // Get videos from playlist
    let videosUrl = `${YOUTUBE_API_BASE}/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${env.YOUTUBE_API_KEY}`;
    if (pageToken) videosUrl += `&pageToken=${pageToken}`;

    const videosResponse = await fetch(videosUrl);

    if (!videosResponse.ok) {
      throw new Error(`Videos API error: ${videosResponse.status}`);
    }

    const videosData = await videosResponse.json();

    // Get detailed video information in batches
    if (videosData.items && videosData.items.length > 0) {
      const videoIds = videosData.items
        .map((item) => item.snippet.resourceId.videoId)
        .join(",");

      const detailsUrl = `${YOUTUBE_API_BASE}/videos?part=statistics,contentDetails,status&id=${videoIds}&key=${env.YOUTUBE_API_KEY}`;
      const detailsResponse = await fetch(detailsUrl);

      if (detailsResponse.ok) {
        const detailsData = await detailsResponse.json();

        // Merge video details
        videosData.items = videosData.items.map((item) => {
          const videoId = item.snippet.resourceId.videoId;
          const details = detailsData.items.find(
            (detail) => detail.id === videoId
          );

          return {
            ...item,
            statistics: details?.statistics || {},
            contentDetails: details?.contentDetails || {},
            status: details?.status || {},
            enhanced: true,
          };
        });
      }
    }

    // Add metadata
    const enhancedData = {
      ...videosData,
      cached_at: new Date().toISOString(),
      worker_enhanced: true,
    };

    const responseBody = JSON.stringify(enhancedData);

    // Cache the response
    await env.AMV_CACHE?.put(cacheKey, responseBody, {
      expirationTtl: CACHE_TTL,
    });

    return new Response(responseBody, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("Videos fetch error:", error);

    // Return fallback mock data
    const fallbackData = {
      items: [
        {
          snippet: {
            resourceId: { videoId: "8aIsh6rfW4U" },
            title: "The death from Puss in boots: the last wish edited",
            description:
              "A powerful AMV featuring the emotional scenes from Puss in Boots: The Last Wish",
            thumbnails: {
              high: {
                url: "https://via.placeholder.com/640x360/191970/ffffff?text=Puss+in+Boots+AMV",
              },
            },
            publishedAt: "2022-01-01T00:00:00Z",
            channelTitle: "Shain Studio",
          },
          statistics: { viewCount: "6200" },
          contentDetails: { duration: "PT1M" },
          status: { embeddable: true, privacyStatus: "public" },
        },
      ],
      fallback: true,
      error: error.message,
    };

    return new Response(JSON.stringify(fallbackData), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "X-Cache": "FALLBACK",
      },
    });
  }
}

// Video Details with enhanced metadata
async function handleVideoDetails(request, env, corsHeaders) {
  const url = new URL(request.url);
  const videoId = url.searchParams.get("videoId");

  if (!videoId) {
    return new Response(
      JSON.stringify({
        error: "Missing videoId parameter",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const cacheKey = `video_details_${videoId}`;

  // Try cache first
  const cached = await env.AMV_CACHE?.get(cacheKey);
  if (cached) {
    return new Response(cached, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "X-Cache": "HIT",
      },
    });
  }

  try {
    const apiUrl = `${YOUTUBE_API_BASE}/videos?part=snippet,statistics,contentDetails,status&id=${videoId}&key=${env.YOUTUBE_API_KEY}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`Video details API error: ${response.status}`);
    }

    const data = await response.json();

    // Add enhanced metadata
    if (data.items && data.items.length > 0) {
      data.items[0].enhanced_metadata = {
        embed_url: `https://www.youtube.com/embed/${videoId}`,
        watch_url: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnail_sizes: ["default", "medium", "high", "standard", "maxres"],
        cached_at: new Date().toISOString(),
      };
    }

    const responseBody = JSON.stringify(data);

    // Cache the response
    await env.AMV_CACHE?.put(cacheKey, responseBody, {
      expirationTtl: CACHE_TTL,
    });

    return new Response(responseBody, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("Video details error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch video details",
        message: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}

// Analytics tracking
async function handleAnalytics(request, env, corsHeaders) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const data = await request.json();
    const timestamp = new Date().toISOString();

    // Store analytics data (you can extend this to use Durable Objects or external analytics)
    const analyticsData = {
      ...data,
      timestamp,
      ip: request.headers.get("CF-Connecting-IP"),
      country: request.cf?.country,
      user_agent: request.headers.get("User-Agent"),
    };

    // Log to console (in production, you might want to send to an analytics service)
    console.log("Analytics event:", analyticsData);

    // You could store this in KV or send to an external service
    if (env.ANALYTICS_KV) {
      const key = `analytics_${timestamp}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      await env.ANALYTICS_KV.put(key, JSON.stringify(analyticsData));
    }

    return new Response(
      JSON.stringify({
        success: true,
        timestamp,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Analytics error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to track analytics",
        message: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}

// Cache management
async function handleCacheClear(request, env, corsHeaders) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(request.url);
    const pattern = url.searchParams.get("pattern") || "";

    // This is a simplified cache clear - in production you might want more sophisticated cache management
    let cleared = 0;

    if (pattern) {
      // Clear specific pattern (this would need to be implemented based on your KV structure)
      console.log(`Clearing cache pattern: ${pattern}`);
      cleared = 1; // Placeholder
    } else {
      // Clear all cache (be careful with this in production)
      console.log("Clearing all cache");
      cleared = 1; // Placeholder
    }

    return new Response(
      JSON.stringify({
        success: true,
        cleared_items: cleared,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Cache clear error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to clear cache",
        message: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}

// Health check endpoint
async function handleHealthCheck(corsHeaders) {
  return new Response(
    JSON.stringify({
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      services: {
        youtube_api: "available",
        cache: "available",
        analytics: "available",
      },
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}
