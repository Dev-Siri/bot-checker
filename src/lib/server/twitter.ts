// Thank you, puang59 on GitHub
// I stole this entire file from your 'xtoxic' codebase
import { EXA_API_KEY } from "$env/static/private";

export interface Tweet {
  text: string;
  createdAt: string;
  favoriteCount: number;
  quoteCount: number;
  replyCount: number;
  retweetCount: number;
  isQuoteStatus?: boolean;
}

export interface TwitterProfile {
  tweets: Tweet[];
  bio?: string;
  profileUrl?: string;
  name?: string;
  createdAt?: string;
  followersCount?: number;
  statusesCount?: number;
  location?: string;
}

interface TweetResult {
  url: string;
}

export async function fetchTwitterProfile(username: string): Promise<TwitterProfile | null> {
  if (!username) return null;
  const cleanUsername = username.trim().replace(/^@/, "");

  try {
    const profileResponse = await fetch("https://api.exa.ai/contents", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${EXA_API_KEY}`,
      },
      body: JSON.stringify({
        ids: [`https://x.com/${cleanUsername}`],
        text: true,
        livecrawl: "always",
      }),
    });

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      throw new Error(`EXA API error: ${profileResponse.status} ${errorText}`);
    }

    const profileData = await profileResponse.json();

    if (!profileData.results || profileData.results.length === 0) {
      console.error("No profile results returned from Exa API");
      return null;
    }

    const profileInfo = extractProfileInfo(profileData.results[0].text);

    const tweetsResponse = await fetch("https://api.exa.ai/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${EXA_API_KEY}`,
      },
      body: JSON.stringify({
        query: `from:${cleanUsername}`,
        numResults: 20,
        includeDomains: ["twitter.com", "x.com"],
        excludeDomains: [],
        startPublishedDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        endPublishedDate: new Date().toISOString(),
        useAutoprompt: true,
      }),
    });

    if (!tweetsResponse.ok) {
      const errorText = await tweetsResponse.text();
      throw new Error(`EXA API error: ${tweetsResponse.status} ${errorText}`);
    }

    const tweetsData = await tweetsResponse.json();

    const statusResults = tweetsData.results.filter(
      (result: TweetResult) =>
        result.url.includes("/status/") && (result.url.includes(`/${cleanUsername}/`) || result.url.includes(`/${cleanUsername.toLowerCase()}/`)),
    );

    if (statusResults.length === 0) {
      return {
        ...profileInfo,
        tweets: [],
      };
    }

    const tweetContentResponse = await fetch("https://api.exa.ai/contents", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${EXA_API_KEY}`,
      },
      body: JSON.stringify({
        ids: statusResults.slice(0, 20).map((result: TweetResult) => result.url),
        text: true,
        livecrawl: "always",
      }),
    });

    if (!tweetContentResponse.ok) {
      const errorText = await tweetContentResponse.text();
      console.error(`Error fetching Tweet contents: ${errorText}`);
      return {
        ...profileInfo,
        tweets: [],
      };
    }

    const tweetContentData = await tweetContentResponse.json();
    const tweets: Tweet[] = [];

    if (tweetContentData.results && tweetContentData.results.length > 0) {
      for (const result of tweetContentData.results) {
        if (result.text) {
          try {
            const tweetText = extractTweetTextFromContent(result.text);

            if (tweetText) {
              tweets.push({
                text: tweetText,
                createdAt: result.publishedDate || new Date().toISOString(),
                favoriteCount: extractEngagementMetric(result.text, "like") || 0,
                quoteCount: extractEngagementMetric(result.text, "quote") || 0,
                replyCount: extractEngagementMetric(result.text, "repl") || 0,
                retweetCount: extractEngagementMetric(result.text, "retweet") || 0,
                isQuoteStatus: result.text.includes("Quoted") || result.text.includes("Quoting"),
              });
            }
          } catch (err) {
            console.error("Error processing tweet:", err);
          }
        }
      }
    }

    return {
      ...profileInfo,
      tweets,
    };
  } catch (error) {
    console.error(`Error fetching Tweets for @${cleanUsername} from Exa:`, error);
    return null;
  }
}

function extractProfileInfo(text: string) {
  const profileInfo = {
    bio: "",
    profileUrl: "",
    name: "",
    createdAt: "",
    followersCount: 0,
    statusesCount: 0,
    location: "",
  };

  if (!text) return profileInfo;

  try {
    const bioMatch = text.match(/^(.*?)(\||$)/);
    if (bioMatch && bioMatch[1]) {
      profileInfo.bio = bioMatch[1].trim();
    }

    const profileUrlMatch = text.match(/\| profile_url:\s*([^|]+)/);
    const nameMatch = text.match(/\| name:\s*([^|]+)/);
    const createdAtMatch = text.match(/\| created_at:\s*([^|]+)/);
    const followersMatch = text.match(/\| followers_count:\s*(\d+)/);
    const statusesMatch = text.match(/\| statuses_count:\s*(\d+)/);
    const locationMatch = text.match(/\| location:\s*([^|$]+)/);

    if (profileUrlMatch) profileInfo.profileUrl = profileUrlMatch[1].trim();
    if (nameMatch) profileInfo.name = nameMatch[1].trim();
    if (createdAtMatch) profileInfo.createdAt = createdAtMatch[1].trim();
    if (followersMatch) profileInfo.followersCount = parseInt(followersMatch[1]);
    if (statusesMatch) profileInfo.statusesCount = parseInt(statusesMatch[1]);
    if (locationMatch) profileInfo.location = locationMatch[1].trim();
  } catch (err) {
    console.error("Error extracting profile info:", err);
  }

  return profileInfo;
}

function extractTweetTextFromContent(content: string) {
  if (!content) return "";

  try {
    const patterns = [/(?:^|\n)(?!@\w+:)([^@\n]+?)(?=\n\d+\s*(?:like|retweet|repl|share|view|react|comment)s?|$)/im, /(?:^|\n)([^@\n]+?)(?=\n|$)/m];

    for (const pattern of patterns) {
      const match = content.match(pattern);

      if (match && match[1] && match[1].trim()) return match[1].trim();
    }

    const lines = content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);

    for (const line of lines) {
      if (!line.match(/^\d+\s*(like|retweet|repl|view|share|comment)s?/) && !line.match(/^@\w+:/) && !line.startsWith("|")) return line;
    }

    if (content.length < 280) return content.trim();

    return "";
  } catch (err) {
    console.error("Error extracting Tweet text:", err);
    return "";
  }
}

function extractEngagementMetric(content: string, metricType: string) {
  if (!content) return null;

  try {
    const regex = new RegExp(`(\\d+)\\s*${metricType}s?`, "i");
    const match = content.match(regex);
    if (match && match[1]) {
      return parseInt(match[1]);
    }

    return null;
  } catch (err) {
    console.error(`Error extracting ${metricType} count:`, err);
    return null;
  }
}
