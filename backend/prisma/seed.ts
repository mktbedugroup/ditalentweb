import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
    MOCK_JOBS, MOCK_COMPANIES, MOCK_USERS, MOCK_PROFILES, MOCK_APPLICATIONS, MOCK_SERVICES, MOCK_TEAM_MEMBERS,
    MOCK_TESTIMONIALS, MOCK_BLOG_POSTS, MOCK_RESOURCES, MOCK_BANNERS, MOCK_SITE_SETTINGS, MOCK_CONTACT_SUBMISSIONS,
    MOCK_CONVERSATIONS, MOCK_CV_SUBMISSIONS, MOCK_SUBSCRIPTION_PLANS, MOCK_ROLES, MOCK_POPUP_ADS
} from '../constants';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    // Clear existing data in the correct order
    await prisma.message.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.application.deleteMany();
    await prisma.job.deleteMany();
    await prisma.candidateProfile.deleteMany();
    await prisma.user.deleteMany();
    await prisma.company.deleteMany();
    await prisma.subscriptionPlan.deleteMany(); // Plans must be deleted before companies that use them
    await prisma.service.deleteMany();
    await prisma.teamMember.deleteMany();
    await prisma.testimonial.deleteMany();
    await prisma.blogPost.deleteMany();
    await prisma.resource.deleteMany();
    await prisma.banner.deleteMany();
    await prisma.siteSettings.deleteMany();
    await prisma.contactSubmission.deleteMany();
    await prisma.cVSubmission.deleteMany();
    await prisma.role.deleteMany();
    await prisma.popupAd.deleteMany();

    // Seed Roles
    for (const role of MOCK_ROLES) {
        await prisma.role.create({ data: role as any });
    }

    // Seed Subscription Plans (BEFORE Companies)
    for (const plan of MOCK_SUBSCRIPTION_PLANS) {
        await prisma.subscriptionPlan.create({ data: plan as any });
    }

    // Seed Companies
    for (const company of MOCK_COMPANIES) {
        await prisma.company.create({
            data: {
                ...company,
                socialLinks: company.socialLinks as any,
                planId: company.planId || null,
                subscriptionEndDate: company.subscriptionEndDate ? new Date(company.subscriptionEndDate) : null,
            } as any,
        });
    }

    // Seed Users
    for (const user of MOCK_USERS) {
        if (!user.password) {
            console.warn(`User ${user.email} has no password. Skipping.`);
            continue;
        }
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await prisma.user.create({
            data: {
                id: user.id,
                email: user.email,
                password: hashedPassword,
                role: user.role,
                companyId: user.companyId || null,
                roleId: user.roleId || null,
            },
        });
    }

    // Seed Candidate Profiles
    for (const profile of MOCK_PROFILES) {
        await prisma.candidateProfile.create({
            data: {
                ...profile,
                academicLife: profile.academicLife as any,
                courses: profile.courses as any,
                workLife: profile.workLife as any,
                languages: profile.languages as any,
                teachingExperience: profile.teachingExperience as any,
                volunteerExperience: profile.volunteerExperience as any,
                references: profile.references as any,
                socialLinks: profile.socialLinks as any,
            } as any,
        });
    }

    // Seed Jobs
    for (const job of MOCK_JOBS) {
        await prisma.job.create({
            data: {
                ...job,
                postedDate: new Date(job.postedDate),
                expiryDate: job.expiryDate ? new Date(job.expiryDate) : null,
            } as any,
        });
    }

    // Seed Applications
    for (const app of MOCK_APPLICATIONS) {
        await prisma.application.create({
            data: {
                ...app,
                appliedDate: new Date(app.appliedDate),
                conversationId: null, // Will link later
            } as any,
        });
    }

    // Seed Services
    for (const service of MOCK_SERVICES) {
        await prisma.service.create({ data: service as any });
    }

    // Seed Team Members
    for (const member of MOCK_TEAM_MEMBERS) {
        await prisma.teamMember.create({ data: member as any });
    }

    // Seed Testimonials
    for (const testimonial of MOCK_TESTIMONIALS) {
        await prisma.testimonial.create({ data: testimonial as any });
    }

    // Seed Blog Posts
    for (const post of MOCK_BLOG_POSTS) {
        await prisma.blogPost.create({
            data: {
                ...post,
                publishedDate: new Date(post.publishedDate),
            } as any,
        });
    }

    // Seed Resources
    for (const resource of MOCK_RESOURCES) {
        await prisma.resource.create({ data: resource as any });
    }

    // Seed Banners
    for (const banner of MOCK_BANNERS) {
        await prisma.banner.create({
            data: {
                ...banner,
                slides: banner.slides as any,
            } as any,
        });
    }

    // Seed Site Settings
    if (MOCK_SITE_SETTINGS) {
        await prisma.siteSettings.create({
            data: {
                ...MOCK_SITE_SETTINGS,
                footerLinks: MOCK_SITE_SETTINGS.footerLinks as any,
            } as any,
        });
    }

    // Seed Contact Submissions
    for (const submission of MOCK_CONTACT_SUBMISSIONS) {
        await prisma.contactSubmission.create({
            data: {
                ...submission,
                submittedAt: new Date(submission.submittedAt),
            },
        });
    }

    // Seed Conversations and Messages
    for (const convo of MOCK_CONVERSATIONS) {
        const { messages, ...convoData } = convo;
        const createdConversation = await prisma.conversation.create({
            data: convoData as any,
        });

        if (messages) {
            for (const message of messages) {
                await prisma.message.create({
                    data: {
                        ...message,
                        timestamp: new Date(message.timestamp),
                        conversationId: createdConversation.id,
                    },
                });
            }
        }
    }

    // Seed CV Submissions
    for (const submission of MOCK_CV_SUBMISSIONS) {
        await prisma.cVSubmission.create({
            data: {
                ...submission,
                submittedAt: new Date(submission.submittedAt),
            },
        });
    }

    // Seed Popup Ads
    for (const popup of MOCK_POPUP_ADS) {
        await prisma.popupAd.create({ data: popup as any });
    }

    console.log('Seeding finished.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
