export enum AppStep {
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  ONBOARDING = 'ONBOARDING',
  UPLOAD_ID = 'UPLOAD_ID',
  UPLOAD_CERTS = 'UPLOAD_CERTS',
  REVIEW_DATA = 'REVIEW_DATA',
  DASHBOARD = 'DASHBOARD',
}

export enum Language {
  PT = 'PT',
  EN = 'EN',
}

export enum TemplateType {
  MODERN = 'MODERN',
  MINIMALIST = 'MINIMALIST',
  EXECUTIVE = 'EXECUTIVE',
  JUNIOR = 'JUNIOR',
}

export enum SubscriptionPlan {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM',
}

export interface UserProfile {
  id: string;
  email: string;
  plan: SubscriptionPlan;
}

export interface PersonalInfo {
  fullName: string;
  address: string;
  phone: string;
  email: string;
  nationality: string;
  idNumber: string;
  birthDate: string;
  linkedin?: string;
}

export interface EducationItem {
  course: string;
  institution: string;
  year: string;
  grade?: string;
}

export interface ExperienceItem {
  role: string;
  company: string;
  period: string;
  description: string;
}

export interface LocalizedContent {
  objective: string;
  skills: string[];
  education: EducationItem[];
  experience: ExperienceItem[];
  certifications: EducationItem[]; // Certs are treated similar to education
}

export interface CVData {
  id?: string;
  user_id?: string;
  personal: PersonalInfo;
  pt: LocalizedContent;
  en: LocalizedContent;
  photoBase64?: string;
  updated_at?: string;
}

export interface AIState {
  isProcessing: boolean;
  statusMessage: string;
  error?: string;
}