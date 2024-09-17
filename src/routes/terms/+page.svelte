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
  import Button from "$components/ui/button/button.svelte";
  import { limitWidth, termsRevised } from "$lib/constants";
  import { cn } from "$lib/utils";
  import * as m from "$paraglide/messages";
  import { languageTag } from "$paraglide/runtime";

  import type { PageData } from "./$types";
  import En from "./en.svelte";
  import Ja from "./ja.svelte";

  export let data: PageData;

  $: lang = languageTag();
</script>

<main class={cn("flex grow flex-col items-center justify-center gap-10 py-10", limitWidth)}>
  <section class="prose prose-sm min-w-full">
    <hgroup>
      <h1 class="mb-2">{m.h__terms_of_service()}</h1>
      <p class="mt-2 text-xs text-muted-foreground">
        {m.p__last_updated()}
        <time datetime={termsRevised.toISOString()}>
          {termsRevised.toLocaleDateString(new Intl.Locale(data.lang))}
        </time>
      </p>
    </hgroup>

    {#if lang === "en"}
      <En />
    {:else if lang === "ja"}
      <Ja />
    {/if}
  </section>

  {#if data.mode === "accept"}
    <form
      class="sticky bottom-5 flex w-full max-w-[720px] animate-fade-in flex-col items-center justify-center gap-x-10 gap-y-4 rounded-lg border border-foreground bg-muted px-3 py-5 md:flex-row"
      method="post"
    >
      <p class="text-center text-sm">{m.p__read_and_accept_terms()}</p>

      <Button type="submit" size="lg" class="w-[200px]">{m.label__accept_and_continue()}</Button>
    </form>
  {/if}
</main>
