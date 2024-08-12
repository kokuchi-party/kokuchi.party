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
  <section class="flex w-full max-w-[348px] flex-col items-center gap-8 p-6">
    <h1 class="font-orbitron text-3xl">Log In</h1>

    <section class="flex w-full flex-col items-center gap-4">
      <form
        class="w-full"
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
        <label for="email" class="mb-1 text-xs text-muted-foreground">{m.label__email()}</label>

        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          minlength={1}
          class={cn("mb-2", form?.reason === "INVALID_EMAIL" && "animate-blink")}
        />

        <Button class="w-full" type="submit" disabled={loading || form?.reason === "RATE_LIMITED"}>
          {m.label__get_login_code()}
        </Button>
      </form>

      <p class="leading-none">{m.label__or()}</p>

      <div class="w-full space-y-2">
        <Button href="/user/auth/google/login" class="w-full" variant="outline">
          {m.label__sign_in_with_google()}
        </Button>

        <Button href="/user/auth/instagram/login" class="w-full" variant="outline">
          {m.label__sign_in_with_instagram()}
        </Button>
      </div>
    </section>

    <section class="w-full space-y-2">
      <h2>{m.h__new_to_kokuchiparty()}</h2>

      <Button href="/user/register" variant="outline" class="w-full"
        >{m.label__create_account()}</Button
      >
    </section>
  </section>
</main>
