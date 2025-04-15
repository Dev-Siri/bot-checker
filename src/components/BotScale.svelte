<script lang="ts">
  import { adjustPercentage } from "$lib/utils";

  let { percent, username }: { percent?: number; username?: string } = $props();

  const adjustPercent = adjustPercentage(username ?? "", percent ?? 0);
</script>

<div>
  <div class="h-2 w-full rounded-full bg-gray-300">
    <div class="h-full rounded-full bg-blue-400 duration-200" style="width: {adjustPercent}%;"></div>
  </div>
  <div class="flex justify-between">
    <p>0%</p>
    <div class="flex justify-between">
      <p>92%</p>
      <p class="ml-[8%]">100%</p>
    </div>
  </div>
  <div class="relative flex justify-between">
    <p></p>
    <p class="absolute {username && '-mt-10 rounded-full bg-blue-200 px-4'}" style="margin-left: {adjustPercent - 5}%;">{username ?? "_"}</p>
    <div class="flex justify-between">
      <a href="https://twitter.com/WarrenInTheBuff" target="_blank" rel="noreferrer noopener" class="mr-[8%]">
        <img src="/imgs/warren.jpg" alt="Warren" height="40" width="40" class="rounded-full" />
      </a>
      <a href="https://twitter.com/Shreyassanthu77" target="_blank" rel="noreferrer noopener">
        <img src="/imgs/shreyas.jpg" alt="Shreyas" height="40" width="40" class="rounded-full" />
      </a>
    </div>
  </div>
  <div class="flex justify-between">
    <div></div>
    <div class="-mr-2 flex justify-between">
      <p>Warren</p>
      <p class="ml-[8%]">Shreyas</p>
    </div>
  </div>
</div>
