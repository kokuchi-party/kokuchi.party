/*
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
*/

import * as m from "$paraglide/messages";
import type { AvailableLanguageTag } from "$paraglide/runtime";

const globalToastTags = ["OAUTH_REGISTRATION_WITH_EXISTING_EMAIL"] as const;

export type GlobalToastTag = (typeof globalToastTags)[number];

export function isGlobalToastTag(s: string): s is GlobalToastTag {
  return globalToastTags.includes(s);
}

export function getMessage(t: GlobalToastTag, languageTag?: AvailableLanguageTag) {
  switch (t) {
    case "OAUTH_REGISTRATION_WITH_EXISTING_EMAIL":
      return m.global_toast__OAUTH_REGISTRATION_WITH_EXISTING_EMAIL(undefined, { languageTag });
  }
}
