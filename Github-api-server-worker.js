/**
 * GitHub API Proxy Worker
 *
 * Handles CORS and provides custom endpoints for GitHub profile data
 */

// Main event listener
addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event));
});

/**
 * Main request handler
 */
async function handleRequest(event) {
  const request = event.request;
  const url = new URL(request.url);
  const path = url.pathname;

  // Enable CORS for preflight requests
  if (request.method === "OPTIONS") {
    return handleCORS();
  }

  // Home route
  if (path === "/" || path === "") {
    return new Response("GitHub API Proxy Worker is Running! 🚀", {
      headers: corsHeaders(),
    });
  }

  // Get GitHub token from environment variable
  // This is the correct way to access environment variables in Cloudflare Workers
  const token = globalThis.GITHUB_TOKEN || "";

  // Debug: Log token (first few characters)
  console.log(`Token available: ${token ? "Yes" : "No"}`);
  if (token) {
    console.log(`Token starts with: ${token.substring(0, 4)}...`);
  } else {
    console.log("No token found!");
  }

  // Handle API routes
  if (path.startsWith("/api/github/")) {
    try {
      // Check cache first for GET requests
      if (request.method === "GET") {
        const cache = caches.default;
        const cacheKey = new Request(url.toString(), request);
        const cachedResponse = await cache.match(cacheKey);

        if (cachedResponse) {
          // Add CORS headers to cached response
          const corsResponse = new Response(
            cachedResponse.body,
            cachedResponse
          );
          Object.entries(corsHeaders()).forEach(([key, value]) => {
            corsResponse.headers.set(key, value);
          });
          return corsResponse;
        }
      }

      // Route to appropriate handler
      let response;
      if (path.includes("/contributions")) {
        response = await handleContributions(event, path, token);
      } else if (path.includes("/pinned")) {
        response = await handlePinnedRepos(event, path, token);
      } else if (path.includes("/top-languages")) {
        response = await handleTopLanguages(event, path, token);
      } else if (path.includes("/detailed-activity")) {
        response = await handleDetailedActivity(event, path, token);
      } else {
        // General GitHub API proxy
        response = await handleGitHubProxy(event, path, token);
      }

      // Ensure CORS headers are set
      Object.entries(corsHeaders()).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;
    } catch (error) {
      console.error(`Error handling request: ${error.message}`);
      // Return error with CORS headers
      return new Response(
        JSON.stringify({
          error: "Internal server error",
          message: error.message,
          path: path,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders(),
          },
        }
      );
    }
  }

  // Not found
  return new Response("Not Found", {
    status: 404,
    headers: corsHeaders(),
  });
}

/**
 * Handle CORS preflight requests
 */
function handleCORS() {
  return new Response(null, {
    headers: corsHeaders(),
  });
}

/**
 * Add CORS headers to all responses
 */
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Max-Age": "86400",
  };
}

/**
 * Handle GitHub API proxy requests
 */
async function handleGitHubProxy(event, path, token) {
  // Extract the GitHub path from the request
  const githubPath = path.replace("/api/github/", "");
  const CACHE_TIME = 60 * 60; // 1 hour in seconds

  try {
    console.log(`Proxying request to: https://api.github.com/${githubPath}`);
    console.log(
      `Using token: ${
        token ? "Yes (starts with " + token.substring(0, 4) + "...)" : "No"
      }`
    );

    const response = await fetch(`https://api.github.com/${githubPath}`, {
      headers: {
        Authorization: `token ${token}`,
        "User-Agent": "GitHub-Profile-Viewer",
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`GitHub API error: ${response.status}`, errorData);
      return new Response(
        JSON.stringify({
          error: `GitHub API error: ${response.status}`,
          details: errorData,
        }),
        {
          status: response.status,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders(),
          },
        }
      );
    }

    const data = await response.json();
    const responseBody = JSON.stringify(data);

    // Cache the successful response
    const responseToCache = new Response(responseBody, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": `public, max-age=${CACHE_TIME}`,
        ...corsHeaders(),
      },
    });

    event.waitUntil(caches.default.put(event.request, responseToCache.clone()));

    return responseToCache;
  } catch (error) {
    console.error(`Error in handleGitHubProxy: ${error.message}`);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch data from GitHub",
        message: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(),
        },
      }
    );
  }
}

/**
 * Handle user contributions request
 */
async function handleContributions(event, path, token) {
  // Extract username from path
  const usernameMatch = path.match(/\/users\/([^/]+)\/contributions/);
  if (!usernameMatch) {
    return new Response(
      JSON.stringify({ error: "Invalid username in request" }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(),
        },
      }
    );
  }

  const username = usernameMatch[1];
  const CACHE_TIME = 60 * 60; // 1 hour in seconds

  try {
    console.log(`Fetching contributions for user: ${username}`);
    console.log(
      `Using token: ${
        token ? "Yes (starts with " + token.substring(0, 4) + "...)" : "No"
      }`
    );

    // GraphQL query to get contribution data
    const query = `
      query {
        user(login: "${username}") {
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  date
                  contributionCount
                  color
                }
              }
            }
          }
        }
      }
    `;

    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "GitHub-Profile-Viewer",
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();

    if (data.errors) {
      console.error("GraphQL errors:", data.errors);
      throw new Error(data.errors[0].message);
    }

    const calendar =
      data.data?.user?.contributionsCollection?.contributionCalendar;

    if (!calendar) {
      console.error("No contribution data found:", data);
      return new Response(
        JSON.stringify({
          error: "Contribution data not found",
          rawResponse: data,
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders(),
          },
        }
      );
    }

    const totalContributions = calendar.totalContributions;

    // Flatten the nested structure
    const contributions = [];
    calendar.weeks.forEach((week) => {
      week.contributionDays.forEach((day) => {
        contributions.push({
          date: day.date,
          count: day.contributionCount,
          color: day.color,
        });
      });
    });

    const responseBody = JSON.stringify({
      totalContributions,
      contributions,
    });

    // Cache the successful response
    const responseToCache = new Response(responseBody, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": `public, max-age=${CACHE_TIME}`,
        ...corsHeaders(),
      },
    });

    event.waitUntil(caches.default.put(event.request, responseToCache.clone()));

    return responseToCache;
  } catch (error) {
    console.error(`Error in handleContributions: ${error.message}`);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch contribution data",
        message: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(),
        },
      }
    );
  }
}

/**
 * Handle pinned repositories request
 */
async function handlePinnedRepos(event, path, token) {
  // Extract username from path
  const usernameMatch = path.match(/\/users\/([^/]+)\/pinned/);
  if (!usernameMatch) {
    return new Response(
      JSON.stringify({ error: "Invalid username in request" }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(),
        },
      }
    );
  }

  const username = usernameMatch[1];
  const CACHE_TIME = 60 * 60; // 1 hour in seconds

  try {
    console.log(`Fetching pinned repositories for user: ${username}`);
    console.log(
      `Using token: ${
        token ? "Yes (starts with " + token.substring(0, 4) + "...)" : "No"
      }`
    );

    // GraphQL query to get pinned repositories
    const query = `
      query {
        user(login: "${username}") {
          pinnedItems(first: 6, types: REPOSITORY) {
            nodes {
              ... on Repository {
                name
                description
                url
                stargazerCount
                forkCount
                primaryLanguage {
                  name
                  color
                }
                updatedAt
              }
            }
          }
        }
      }
    `;

    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "GitHub-Profile-Viewer",
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();

    if (data.errors) {
      console.error("GraphQL errors:", data.errors);
      throw new Error(data.errors[0].message);
    }

    if (!data.data?.user?.pinnedItems?.nodes) {
      console.error("No pinned repositories found:", data);
      return new Response(
        JSON.stringify({
          error: "Pinned repositories not found",
          rawResponse: data,
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders(),
          },
        }
      );
    }

    const responseBody = JSON.stringify(data.data.user.pinnedItems.nodes);

    // Cache the successful response
    const responseToCache = new Response(responseBody, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": `public, max-age=${CACHE_TIME}`,
        ...corsHeaders(),
      },
    });

    event.waitUntil(caches.default.put(event.request, responseToCache.clone()));

    return responseToCache;
  } catch (error) {
    console.error(`Error in handlePinnedRepos: ${error.message}`);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch pinned repositories",
        message: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(),
        },
      }
    );
  }
}

/**
 * Handle top languages request
 */
async function handleTopLanguages(event, path, token) {
  // Extract username from path
  const usernameMatch = path.match(/\/users\/([^/]+)\/top-languages/);
  if (!usernameMatch) {
    return new Response(
      JSON.stringify({ error: "Invalid username in request" }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(),
        },
      }
    );
  }

  const username = usernameMatch[1];
  const CACHE_TIME = 60 * 60; // 1 hour in seconds

  try {
    console.log(`Fetching top languages for user: ${username}`);
    console.log(
      `Using token: ${
        token ? "Yes (starts with " + token.substring(0, 4) + "...)" : "No"
      }`
    );

    // GraphQL query to get repositories with languages
    const query = `
      query {
        user(login: "${username}") {
          repositories(first: 100, orderBy: {field: UPDATED_AT, direction: DESC}, isFork: false) {
            nodes {
              name
              languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
                edges {
                  size
                  node {
                    name
                    color
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "GitHub-Profile-Viewer",
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();

    if (data.errors) {
      console.error("GraphQL errors:", data.errors);
      throw new Error(data.errors[0].message);
    }

    if (!data.data?.user?.repositories?.nodes) {
      console.error("No repository language data found:", data);
      return new Response(
        JSON.stringify({
          error: "Repository language data not found",
          rawResponse: data,
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders(),
          },
        }
      );
    }

    // Process language data
    const languages = {};
    let totalSize = 0;

    data.data.user.repositories.nodes.forEach((repo) => {
      if (repo.languages?.edges) {
        repo.languages.edges.forEach((edge) => {
          const { name, color } = edge.node;
          const size = edge.size;

          if (!languages[name]) {
            languages[name] = { size: 0, color };
          }

          languages[name].size += size;
          totalSize += size;
        });
      }
    });

    // If no languages were found
    if (totalSize === 0) {
      return new Response(JSON.stringify([]), {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(),
        },
      });
    }

    // Convert to array and calculate percentages
    const languageArray = Object.keys(languages).map((name) => ({
      name,
      color: languages[name].color,
      size: languages[name].size,
      percentage: ((languages[name].size / totalSize) * 100).toFixed(1),
    }));

    // Sort by size (descending)
    languageArray.sort((a, b) => b.size - a.size);

    const responseBody = JSON.stringify(languageArray);

    // Cache the successful response
    const responseToCache = new Response(responseBody, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": `public, max-age=${CACHE_TIME}`,
        ...corsHeaders(),
      },
    });

    event.waitUntil(caches.default.put(event.request, responseToCache.clone()));

    return responseToCache;
  } catch (error) {
    console.error(`Error in handleTopLanguages: ${error.message}`);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch top languages",
        message: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(),
        },
      }
    );
  }
}

/**
 * Handle detailed activity request
 */
async function handleDetailedActivity(event, path, token) {
  // Extract username from path
  const usernameMatch = path.match(/\/users\/([^/]+)\/detailed-activity/);
  if (!usernameMatch) {
    return new Response(
      JSON.stringify({ error: "Invalid username in request" }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(),
        },
      }
    );
  }

  const username = usernameMatch[1];
  const CACHE_TIME = 60 * 60; // 1 hour in seconds

  try {
    console.log(`Fetching detailed activity for user: ${username}`);
    console.log(
      `Using token: ${
        token ? "Yes (starts with " + token.substring(0, 4) + "...)" : "No"
      }`
    );

    // GraphQL query to get detailed user activity
    const query = `
      query {
        user(login: "${username}") {
          contributionsCollection {
            commitContributionsByRepository(maxRepositories: 10) {
              repository {
                name
                url
              }
              contributions {
                totalCount
              }
            }
            pullRequestContributionsByRepository(maxRepositories: 10) {
              repository {
                name
                url
              }
              contributions {
                totalCount
              }
            }
            issueContributionsByRepository(maxRepositories: 10) {
              repository {
                name
                url
              }
              contributions {
                totalCount
              }
            }
          }
        }
      }
    `;

    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "GitHub-Profile-Viewer",
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();

    if (data.errors) {
      console.error("GraphQL errors:", data.errors);
      throw new Error(data.errors[0].message);
    }

    if (!data.data?.user?.contributionsCollection) {
      console.error("No detailed activity data found:", data);
      return new Response(
        JSON.stringify({
          error: "Detailed activity data not found",
          rawResponse: data,
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders(),
          },
        }
      );
    }

    const responseBody = JSON.stringify(data.data.user.contributionsCollection);

    // Cache the successful response
    const responseToCache = new Response(responseBody, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": `public, max-age=${CACHE_TIME}`,
        ...corsHeaders(),
      },
    });

    event.waitUntil(caches.default.put(event.request, responseToCache.clone()));

    return responseToCache;
  } catch (error) {
    console.error(`Error in handleDetailedActivity: ${error.message}`);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch detailed activity",
        message: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(),
        },
      }
    );
  }
}
