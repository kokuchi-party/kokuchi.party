<script>
  import { enhance } from "$app/forms";
  /** @type {import('./$types').ActionData} */
  export let form;
</script>

<main class="space-y-4">
  {#if form?.errorCode !== "RATE_LIMITED"}
    <form
      class="space-y-2"
      method="post"
      enctype="multipart/form-data"
      action={form?.emailSent ? "?/verify" : "?/generate"}
      use:enhance={() => (e) => e.update({ reset: false })}
    >
      <input name="email" type="email" readonly={!!form?.emailSent} value={form?.email ?? ""} />
      <input name="code" type="text" disabled={!form?.emailSent} />
      <button type="submit">{form?.emailSent ? "Verify" : "Send"}</button>
    </form>
    {#if form?.errorCode}
      <p>
        {#if form.errorCode === "INVALID_CODE"}
          Invalid login code
        {:else if form.errorCode === "INVALID_EMAIL"}
          Invalid email address
        {/if}
      </p>
    {/if}
  {/if}
</main>
