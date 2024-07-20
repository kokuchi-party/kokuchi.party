<script lang="ts">
  import Calendar from "lucide-svelte/icons/calendar-fold";
  import Languages from "lucide-svelte/icons/languages";
  import LogIn from "lucide-svelte/icons/log-in";
  import LogOut from "lucide-svelte/icons/log-out";
  import MoonStar from "lucide-svelte/icons/moon-star";
  import Settings from "lucide-svelte/icons/settings";
  import Sun from "lucide-svelte/icons/sun";
  import UserSettings from "lucide-svelte/icons/user-round-cog";
  import SignUp from "lucide-svelte/icons/user-round-plus";
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

  $: userControl = $page.url.pathname.startsWith("/user")
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
    <ul class="flex items-center gap-4 md:gap-6 lg:gap-8">
      {#if userControl !== "none"}
        <li>
          <!-- TODO: /event/new -->
          <Button class="mr-6 hidden w-[220px] md:flex">イベントを投稿する</Button>
        </li>
      {/if}

      {#if userControl === "login"}
        <!-- TODO: /user/register -->
        <li class="flex h-full w-10 flex-col items-center gap-[2px] text-muted-foreground">
          <SignUp class="size-6 md:size-7 lg:size-8" />
          <p class="whitespace-nowrap text-2xs font-medium lg:text-xs">{m.p__signup()}</p>
        </li>

        <li>
          <form method="post" action="/user/login?/initiate" use:enhance>
            <input id="origin" name="origin" type="hidden" value={$page.url.pathname} />
            <button
              class="flex h-full w-10 flex-col items-center gap-[2px] text-muted-foreground"
              type="submit"
            >
              <LogIn class="size-6 md:size-7 lg:size-8" />
              <p class="whitespace-nowrap text-2xs font-medium lg:text-xs">{m.p__login()}</p>
            </button>
          </form>
        </li>
      {/if}

      {#if userControl === "logout"}
        <li>
          <form method="post" action="/user/logout">
            <input id="origin" name="origin" type="hidden" value={$page.url.pathname} />
            <button
              class="flex h-full w-10 flex-col items-center gap-[2px] text-muted-foreground"
              type="submit"
            >
              <LogOut class="size-6 md:size-7 lg:size-8" />
              <p class="whitespace-nowrap text-2xs font-medium lg:text-xs">{m.p__logout()}</p>
            </button>
          </form>
        </li>

        <!-- TODO: /user/dashboard -->
        <li class="flex h-full w-10 flex-col items-center gap-[2px] text-muted-foreground">
          <Calendar class="size-6 md:size-7 lg:size-8" />
          <p class="whitespace-nowrap text-2xs font-medium lg:text-xs">{m.p__dashboard()}</p>
        </li>
      {/if}

      <li class="group relative">
        <button
          id="menubutton"
          aria-haspopup
          aria-controls="menu"
          class="flex h-full w-10 flex-col items-center gap-[2px] text-muted-foreground"
        >
          <Settings
            aria-label="Settings"
            class="size-6 group-focus-within:animate-spin md:size-7 lg:size-8"
          />
          <p class="whitespace-nowrap text-2xs font-medium lg:text-xs">{m.p__settings()}</p>
        </button>

        <div
          id="menu"
          role="menu"
          aria-labelledby="menubutton"
          class={cn(
            "absolute right-0 mt-2 flex w-[180px] flex-col gap-3 rounded-md border bg-background p-3 shadow-lg",
            "invisible opacity-0 transition-all duration-200 ease-in group-focus-within:visible group-focus-within:opacity-100 "
          )}
        >
          <Button
            role="menuitem"
            variant="outline"
            on:click={toggleMode}
            class="yesscript flex justify-start gap-2"
          >
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
            <p class="mx-auto text-xs">
              {#if darkmode}
                {m.label__dark_mode()}
              {:else}
                {m.label__light_mode()}
              {/if}
            </p>
          </Button>

          <noscript>
            <Button
              role="menuitem"
              variant="outline"
              class="flex w-full justify-start gap-2"
              disabled
            >
              <Sun class="size-4 shrink-0" />
              <p class="mx-auto text-xs">
                {m.label__light_mode()}
              </p>
            </Button>
          </noscript>

          <Button
            role="menuitem"
            variant="outline"
            data-sveltekit-reload
            data-sveltekit-noscroll
            href={`?${langQuery.toString()}`}
            class="flex justify-start gap-2"
          >
            <Languages aria-hidden class="size-4 shrink-0" />
            <p class="mx-auto text-xs">
              {#if lang === "en"}
                日本語
              {:else}
                English
              {/if}
            </p>
          </Button>

          <hr />

          <!-- TODO: /user/settings -->
          <Button role="menuitem" class="flex justify-start gap-2">
            <UserSettings aria-hidden class="size-4 shrink-0" />
            <p class="mx-auto text-xs">
              {m.label__account_settings()}
            </p>
          </Button>
        </div>
      </li>
    </ul>
  </nav>
</header>
