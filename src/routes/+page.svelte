<script lang="ts">
  import type { PageData } from "./$types";

  export let data: PageData;
</script>

<header>
  <nav>
    {#if data.user}
      <a href="/user/logout">Signout</a>
    {:else}
      <a href="/user/auth/google">Sign In (Google)</a>
      |
      <a href="/user/login/email">Sign In (Email)</a>
    {/if}
  </nav>
</header>

<main>
  <ul>
    <li>Name: {data.user?.name}</li>
    <li>Email: {data.user?.email}</li>
  </ul>
</main>
