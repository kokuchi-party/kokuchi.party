/*
  Copyright (c) 2024 kokuchi.party

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
  OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
  OR OTHER DEALINGS IN THE SOFTWARE.
*/

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

export function getAccountName(email: string): string {
  const atIndex = email.indexOf("@");
  if (atIndex <= 0) return email;

  const localPart = email.slice(0, atIndex);
  return localPart;
}
