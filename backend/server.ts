import express from 'express';
import cors from 'cors';
import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Importa zod
import { z } from 'zod';

// Esquemas de validación con Zod
const registerSchema = z.object({
    email: z.string().email('Formato de email inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    role: z.enum(['candidate', 'company', 'admin'], 'Rol inválido'),
    companyData: z.object({
        name: z.string().min(1, 'El nombre de la empresa es requerido'),
        description: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        rnc: z.string().optional(),
        employeeCount: z.string().optional(),
        industry: z.string().optional(),
    }).optional(),
}).refine(data => {
    if (data.role === 'company' && !data.companyData) {
        return false; // companyData es requerido si el rol es company
    }
    return true;
}, { message: 'companyData es requerido para el rol de empresa', path: ['companyData'] });

const loginSchema = z.object({
    email: z.string().email('Formato de email inválido'),
    password: z.string().min(1, 'La contraseña es requerida'),
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Middleware for async error handling
const asyncHandler = (fn: (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<any>) => 
    (req: express.Request, res: express.Response, next: express.NextFunction) => {
        return Promise.resolve(fn(req, res, next)).catch(next);
    };

// Middleware de autenticación JWT
const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.status(401).json({ message: 'Token no proporcionado' });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) return res.status(403).json({ message: 'Token inválido' });
        (req as any).user = user; // Adjuntar la información del usuario al objeto de solicitud
        next();
    });
};

// Middleware de autorización basado en roles
const authorizeRoles = (roles: string[]) => {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
        if (!(req as any).user || !roles.includes((req as any).user.role)) {
            return res.status(403).json({ message: 'Acceso denegado: No tiene los permisos necesarios.' });
        }
        next();
    };
};

// Middleware de validación con Zod
const validate = (schema: z.ZodObject<any, any>) => 
    (req: express.Request, res: express.Response, next: express.NextFunction) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ message: 'Error de validación', errors: error.errors });
            }
            next(error); // Pasar otros errores al manejador de errores general
        }
    };

// --- API ENDPOINTS ---

app.get('/api', (req, res) => {
  res.send('Ditalent Backend Server is running with Prisma!');
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'Test endpoint is working!' });
});

// Módulo 1: Autenticación y Usuarios

app.post('/api/auth/register', validate(registerSchema), asyncHandler(async (req, res) => {
    const { email, password, role, companyData } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let user;

    if (role === 'company' && companyData) {
        const newCompany = await prisma.company.create({
            data: {
                name: { es: companyData.name, en: companyData.name, fr: companyData.name },
                description: { es: companyData.description || '', en: companyData.description || '', fr: companyData.description || '' },
                address: companyData.address,
                phone: companyData.phone,
                rnc: companyData.rnc,
                employeeCount: companyData.employeeCount,
                industry: companyData.industry,
                logo: 'https://picsum.photos/seed/newcompany/100',
                // planId: 'plan_free', // TODO: Seed plans and assign one
            }
        });
        user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role,
                companyId: newCompany.id,
            },
            include: { company: true },
        });
    } else if (role === 'candidate') {
        user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role,
                profile: {
                    create: {
                        fullName: 'New User',
                        photoUrl: `https://i.pravatar.cc/150?u=${Date.now()}`,
                        headline: { es: 'Nuevo en la plataforma', en: 'New to the platform', fr: 'Nouveau sur la plateforme' },
                        summary: { es: '', en: '', fr: '' },
                        professionalAreas: [],
                        location: { es: 'Santo Domingo', en: 'Santo Domingo', fr: 'Saint-Domingue' },
                        educationLevel: "Bachelor's Degree",
                        academicLife: [],
                        courses: [],
                        workLife: [],
                        languages: [],
                        teachingExperience: [],
                        volunteerExperience: [],
                        skills: [],
                        competencies: [],
                        socialSkills: [],
                        personalityType: '',
                        currentSalary: null,
                        desiredSalary: null,
                        desiredContractTypes: [],
                        coverLetter: { es: '', en: '', fr: '' },
                        references: [],
                        socialLinks: [],
                    }
                }
            },
            include: { profile: true },
        });
    } else { // Admin or other roles
        user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role,
            }
        });
    }

    res.status(201).json(user);
}));

app.post('/api/auth/login', validate(loginSchema), asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    console.log('Login attempt with body:', req.body);
    const user = await prisma.user.findUnique({
        where: { email },
        include: { profile: true, company: true, adminRole: true }
    });

    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // In a real app, compare hashed password
    if (!await bcrypt.compare(password, user.password)) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ user, token });
}));

// CRUD for Users
app.get('/api/users', authenticateToken, authorizeRoles(['admin']), asyncHandler(async (req, res) => {
    const users = await prisma.user.findMany({ include: { company: true, adminRole: true }});
    res.json(users);
}));

app.put('/api/users/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { email, role, roleId, companyId } = req.body;
    const updatedUser = await prisma.user.update({
        where: { id },
        data: { email, role, roleId, companyId },
    });
    res.json(updatedUser);
}));

app.delete('/api/users/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    // Add protection for super-admin if needed
    await prisma.user.delete({ where: { id } });
    res.json({ success: true });
}));


// Módulo 3: Empresas (Companies)
app.get('/api/companies', asyncHandler(async (req, res) => {
    const { name } = req.query;
    const where: Prisma.CompanyWhereInput = {};
    if (name) {
        where.name = {
            path: ['es'], // Assuming name is multilingual JSON field
            string_contains: String(name),
            mode: 'insensitive' // Case-insensitive search
        };
    }
    const companies = await prisma.company.findMany({ where });
    res.json(companies);
}));

app.get('/api/companies/:id', asyncHandler(async (req, res) => {
    const item = await prisma.company.findUnique({ where: { id: req.params.id } });
    if (item) res.json(item);
    else res.status(404).json({ message: 'Company not found' });
}));

app.post('/api/companies', asyncHandler(async (req, res) => {
    const newItem = await prisma.company.create({ data: req.body });
    res.status(201).json(newItem);
}));

app.put('/api/companies/:id', asyncHandler(async (req, res) => {
    const updatedItem = await prisma.company.update({
        where: { id: req.params.id },
        data: req.body,
    });
    res.json(updatedItem);
}));

app.delete('/api/companies/:id', asyncHandler(async (req, res) => {
    await prisma.company.delete({ where: { id: req.params.id } });
    res.json({ success: true });
}));

app.put('/api/companies/:id/plan', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { planId } = req.body;
    const updatedCompany = await prisma.company.update({
        where: { id },
        data: { planId },
    });
    res.json(updatedCompany);
}));


// Módulo 2: Vacantes (Jobs)

app.get('/api/jobs', asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, searchTerm, location, professionalArea, companyId, status, isInternal } = req.query;

    const where: Prisma.JobWhereInput = {};
    if (searchTerm) where.title = { path: ['es'], string_contains: String(searchTerm) }; // Simple search on 'es' for now
    if (location) where.location = { path: ['es'], string_contains: String(location) };
    if (professionalArea) where.professionalArea = String(professionalArea);
    if (companyId) where.companyId = String(companyId);
    if (status) where.status = String(status);
    if (isInternal) where.isInternal = isInternal === 'true';

    const jobs = await prisma.job.findMany({
        where,
        include: { company: true },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { postedDate: 'desc' }
    });

    const total = await prisma.job.count({ where });

    res.json({ jobs, total });
}));

app.get('/api/jobs/all', asyncHandler(async (req, res) => {
    const jobs = await prisma.job.findMany({ include: { company: true } });
    res.json({ jobs });
}));

app.get('/api/jobs/:id', asyncHandler(async (req, res) => {
    const job = await prisma.job.findUnique({ where: { id: req.params.id }, include: { company: true } });
    if (job) res.json(job);
    else res.status(404).json({ message: 'Job not found' });
}));

app.post('/api/jobs', asyncHandler(async (req, res) => {
    console.log('Request body for new job:', req.body);
    const { companyId, ...jobData } = req.body;
    
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) return res.status(404).json({ message: "Company not found" });

    if (!company.isRecruitmentClient && (company.jobPostingsRemaining ?? 0) <= 0) {
        return res.status(403).json({ message: "No job postings remaining." });
    }

    const newJob = await prisma.job.create({
        data: {
            title: jobData.title,
            location: jobData.location,
            professionalArea: jobData.professionalArea,
            type: jobData.type,
            salary: jobData.salary,
            description: jobData.description,
            requirements: jobData.requirements,
            isInternal: jobData.isInternal,
            status: jobData.status,
            imageUrl: jobData.imageUrl,
            company: { connect: { id: companyId } },
            postedDate: new Date(),
        }
    });

    if (!company.isRecruitmentClient && company.jobPostingsRemaining && company.jobPostingsRemaining > 0) {
        await prisma.company.update({
            where: { id: companyId },
            data: { jobPostingsRemaining: { decrement: 1 } }
        });
    }

    res.status(201).json(newJob);
}));

app.put('/api/jobs/:id', asyncHandler(async (req, res) => {
    console.log('Request body for updating job:', req.body);
    const { companyId, ...jobData } = req.body;
    const updatedJob = await prisma.job.update({
        where: { id: req.params.id },
        data: {
            title: jobData.title,
            location: jobData.location,
            professionalArea: jobData.professionalArea,
            type: jobData.type,
            salary: jobData.salary,
            description: jobData.description,
            requirements: jobData.requirements,
            isInternal: jobData.isInternal,
            status: jobData.status,
            imageUrl: jobData.imageUrl,
            ...(companyId && { company: { connect: { id: companyId } } })
        },
    });
    res.json(updatedJob);
}));

app.delete('/api/jobs/:id', asyncHandler(async (req, res) => {
    await prisma.job.delete({ where: { id: req.params.id } });
    res.json({ success: true });
}));

app.get('/api/jobs/company/:companyId', asyncHandler(async (req, res) => {
    const { companyId } = req.params;
    const jobs = await prisma.job.findMany({ where: { companyId } });
    res.json({ jobs });
}));

app.get('/api/companies/user/:userId', asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.params.userId } });
    if (!user || !user.companyId) {
        return res.status(404).json({ message: 'Company not found for this user' });
    }
    const company = await prisma.company.findUnique({ where: { id: user.companyId } });
    if (company) res.json(company);
    else res.status(404).json({ message: 'Company not found' });
}));

// Generic CRUD factory for simple models
const createCrudEndpoints = (modelName: keyof PrismaClient, resource: string) => {
    const model = prisma[modelName] as any;

    app.get(`/api/${resource}`, asyncHandler(async (req, res) => res.json(await model.findMany())));
    
    app.get(`/api/${resource}/:id`, asyncHandler(async (req, res) => {
        const item = await model.findUnique({ where: { id: req.params.id } });
        if (item) res.json(item);
        else res.status(404).json({ message: 'Not found' });
    }));

    app.post(`/api/${resource}`, asyncHandler(async (req, res) => {
        const newItem = await model.create({ data: req.body });
        res.status(201).json(newItem);
    }));

    app.put(`/api/${resource}/:id`, asyncHandler(async (req, res) => {
        const updatedItem = await model.update({
            where: { id: req.params.id },
            data: req.body,
        });
        res.json(updatedItem);
    }));

    app.delete(`/api/${resource}/:id`, asyncHandler(async (req, res) => {
        await model.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    }));
};



// Módulo 4: Perfiles de Candidato (Profiles)

app.get('/api/profiles/user/:userId', asyncHandler(async (req, res) => {
    const profile = await prisma.candidateProfile.findUnique({ where: { userId: req.params.userId } });
    if (profile) res.json(profile);
    else res.status(404).json({ message: 'Profile not found' });
}));

app.get('/api/profiles/:profileId', asyncHandler(async (req, res) => {
    const profile = await prisma.candidateProfile.findUnique({ where: { id: req.params.profileId } });
    if (profile) res.json(profile);
    else res.status(404).json({ message: 'Profile not found' });
}));

app.put('/api/profiles/:profileId', asyncHandler(async (req, res) => {
    const updatedProfile = await prisma.candidateProfile.update({
        where: { id: req.params.profileId },
        data: req.body,
    });
    res.json(updatedProfile);
}));

app.get('/api/candidates/search', asyncHandler(async (req, res) => {
    const { searchTerm, professionalArea } = req.query;
    const where: Prisma.CandidateProfileWhereInput = {
        OR: searchTerm ? [
            { fullName: { contains: String(searchTerm), mode: 'insensitive' } },
            { headline: { path: ['es'], string_contains: String(searchTerm) } },
            { summary: { path: ['es'], string_contains: String(searchTerm) } },
            { skills: { has: String(searchTerm) } },
        ] : undefined,
        professionalAreas: professionalArea ? { has: String(professionalArea) } : undefined,
    };
    const candidates = await prisma.candidateProfile.findMany({ where });
    res.json(candidates);
}));

// Módulo 5: Contenido del Sitio (CMS)
createCrudEndpoints('service', 'services');
createCrudEndpoints('teamMember', 'team');
createCrudEndpoints('testimonial', 'testimonials');
createCrudEndpoints('blogPost', 'blog');
createCrudEndpoints('resource', 'resources');
createCrudEndpoints('banner', 'banners');
createCrudEndpoints('popupAd', 'popups');

app.get('/api/popups/active', asyncHandler(async (req, res) => {
    const { route, device, userRole } = req.query;
    // This is a simplified implementation. A real implementation would have more complex logic.
    const popups = await prisma.popupAd.findMany({
        where: {
            isActive: true,
            targeting: {
                path: ['pages'],
                array_contains: [String(route)]
            }
        }
    });
    res.json(popups);
}));

app.get('/api/banners/location/:location', asyncHandler(async (req, res) => {
    const { location } = req.params;
    const banners = await prisma.banner.findMany({
        where: {
            location: location,
        },
    });
    res.json(banners);
}));
createCrudEndpoints('subscriptionPlan', 'plans');
createCrudEndpoints('role', 'roles');

// Special endpoint for SiteSettings (only one entry)
app.get('/api/settings', asyncHandler(async (req, res) => {
    let settings = await prisma.siteSettings.findFirst();
    if (!settings) {
        settings = await prisma.siteSettings.create({
            data: {
                mission: { es: 'Misión por defecto', en: 'Default Mission', fr: 'Mission par défaut' },
                vision: { es: 'Visión por defecto', en: 'Default Vision', fr: 'Valeurs par défaut' },
                values: { es: 'Valores por defecto', en: 'Default Values', fr: 'Valeurs par défaut' },
                contactAddress: 'Dirección por defecto',
                contactPhone: 'Teléfono por defecto',
                contactEmail: 'email@defecto.com',
                careersPageTitle: { es: 'Carreras', en: 'Careers', fr: 'Carrières' },
                careersPageSubtitle: { es: 'Únete a nosotros', en: 'Join us', fr: 'Rejoignez-nous' },
                careersPageCtaTitle: { es: 'CTA Título', en: 'CTA Title', fr: 'Titre CTA' },
                careersPageCtaText: { es: 'CTA Texto', en: 'CTA Text', fr: 'Texte CTA' },
                jobTypes: [],
                educationLevels: [],
                footerCopyright: { es: 'Copyright', en: 'Copyright', fr: 'Copyright' },
                footerLinks: [],
                paymentGateways: { stripe: { publicKey: '', secretKey: '' }, paypal: { clientId: '', clientSecret: '' } },
                enableLanguageSwitcher: true,
                availableLanguages: ['es', 'en', 'fr'],
                defaultLanguage: 'es',
            }
        });
    }
    res.json(settings);
}));
app.put('/api/settings', asyncHandler(async (req, res) => {
    const currentSettings = await prisma.siteSettings.findFirst();
    const { 
        mission, vision, values, contactAddress, contactPhone, contactEmail, 
        contactLatitude, contactLongitude, careersPageTitle, careersPageSubtitle, 
        careersPageCtaTitle, careersPageCtaText, jobTypes, educationLevels, 
        footerCopyright, footerLinks, paymentGateways, enableLanguageSwitcher, 
        availableLanguages, defaultLanguage, availableLocations 
    } = req.body;

    const updatedSettings = await prisma.siteSettings.update({
        where: { id: currentSettings!.id },
        data: {
            mission, vision, values, contactAddress, contactPhone, contactEmail,
            contactLatitude, contactLongitude, careersPageTitle, careersPageSubtitle,
            careersPageCtaTitle, careersPageCtaText, jobTypes, educationLevels,
            footerCopyright, footerLinks, paymentGateways, enableLanguageSwitcher,
            availableLanguages, defaultLanguage, availableLocations
        },
    });
    res.json(updatedSettings);
}));

// --- Other Endpoints from mock server to be implemented with Prisma ---

// Example: Applications


app.get('/api/applications/job/:jobId', asyncHandler(async (req, res) => {
    const applications = await prisma.application.findMany({
        where: { jobId: req.params.jobId },
        include: { candidate: true }
    });
    res.json(applications);
}));

app.get('/api/applications', asyncHandler(async (req, res) => {
    const applications = await prisma.application.findMany({
        include: { job: true, candidate: true, company: true }
    });
    res.json(applications);
}));

app.get('/api/applications/company/:companyId', asyncHandler(async (req, res) => {
    const { companyId } = req.params;
    const applications = await prisma.application.findMany({ where: { companyId } });
    res.json(applications);
}));

app.get('/api/applications/user/:userId', asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const user = await prisma.user.findUnique({ 
        where: { id: userId },
        include: { profile: true }
    });
    if (!user || !user.profile) {
        return res.json([]);
    }
    const applications = await prisma.application.findMany({ where: { profileId: user.profile.id } });
    res.json(applications);
}));

app.get('/api/applications/has-applied', asyncHandler(async (req, res) => {
    const { jobId, userId } = req.query;
    const user = await prisma.user.findUnique({ 
        where: { id: String(userId) },
        include: { profile: true }
    });
    if (!user || !user.profile) {
        return res.json({ hasApplied: false });
    }
    const application = await prisma.application.findFirst({
        where: {
            jobId: String(jobId),
            profileId: user.profile.id,
        },
    });
    res.json({ hasApplied: !!application });
}));



// Add other endpoints as needed...

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});