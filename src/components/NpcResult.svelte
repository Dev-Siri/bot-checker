<script lang="ts">
  import { explanationForBotness } from "$lib/constants";
  import type { NpcSchema } from "$lib/server/schemas/npc-schema";
  import type { TwitterProfile } from "$lib/server/twitter";
  import { adjustPercentage } from "$lib/utils";

  export const {
    result,
  }: {
    result: {
      analysis: NpcSchema;
      user: TwitterProfile;
    };
  } = $props();

  function determineNpcNess(percent: number) {
    if (percent <= 20) return "Main Character";
    if (percent < 39) return "Normal Person";
    if (percent <= 51) return "Likely Engagement Farmer";
    if (percent <= 76) return "In danger of Elon's purge";
    if (percent === 92) return "Canadian Man";

    return "Shreyas Level";
  }

  const { user, analysis } = result;

  const adjustPercent = adjustPercentage(user.name ?? "", analysis.npcLevel ?? "  ");
</script>

<div class="flex items-center gap-4">
  <h4 class="text-start text-3xl">{user.name}</h4>
  <p class="text-gray-500">
    <span class="text-lg font-bold text-black">
      {(user.followersCount ?? 0).toLocaleString()}
    </span>
    Followers
  </p>
  <p class="text-gray-500">
    <span class="text-lg font-bold text-black">
      {(user.statusesCount ?? 0).toLocaleString()}
    </span>
    Tweets
  </p>
</div>
<p class="my-5 text-6xl font-bold">{adjustPercent}% BOT - {determineNpcNess(adjustPercent ?? 0)}</p>
<p class="mt-4 text-sm text-balance">
  {#if user.name?.toLowerCase() === "shreyas mididoddi"}
    {explanationForBotness.shreyas}
  {:else if user.name?.toLowerCase() === "warrenbuffering"}
    {explanationForBotness.warren}
  {:else}
    {analysis.explanation}
  {/if}
</p>
