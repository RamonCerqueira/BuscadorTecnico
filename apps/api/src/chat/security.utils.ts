/**
 * Utility to detect and mask sensitive information in chat messages,
 * preventing off-platform communication (payment bypass, direct contact).
 */
export function maskSensitiveData(text: string): string {
  if (!text) return text;

  let masked = text;

  // 1. Mask Email Addresses
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
  masked = masked.replace(emailRegex, '[E-mail Ocultado]');

  // 2. Mask URLs / Websites / Domains
  // Covers http://, https://, www., and common domains with paths
  const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9.-]+\.(com|com\.br|net|org|io|me|online|site)\/[^\s]*)/gi;
  masked = masked.replace(urlRegex, '[Link Ocultado]');

  // 3. Mask Brazilian and Generic Phone Numbers
  // Patterns like:
  // - +55 (11) 99999-9999
  // - 11999999999
  // - 99999-9999
  // - 9999-9999
  const phoneRegex = /(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?\d{4,5}[-\s]?\d{4}/g;
  masked = masked.replace(phoneRegex, (match) => {
    // If the match is a pure number like a price (e.g. "2026" or "1000"), let's not mask short numbers.
    // If it's longer than 7 digits of raw numbers, it's likely a phone or serial number.
    const rawDigits = match.replace(/\D/g, '');
    if (rawDigits.length >= 8) {
      return '[Telefone Ocultado]';
    }
    return match;
  });

  // 4. Mask Numeric Sequences of 8+ digits (potential Pix keys, CPFs, or bank accounts)
  const numericSequenceRegex = /\b\d{8,20}\b/g;
  masked = masked.replace(numericSequenceRegex, '[Dado Sensível Ocultado]');

  return masked;
}
