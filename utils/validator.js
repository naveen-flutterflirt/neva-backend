/**
 * Shared Validation Helpers for Neva Backend
 */

// Valid 10-digit Indian mobile number (starts with 6, 7, 8, or 9)
const PHONE_REGEX = /^[6-9]\d{9}$/;

// Standard email regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 6-digit Indian PIN Code (first digit 1-9)
const PINCODE_REGEX = /^[1-9]\d{5}$/;

/**
 * Normalizes phone number: strips spaces, dashes, +91 or leading 0 if 10-digit remains
 */
function normalizePhone(phone) {
  if (!phone) return '';
  let cleaned = String(phone).replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.substring(3);
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = cleaned.substring(1);
  }
  return cleaned.trim();
}

/**
 * Validates 10-digit mobile number
 */
function isValidPhone(phone) {
  const normalized = normalizePhone(phone);
  return PHONE_REGEX.test(normalized);
}

/**
 * Validates email format
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim().toLowerCase());
}

/**
 * Validates 6-digit PIN code
 */
function isValidPincode(pincode) {
  if (!pincode) return false;
  const cleaned = String(pincode).trim();
  return PINCODE_REGEX.test(cleaned);
}

/**
 * Validates full address string to ensure it has valid address content and a 6-digit PIN code
 */
function validateAddressString(addressStr) {
  if (!addressStr || typeof addressStr !== 'string' || addressStr.trim().length < 5) {
    return {
      isValid: false,
      message: 'Complete delivery address is required.',
    };
  }

  // Check if address contains a 6-digit pincode
  const pinMatch = addressStr.match(/\b([1-9]\d{5})\b/);
  if (!pinMatch) {
    return {
      isValid: false,
      message: 'Address must contain a valid 6-digit pincode.',
    };
  }

  return { isValid: true, pincode: pinMatch[1] };
}

module.exports = {
  PHONE_REGEX,
  EMAIL_REGEX,
  PINCODE_REGEX,
  normalizePhone,
  isValidPhone,
  isValidEmail,
  isValidPincode,
  validateAddressString,
};
