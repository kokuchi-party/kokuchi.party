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

<script>
  import { enhance } from "$app/forms";
  import { getFileUrl } from "$lib/common/file";

  /** @type {import('./$types').ActionData} */
  export let form;
</script>

<main class="space-y-4">
  <form class="space-y-2" method="post" enctype="multipart/form-data" action="?/upload" use:enhance>
    <input name="file" type="file" accept="image/jpeg, image/png, image/webp" />
    <button type="submit">Upload</button>
  </form>

  <div class="space-y-2">
    {#if form?.ok}
      <a href={getFileUrl(form)}>Uploaded</a>
    {/if}
    {JSON.stringify(form)}
  </div>
</main>
