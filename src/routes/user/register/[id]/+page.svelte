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
  import { mode } from "mode-watcher";
  import { Turnstile } from "svelte-turnstile";

  import { enhance } from "$app/forms";
  import { PUBLIC_TURNSTILE_SITE_KEY } from "$env/static/public";
  import Button from "$lib/components/ui/button/button.svelte";
  import Input from "$lib/components/ui/input/input.svelte";
  import * as m from "$paraglide/messages";
  import { languageTag } from "$paraglide/runtime";

  import type { PageData } from "./$types";

  export let data: PageData;
</script>

<main class="relative flex grow flex-col items-center justify-center">
  <section class="flex w-full max-w-[348px] animate-fade-in flex-col items-center gap-8 p-6">
    <h1 class="font-orbitron text-3xl">Register</h1>
    <form
      class="flex w-full flex-col items-center gap-4"
      method="post"
      enctype="multipart/form-data"
      use:enhance
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
            disabled
            checked
            class="h-4 w-4 rounded border-border bg-background text-primary accent-primary disabled:accent-primary/50"
          />
          <label for="terms" class="h-6 align-middle text-sm">{m.label__accept_terms()}</label>
        </div>
      </div>

      <div class="w-full">
        <label for="email" class="mb-1 text-xs text-muted-foreground">{m.label__email()}</label>

        <Input id="email" name="email" type="email" disabled value={data.email} class="mb-2" />

        <label for="name" class="mb-1 text-xs text-muted-foreground">{m.label__name()}</label>

        <Input id="name" name="name" type="text" required minlength={1} value={data.name} />
      </div>

      <div class="h-[65px] w-[300px] bg-muted">
        <Turnstile
          appearance="always"
          theme={$mode ?? "auto"}
          language={languageTag()}
          siteKey={PUBLIC_TURNSTILE_SITE_KEY}
        />
      </div>

      <Button class="w-full" type="submit" name="type">{m.label__register_and_continue()}</Button>

      <p class="text-sm text-muted-foreground">
        {m.p__registration_not_yet_complete()}
      </p>
    </form>
  </section>
</main>
