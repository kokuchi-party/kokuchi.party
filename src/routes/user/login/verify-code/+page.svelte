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

<main class="flex grow flex-col items-center justify-center">
  <section class="flex w-full max-w-80 flex-col items-center gap-8 p-6">
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
