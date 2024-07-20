<script lang="ts">
  import { limitWidth } from "$lib/constants";
  import { cn } from "$lib/utils";

  import type { PageData } from "./$types";

  export let data: PageData;
</script>

<main class={cn("flex grow flex-col items-center justify-center gap-10 py-10", limitWidth)}>
  <ul>
    <li>Name: {data.user?.name}</li>
    <li>Email: {data.user?.email}</li>
  </ul>
</main>
