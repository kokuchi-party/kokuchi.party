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
    <h1 class="font-orbitron text-3xl">Log In</h1>

    <section class="flex w-full flex-col items-center gap-4">
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
        <label for="email">Email</label>

        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          minlength={1}
          class={cn(form?.reason === "INVALID_EMAIL" && "animate-blink")}
        />

        <Button class="w-full" type="submit" disabled={loading || form?.reason === "RATE_LIMITED"}>
          Get login code
        </Button>
      </form>

      <p>or</p>

      <div class="w-full space-y-1">
        <Button href="/user/auth/google" class="w-full" variant="outline">
          Sign in with Google
        </Button>

        <Button href="/user/auth/instagram" class="w-full" variant="outline">
          Sign in with Instagram
        </Button>
      </div>
    </section>

    <section class="w-full space-y-2">
      <h2>New to Kokuchi.party?</h2>

      <Button variant="outline" class="w-full">Create account</Button>
    </section>
  </section>
</main>
