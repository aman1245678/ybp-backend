/** Mobile FormType → short type code (matches ApplicationIdGenerator). */
export const FORM_TYPE_CODES = Object.freeze({
  BRANDING: 'BR',
  CASTING_CREW: 'CS',
  IT_SOLUTIONS: 'IT',
  TRAINING: 'TR',
  DIGITAL_MARKETING: 'DM',
  SOCIAL_MEDIA: 'SM',
  MANPOWER_HIRE: 'MH',
  CREATIVE_CAREER: 'CR',
  FILM_TV_TALENT: 'FT',
  IT_CAREER: 'TC',
  OFFICE_JOB: 'MP',
  CONTACT: 'CT',
  JOIN_NETWORK: 'JN',
});

export const FORM_TYPE_TITLES = Object.freeze({
  BRANDING: 'Creative Branding',
  CASTING_CREW: 'Cast / Crew / Production',
  IT_SOLUTIONS: 'IT Solutions',
  TRAINING: 'Training & Assessments',
  DIGITAL_MARKETING: 'Digital Marketing',
  SOCIAL_MEDIA: 'Social Media Management',
  MANPOWER_HIRE: 'Manpower Outsourcing',
  CREATIVE_CAREER: 'Creative Professional',
  FILM_TV_TALENT: 'Film / TV Talent',
  IT_CAREER: 'IT Professional',
  OFFICE_JOB: 'Office / Manpower Job',
  CONTACT: 'Contact / Business Query',
  JOIN_NETWORK: 'Careers Soft Sign-Up',
});

export const INDUSTRY_FORMS = new Set([
  'BRANDING',
  'CASTING_CREW',
  'IT_SOLUTIONS',
  'TRAINING',
  'DIGITAL_MARKETING',
  'SOCIAL_MEDIA',
  'MANPOWER_HIRE',
  'CONTACT',
]);

export function resolveUserKind(formType) {
  return INDUSTRY_FORMS.has(formType) ? 'INDUSTRY' : 'CANDIDATE';
}

export function todayYmd(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}
