<script>
  import "@fontsource-variable/orbitron";
  import "../app.pcss";

  import { ModeWatcher } from "mode-watcher";

  import Footer from "$lib/components/footer.svelte";
  import Header from "$lib/components/header.svelte";
  import { Toaster } from "$lib/components/ui/sonner";
  import { setLanguageTag } from "$paraglide/runtime";

  export let data;
  $: setLanguageTag(data.lang);
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
