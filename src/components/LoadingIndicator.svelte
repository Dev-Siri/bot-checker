<script lang="ts">
  import { funFacts } from "$lib/constants";

  let indicator = $state("");
  let isSecondPassed = $state(false);

  $effect(() => {
    setTimeout(() => (isSecondPassed = true), 3000);
    const interval = setInterval(() => {
      if (indicator === "") return (indicator = ".");
      if (indicator === ".") return (indicator = "..");
      if (indicator === "..") return (indicator = "...");

      indicator = "";
    }, 500);

    return () => clearInterval(interval);
  });
</script>

<p>Please wait while I waste your time{indicator}</p>
<p class="pointer-events-none text-sm text-gray-400 duration-200 {isSecondPassed ? 'opacity-100' : 'opacity-0'}">
  Fun fact: {funFacts[Math.floor(Math.random() * funFacts.length)]}.
</p>
