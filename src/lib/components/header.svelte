<script lang="ts">
  import { cn } from "$lib/utils";
  import { languageTag } from "$paraglide/runtime";
  import { page } from "$app/stores";
  import Button from "./ui/button/button.svelte";

  let className: string | undefined = undefined;
  const lang = languageTag();

  export let loggedIn: boolean | undefined;

  $: userControl = $page.url.pathname.startsWith("/user")
    ? ("none" as const)
    : loggedIn
      ? ("logout" as const)
      : ("login" as const);

  export { className as class };
</script>

<header class={cn("h-[50px] w-full bg-background text-foreground md:h-[75px] lg:h-20", className)}>
  <nav
    class="mx-auto flex h-full w-full max-w-[320px] items-center justify-between p-3 sm:max-w-[800px] md:p-5 lg:max-w-[1280px]"
  >
    <h1 class="font-orbitron text-lg font-semibold md:text-2xl lg:text-4xl">
      <a href="/">Kokuchi.party</a>
    </h1>
    <div class="flex h-full gap-3">
      <Button class="hidden h-full w-[220px] md:flex" href="/">イベントを投稿する</Button>
      <Button
        class="h-full"
        variant="outline"
        data-sveltekit-reload
        data-sveltekit-noscroll
        href={lang === "ja" ? "?lang=en" : "?lang=ja"}
      >
        <span class="sr-only">Switch to</span>
        <span>ENGLISH</span>
      </Button>
      {#if userControl !== "none"}
        <form
          method="post"
          action={userControl === "login" ? "/user/login?/initiate" : "/user/logout"}
        >
          <input id="origin" name="origin" type="hidden" value={$page.url.pathname} />
          <Button class="h-full" type="submit">
            {#if userControl === "login"}
              Log In
            {:else}
              Logout
            {/if}
          </Button>
        </form>
      {/if}
    </div>
  </nav>
</header>
