<script lang="ts">
  import { SignIn, SignOut } from "@auth/sveltekit/components";
  import type { PageData } from "./$types";

  export let data: PageData;
</script>

<header>
  <nav>
    <SignIn>
      <span slot="submitButton">Sign In</span>
    </SignIn>
    <SignOut>
      <span slot="submitButton">Sign Out</span>
    </SignOut>
  </nav>
</header>

<main>
  <ul>
    <li>Name: {data.session?.user?.name}</li>
    <li>Email: {data.session?.user?.email}</li>
  </ul>
</main>
