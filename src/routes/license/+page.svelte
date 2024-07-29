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
  import { limitWidth } from "$lib/constants";
  import { cn } from "$lib/utils";
  import * as m from "$paraglide/messages";

  import licenses from "../../licenses.json";
  import Agpl from "./agpl.svelte";
  import Spdx from "./spdx.svelte";
</script>

<main class={cn("flex grow flex-col items-center justify-center gap-10 py-10", limitWidth)}>
  <section class="prose prose-sm mx-auto max-w-full">
    <Agpl />
  </section>

  <hr class="w-full" />

  <section class="prose prose-sm mx-auto w-full max-w-full">
    <h2>{m.h2__third_party_packages()}</h2>
    <p>{m.p__third_party_packages()}</p>
    <ul>
      {#each Object.entries(licenses.packages) as [name, info]}
        <li>
          <span>
            <a class="underline" href={info.repository}>
              {name}
            </a>
            <span class="inline-flex text-muted-foreground">
              (
              <span class="inline-flex gap-1">
                <Spdx licenses={licenses.licenses} expr={info.license} />
              </span>
              )
            </span>
          </span>
        </li>
      {/each}
    </ul>
  </section>
</main>
