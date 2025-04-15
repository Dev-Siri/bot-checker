import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { fail } from "@sveltejs/kit";
import { generateObject, type CoreMessage } from "ai";
import { dedent } from "ts-dedent";

import { GOOGLE_GENERATIVE_AI_API_KEY } from "$env/static/private";
import { npcSchema } from "$lib/server/schemas/npc-schema";
import { fetchTwitterProfile } from "$lib/server/twitter";

export const actions = {
  async default({ request }) {
    const reqForm = await request.formData();
    const username = reqForm.get("username");

    if (typeof username !== "string")
      return fail(400, {
        success: false,
        message: "Username isn't a string.",
      });

    const cleanUsername = username.trim().replace(/^@/, "");

    try {
      const user = await fetchTwitterProfile(cleanUsername);

      if (!user)
        return fail(500, {
          success: false,
          message: "Do you exist on the bird app?",
        });

      if (user.tweets.length === 0)
        return {
          success: false,
          message: "Tweet something lil bro.",
        };

      const tweetsStr: string[] = [];

      for (let i = 0; i < user.tweets.length; i++) {
        const tweet = user.tweets[i];

        tweetsStr.push(`<post id="${i}"${tweet.isQuoteStatus ? ' is_quote="true"' : ""}>
    ${tweet.text}
    ${tweet.favoriteCount} likes, ${tweet.replyCount} replies, ${tweet.retweetCount} retweets, ${tweet.quoteCount} quotes
    </post>`);
      }
      const userProfileStr = JSON.stringify({ ...user, tweets: undefined }, null, 2);

      const messages = [
        {
          role: "system",
          content: dedent`
          Analyze the user's Tweets from the given Twitter user and determine their NPC level.

          Give them a NPC score (0 to 100) percentage, which refers to "How NPC like their behavior is". NPC behavior includes boring Tweets, jumping into random
          conversations without seeming out of place, aka blending well with it, and they may also be posting without care for engagement. Which means they Tweet random stuff
          but never actually get meaningful conversations with someone else, let alone likes or replies.

          To not generalize everyone under 50 NPC score, try to randomize and nitpick certain Tweets to make their NPC score a little higher, which makes it more interesting. 
          `,
        },
        {
          role: "user",
          content: dedent`Username: @${username}

    <user_profile>
    ${userProfileStr}
    </user_profile>
    
    <user_tweets count="${user.tweets.length}">
    ${tweetsStr.join("\n\n")}
    </user_tweets>`.trim(),
        },
      ] satisfies CoreMessage[];

      const google = createGoogleGenerativeAI({
        apiKey: GOOGLE_GENERATIVE_AI_API_KEY,
      });

      const { object } = await generateObject({
        model: google("gemini-1.5-flash"),
        temperature: 0.5,
        schema: npcSchema,
        messages,
      });

      return { success: true, data: { analysis: object, user } };
    } catch (err) {
      console.error(err);
      return fail(500, {
        success: false,
        message: "Something happened, whatever it was, definitely wasn't intended. I'm basically trying to tell you that an error occured.",
      });
    }
  },
};
