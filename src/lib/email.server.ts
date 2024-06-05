import { dev } from "$app/environment";
import type { RequestEvent } from "@sveltejs/kit";

export * from "$lib/email";

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
