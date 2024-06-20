<script>
  import "@fontsource-variable/orbitron";
  import "../app.pcss";

  import { ModeWatcher } from "mode-watcher";
  import { Toaster } from "$lib/components/ui/sonner";
  import { setLanguageTag } from "$paraglide/runtime";

  export let data;
  $: setLanguageTag(data.lang);
</script>

<ModeWatcher />
<Toaster />
<slot />
