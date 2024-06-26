<script lang="ts">
  import { toast } from "svelte-sonner";
  import { enhance } from "$app/forms";

  import Input from "$lib/components/ui/input/input.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import type { ActionData } from "./$types";
  import { cn } from "$lib/utils";

  import * as m from "$paraglide/messages";

  export let form: ActionData;

  let loading: boolean;

  $: {
    switch (form?.reason) {
      case "RATE_LIMITED": {
        toast.error(m.toast__rate_limited());
        break;
      }
      case "INVALID_CODE": {
        toast.error(m.toast__invalid_code());
        break;
      }
      case "INTERNAL_ERROR": {
        toast.error(m.toast__internal_error({ message: form.message }));
        break;
      }
      default:
        break;
    }
  }
</script>

<main>
  <section class="mx-auto flex w-full max-w-80 flex-col items-center gap-8 p-6">
    <h1 class="font-orbitron text-3xl">Verify Code</h1>

    <section class="flex w-full flex-col items-center gap-4">
      <p>{m.p__code_has_been_sent()}</p>

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
        <label for="email">{m.label__code()}</label>

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
          {m.label__verify_login_code()}
        </Button>
      </form>
    </section>

    <section class="w-full space-y-2">
      <h2>{m.h__new_to_kokuchiparty()}</h2>

      <Button variant="outline" class="w-full">{m.label__create_account()}</Button>
    </section>
  </section>
</main>
