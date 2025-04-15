<script lang="ts">
  import { enhance } from "$app/forms";
  import BotScale from "../components/BotScale.svelte";
  import Header from "../components/Header.svelte";
  import LoadingIndicator from "../components/LoadingIndicator.svelte";
  import NpcResult from "../components/NpcResult.svelte";

  let { form } = $props();

  let usernameInput: HTMLInputElement;

  let isInputFocused = $state(false);
  let username = $state("");
  let isLoading = $state(false);

  $effect(() => {
    usernameInput.focus();
  });
</script>

<Header />
<main class="mt-[10vh] flex h-[90vh] w-screen flex-col items-center justify-center p-2 text-center md:p-4">
  <h1 class=" text-4xl font-bold text-balance md:text-5xl">How Bot are you?</h1>
  <p class="mt-4 text-balance">
    See where you stand on the scale from 0% to Shreyas (100%) based on your Twitter activity. High NPC (a.k.a. Bot) points are given on how boring
    your Tweets are, how well you can jump into a conversation without seeming out of place, or if your Tweets go to no one.
  </p>
  <form
    action="/"
    method="POST"
    class="mt-10"
    use:enhance={() => {
      isLoading = true;

      return ({ update }) => {
        isLoading = false;
        update({ reset: false });
      };
    }}
  >
    <div class="flex">
      <a href="https://twitter.com/{username}" aria-label="Twitter" target="_blank" rel="noopener roreferrer">
        <svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" viewBox="0 0 248 204" class="m-4 h-8 w-8">
          <path
            fill="#1d9bf0"
            d="M221.95 51.29c.15 2.17.15 4.34.15 6.53 0 66.73-50.8 143.69-143.69 143.69v-.04c-27.44.04-54.31-7.82-77.41-22.64 3.99.48 8 .72 12.02.73 22.74.02 44.83-7.61 62.72-21.66-21.61-.41-40.56-14.5-47.18-35.07 7.57 1.46 15.37 1.16 22.8-.87-23.56-4.76-40.51-25.46-40.51-49.5v-.64c7.02 3.91 14.88 6.08 22.92 6.32C11.58 63.31 4.74 33.79 18.14 10.71c25.64 31.55 63.47 50.73 104.08 52.76-4.07-17.54 1.49-35.92 14.61-48.25 20.34-19.12 52.33-18.14 71.45 2.19 11.31-2.23 22.15-6.38 32.07-12.26-3.77 11.69-11.66 21.62-22.2 27.93 10.01-1.18 19.79-3.86 29-7.95-6.78 10.16-15.32 19.01-25.2 26.16z"
          />
        </svg>
      </a>
      <input
        type="text"
        placeholder="Username"
        class="w-full bg-transparent pr-2 text-2xl caret-purple-700 outline-none"
        name="username"
        onfocus={() => (isInputFocused = true)}
        onblur={() => (isInputFocused = false)}
        bind:value={username}
        bind:this={usernameInput}
      />
      <button
        type="submit"
        class="my-2 cursor-pointer rounded-lg border-2 border-blue-500 bg-blue-500 p-3 px-6 font-semibold text-white duration-200 hover:bg-blue-700"
      >
        Check
      </button>
    </div>
    <div class="h-0.5 w-full rounded-full duration-200 {isInputFocused ? 'bg-blue-400' : 'bg-gray-300'}"></div>
  </form>
  {#if isLoading}
    <div class="mt-10">
      <LoadingIndicator />
    </div>
  {/if}
  <!-- could be undefined -->
  {#if form?.success === false}
    <p class="mt-4 text-red-500">
      ⚠️ {form?.message ?? "Something happened, whatever it was, definitely wasn't intended. I'm basically trying to tell you that an error occured"}
    </p>
  {/if}
  {#if form?.success === true && form.data}
    <div class="mt-4 flex w-full flex-col items-start px-5 md:px-40">
      <NpcResult result={form.data} />
    </div>
  {/if}
  <div class="mt-20 w-full px-4 md:px-40">
    {#key form}
      <BotScale percent={form?.success === true ? form?.data?.analysis.npcLevel : 0} username={form?.data?.user.name} />
    {/key}
  </div>
</main>
