<!--
  Copyright (C) 2024 kokuchi.party

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU Affero General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU Affero General Public License for more details.

  You should have received a copy of the GNU Affero General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->

<script lang="ts">
  import { toast } from "svelte-sonner";

  import { enhance } from "$app/forms";
  import Button from "$lib/components/ui/button/button.svelte";
  import Input from "$lib/components/ui/input/input.svelte";
  import { cn } from "$lib/utils";
  import * as m from "$paraglide/messages";

  import type { ActionData } from "./$types";

  export let form: ActionData;

  let loading: boolean;

  $: {
    switch (form?.reason) {
      case "INVALID_EMAIL": {
        toast.error(m.toast__invalid_email());
        break;
      }
      case "RATE_LIMITED": {
        toast.error(m.toast__rate_limited());
        break;
      }
      case "CONSENT_REQUIRED": {
        toast.error(m.toast__consent_required());
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

<main class="flex grow flex-col items-center justify-center">
  <section
    class={cn(
      "flex w-full max-w-[348px] flex-col items-center gap-8 p-6",
      "visible opacity-100 transition-all duration-200 ease-in",
      form?.ok && "invisible opacity-0"
    )}
  >
    <h1 class="font-orbitron text-3xl">Register</h1>
    <form
      class="flex w-full flex-col items-center gap-4"
      method="post"
      enctype="multipart/form-data"
      action="?/submit"
      use:enhance={() => {
        loading = true;
        return (e) => {
          loading = false;
          return e.update({ reset: false });
        };
      }}
    >
      <div class="space-y-2">
        <p class="text-sm">
          {m.p__accept_tos_1()}
          <a class="text-primary underline" href="/terms" target="_blank"
            >{m.p__accept_tos_inner()}</a
          >
          {m.p__accept_tos_2()}
        </p>

        <div class="flex items-center gap-2">
          <input
            type="checkbox"
            id="terms"
            name="terms"
            disabled={loading}
            class="h-4 w-4 rounded border-border bg-background text-primary accent-primary disabled:accent-primary/50"
          />
          <label
            for="terms"
            class={cn(
              "h-6 align-middle text-sm",
              form?.reason === "CONSENT_REQUIRED" && "animate-blink"
            )}>{m.label__accept_terms()}</label
          >
        </div>
      </div>

      <div class="w-full">
        <label for="email" class="mb-1 text-xs text-muted-foreground">{m.label__email()}</label>

        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          minlength={1}
          disabled={loading}
          class={cn("mb-2", form?.reason === "INVALID_EMAIL" && "animate-blink")}
        />

        <Button
          class="w-full"
          type="submit"
          name="type"
          value="email"
          disabled={loading || form?.reason === "RATE_LIMITED"}
        >
          {m.label__send_verification_link()}
        </Button>
      </div>

      <p class="leading-none">{m.label__or()}</p>

      <div class="w-full space-y-2">
        <Button
          type="submit"
          value="google"
          name="type"
          class="w-full"
          variant="outline"
          disabled={loading}
        >
          {m.label__register_via_google()}
        </Button>

        <Button
          type="submit"
          value="instagram"
          name="type"
          class="w-full"
          variant="outline"
          disabled={loading}
        >
          {m.label__register_via_instagram()}
        </Button>
      </div>
    </form>

    <section class="w-full space-y-2">
      <h2>{m.h__already_have_an_account()}</h2>

      <Button href="/user/login" variant="outline" class="w-full">{m.label__sign_in()}</Button>
    </section>
  </section>

  <section
    class={cn(
      "absolute flex w-full max-w-[348px] flex-col gap-8 p-6",
      "invisible opacity-0 transition-all duration-200 ease-in",
      form?.ok && "visible opacity-100"
    )}
  >
    <h1 class="font-orbitron text-3xl">Email Sent</h1>

    <div class="w-full space-y-2">
      <p>{m.p__check_your_inbox()}</p>

      <p>{m.p__link_expire()}</p>
    </div>

    <p class="text-sm text-muted-foreground">({m.p__can_close_this_page()})</p>
  </section>
</main>
