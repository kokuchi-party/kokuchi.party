import type { EmailConfig } from "@auth/core/providers/email";
import type { SvelteKitAuthConfig } from "@auth/sveltekit";

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

export default function emailProviderFactory({ platform }: { platform: App.Platform }) {
  const fromAddress: EmailAddress = {
    email: "noreply@kokuchi.party",
    name: "Kokuchi.party"
  };

  const sendVerificationRequest: EmailConfig["sendVerificationRequest"] = async ({
    identifier: email,
    url
  }) => {
    // Call the cloud Email provider API for sending emails
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      // The body format will vary depending on provider, please see their documentation
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email }],
            from: fromAddress,
            dkim_domain: "kokuchi.party",
            dkim_selector: "mailchannels",
            dkim_private_key: platform.env.DKIM_PRIVATE_KEY
          }
        ],
        from: fromAddress,
        subject: "ログインURL / Sign in to Your page",
        content: [
          {
            type: "text/plain",
            value: `こんにちは！ こちらのURLよりログインしてください。
Hello! Please click here to authenticate.

${url}`
          }
        ]
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
  };
  return {
    id: "http-email",
    type: "email",
    sendVerificationRequest
  } as unknown as SvelteKitAuthConfig["providers"][number];
}
