export const APP_CONFIG = {
  name: 'StrangerSpace',
  tagline: 'Meet Someone New. Start a Conversation.',
  description: 'A modern, private, anonymous random text chat platform for adults.',
  version: '1.0.0',
  adultAgeMinimum: 18,
  maxMessageLength: 1000,
  rateLimitSeconds: 3,
  rateLimitMaxMessages: 5,
  supportEmail: 'safety@strangerspace.example',
  policies: {
    termsVersion: '1.0.0',
    privacyVersion: '1.0.0',
    guidelinesVersion: '1.0.0',
  },
} as const;

export const REPORT_REASONS = [
  { code: 'harassment', label: 'Harassment or Bullying' },
  { code: 'spam', label: 'Spam or Scams' },
  { code: 'threat', label: 'Threatening Behavior' },
  { code: 'inappropriate', label: 'Inappropriate Content' },
  { code: 'underage', label: 'Suspected Underage User' },
  { code: 'other', label: 'Other Violation' },
] as const;
