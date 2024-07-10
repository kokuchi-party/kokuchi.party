<script lang="ts">
  import { cn } from "$lib/utils";
  import { page } from "$app/stores";
  import Settings from "lucide-svelte/icons/settings";
  import SignUp from "lucide-svelte/icons/user-round-plus";
  import LogIn from "lucide-svelte/icons/log-in";
  import LogOut from "lucide-svelte/icons/log-out";
  import { limitWidth } from "$lib/constant";

  let className: string | undefined = undefined;

  export let loggedIn: boolean | undefined;

  $: userControl = $page.url.pathname.startsWith("/user")
    ? ("none" as const)
    : loggedIn
      ? ("logout" as const)
      : ("login" as const);

  export { className as class };
</script>

<header class={cn("h-15 w-full bg-background text-foreground lg:h-20", className)}>
  <nav class={cn(limitWidth, "flex h-full items-center justify-between py-2 lg:py-3")}>
    <h1 class="font-orbitron text-lg leading-tight lg:text-4xl">
      <a href="/">Kokuchi.party</a>
    </h1>
    <ul class="flex items-center gap-4 md:gap-6 lg:gap-8">
      <li class="flex h-full w-10 flex-col items-center gap-[2px] text-muted-foreground lg:w-10">
        <Settings class="size-6 md:size-7 lg:size-8" />
        <p class="whitespace-nowrap text-2xs font-medium lg:text-xs">設定</p>
      </li>

      {#if userControl !== "logout"}
        <li class="flex h-full w-10 flex-col items-center gap-[2px] text-muted-foreground lg:w-10">
          <SignUp class="size-6 md:size-7 lg:size-8" />
          <p class="whitespace-nowrap text-2xs font-medium lg:text-xs">新規登録</p>
        </li>
      {/if}
      {#if userControl !== "none"}
        <li>
          <form
            method="post"
            action={userControl === "login" ? "/user/login?/initiate" : "/user/logout"}
          >
            <input id="origin" name="origin" type="hidden" value={$page.url.pathname} />
            <button
              class="flex h-full w-10 flex-col items-center gap-[2px] text-muted-foreground lg:w-10"
              type="submit"
            >
              {#if userControl === "login"}
                <LogIn class="size-6 md:size-7 lg:size-8" />
                <p class="whitespace-nowrap text-2xs font-medium lg:text-xs">ログイン</p>
              {:else}
                <LogOut class="size-6 md:size-7 lg:size-8" />
                <p class="whitespace-nowrap text-2xs font-medium lg:text-xs">ログアウト</p>
              {/if}
            </button>
          </form>
        </li>
      {/if}
    </ul>
  </nav>
</header>
