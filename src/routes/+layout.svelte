<script>
  import "@fontsource-variable/orbitron";
  import "../app.pcss";

  import { setLanguageTag } from "$paraglide/runtime";

  export let data;
  $: setLanguageTag(data.lang);
</script>

<slot></slot>
