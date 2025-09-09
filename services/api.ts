import type { Job, Company, User, CandidateProfile, Application, Service, TeamMember, Testimonial, BlogPost, Resource, Banner, SiteSettings, ContactSubmission, Conversation, Message, CVSubmission, SubscriptionPlan, Role, PopupAd } from '../types';
import type { CompanyRegistrationData } from '../contexts/AuthContext';

const API_BASE_URL = 'http://localhost:8088/api';

async function fetchApi(path: string, options: RequestInit = {}) {
    try {
        const token = sessionStorage.getItem('token');
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${path}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'An unknown API error occurred' }));
            throw new Error(errorData.message || 'API request failed');
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            return response.json();
        }
        
        return { success: true };

    } catch (error) {
        console.error(`API call to ${path} failed:`, error);
        throw error;
    }
}


export const api = {
  getActiveUserCount: async (): Promise<number> => {
    const data = await fetchApi('/stats/active-users');
    return data.count;
  },

  // Auth
  login: async (email: string, pass: string): Promise<{ user: User, token: string } | null> => {
    const data = await fetchApi('/auth/login', { method: 'POST', body: JSON.stringify({ email, password: pass }) });
    return data; // data will be { user, token } from backend
  },
  register: async (email: string, pass: string, role: 'candidate' | 'company', companyData?: CompanyRegistrationData): Promise<User | null> => {
    return fetchApi('/auth/register', { method: 'POST', body: JSON.stringify({ email, password: pass, role, companyData }) });
  },

  // Jobs
  getJobs: async (params: { page?: number; limit?: number; isInternal?: boolean; onlyActive?: boolean; searchTerm?: string; location?: string; professionalArea?: string; companyId?: string; status?: Job['status']; } = {}): Promise<{ jobs: Job[]; total: number }> => {
    const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '').map(([key, value]) => [key, String(value)])).toString();
    return fetchApi(`/jobs?${query}`);
  },
  getAllJobs: async (): Promise<Job[]> => {
     const response = await fetchApi('/jobs/all');
     return response.jobs;
  },
  getJobById: async (id: string): Promise<Job | undefined> => {
    return fetchApi(`/jobs/${id}`);
  },
  getJobsByCompanyId: async (companyId: string): Promise<Job[]> => {
    const response = await fetchApi(`/jobs/company/${companyId}`);
    return response.jobs;
  },
  saveJob: async (jobData: Omit<Job, 'id' | 'postedDate' | 'status'> & { id?: string }): Promise<Job> => {
    if (jobData.id) {
      return fetchApi(`/jobs/${jobData.id}`, { method: 'PUT', body: JSON.stringify(jobData) });
    } else {
      return fetchApi('/jobs', { method: 'POST', body: JSON.stringify(jobData) });
    }
  },
  deleteJob: async (jobId: string): Promise<{ success: boolean }> => {
    return fetchApi(`/jobs/${jobId}`, { method: 'DELETE' });
  },
  updateJobStatus: async (jobId: string, status: Job['status']): Promise<Job | null> => {
      return fetchApi(`/jobs/${jobId}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
  },

  // Companies
  getCompanies: async (params: { searchTerm?: string } = {}): Promise<Company[]> => {
    const query = new URLSearchParams(params as any).toString();
    return fetchApi(`/companies?${query}`);
  },
  getCompanyById: async (id: string): Promise<Company | undefined> => {
    return fetchApi(`/companies/${id}`);
  },
  getCompanyByUserId: async (userId: string): Promise<Company | undefined> => {
    return fetchApi(`/companies/user/${userId}`);
  },
  saveCompany: async (companyData: Omit<Company, 'id'> & { id?: string }): Promise<Company> => {
     if (companyData.id) {
      return fetchApi(`/companies/${companyData.id}`, { method: 'PUT', body: JSON.stringify(companyData) });
    } else {
      return fetchApi('/companies', { method: 'POST', body: JSON.stringify(companyData) });
    }
  },
  deleteCompany: async (companyId: string): Promise<{ success: boolean }> => {
    return fetchApi(`/companies/${companyId}`, { method: 'DELETE' });
  },

  // Users
  getUsers: async (): Promise<User[]> => {
    return fetchApi('/users');
  },
  saveUser: async (userData: Omit<User, 'id'> & { id?: string }): Promise<User> => {
    if (userData.id) {
      return fetchApi(`/users/${userData.id}`, { method: 'PUT', body: JSON.stringify(userData) });
    } else {
      return fetchApi('/users', { method: 'POST', body: JSON.stringify(userData) });
    }
  },
  deleteUser: async (userId: string): Promise<{ success: boolean }> => {
    return fetchApi(`/users/${userId}`, { method: 'DELETE' });
  },

  // Roles
  getRoles: async (): Promise<Role[]> => fetchApi('/roles'),
  getRoleById: async (id: string): Promise<Role | undefined> => fetchApi(`/roles/${id}`),
  saveRole: async (data: Omit<Role, 'id'> & { id?: string }): Promise<Role> => {
    if (data.id) {
      return fetchApi(`/roles/${data.id}`, { method: 'PUT', body: JSON.stringify(data) });
    }
    return fetchApi('/roles', { method: 'POST', body: JSON.stringify(data) });
  },
  deleteRole: async (id: string): Promise<{ success: boolean }> => fetchApi(`/roles/${id}`, { method: 'DELETE' }),

  // Profiles
  getProfileByUserId: async (userId: string): Promise<CandidateProfile | undefined> => {
      return fetchApi(`/profiles/user/${userId}`);
  },
  getProfileById: async (profileId: string): Promise<CandidateProfile | undefined> => {
    return fetchApi(`/profiles/${profileId}`);
  },
  saveProfile: async (profileData: CandidateProfile): Promise<CandidateProfile> => {
    return fetchApi(`/profiles/${profileData.id}`, { method: 'PUT', body: JSON.stringify(profileData) });
  },
   getSuggestedJobs: async (userId: string): Promise<Job[]> => {
        return fetchApi(`/jobs/suggested/${userId}`);
    },
   searchCandidates: async (params: { searchTerm?: string; professionalArea?: string }): Promise<CandidateProfile[]> => {
    const query = new URLSearchParams(params as any).toString();
    return fetchApi(`/candidates/search?${query}`);
  },
  
  // Applications
  applyForJob: async(jobId: string, candidateId: string): Promise<Application | null> => {
    return fetchApi('/applications/apply', { method: 'POST', body: JSON.stringify({ jobId, candidateId }) });
  },
  getApplicationsByUserId: async(userId: string): Promise<Application[]> => {
      return fetchApi(`/applications/user/${userId}`);
  },
  getAllApplications: async(): Promise<Application[]> => {
    return fetchApi('/applications');
  },
   getApplicationsByCompanyId: async (companyId: string): Promise<Application[]> => {
      return fetchApi(`/applications/company/${companyId}`);
  },
  hasUserApplied: async(jobId: string, userId: string): Promise<boolean> => {
      const data = await fetchApi(`/applications/has-applied?jobId=${jobId}&userId=${userId}`);
      return data.hasApplied;
  },
  getApplicantsByJobId: async (jobId: string): Promise<Application[]> => {
      return fetchApi(`/applications/job/${jobId}`);
  },
  updateApplicationStatus: async (applicationId: string, status: Application['status']): Promise<Application | null> => {
      return fetchApi(`/applications/${applicationId}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
  },

  // Messaging
  getConversationById: async (conversationId: string): Promise<Conversation | undefined> => {
      return fetchApi(`/conversations/${conversationId}`);
  },
  sendMessage: async (conversationId: string, senderId: string, text: string): Promise<Message | null> => {
    return fetchApi(`/conversations/${conversationId}/messages`, { method: 'POST', body: JSON.stringify({ senderId, text }) });
  },
  
  // Subscription Plans
  getSubscriptionPlans: async (): Promise<SubscriptionPlan[]> => fetchApi('/plans'),
  getSubscriptionPlanById: async (planId: string): Promise<SubscriptionPlan | undefined> => fetchApi(`/plans/${planId}`),
  saveSubscriptionPlan: async (data: Omit<SubscriptionPlan, 'id'> & { id?: string }): Promise<SubscriptionPlan> => {
    if (data.id) {
      return fetchApi(`/plans/${data.id}`, { method: 'PUT', body: JSON.stringify(data) });
    }
    return fetchApi('/plans', { method: 'POST', body: JSON.stringify(data) });
  },
  deleteSubscriptionPlan: async (id: string): Promise<{ success: boolean }> => fetchApi(`/plans/${id}`, { method: 'DELETE' }),
  upgradeCompanyPlan: async (companyId: string, planId: string): Promise<Company | null> => fetchApi(`/companies/${companyId}/upgrade-plan`, { method: 'POST', body: JSON.stringify({ planId }) }),


  // Site Content (generic implementation example)
  getServices: async (): Promise<Service[]> => fetchApi('/services'),
  saveService: async (data: Omit<Service, 'id'> & { id?: string }): Promise<Service> => data.id ? fetchApi(`/services/${data.id}`, { method: 'PUT', body: JSON.stringify(data) }) : fetchApi('/services', { method: 'POST', body: JSON.stringify(data) }),
  deleteService: async (id: string): Promise<{ success: boolean }> => fetchApi(`/services/${id}`, { method: 'DELETE' }),

  getTeamMembers: async (): Promise<TeamMember[]> => fetchApi('/team'),
  saveTeamMember: async (data: Omit<TeamMember, 'id'> & { id?: string }): Promise<TeamMember> => data.id ? fetchApi(`/team/${data.id}`, { method: 'PUT', body: JSON.stringify(data) }) : fetchApi('/team', { method: 'POST', body: JSON.stringify(data) }),
  deleteTeamMember: async (id: string): Promise<{ success: boolean }> => fetchApi(`/team/${id}`, { method: 'DELETE' }),
  
  getTestimonials: async (): Promise<Testimonial[]> => fetchApi('/testimonials'),
  saveTestimonial: async (data: Omit<Testimonial, 'id'> & { id?: string }): Promise<Testimonial> => data.id ? fetchApi(`/testimonials/${data.id}`, { method: 'PUT', body: JSON.stringify(data) }) : fetchApi('/testimonials', { method: 'POST', body: JSON.stringify(data) }),
  deleteTestimonial: async (id: string): Promise<{ success: boolean }> => fetchApi(`/testimonials/${id}`, { method: 'DELETE' }),

  getBlogPosts: async (): Promise<BlogPost[]> => fetchApi('/blog'),
  getBlogPostById: async (id: string): Promise<BlogPost | undefined> => fetchApi(`/blog/${id}`),
  saveBlogPost: async (data: Omit<BlogPost, 'id' | 'publishedDate'> & { id?: string }): Promise<BlogPost> => data.id ? fetchApi(`/blog/${data.id}`, { method: 'PUT', body: JSON.stringify(data) }) : fetchApi('/blog', { method: 'POST', body: JSON.stringify(data) }),
  deleteBlogPost: async (id: string): Promise<{ success: boolean }> => fetchApi(`/blog/${id}`, { method: 'DELETE' }),

  getResources: async (): Promise<Resource[]> => fetchApi('/resources'),
  saveResource: async (data: Omit<Resource, 'id'> & { id?: string }): Promise<Resource> => data.id ? fetchApi(`/resources/${data.id}`, { method: 'PUT', body: JSON.stringify(data) }) : fetchApi('/resources', { method: 'POST', body: JSON.stringify(data) }),
  deleteResource: async (id: string): Promise<{ success: boolean }> => fetchApi(`/resources/${id}`, { method: 'DELETE' }),

  // Banners
  getBanners: async (): Promise<Banner[]> => fetchApi('/banners'),
  getBannersByLocation: async (location: string): Promise<Banner[]> => fetchApi(`/banners/location/${location}`),
  saveBanner: async (data: Omit<Banner, 'id'> & { id?: string }): Promise<Banner> => data.id ? fetchApi(`/banners/${data.id}`, { method: 'PUT', body: JSON.stringify(data) }) : fetchApi('/banners', { method: 'POST', body: JSON.stringify(data) }),
  deleteBanner: async (id: string): Promise<{ success: boolean }> => fetchApi(`/banners/${id}`, { method: 'DELETE' }),

  // Site Settings
  getSiteSettings: async (): Promise<SiteSettings> => fetchApi('/settings'),
  saveSiteSettings: async (data: SiteSettings): Promise<SiteSettings> => fetchApi('/settings', { method: 'PUT', body: JSON.stringify(data) }),

  // Contact Submissions
  getContactSubmissions: async (): Promise<ContactSubmission[]> => fetchApi('/contact-submissions'),
  saveContactSubmission: async (data: Omit<ContactSubmission, 'id' | 'submittedAt'>): Promise<ContactSubmission> => fetchApi('/contact-submissions', { method: 'POST', body: JSON.stringify(data) }),

  // CV Submissions
  getCvSubmissions: async (): Promise<CVSubmission[]> => fetchApi('/cv-submissions'),
  saveCvSubmission: async (data: Omit<CVSubmission, 'id' | 'submittedAt'>): Promise<CVSubmission> => fetchApi('/cv-submissions', { method: 'POST', body: JSON.stringify(data) }),
  
  // Popup Ads
  getPopupAds: async (): Promise<PopupAd[]> => fetchApi('/popups'),
  savePopupAd: async (data: Omit<PopupAd, 'id'> & { id?: string }): Promise<PopupAd> => data.id ? fetchApi(`/popups/${data.id}`, { method: 'PUT', body: JSON.stringify(data) }) : fetchApi('/popups', { method: 'POST', body: JSON.stringify(data) }),
  deletePopupAd: async (id: string): Promise<{ success: boolean }> => fetchApi(`/popups/${id}`, { method: 'DELETE' }),
  getActivePopupsForRoute: async (route: string, device: 'desktop' | 'mobile', userRole: User['role'] | 'guest'): Promise<PopupAd[]> => {
      const query = new URLSearchParams({ route, device, userRole }).toString();
      return fetchApi(`/popups/active?${query}`);
  },
};