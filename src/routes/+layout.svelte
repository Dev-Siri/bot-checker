<script lang="ts">
  import "../app.css";

  let { children } = $props();
</script>

<svelte:head>
  <title>How Bot Are You?</title>
  <link rel="shortcut icon" href="/imgs/devsiri.png" />
</svelte:head>
{@render children()}
