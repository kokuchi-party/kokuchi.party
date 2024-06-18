<script lang="ts">
  import { toggleMode } from "mode-watcher";
  import type { PageData } from "./$types";

  export let data: PageData;
</script>

<header>
  <nav class="flex flex-col items-start">
    {#if data.user}
      <a href="/user/logout">Signout</a>
    {:else}
      <a href="/user/login">Sign In</a>
    {/if}
    <button on:click={toggleMode}> Toggle Theme </button>
  </nav>
</header>

<main>
  <ul>
    <li>Name: {data.user?.name}</li>
    <li>Email: {data.user?.email}</li>
  </ul>
</main>
