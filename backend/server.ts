import crypto from 'crypto';
import express from 'express';
import cors from 'cors';
import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';

console.log('[Startup] Backend application starting...');
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: './.env' });
}

let prisma: PrismaClient;

(async () => { // IIAFE start
    try {
        console.log('[Startup] Initializing Prisma Client...');
        console.log(`[Startup] DATABASE_URL: ${process.env.DATABASE_URL ? 'Configured' : 'NOT CONFIGURED'}`);
        prisma = new PrismaClient({
            datasources: {
                db: {
                    url: process.env.DATABASE_URL,
                },
            },
        });
        // Test database connection
        await prisma.$connect();
        console.log('[Startup] Prisma Client connected to database successfully.');
    } catch (error) {
        console.error('[Startup Error] Failed to connect to database or initialize Prisma:', error);
        // Exit the process if database connection fails on startup
        process.exit(1);
    }
})(); // IIAFE end

const app = express();
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Catch unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Application specific logging, throwing an error, or other logic here
    process.exit(1);
});

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

const newsletterSubscribeSchema = z.object({
    email: z.string().email('Formato de email inválido'),
});

const sendCampaignSchema = z.object({
    subject: z.string().min(1, 'El asunto es requerido'),
    content: z.string().min(1, 'El contenido del correo es requerido'),
});

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8081',
  'http://localhost:8080',
];

if (process.env.NODE_ENV === 'production' && process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
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
                return res.status(400).json({ message: 'Error de validación', errors: error.issues });
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

app.get('/api/stats/active-users', asyncHandler(async (req, res) => {
    const userCount = await prisma.user.count();
    res.json({ count: userCount });
}));

// Módulo 1: Autenticación y Usuarios

app.post('/api/auth/register', validate(registerSchema), asyncHandler(async (req, res) => {
    const { email, password, role, companyData } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const confirmationToken = crypto.randomBytes(32).toString('hex');
    const confirmationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

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
                planId: 'plan_free',
                socialLinks: [], // Added missing socialLinks
            }
        });
        user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role,
                companyId: newCompany.id,
                isConfirmed: false,
                confirmationToken,
                confirmationTokenExpires,
            },
            include: { company: true },
        });
    } else if (role === 'candidate') {
        user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role,
                isConfirmed: false,
                confirmationToken,
                confirmationTokenExpires,
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
                isConfirmed: false,
                confirmationToken,
                confirmationTokenExpires,
            }
        });
    }

    // Simulate sending confirmation email
    const settings = await prisma.siteSettings.findFirst();
    const emailSettings = settings?.emailSettings as any;

    if (emailSettings && emailSettings.provider !== 'none' && emailSettings.fromEmail) {
        console.log(`[Email Confirmation] Simulating sending confirmation email to ${user.email} from ${emailSettings.fromEmail}`);
        console.log(`[Email Confirmation] Confirmation Link: http://localhost:5173/#/confirm-email?token=${confirmationToken}`);
    } else {
        console.warn(`[Email Confirmation] Email service not configured. Cannot simulate sending confirmation email to ${user.email}.`);
        console.warn(`[Email Confirmation] Manual Confirmation Link: http://localhost:5173/#/confirm-email?token=${confirmationToken}`);
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
    console.log('User found:', user ? user.email : 'No user found');

    if (!user) {
        console.log('Login failed: User not found');
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    console.log('User isActive status:', user.isActive);
    if (!user.isActive) {
        console.log('Login failed: User account is inactive');
        return res.status(403).json({ message: 'User account is inactive' });
    }

    // In a real app, compare hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log('Password match result:', passwordMatch);
    if (!passwordMatch) {
        console.log('Login failed: Invalid password');
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

// New endpoint to update user active status
app.put('/api/users/:id/status', authenticateToken, authorizeRoles(['admin']), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body; // Expecting a boolean value

    // Validate isActive is a boolean
    if (typeof isActive !== 'boolean') {
        return res.status(400).json({ message: 'Invalid value for isActive. Must be a boolean.' });
    }

    const updatedUser = await prisma.user.update({
        where: { id },
        data: { isActive },
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
    const whereConditions: Prisma.Sql[] = [];

    if (name) {
        const searchPattern = '%' + String(name).toLowerCase() + '%';
        whereConditions.push(Prisma.sql`(
            LOWER(JSON_UNQUOTE(JSON_EXTRACT(C.name, '$.es'))) LIKE ${searchPattern} OR
            LOWER(JSON_UNQUOTE(JSON_EXTRACT(C.name, '$.en'))) LIKE ${searchPattern} OR
            LOWER(JSON_UNQUOTE(JSON_EXTRACT(C.name, '$.fr'))) LIKE ${searchPattern}
        )`);
    }

    const whereClause = whereConditions.length > 0 
        ? Prisma.sql`WHERE ${Prisma.join(whereConditions, ' AND ')}`
        : Prisma.empty;

    const companies = await prisma.$queryRaw`
        SELECT *
        FROM Company AS C
        ${whereClause}
        ORDER BY C.createdAt DESC
    `;
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
    const { id, ...data } = req.body;

    // Safely parse latitude and longitude from string to float
    if (data.latitude !== undefined && data.latitude !== null) {
        const lat = parseFloat(data.latitude);
        data.latitude = isNaN(lat) ? null : lat;
    }
    if (data.longitude !== undefined && data.longitude !== null) {
        const lon = parseFloat(data.longitude);
        data.longitude = isNaN(lon) ? null : lon;
    }

    const updatedItem = await prisma.company.update({
        where: { id: req.params.id },
        data: data,
    });
    res.json(updatedItem);
}));

app.delete('/api/companies/:id', asyncHandler(async (req, res) => {
    await prisma.company.delete({ where: { id: req.params.id } });
    res.json({ success: true });
}));

// Endpoint for Admin Companies Analytics Page
app.get('/api/admin/companies-analytics', authenticateToken, authorizeRoles(['admin']), asyncHandler(async (req, res) => {
    const { location } = req.query;

    const where: Prisma.CompanyWhereInput = {};
    if (location) {
        where.address = {
            contains: String(location),
            mode: 'insensitive'
        };
    }

    const companies = await prisma.company.findMany({
        where,
        include: {
            plan: {
                select: {
                    name: true
                }
            },
            _count: {
                select: { jobs: true }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    res.json(companies);
}));

app.get('/api/admin/dashboard-stats', authenticateToken, authorizeRoles(['admin']), asyncHandler(async (req, res) => {
    const contactSubmissionsCount = await prisma.contactSubmission.count();
    const newContactSubmissionsCount = await prisma.contactSubmission.count({ where: { status: 'New' } });
    const cvSubmissionsCount = await prisma.cVSubmission.count();
    const newCvSubmissionsCount = await prisma.cVSubmission.count({ where: { isRead: false } });

    res.json({
        contactSubmissionsCount,
        newContactSubmissionsCount,
        cvSubmissionsCount,
        newCvSubmissionsCount,
    });
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

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const offset = (pageNum - 1) * limitNum;

    // --- Raw SQL Query Construction ---

    const whereConditions: Prisma.Sql[] = [];
    
    // --- Filter Conditions ---
    if (status) {
        whereConditions.push(Prisma.sql`J.status = ${status}`);
    } else if (req.query.onlyActive === 'true') {
        whereConditions.push(Prisma.sql`J.status = 'active'`);
    }

    if (isInternal !== undefined) {
        whereConditions.push(Prisma.sql`J.isInternal = ${isInternal === 'true'}`);
    }

    if (companyId) {
        whereConditions.push(Prisma.sql`J.companyId = ${companyId}`);
    }

    if (professionalArea) {
        // Case-insensitive equality check
        whereConditions.push(Prisma.sql`LOWER(J.professionalArea) = LOWER(${professionalArea})`);
    }

    if (location) {
        // Case-insensitive substring search on the whole JSON blob.
        // This is the most robust simple search with raw SQL.
        whereConditions.push(Prisma.sql`LOWER(J.location) LIKE ${'%' + String(location).toLowerCase() + '%'}`);
    }

    if (searchTerm) {
        const searchPattern = '%' + String(searchTerm).toLowerCase() + '%';
        // Case-insensitive search in title and description across all languages
        whereConditions.push(Prisma.sql`(
            LOWER(JSON_UNQUOTE(JSON_EXTRACT(J.title, '$.es'))) LIKE ${searchPattern} OR
            LOWER(JSON_UNQUOTE(JSON_EXTRACT(J.title, '$.en'))) LIKE ${searchPattern} OR
            LOWER(JSON_UNQUOTE(JSON_EXTRACT(J.title, '$.fr'))) LIKE ${searchPattern} OR
            LOWER(JSON_UNQUOTE(JSON_EXTRACT(J.description, '$.es'))) LIKE ${searchPattern} OR
            LOWER(JSON_UNQUOTE(JSON_EXTRACT(J.description, '$.en'))) LIKE ${searchPattern} OR
            LOWER(JSON_UNQUOTE(JSON_EXTRACT(J.description, '$.fr'))) LIKE ${searchPattern}
        )`);
    }

    const whereClause = whereConditions.length > 0 
        ? Prisma.sql`WHERE ${Prisma.join(whereConditions, ' AND ')}`
        : Prisma.empty;

    // --- Total Count Query ---
    const totalResult: { count: bigint }[] = await prisma.$queryRaw`
        SELECT COUNT(J.id) as count
        FROM Job AS J
        ${whereClause}
    `;
    const total = Number(totalResult[0].count);

    // --- Main Data Query ---
    const results: any[] = await prisma.$queryRaw`
        SELECT 
            J.id, J.title, J.location, J.professionalArea, J.type, J.salary,
            J.description, J.requirements, J.postedDate, J.expiryDate, J.isInternal,
            J.status, J.imageUrl, J.companyId,
            C.name as companyName,
            C.logo as companyLogo,
            (SELECT COUNT(*) FROM Application WHERE jobId = J.id) as _applicationsCount
        FROM Job AS J
        LEFT JOIN Company AS C ON J.companyId = C.id
        ${whereClause}
        ORDER BY J.postedDate DESC
        LIMIT ${limitNum}
        OFFSET ${offset}
    `;

    // --- Process Results ---
    // Manually structure the result to nest company data as the ORM would
    const jobs = results.map(job => {
        const { companyName, companyLogo, _applicationsCount, ...jobData } = job;
        return {
            ...jobData,
            company: {
                id: job.companyId,
                name: companyName,
                logo: companyLogo
            },
            applications: {
                length: Number(_applicationsCount) // Map count to applications.length
            }
        };
    });

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

app.get('/api/jobs/:jobId/applicants/excel', authenticateToken, authorizeRoles(['admin', 'company']), asyncHandler(async (req, res) => {
    const { jobId } = req.params;
    console.log(`[Excel Export] Request received for jobId: ${jobId}`);

    const applicants = await prisma.application.findMany({
        where: { jobId },
        include: {
            candidate: { include: { user: true } }, // Include candidate profile details and their user for email
            job: true, // Include job details
            company: true, // Include company details
        },
    });

    if (applicants.length === 0) {
        console.log(`[Excel Export] No applicants found for jobId: ${jobId}. Returning 404.`);
        return res.status(404).json({ message: 'No applicants found for this job.' });
    }
    console.log(`[Excel Export] Found ${applicants.length} applicants.`);

    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Applicants');
    console.log('[Excel Export] ExcelJS workbook and worksheet created.');

    // Define columns
    worksheet.columns = [
        { header: 'ID de Postulación', key: 'id', width: 30 },
        { header: 'Fecha de Postulación', key: 'appliedDate', width: 20 },
        { header: 'Estado', key: 'status', width: 15 },
        { header: 'Nombre del Candidato', key: 'candidateName', width: 30 },
        { header: 'Email del Candidato', key: 'candidateEmail', width: 30 },
        { header: 'URL del CV', key: 'cvUrl', width: 50 },
        { header: 'Puesto de la Vacante', key: 'jobTitle', width: 30 },
        { header: 'Empresa de la Vacante', key: 'jobCompany', width: 30 },
    ];
    console.log('[Excel Export] Worksheet columns defined.');
    // Add rows
    applicants.forEach(app => {
        worksheet.addRow({
            id: app.id,
            appliedDate: app.appliedDate.toLocaleString(),
            status: app.status,
            candidateName: app.candidate?.fullName || 'N/A',
            candidateEmail: app.candidate?.user?.email || 'N/A',
            cvUrl: app.candidate?.cvUrl || 'N/A',
            jobTitle: (app.job?.title as any)?.es || 'N/A',
            jobCompany: (app.company?.name as any)?.es || 'N/A',
        });
    });
    console.log('[Excel Export] Applicant data added to worksheet.');

    // Set response headers
    res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
        'Content-Disposition',
        `attachment; filename=applicants_${jobId}.xlsx`
    );
    console.log('[Excel Export] Response headers set.');

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
    console.log('[Excel Export] Excel file written to response and sent.');
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
        const { id, ...data } = req.body;
        if (resource === 'popups') {
            console.log(`Updating popup with id: ${req.params.id}, data:`, JSON.stringify(data, null, 2));
        }
        const updatedItem = await model.update({
            where: { id: req.params.id },
            data: data,
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
    const whereConditions: Prisma.Sql[] = [];

    if (searchTerm) {
        const searchPattern = '%' + String(searchTerm).toLowerCase() + '%';
        whereConditions.push(Prisma.sql`(
            LOWER(CP.fullName) LIKE ${searchPattern} OR
            LOWER(JSON_UNQUOTE(JSON_EXTRACT(CP.headline, '$.es'))) LIKE ${searchPattern} OR
            LOWER(JSON_UNQUOTE(JSON_EXTRACT(CP.summary, '$.es'))) LIKE ${searchPattern} OR
            LOWER(CP.skills) LIKE ${searchPattern}
        )`);
    }

    if (professionalArea) {
        const areaPattern = '%' + String(professionalArea).toLowerCase() + '%';
        whereConditions.push(Prisma.sql`LOWER(CP.professionalAreas) LIKE ${areaPattern}`);
    }

    const whereClause = whereConditions.length > 0 
        ? Prisma.sql`WHERE ${Prisma.join(whereConditions, ' AND ')}`
        : Prisma.empty;

    const candidates = await prisma.$queryRaw`
        SELECT *
        FROM CandidateProfile AS CP
        ${whereClause}
        ORDER BY CP.createdAt DESC
    `;
    res.json(candidates);
}));

// Helper function for route matching with wildcards
const routeMatches = (route: string, pattern: string): boolean => {
    if (pattern.endsWith('/*')) {
        const basePattern = pattern.slice(0, -2); // Remove '/*'
        return route.startsWith(basePattern);
    }
    return route === pattern;
};

app.get('/api/popups/active', asyncHandler(async (req, res) => {
    console.log('Query params for active popups:', req.query);
    const { route, device, userRole } = req.query as { route: string; device: string; userRole: string; };

    if (!route || !device || !userRole) {
        // The frontend should always provide these.
        return res.json([]);
    }

    const allActivePopups = await prisma.popupAd.findMany({
        where: { isActive: true }
    });
    console.log('Number of active popups found in DB:', allActivePopups.length);

    // Filter in application code to overcome DB/Prisma limitations with complex JSON queries on MySQL
    const matchingPopups = allActivePopups.filter(popup => {
        try {
            const targeting = popup.targeting as any;
            console.log(`Processing popup ${popup.id} with targeting:`, targeting);
            if (!targeting) return false;

            const deviceMatch = targeting.devices?.includes(device);
            const userMatch = targeting.users?.includes(userRole);
            const pageMatch = targeting.pages?.some((pattern: string) => routeMatches(route, pattern));

            console.log(`Popup ${popup.id} - deviceMatch: ${deviceMatch}, userMatch: ${userMatch}, pageMatch: ${pageMatch}`);

            return deviceMatch && userMatch && pageMatch;
        } catch (error) {
            console.error(`Error processing targeting for popup ${popup.id}`, error);
            return false;
        }
    });

    res.json(matchingPopups);
}));

// Módulo 5: Contenido del Sitio (CMS)
createCrudEndpoints('service', 'services');
createCrudEndpoints('teamMember', 'team');
createCrudEndpoints('testimonial', 'testimonials');
createCrudEndpoints('blogPost', 'blog');
createCrudEndpoints('resource', 'resources');
createCrudEndpoints('banner', 'banners');
createCrudEndpoints('popupAd', 'popups');
createCrudEndpoints('contactSubmission', 'contact-submissions');
createCrudEndpoints('cVSubmission', 'cv-submissions');

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

app.put('/api/cv-submissions/:id/read', authenticateToken, authorizeRoles(['admin']), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updatedSubmission = await prisma.cVSubmission.update({
        where: { id },
        data: { isRead: true },
    });
    res.json(updatedSubmission);
}));

app.put('/api/contact-submissions/:id/status', authenticateToken, authorizeRoles(['admin']), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const updatedSubmission = await prisma.contactSubmission.update({
        where: { id },
        data: { status },
    });
    res.json(updatedSubmission);
}));


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
                availableLocations: [], // Added missing availableLocations
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

app.post('/api/applications/apply', asyncHandler(async (req, res) => {
    const { jobId, candidateId } = req.body; // candidateId is userId

    const user = await prisma.user.findUnique({
        where: { id: candidateId },
        include: { profile: true },
    });

    if (!user || !user.profile) {
        return res.status(404).json({ message: 'Candidate profile not found' });
    }

    const job = await prisma.job.findUnique({
        where: { id: jobId },
    });

    if (!job) {
        return res.status(404).json({ message: 'Job not found' });
    }

    const newApplication = await prisma.application.create({
        data: {
            jobId: jobId,
            profileId: user.profile.id,
            companyId: job.companyId,
            status: 'Submitted',
        },
    });

    res.status(201).json(newApplication);
}));

// Newsletter Subscription
app.post('/api/newsletter/subscribe', validate(newsletterSubscribeSchema), asyncHandler(async (req, res) => {
    console.log('[Newsletter] Request received for subscription.');
    const { email } = req.body;

    try {
        const newSubscriber = await prisma.newsletterSubscriber.create({
            data: { email },
        });
        res.status(201).json(newSubscriber);
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            // P2002 is the error code for unique constraint violation
            return res.status(409).json({ message: 'Este correo electrónico ya está suscrito.' });
        }
        throw error; // Re-throw other errors
    }
}));

// GET all newsletter subscribers (admin only)
app.get('/api/newsletter/subscribers', authenticateToken, authorizeRoles(['admin']), asyncHandler(async (req, res) => {
  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: {
      subscribedAt: 'desc',
    },
  });
  res.json(subscribers);
}));

// GET export newsletter subscribers to excel (admin only)
app.get('/api/newsletter/subscribers/excel', authenticateToken, authorizeRoles(['admin']), asyncHandler(async (req, res) => {
    const subscribers = await prisma.newsletterSubscriber.findMany({
        orderBy: {
            subscribedAt: 'desc'
        }
    });

    if (subscribers.length === 0) {
        return res.status(404).json({ message: 'No subscribers to export.' });
    }

    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Subscribers');

    worksheet.columns = [
        { header: 'Email', key: 'email', width: 50 },
        { header: 'Fecha de Suscripción', key: 'subscribedAt', width: 25 },
    ];

    subscribers.forEach(sub => {
        worksheet.addRow({
            email: sub.email,
            subscribedAt: sub.subscribedAt,
        });
    });

    res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
        'Content-Disposition',
        `attachment; filename=newsletter_subscribers.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
}));

app.post('/api/newsletter/send', authenticateToken, authorizeRoles(['admin']), validate(sendCampaignSchema), asyncHandler(async (req, res) => {
    const { subject, content } = req.body;

    // 1. Fetch settings from the database
    const settings = await prisma.siteSettings.findFirst();
    const emailSettings = settings?.emailSettings as any;

    // 2. Validate if email service is configured
    if (!emailSettings || !emailSettings.provider || emailSettings.provider === 'none' || !emailSettings.apiKey || !emailSettings.fromEmail) {
        console.error('Email service is not configured in Site Settings.');
        return res.status(500).json({ message: 'El servicio de envío de correos no está configurado. Por favor, configúrelo en los Ajustes del Sitio antes de enviar una campaña.' });
    }

    // 3. Fetch subscribers
    const subscribers = await prisma.newsletterSubscriber.findMany({
        select: { email: true }
    });

    if (subscribers.length === 0) {
        return res.status(404).json({ message: 'No hay suscriptores a los que enviar el correo.' });
    }

    console.log(`Starting simulated email dispatch for ${subscribers.length} subscribers.`);
    console.log(`Using provider: ${emailSettings.provider}`);

    // 4. Simulate sending
    // In a real-world scenario, you would use the provider's SDK here.
    // For example, if (emailSettings.provider === 'sendgrid') { ... }
    for (const sub of subscribers) {
        console.log(`--> Simulating sending email from "${emailSettings.fromEmail}" to: ${sub.email}`);
    }

    console.log('Simulated dispatch complete.');

    res.status(200).json({ message: `Campaña enviada (simulación) a ${subscribers.length} suscriptores.` });
}));

app.put('/api/applications/:id/status', authenticateToken, authorizeRoles(['admin', 'company']), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    // Basic validation for status (optional, but good practice)
    const validStatuses = ['Submitted', 'In Review', 'Interviewing', 'Hired', 'Rejected']; // Match with frontend and schema
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid application status provided.' });
    }

    const updatedApplication = await prisma.application.update({
        where: { id },
        data: { status },
    });
    res.json(updatedApplication);
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