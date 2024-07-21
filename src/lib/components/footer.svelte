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
  import Copyleft from "lucide-svelte/icons/copyleft";

  import { limitWidth } from "$lib/constants";
  import { cn } from "$lib/utils";
  import * as m from "$paraglide/messages";
</script>

<footer class="w-full bg-muted">
  <nav
    class={cn(
      limitWidth,
      "min-h-15 p-4 lg:min-h-20",
      "text-muted-foreground",
      "flex h-full flex-col-reverse items-center justify-between gap-y-3 sm:flex-row lg:gap-y-5"
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
