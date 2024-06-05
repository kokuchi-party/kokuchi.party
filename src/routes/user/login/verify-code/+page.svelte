<script lang="ts">
  import { enhance } from "$app/forms";

  import Input from "$lib/components/ui/input/input.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import type { ActionData } from "./$types";
  import { cn } from "$lib/utils";

  export let form: ActionData;

  let loading: boolean;
</script>

<main>
  <section class="mx-auto flex w-full max-w-80 flex-col items-center gap-8 p-6">
    <h1 class="font-orbitron text-3xl">Verify Code</h1>

    <section class="flex w-full flex-col items-center gap-4">
      <p>A six-letter login code has been sent to your email (if you have registered).</p>

      <form
        class="w-full space-y-2"
        method="post"
        enctype="multipart/form-data"
        use:enhance={() => {
          loading = true;
          return (e) => {
            loading = false;
            return e.update({ reset: false });
          };
        }}
      >
        <label for="email">Code</label>

        <Input
          name="code"
          type="text"
          inputmode="numeric"
          placeholder="XXXXXX"
          required
          minlength={6}
          maxlength={6}
          pattern="[0-9][0-9][0-9][0-9][0-9][0-9]"
          autocomplete="one-time-code"
          autofocus
          class={cn(form?.reason === "INVALID_CODE" && "animate-blink")}
        />

        <Button class="w-full" type="submit" disabled={loading || form?.reason === "RATE_LIMITED"}>
          Verify login code
        </Button>
      </form>
    </section>

    <section class="w-full space-y-2">
      <h2>New to Kokuchi.party?</h2>

      <Button variant="outline" class="w-full">Create account</Button>
    </section>
  </section>
</main>
