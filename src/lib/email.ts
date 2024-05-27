// https://thecopenhagenbook.com/email-verification
export function validateEmail(email: string): boolean {
  // Check if email length is more than 255 characters
  if (email.length > 255) return false;

  // Check if email starts or ends with whitespace
  if (email.startsWith(" ") || email.endsWith(" ")) return false;

  // Check if email includes exactly one '@' character
  const atIndex = email.indexOf("@");
  if (atIndex <= 0) return false;

  // Extract local part and domain part
  const localPart = email.slice(0, atIndex);
  const domainPart = email.slice(atIndex + 1);

  // Check if local part is at least 1 character long
  if (localPart.length === 0) return false;

  // Check if domain part includes at least one '.' and has at least one character before it
  const dotIndex = domainPart.indexOf(".");
  if (dotIndex <= 0 || dotIndex === domainPart.length - 1) return false;

  return true;
}
