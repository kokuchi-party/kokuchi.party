<script>
  import { enhance } from "$app/forms";
  import { getFileUrl } from "$lib/common/file";

  /** @type {import('./$types').ActionData} */
  export let form;
</script>

<main class="space-y-4">
  <form class="space-y-2" method="post" enctype="multipart/form-data" action="?/upload" use:enhance>
    <input name="file" type="file" accept="image/jpeg, image/png, image/webp" />
    <button type="submit">Upload</button>
  </form>

  <div class="space-y-2">
    {#if form?.ok}
      <a href={getFileUrl(form)}>Uploaded</a>
    {/if}
    {JSON.stringify(form)}
  </div>
</main>
