<script lang="ts">
  import Copyleft from "lucide-svelte/icons/copyleft";

  import { cn } from "$lib/utils";
  import { limitWidth } from "$lib/constant";

  import * as m from "$paraglide/messages";
</script>

<footer class="w-full bg-muted">
  <nav
    class={cn(
      limitWidth,
      "min-h-15 p-4 lg:min-h-20",
      "text-muted-foreground",
      "flex h-full flex-col-reverse items-center justify-between gap-y-5 lg:flex-row"
    )}
  >
    <div class="flex h-fit items-end gap-1 text-xs">
      <Copyleft class="size-[10px]" />
      <span class="leading-none"> 2024 <a href="/">kokuchi.party</a> some rights reserved.</span>
    </div>
    <ul class="flex gap-4 text-xs">
      <li>
        <a href="/terms">{m.a__tos()}</a>
      </li>
      <li><a href="/license">{m.a__license()}</a></li>
      <li><a href="/about">{m.a__about_us()}</a></li>
    </ul>
  </nav>
</footer>
