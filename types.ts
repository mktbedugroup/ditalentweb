export type MultilingualString = {
  es: string;
  en: string;
  fr: string;
};

export type MultilingualStringArray = {
  es: string[];
  en: string[];
  fr: string[];
};

export interface SubscriptionPlan {
  id: string;
  name: MultilingualString;
  description: MultilingualString;
  price: number;
  currency: 'USD' | 'DOP';
  type: 'subscription' | 'package';
  durationUnit?: 'week' | 'month' | 'year';
  durationValue?: number;
  jobPostingsLimit: number; // For subscriptions: per period. For packages: total credits. -1 for unlimited.
  features: ('search_candidates')[];
  isFeatured?: boolean;
  isActive: boolean;
}


export interface Company {
  id: string;
  name: MultilingualString;
  logo: string;
  description: MultilingualString;
  address?: string;
  phone?: string;
  rnc?: string;
  employeeCount?: '1-10' | '11-50' | '51-200' | '201-500' | '501+';
  industry?: string;
  latitude?: number;
  longitude?: number;
  planId?: string;
  jobPostingsRemaining?: number;
  subscriptionEndDate?: string;
  isRecruitmentClient?: boolean;
  socialLinks?: SocialLink[];
}

export interface Job {
  id: string;
  title: MultilingualString;
  companyId: string;
  location: MultilingualString;
  professionalArea: string;
  type: string;
  salary: string;
  description: MultilingualString;
  requirements: MultilingualStringArray;
  postedDate: string;
  expiryDate: string;
  isInternal?: boolean;
  status: 'active' | 'paused' | 'closed';
  imageUrl?: string;
}

export type Permission = 
  | 'view_dashboard'
  | 'view_analytics'
  | 'view_map'
  | 'manage_jobs'
  | 'manage_companies'
  | 'manage_users'
  | 'manage_submissions'
  | 'manage_content' // Covers services, team, testimonials, blog, resources
  | 'manage_banners'
  | 'manage_plans'
  | 'manage_settings'
  | 'manage_roles'
  | 'manage_popups';

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'candidate' | 'company';
  profileId?: string; // For candidates
  companyId?: string; // For company users
  roleId?: string; // For admin users with custom roles
}

export interface Experience {
  id: string;
  title: MultilingualString;
  company: MultilingualString;
  location: MultilingualString;
  startDate: string;
  endDate: string | 'Present';
  description: MultilingualString;
}

export interface Education {
  id: string;
  institution: MultilingualString;
  degree: MultilingualString;
  fieldOfStudy: MultilingualString;
  startDate: string;
  endDate: string;
}

export interface Course {
  id: string;
  name: MultilingualString;
  institution: MultilingualString;
  completionDate: string;
}

export interface Language {
    id: string;
    name: string;
    proficiency: 'Basic' | 'Conversational' | 'Fluent' | 'Native';
}

export interface TeachingExperience {
    id: string;
    course: MultilingualString;
    institution: MultilingualString;
    years: number;
}

export interface VolunteerExperience {
    id: string;
    organization: MultilingualString;
    role: MultilingualString;
    cause: MultilingualString;
    startDate: string;
    endDate: string | 'Present';
}

export interface Reference {
    id: string;
    name: string;
    type: 'personal' | 'professional';
    company?: MultilingualString;
    phone: string;
}

export interface SocialLink {
    id: string;
    platform: 'LinkedIn' | 'GitHub' | 'Portfolio' | 'Website' | 'Facebook' | 'Twitter' | 'Instagram' | 'Other';
    url: string;
}

export interface CandidateProfile {
  id: string;
  userId: string;
  fullName: string;
  headline: MultilingualString;
  summary: MultilingualString;
  photoUrl: string;
  cvUrl?: string;
  
  professionalAreas: string[];
  location: MultilingualString;
  educationLevel: string; 
  
  academicLife: Education[];
  courses: Course[];
  workLife: Experience[];
  
  languages: Language[];
  teachingExperience: TeachingExperience[];
  volunteerExperience: VolunteerExperience[];
  
  skills: string[];
  competencies: string[];
  socialSkills: string[];
  personalityType: string;
  
  currentSalary: number | null;
  desiredSalary: number | null;
  desiredContractTypes: ('Full-time' | 'Part-time' | 'Contract' | 'Internship')[];
  
  coverLetter: MultilingualString;
  references: Reference[];
  socialLinks: SocialLink[];
  
  blockedCompanyIds: string[];
}


export interface Application {
    id: string;
    jobId: string;
    companyId: string;
    candidateId: string;
    profileId: string;
    appliedDate: string;
    status: 'Submitted' | 'In Review' | 'Interviewing' | 'Rejected' | 'Hired';
    conversationId: string;
}

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    text: string;
    timestamp: string;
}

export interface Conversation {
    id: string;
    participantIds: string[];
    jobId: string;
    messages: Message[];
}

export interface Service {
    id: string;
    title: MultilingualString;
    description: MultilingualString;
}

export interface TeamMember {
    id: string;
    name: MultilingualString;
    title: MultilingualString;
    photoUrl: string;
}

export interface Testimonial {
    id: string;
    quote: MultilingualString;
    author: MultilingualString;
    company: MultilingualString;
}

export interface BlogPost {
    id: string;
    title: MultilingualString;
    content: MultilingualString;
    author: MultilingualString;
    publishedDate: string;
    imageUrl?: string;
}

export interface Resource {
    id: string;
    title: MultilingualString;
    description: MultilingualString;
    fileUrl: string;
}

export interface CTAButton {
  id: string;
  text: MultilingualString;
  link: string;
  size: 'sm' | 'md' | 'lg';
  backgroundColor: string;
  textColor: string;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  showTo?: ('guest' | 'candidate' | 'company' | 'admin')[];
}

export interface Slide {
  id: string;
  imageUrl: string;
  title: MultilingualString;
  subtitle: MultilingualString;
  ctaButtons: CTAButton[];
}

export interface Banner {
  id: string;
  name: string; 
  location: string;
  slides: Slide[];
  config: {
    transition: 'slide' | 'fade';
    interval: number;
    autoplay: boolean;
    loop: boolean;
    showArrows: boolean;
    showDots: boolean;
    height_px: number;
    fontFamily: 'sans' | 'montserrat' | 'roboto-slab';
    overlayColor: string;
    overlayOpacity: number;
    textShadow: boolean;
  };
}

export interface ContactSubmission {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    submittedAt: string;
}

export interface CVSubmission {
    id: string;
    name: string;
    email: string;
    cvBase64: string;
    fileName: string;
    submittedAt: string;
}

export interface FooterLink {
  id: string;
  title: MultilingualString;
  url: string;
}

export interface SiteSettings {
    mission: MultilingualString;
    vision: MultilingualString;
    values: MultilingualString;
    contactAddress: string;
    contactPhone: string;
    contactEmail: string;
    contactLatitude?: number;
    contactLongitude?: number;
    careersPageTitle: MultilingualString;
    careersPageSubtitle: MultilingualString;
    careersPageCtaTitle: MultilingualString;
    careersPageCtaText: MultilingualString;
    jobTypes: string[];
    educationLevels: string[];
    footerCopyright: MultilingualString;
    footerLinks: FooterLink[];
    paymentGateways: {
      stripe: {
        publicKey: string;
        secretKey: string;
      };
      paypal: {
        clientId: string;
        clientSecret: string;
      }
    };
    enableLanguageSwitcher: boolean;
    availableLanguages: ('es' | 'en' | 'fr')[];
    defaultLanguage: 'es' | 'en' | 'fr';
}

export interface PopupAd {
  id: string;
  name: string;
  isActive: boolean;
  
  content: {
    imageUrl: string;
    title: MultilingualString;
    text: MultilingualString;
    ctaButton: {
      text: MultilingualString;
      link: string;
    };
  };

  appearance: {
    size: 'sm' | 'md' | 'lg';
    position: 'center' | 'bottom-right' | 'bottom-left';
    overlayOpacity: number;
  };
  
  triggers: {
    type: 'delay' | 'scroll' | 'exit-intent';
    value: number; // seconds for delay, percentage for scroll
  };

  frequency: {
    type: 'session' | 'days' | 'always';
    value?: number; // number of days
  };

  targeting: {
    pages: string[]; // e.g., ['/', '/jobs/*']
    devices: ('desktop' | 'mobile')[];
    // FIX: Add 'admin' to the list of user roles that can be targeted for popups.
    users: ('guest' | 'candidate' | 'company' | 'admin')[];
  };
}
