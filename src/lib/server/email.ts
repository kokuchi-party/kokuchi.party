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

import type { RequestEvent } from "@sveltejs/kit";

import { dev } from "$app/environment";

export * from "$lib/common/email";

interface EmailAddress {
  email: string;
  name?: string;
}

interface Personalization {
  to: [EmailAddress, ...EmailAddress[]];
  from?: EmailAddress;
  dkim_domain?: string;
  dkim_private_key?: string;
  dkim_selector?: string;
  reply_to?: EmailAddress;
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject?: string;
  headers?: Record<string, string>;
}

interface ContentItem {
  type: string;
  value: string;
}

interface MailSendBody {
  personalizations: [Personalization, ...Personalization[]];
  from: EmailAddress;
  reply_to?: EmailAddress;
  subject: string;
  content: [ContentItem, ...ContentItem[]];
  headers?: Record<string, string>;
}

export interface Email {
  to: Personalization["to"];
  cc?: Personalization["cc"];
  bcc?: Personalization["bcc"];
  subject: string;
  content: MailSendBody["content"];
}

export async function sendEmail(
  { platform }: RequestEvent,
  { to, cc, bcc, subject, content }: Email
) {
  // Email doesn't work in local testing
  if (dev) {
    console.log(JSON.stringify({ to, cc, bcc, subject, content }));
    return;
  }

  if (!platform) throw new Error("Email not available");

  const fromAddress: EmailAddress = {
    email: "noreply@kokuchi.party",
    name: "Kokuchi.party"
  };

  // Call the cloud Email provider API for sending emails
  const response = await fetch("https://api.mailchannels.net/tx/v1/send", {
    // The body format will vary depending on provider, please see their documentation
    body: JSON.stringify({
      personalizations: [
        {
          to,
          cc,
          bcc,
          from: fromAddress,
          dkim_domain: "kokuchi.party",
          dkim_selector: "mailchannels",
          dkim_private_key: platform.env.DKIM_PRIVATE_KEY
        }
      ],
      from: fromAddress,
      subject,
      content
    } satisfies MailSendBody),
    headers: {
      "Content-Type": "application/json"
    },
    method: "POST"
  });

  if (!response.ok) {
    const resp = await response.json();
    throw new Error(JSON.stringify(resp));
  }
}
