<script>
  import "@fontsource-variable/orbitron";
  import "../app.pcss";

  import { ModeWatcher } from "mode-watcher";
  import { setLanguageTag } from "$paraglide/runtime";

  export let data;
  $: setLanguageTag(data.lang);
</script>

<ModeWatcher />
<slot />
