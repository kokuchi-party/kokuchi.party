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
  import Button from "$components/ui/button/button.svelte";
  import { limitWidth, termRevised } from "$lib/constants";
  import { cn } from "$lib/utils";
  import * as m from "$paraglide/messages";

  import type { PageData } from "./$types";

  export let data: PageData;
</script>

<main class={cn("flex grow flex-col items-center justify-center gap-10 py-10", limitWidth)}>
  <section class="prose prose-sm min-w-full">
    <hgroup>
      <h1 class="mb-2">{m.h__terms_of_service()}</h1>
      <p class="mt-2 text-xs text-muted-foreground">
        {m.p__last_updated()}
        <time datetime={termRevised.toISOString()}>
          {termRevised.toLocaleDateString(new Intl.Locale(data.lang))}
        </time>
      </p>
    </hgroup>

    <h2 id="acceptance">Acceptances of Terms</h2>
    <p>
      <strong>"We run this hosted version of Taguette and you can use it under those terms."</strong
      >
    </p>

    <p>
      The Example.org Team ("us", "our", "we") provides the information on the hosted version of
      Taguette (<code>taguette.example.org</code>, "the App") as provided in these Terms of Service
      ("TOS"). We may update the TOS at
      <a href="https://example.org/tos"><code>https://example.org/tos</code></a>. The information on
      this site and your use of it is subject to the most recent version of the TOS posted.
    </p>

    <h2 id="description">Description of Service</h2>
    <p><strong>"We store your data, so that you can see it."</strong></p>

    <p>
      We will provide you with access to the App. New features that augment or enhance the current
      version of the App shall be subject to the TOS. We will store your data and present it only to
      you and the people you add as collaborators on your projects. By putting your data in the App,
      you grant us a license to store, archive, parse, display, and make copies of your data, as
      necessary to run the App. We will backup all data daily to Amazon Web Services, in encrypted
      form only. We do not share or sell your data, and you retain all copyright on it.
    </p>

    <h2 id="warranties">Disclaimer of Warranties</h2>
    <p>
      <strong
        >"We will do our best not to lose your data and keep this service up, but we cannot
        guarantee that we won't make a mistake or run out of money."</strong
      >
    </p>

    <p>
      Relying on this App is at your own risk. You expressly understand and agree that: The App is
      provided on an "as is" and "as available" basis. We expressly disclaim all warranties of any
      kind, whether express or implied. We make no warranty that the App will meet your requirements
      and that service will be uninterrupted, timely, secure, or error-free.
    </p>

    <h2 id="privacy">Privacy Policy</h2>
    <p><strong>"We won't share your information, that would be rude."</strong></p>

    <p>
      We will not share or sell any personal information you provide on the App. We will not use it
      for any purpose except to log you in (e.g. your username and password), send you a password
      reset link (e.g. an email address, which you can optionally provide), and for diagnostics and
      normal operation of a web server (IP address, browser information). By creating an account,
      you explicitly consent to our processing of such information within the meaning of the GDPR.
    </p>

    <p>
      We do not use any trackers on the App, such as Google Analytics or AdSense. We do use two
      cookies: one when you log in to the app (to identify your account), and one as a
      cross-scripting protective measure. Those are not "third-party" or "tracking" cookies.
    </p>

    <p>The App depends on additional services from:</p>
    <ul>
      <li>
        OVH, who hosts the physical machine running Taguette and where all data is kept (in Roubaix,
        France)
      </li>
      <li>
        <a href="https://api.sendgrid.com/privacy.html">SendGrid</a>, used to send password-reset
        links via email, should you or someone else request such a link in the App. We provide them
        with your email address in that situation
      </li>
      <li>
        <a href="https://sentry.io/privacy/">Sentry</a>, used to collect and analyze error reports.
        They may incidentally receive personal information or other pieces of your data when errors
        occur
      </li>
      <li>
        Amazon Web Services, who stores backups of the App, in encrypted form only (doesn't have
        access to personal information or data)
      </li>
    </ul>

    <h2 id="conduct">Conduct</h2>
    <p><strong>"Only upload/transmit materials that you have the rights to."</strong></p>

    <p>
      You understand that all information, data, and/or other materials ("Content") are the sole
      responsibility of the person from whom such Content originated. This means that you, and not
      us, are entirely responsible for all Content that you upload or otherwise make available via
      the App. We do not control the Content posted via the App and under no circumstances will we
      be liable in any way for any Content.
    </p>

    <h2 id="termination">Termination</h2>
    <p>
      <strong
        >"If you want to cancel this agreement, just close your account. We can cancel it too."</strong
      >
    </p>

    <p>You agree that we may terminate your access to the App for violations of the TOS.</p>

    <p>
      Users can remove their data at any time as well as delete their account at any time. Given
      that we backup data from the App daily, your data and account information will be in the App's
      backups for a short period. We will not share any of your data hosted on the App with anyone
      else.
    </p>

    <h2 id="liability">Limitation of Liability</h2>
    <p><strong>"We aren't liable for what you do on the App, you are."</strong></p>

    <p>
      You expressly understand and agree that we shall not be liable to you for any direct,
      indirect, incidental, special, consequential or exemplary damages, including, but not limited
      to, damages for goodwill, use, data or other intangible losses resulting from the use or the
      inability to use the App.
    </p>
  </section>

  {#if data.mode === "accept"}
    <form
      class="sticky bottom-5 flex w-full max-w-[720px] animate-fade-in flex-col items-center justify-center gap-x-10 gap-y-4 rounded-lg border border-foreground bg-muted px-3 py-5 md:flex-row"
      method="post"
    >
      <p class="text-center text-sm">{m.p__read_and_accept_terms()}</p>

      <Button type="submit" size="lg" class="w-[200px]">{m.label__accept_and_continue()}</Button>
    </form>
  {/if}
</main>
