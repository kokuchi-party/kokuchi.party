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

<script>
  import "@fontsource-variable/orbitron";
  import "../app.pcss";

  import { ModeWatcher } from "mode-watcher";
  import { onMount } from "svelte";
  import { toast } from "svelte-sonner";

  import Footer from "$lib/components/footer.svelte";
  import Header from "$lib/components/header.svelte";
  import { Toaster } from "$lib/components/ui/sonner";
  import { setLanguageTag } from "$paraglide/runtime";

  export let data;
  $: setLanguageTag(data.lang);

  onMount(() => {
    if (data.globalToast) {
      toast.info(data.globalToast);
    }
  });
</script>

<svelte:head>
  <noscript>
    <style>
      .yesscript {
        display: none;
      }
    </style>
  </noscript>
</svelte:head>

<ModeWatcher />
<Toaster />

<Header loggedIn={data.loggedIn} />

<slot />

<Footer />
