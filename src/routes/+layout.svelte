<script lang="ts">
  import { injectAnalytics } from "@vercel/analytics/sveltekit";
  import "../app.css";

  injectAnalytics();

  let { children } = $props();
</script>

<svelte:head>
  <title>How Bot Are You?</title>
  <link rel="shortcut icon" href="/imgs/devsiri.png" />
</svelte:head>
{@render children()}
