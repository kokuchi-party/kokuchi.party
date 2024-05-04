<script lang="ts">
  import type { PageData } from "./$types";

  export let data: PageData;
</script>

<h1>Posts</h1>

<ul>
  {#each data.posts as item}
    <li>
      [{item.id}] {item.content}
    </li>
  {/each}
</ul>
