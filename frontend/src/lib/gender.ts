export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export const genderLabels: Record<Gender, string> = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
  OTHER: 'Khác',
};

export const GENDERS: Gender[] = ['MALE', 'FEMALE', 'OTHER'];
