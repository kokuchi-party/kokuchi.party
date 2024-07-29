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
  import { page } from "$app/stores";
  import { limitWidth } from "$lib/constants";
  import { cn } from "$lib/utils";
  import * as m from "$paraglide/messages";

  const codeNames: Record<number, string> = {
    400: "Bad Request",
    401: "Unauthorized",
    402: "Payment Required",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    406: "Not Acceptable",
    407: "Proxy Authentication Required",
    408: "Request Timeout",
    409: "Conflict",
    410: "Gone",
    411: "Length Required",
    412: "Precondition Required",
    413: "Payload Too Large",
    414: "URI Too Long",
    415: "Unsupported Media Type",
    416: "Range Not Satisfiable",
    417: "Expectation Failed",
    429: "Too Many Requests",
    451: "Unavailable For Legal Reasons",
    500: "Internal Server Error",
    501: "Not Implemented",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
    505: "HTTP Version Not Supported"
  };
</script>

<main class={cn("flex grow flex-col items-center justify-center gap-10 py-10", limitWidth)}>
  <section class="flex min-w-full flex-col items-center gap-10">
    <h1 class="text-center font-orbitron text-4xl">
      {$page.status}
      {codeNames[$page.status] ?? "Unknown Error"}
    </h1>

    <div class="text-muted-foreground">
      {#if $page.status === 400}
        <p>{m.p__error_400()}</p>
      {:else if $page.status === 401}
        <p>{m.p__error_401()}</p>
      {:else if $page.status === 403}
        <p>{m.p__error_403()}</p>
      {:else if $page.status === 404}
        <p>{m.p__error_404()}</p>
      {:else}
        <p>Message: {$page.error?.message}</p>
      {/if}
    </div>
  </section>
</main>
