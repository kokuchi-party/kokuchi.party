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
  import FilePlus from "lucide-svelte/icons/file-plus";
  import Languages from "lucide-svelte/icons/languages";
  import LogIn from "lucide-svelte/icons/log-in";
  import LogOut from "lucide-svelte/icons/log-out";
  import MoonStar from "lucide-svelte/icons/moon-star";
  import NotebookPen from "lucide-svelte/icons/notebook-pen";
  import Settings from "lucide-svelte/icons/settings";
  import Sun from "lucide-svelte/icons/sun";
  import UserRoundCog from "lucide-svelte/icons/user-round-cog";
  import { mode, toggleMode } from "mode-watcher";

  import { enhance } from "$app/forms";
  import { page } from "$app/stores";
  import Button from "$components/ui/button/button.svelte";
  import { limitWidth } from "$lib/constants";
  import { cn } from "$lib/utils";
  import * as m from "$paraglide/messages";
  import { languageTag } from "$paraglide/runtime";

  let className: string | undefined = undefined;

  $: darkmode = $mode === "dark";
  $: lang = languageTag();
  $: langQuery = $page.url.searchParams;
  $: {
    langQuery.delete("lang");
    langQuery.append("lang", lang === "en" ? "ja" : "en");
  }

  export let loggedIn: boolean | undefined;

  // hide unnecessary links when in an authentication flow
  $: inAuthFlow =
    $page.url.pathname.startsWith("/user/login") || $page.url.pathname.startsWith("/user/register");

  $: userControl = inAuthFlow
    ? ("none" as const)
    : loggedIn
      ? ("logout" as const)
      : ("login" as const);

  export { className as class };
</script>

<header class={cn("sticky top-0 h-15 w-full bg-background text-foreground lg:h-20", className)}>
  <nav class={cn(limitWidth, "flex h-full items-center justify-between py-2 lg:py-3")}>
    <h1 class="font-orbitron text-lg leading-tight lg:text-4xl">
      <a href="/">Kokuchi.party</a>
    </h1>
    <ul class="flex items-center gap-5 md:gap-6 lg:gap-8">
      {#if userControl !== "none"}
        <li>
          <Button href="/dashboard/event/new" class="mr-6 hidden w-[220px] text-sm sm:flex">
            <FilePlus class="mr-2 size-[18px] shrink-0" />
            {m.label__submit_event()}
          </Button>
        </li>
      {/if}

      {#if userControl === "login"}
        <li>
          <form method="post" action="/user/login?/initiate" use:enhance>
            <input id="origin" name="origin" type="hidden" value={$page.url.pathname} />
            <button class="iconbutton" type="submit">
              <LogIn class="size-6 md:size-7 lg:size-8" />
              <p>{m.p__login()}</p>
            </button>
          </form>
        </li>
      {/if}

      {#if userControl === "logout"}
        <li>
          <a href="/dashboard" class="iconbutton">
            <NotebookPen class="size-6 md:size-7 lg:size-8" />
            <p>{m.p__dashboard()}</p>
          </a>
        </li>
      {/if}

      <li class="group relative">
        <button id="menubutton" aria-haspopup aria-controls="menu" class="iconbutton">
          <Settings
            aria-label="Settings"
            class="size-6 group-focus-within:animate-spin md:size-7 lg:size-8"
          />
          <p>{m.p__settings()}</p>
        </button>

        <div
          id="menu"
          role="menu"
          aria-labelledby="menubutton"
          class={cn(
            "absolute right-0 mt-2 flex w-[200px] flex-col gap-2 rounded-md border bg-background p-2 shadow-lg",
            "invisible text-sm opacity-0 transition-all duration-200 ease-in group-focus-within:visible group-focus-within:opacity-100"
          )}
        >
          <button role="menuitem" on:click={toggleMode} class="yesscript menuitem">
            <div aria-hidden role="presentation" class="size-4 shrink-0">
              <Sun
                class={cn(
                  "absolute size-4 transition-all duration-100 ease-in",
                  darkmode ? "invisible opacity-0" : "visible opacity-100"
                )}
              />
              <MoonStar
                class={cn(
                  "absolute size-4 transition-all duration-100 ease-in",
                  darkmode ? "visible opacity-100" : "invisible opacity-0"
                )}
              />
            </div>
            <p>
              {#if darkmode}
                {m.label__dark_mode()}
              {:else}
                {m.label__light_mode()}
              {/if}
            </p>
          </button>

          <noscript>
            <button role="menuitem" class="menuitem" disabled>
              <Sun class="size-4 shrink-0" />
              <p>
                {m.label__light_mode()}
              </p>
            </button>
          </noscript>

          <a
            role="menuitem"
            data-sveltekit-reload
            data-sveltekit-noscroll
            href={`?${langQuery.toString()}`}
            class="menuitem"
          >
            <Languages aria-hidden class="size-4 shrink-0" />
            <p>
              {#if lang === "en"}
                日本語
              {:else}
                English
              {/if}
            </p>
          </a>

          <hr class="mx-2" />

          <!-- TODO: /user/settings -->
          <a href="/user/settings" role="menuitem" class="menuitem">
            <UserRoundCog aria-hidden class="size-4 shrink-0" />
            <p>
              {m.label__account_settings()}
            </p>
          </a>

          {#if userControl === "logout"}
            <form method="post" action="/user/logout" class="w-full">
              <button role="menuitem" type="submit" class="menuitem">
                <LogOut aria-hidden class="size-4 shrink-0" />
                <p>
                  {m.p__logout()}
                </p>
              </button>
            </form>
          {/if}
        </div>
      </li>
    </ul>
  </nav>
</header>

<style lang="postcss">
  .iconbutton {
    @apply flex h-full w-10 flex-col items-center gap-[2px] text-muted-foreground focus:text-foreground;
  }

  .iconbutton > p {
    @apply whitespace-nowrap text-2xs font-medium lg:text-xs;
  }

  .menuitem {
    @apply flex w-full items-center justify-start gap-3 rounded p-2 hover:bg-muted;
  }
</style>
