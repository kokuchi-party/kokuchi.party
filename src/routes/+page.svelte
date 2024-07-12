<script lang="ts">
  import type { PageData } from "./$types";
  import { limitWidth } from "$lib/constant";

  export let data: PageData;
</script>

<main class={limitWidth}>
  <ul>
    <li>Name: {data.user?.name}</li>
    <li>Email: {data.user?.email}</li>
  </ul>
</main>
