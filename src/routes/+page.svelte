<script lang="ts">
  import type { PageData } from "./$types";

  export let data: PageData;
</script>

<header>
  <nav>
    {#if data.user}
      <a href="/auth/logout">Signout</a>
    {:else}
      <a href="/auth/login/google">Sign In (Google)</a>
      |
      <a href="/auth/login/email">Sign In (Email)</a>
    {/if}
  </nav>
</header>

<main>
  <ul>
    <li>Name: {data.user?.name}</li>
    <li>Email: {data.user?.email}</li>
  </ul>
</main>
