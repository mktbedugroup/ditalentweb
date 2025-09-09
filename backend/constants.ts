
import type { Job, Company, User, CandidateProfile, Application, Experience, Education, Course, Service, TeamMember, Testimonial, BlogPost, Resource, Banner, ContactSubmission, SiteSettings, Conversation, Message, Language, TeachingExperience, VolunteerExperience, Reference, SocialLink, CVSubmission, FooterLink, SubscriptionPlan, Slide, CTAButton, Permission, Role, PopupAd } from './types';

export const PERMISSIONS: Permission[] = [
  'view_dashboard',
  'view_analytics',
  'view_map',
  'manage_jobs',
  'manage_companies',
  'manage_users',
  'manage_submissions',
  'manage_content',
  'manage_banners',
  'manage_plans',
  'manage_settings',
  'manage_roles',
  'manage_popups',
];

export const PERMISSION_GROUPS: { name: string, permissions: Permission[] }[] = [
  {
    name: "General",
    permissions: ['view_dashboard', 'view_analytics', 'view_map']
  },
  {
    name: "Recruitment",
    permissions: ['manage_jobs', 'manage_companies', 'manage_submissions']
  },
  {
    name: "User Management",
    permissions: ['manage_users', 'manage_roles']
  },
  {
    name: "Website Content",
    permissions: ['manage_content', 'manage_banners', 'manage_popups']
  },
  {
    name: "Monetization & Settings",
    permissions: ['manage_plans', 'manage_settings']
  }
];

export const PROFESSIONAL_AREAS: string[] = [
  'Sin clasificar',
  'Administración',
  'Aeronáutica',
  'Agrimensura',
  'Agronomía, Agricultura',
  'Arquitectura, Construcción',
  'Atención al Cliente',
  'Banca, Servicios Financieros',
  'Biblioteconomía, Documentación',
  'Blockchain y Finanzas Digitales',
  'Ciberseguridad',
  'Ciencias Económicas',
  'Ciencias Empresariales',
  'Ciencias Sociales',
  'Comercio Exterior, Aduanas',
  'Compras',
  'Comunicación, Publicidad, Medios',
  'Consultoría, Análisis',
  'Contabilidad',
  'Creatividad, Diseño, Multimedia',
  'Cuidado de Animales',
  'Cuidado de Mayores y Dependientes',
  'Cuidado de Niños',
  'Derecho',
  'Desarrollo de Negocios',
  'Desarrollo Sostenible',
  'Diseño de Moda',
  'Diseño Industrial',
  'Electricidad, Electrónica',
  'Energías Renovables',
  'Farmacia',
  'Finanzas',
  'Física',
  'Formación, Docencia',
  'Gestión cultural',
  'Gestión de Datos',
  'Gestión de Impacto Social',
  'Gestión, Alta Dirección',
  'Impuestos',
  'Industria, Producción, Calidad',
  'Informática, Sistemas, Internet',
  'Ingeniería',
  'Ingeniería Ambiental',
  'Ingeniería Civil, Estructural',
  'Ingeniería Eléctrica',
  'Ingeniería Electromecánica',
  'Ingeniería Electrónica',
  'Ingeniería Industrial',
  'Ingeniería Mecánica',
  'Ingeniería Mecatrónica',
  'Ingeniería Montes, Caminos',
  'Ingeniería Naval',
  'Ingeniería Química',
  'Ingeniería Sanitaria, Ambiental',
  'Ingeniería Sistemas',
  'Ingeniería Telecomunicaciones',
  'Ingeniería Textil',
  'Inteligencia Artificial',
  'Investigación de Mercado',
  'Investigación y Desarrollo',
  'Letras, Humanidades, Filosofía',
  'Logística, Distribución',
  'Marketing',
  'Mecánica',
  'Medio Ambiente',
  'Oficios diversos',
  'Prevención de Riesgos',
  'Producción Audiovisual',
  'Protección Animal',
  'Psicología',
  'Psicología Industrial',
  'Química, Biología',
  'Recepción, Centralita',
  'Recursos Humanos',
  'Relaciones Internacionales',
  'Salud, Medicina',
  'Secretariado',
  'Seguridad y Salud Occupacional',
  'Seguros',
  'Servicio Doméstico',
  'Servicio/Soporte Técnico',
  'Sostenibilidad y Economía Circular',
  'Telecomunicaciones',
  'Telemarketing, Help Desk',
  'Teletrabajo',
  'Trabajo Social',
  'Traducción, Interpretación, Idiomas',
  'Transporte',
  'Turismo, Hostelería',
  'Ventas',
  'Ventas en Exteriores',
  'Ventas en Tienda',
  'Ventas Institucionales',
  'Ventas Mayoristas',
  'Ventas Telefónicas y Online',
  'Veterinaria, Ganadería',
  'Videojuegos y Desarrollo Multimedia',
  'Voluntariado'
];


export const MOCK_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan_free',
    name: { es: 'Gratuito', en: 'Free', fr: 'Gratuit' },
    description: { es: 'Crea tu perfil de empresa y explora la plataforma.', en: 'Create your company profile and explore the platform.', fr: 'Créez votre profil d\'entreprise et explorez la plateforme.' },
    price: 0,
    currency: 'DOP',
    type: 'subscription',
    durationUnit: 'month',
    durationValue: 1,
    jobPostingsLimit: 0,
    features: [],
    isActive: true,
  },
  {
    id: 'package_1_post',
    name: { es: '1 Publicación de Vacante', en: '1 Job Post', fr: '1 Offre d\'Emploi' },
    description: { es: 'Compra una sola publicación para usar cuando la necesites. Válida por 60 días.', en: 'Purchase a single job posting to use when you need it. Valid for 60 days.', fr: 'Achetez une seule publication d\'offre à utiliser quand vous en avez besoin. Valable 60 jours.' },
    price: 2500,
    currency: 'DOP',
    type: 'package',
    jobPostingsLimit: 1,
    features: [],
    isActive: true,
  },
  {
    id: 'plan_basic_monthly',
    name: { es: 'Básico Mensual', en: 'Basic Monthly', fr: 'Basique Mensuel' },
    description: { es: 'Ideal para necesidades de contratación puntuales. Incluye 2 publicaciones.', en: 'Ideal for occasional hiring needs. Includes 2 job posts.', fr: 'Idéal pour les besoins de recrutement ponctuels. Inclut 2 publications.' },
    price: 4500,
    currency: 'DOP',
    type: 'subscription',
    durationUnit: 'month',
    durationValue: 1,
    jobPostingsLimit: 2,
    features: [],
    isActive: true,
  },
  {
    id: 'plan_pro_monthly',
    name: { es: 'Pro Mensual', en: 'Pro Monthly', fr: 'Pro Mensuel' },
    description: { es: 'Publicaciones ilimitadas y herramientas avanzadas.', en: 'Unlimited job postings and advanced tools.', fr: 'Publications d\'emplois illimitées et outils avancés.' },
    price: 11500,
    currency: 'DOP',
    type: 'subscription',
    durationUnit: 'month',
    durationValue: 1,
    jobPostingsLimit: -1, // Unlimited
    features: ['search_candidates'],
    isFeatured: true,
    isActive: true,
  },
  {
    id: 'plan_pro_yearly',
    name: { es: 'Pro Anual', en: 'Pro Yearly', fr: 'Pro Annuel' },
    description: { es: 'Ahorra con nuestro plan anual y accede a todas las funciones.', en: 'Save with our annual plan and access all features.', fr: 'Économisez avec notre forfait annuel et accédez à toutes les fonctionnalités.' },
    price: 115000,
    currency: 'DOP',
    type: 'subscription',
    durationUnit: 'year',
    durationValue: 1,
    jobPostingsLimit: -1, // Unlimited
    features: ['search_candidates'],
    isActive: true,
  },
  {
    id: 'package_5_posts',
    name: { es: 'Paquete de 5 Vacantes', en: '5 Job Posts Package', fr: 'Paquet de 5 Offres' },
    description: { es: 'Compra un paquete de 5 publicaciones para usar cuando quieras.', en: 'Purchase a package of 5 job postings to use anytime.', fr: 'Achetez un paquet de 5 publications d\'offres à utiliser à tout moment.' },
    price: 10000,
    currency: 'DOP',
    type: 'package',
    jobPostingsLimit: 5,
    features: [],
    isActive: true,
  }
];


const getFutureDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
};

const calculateExpiry = (postedDate: string): string => {
    const date = new Date(postedDate);
    date.setDate(date.getDate() + 60);
    return date.toISOString().split('T')[0];
};


export const MOCK_COMPANIES: Company[] = [
  { id: 'c1', name: {es: 'Innovar Inc.', en: 'Innovate Inc.', fr: 'Innover Inc.'}, logo: 'https://picsum.photos/seed/innovate/100', description: {es: 'Una empresa de tecnología líder enfocada en soluciones de IA.', en: 'A leading tech company focused on AI solutions.', fr: 'Une entreprise technologique de premier plan axée sur les solutions d\'IA.'}, address: '123 Tech Ave, Silicon Valley, CA', phone: '555-0101', rnc: '123-45678-9', employeeCount: '201-500', industry: 'Technology', latitude: 37.3861, longitude: -122.0839, planId: 'plan_pro_monthly', jobPostingsRemaining: -1, subscriptionEndDate: getFutureDate(30), isRecruitmentClient: true, socialLinks: [ { id: 'c1s1', platform: 'Website', url: 'https://innovate.com' }, { id: 'c1s2', platform: 'LinkedIn', url: 'https://linkedin.com/company/innovate' } ] },
  { id: 'c2', name: {es: 'Salto Cuántico', en: 'QuantumLeap', fr: 'QuantumLeap'}, logo: 'https://picsum.photos/seed/quantum/100', description: {es: 'Pioneros en computación cuántica para un futuro mejor.', en: 'Pioneering quantum computing for a better future.', fr: 'Pionnier de l\'informatique quantique pour un avenir meilleur.'}, address: '456 Future St, Austin, TX', phone: '555-0102', rnc: '234-56789-0', employeeCount: '51-200', industry: 'Quantum Computing', latitude: 30.2672, longitude: -97.7431, planId: 'plan_free', jobPostingsRemaining: 0, subscriptionEndDate: undefined, isRecruitmentClient: false, socialLinks: [] },
  { id: 'c3', name: {es: 'Mentes Creativas', en: 'Creative Minds', fr: 'Esprits Créatifs'}, logo: 'https://picsum.photos/seed/creative/100', description: {es: 'Una agencia de marketing digital que piensa fuera de la caja.', en: 'A digital marketing agency that thinks outside the box.', fr: 'Une agence de marketing numérique qui sort des sentiers battus.'}, address: '789 Ad Blvd, New York, NY', phone: '555-0103', rnc: '345-67890-1', employeeCount: '11-50', industry: 'Marketing', latitude: 40.7128, longitude: -74.0060, planId: 'plan_basic_monthly', jobPostingsRemaining: 1, subscriptionEndDate: getFutureDate(15), isRecruitmentClient: false, socialLinks: [ { id: 'c3s1', platform: 'Twitter', url: 'https://twitter.com/creativeminds' } ] },
  { id: 'c4', name: {es: 'EcoConstructores', en: 'EcoBuilders', fr: 'ÉcoBâtisseurs'}, logo: 'https://picsum.photos/seed/eco/100', description: {es: 'Firma de construcción sostenible y arquitectura verde.', en: 'Sustainable construction and green architecture firm.', fr: 'Entreprise de construction durable et d\'architecture verte.'}, address: '101 Green Way, Portland, OR', phone: '555-0104', rnc: '456-78901-2', employeeCount: '51-200', industry: 'Construction', latitude: 45.5051, longitude: -122.6750, planId: 'plan_free', jobPostingsRemaining: 0, subscriptionEndDate: undefined, isRecruitmentClient: false, socialLinks: [] },
  { id: 'c-ditalent', name: {es: 'Ditalent', en: 'Ditalent', fr: 'Ditalent'}, logo: 'https://picsum.photos/seed/ditalent/100', description: {es: 'Una aplicación web moderna y minimalista para una empresa de recursos humanos.', en: 'A modern and minimalist web application for a human resources company.', fr: 'Une application web moderne et minimaliste pour une entreprise de ressources humaines.'}, address: 'Av. Principal 123, Santo Domingo', phone: '(809) 555-1234', rnc: '567-89012-3', employeeCount: '11-50', industry: 'Human Resources', latitude: 18.4861, longitude: -69.9312, planId: 'plan_pro_yearly', jobPostingsRemaining: -1, subscriptionEndDate: getFutureDate(365), isRecruitmentClient: false, socialLinks: [ { id: 'dts1', platform: 'Website', url: 'https://ditalentrh.com' } ] }
];

export const MOCK_JOBS: Job[] = [
  { 
    id: 'j1', 
    title: {es: 'Ingeniero Frontend Senior', en: 'Senior Frontend Engineer', fr: 'Ingénieur Frontend Senior'}, 
    companyId: 'c1', 
    location: {es: 'Remoto', en: 'Remote', fr: 'À distance'}, 
    professionalArea: 'Informática, Sistemas, Internet',
    type: 'Full-time', 
    salary: '$120,000 - $150,000', 
    description: {es: 'Buscamos un Ingeniero Frontend experimentado para unirse a nuestro equipo. Serás responsable de construir el lado del cliente de nuestras aplicaciones web.', en: 'We are for an experienced Frontend Engineer to join our team. You will be responsible for building the client-side of our web applications.', fr: 'Nous recherchons un ingénieur frontend expérimenté pour rejoindre notre équipe. Vous serez responsable de la création du côté client de nos applications Web.'}, 
    requirements: {es: ['5+ años de experiencia en React', 'Experto en TypeScript', 'Sólida comprensión de CSS moderno', 'Experiencia con bibliotecas de testing'], en: ['5+ years of React experience', 'Expert in TypeScript', 'Strong understanding of modern CSS', 'Experience with testing libraries'], fr: ['5+ ans d\'expérience avec React', 'Expert en TypeScript', 'Solide compréhension du CSS moderne', 'Expérience avec les bibliothèques de test']},
    postedDate: '2024-07-20',
    expiryDate: calculateExpiry('2024-07-20'),
    isInternal: false,
    status: 'active',
    imageUrl: 'https://picsum.photos/seed/job1/800/400',
  },
  { 
    id: 'j2', 
    title: {es: 'Diseñador UX/UI', en: 'UX/UI Designer', fr: 'Designer UX/UI'}, 
    companyId: 'c3', 
    location: {es: 'Nueva York, NY', en: 'New York, NY', fr: 'New York, NY'}, 
    professionalArea: 'Creatividad, Diseño, Multimedia',
    type: 'Full-time', 
    salary: '$90,000 - $110,000', 
    description: {es: 'Creative Minds busca un talentoso Diseñador UX/UI para crear experiencias de usuario increíbles para nuestros clientes.', en: 'Creative Minds is seeking a talented UX/UI Designer to create amazing user experiences for our clients.', fr: 'Creative Minds recherche un concepteur UX/UI talentueux pour créer des expériences utilisateur exceptionnelles pour nos clients.'}, 
    requirements: {es: ['Experiencia comprobada en UX/UI', 'Portafolio de proyectos de diseño', 'Dominio de Figma, Sketch o Adobe XD', 'Fuertes habilidades de comunicación'], en: ['Proven UX/UI experience', 'Portfolio of design projects', 'Proficiency in Figma, Sketch, or Adobe XD', 'Strong communication skills'], fr: ['Expérience UX/UI prouvée', 'Portfolio de projets de design', 'Maîtrise de Figma, Sketch ou Adobe XD', 'Solides compétences en communication']},
    postedDate: '2024-07-18',
    expiryDate: calculateExpiry('2024-07-18'),
    isInternal: false,
    status: 'active',
    imageUrl: 'https://picsum.photos/seed/job2/800/400',
  },
  { 
    id: 'j3', 
    title: {es: 'Gerente de Proyectos', en: 'Project Manager', fr: 'Chef de Projet'}, 
    companyId: 'c4', 
    location: {es: 'Austin, TX', en: 'Austin, TX', fr: 'Austin, TX'}, 
    professionalArea: 'Arquitectura, Construcción',
    type: 'Contract', 
    salary: '$75/hour', 
    description: {es: 'Gestionar proyectos de construcción sostenible desde la concepción hasta la finalización. Asegurar que los proyectos se entreguen a tiempo y dentro del presupuesto.', en: 'Manage sustainable building projects from conception to completion. Ensure projects are delivered on time and within budget.', fr: 'Gérer des projets de construction durable de la conception à l\'achèvement. S\'assurer que les projets sont livrés à temps et dans le respect du budget.'}, 
    requirements: {es: ['5+ años en gestión de proyectos', 'Certificación PMP es un plus', 'Experiencia en la industria de la construcción', 'Excelentes habilidades de liderazgo'], en: ['5+ years in project management', 'PMP certification is a plus', 'Experience in the construction industry', 'Excellent leadership skills'], fr: ['5+ ans en gestion de projet', 'La certification PMP est un plus', 'Expérience dans le secteur de la construction', 'Excellentes compétences en leadership']},
    postedDate: '2024-07-15',
    expiryDate: calculateExpiry('2024-07-15'),
    isInternal: false,
    status: 'active',
    imageUrl: 'https://picsum.photos/seed/job3/800/400',
  },
  { 
    id: 'j4', 
    title: {es: 'Desarrollador Backend Junior', en: 'Junior Backend Developer', fr: 'Développeur Backend Junior'}, 
    companyId: 'c2', 
    location: {es: 'Remoto', en: 'Remote', fr: 'À distance'}, 
    professionalArea: 'Informática, Sistemas, Internet',
    type: 'Part-time', 
    salary: '$40,000 - $50,000 (pro-rated)', 
    description: {es: 'Únete a nuestro equipo de computación cuántica como desarrollador backend junior. Trabajarás en el desarrollo y mantenimiento de la lógica del lado del servidor.', en: 'Join our quantum computing team as a junior backend developer. You will work on developing and maintaining server-side logic.', fr: 'Rejoignez notre équipe d\'informatique quantique en tant que développeur backend junior. Vous travaillerez sur le développement et la maintenance de la logique côté serveur.'}, 
    requirements: {es: ['1+ años de experiencia en Python o Go', 'Comprensión de APIs', 'Familiaridad con bases de datos (SQL o NoSQL)', 'Ganas de aprender'], en: ['1+ years of Python or Go experience', 'Understanding of APIs', 'Familiarity with databases (SQL or NoSQL)', 'Eagerness to learn'], fr: ['1+ an d\'expérience en Python ou Go', 'Compréhension des API', 'Familiarité avec les bases de données (SQL ou NoSQL)', 'Désir d\'apprendre']},
    postedDate: '2024-07-21',
    expiryDate: calculateExpiry('2024-07-21'),
    isInternal: false,
    status: 'active',
    imageUrl: 'https://picsum.photos/seed/job4/800/400',
  },
  {
      id: 'j-dt-1',
      title: {es: 'Consultor de RRHH', en: 'HR Consultant', fr: 'Consultant RH'},
      companyId: 'c-ditalent',
      location: {es: 'Santo Domingo, RD', en: 'Santo Domingo, DR', fr: 'Saint-Domingue, RD'},
      professionalArea: 'Recursos Humanos',
      type: 'Full-time',
      salary: 'Competitive',
      description: {es: 'Únete a nuestro equipo de expertos para brindar servicios de consultoría de RRHH de primer nivel a nuestros clientes. Serás responsable de la estrategia, organización y planificación de la fuerza laboral.', en: 'Join our team of experts to provide top-tier HR consulting services to our clients. You will be responsible for strategy, organization, and workforce planning.', fr: 'Rejoignez notre équipe d\'experts pour fournir des services de conseil en RH de premier ordre à nos clients. Vous serez responsable de la stratégie, de l\'organisation et de la planification des effectifs.'},
      requirements: {es: ['3+ años en consultoría de RRHH', 'Sólido conocimiento de las leyes laborales', 'Excelentes habilidades de comunicación'], en: ['3+ years in HR consulting', 'Strong knowledge of labor laws', 'Excellent communication skills'], fr: ['3+ ans en conseil RH', 'Solide connaissance du droit du travail', 'Excellentes compétences en communication']},
      postedDate: '2024-07-22',
      expiryDate: calculateExpiry('2024-07-22'),
      isInternal: true,
      status: 'active',
      imageUrl: 'https://picsum.photos/seed/jobdt1/800/400',
  },
  {
      id: 'j-dt-2',
      title: {es: 'Especialista en Marketing Digital', en: 'Digital Marketing Specialist', fr: 'Spécialiste en Marketing Numérique'},
      companyId: 'c-ditalent',
      location: {es: 'Remoto', en: 'Remote', fr: 'À distance'},
      professionalArea: 'Marketing',
      type: 'Full-time',
      salary: 'Competitive',
      description: {es: 'Buscamos un Especialista en Marketing Digital creativo para gestionar nuestra presencia en línea, ejecutar campañas y ayudarnos a hacer crecer nuestra marca.', en: 'We are looking for a creative Digital Marketing Specialist to manage our online presence, run campaigns, and help us grow our brand.', fr: 'Nous recherchons un spécialiste du marketing numérique créatif pour gérer notre présence en ligne, mener des campagnes et nous aider à développer notre marque.'},
      requirements: {es: ['Experiencia comprobada en marketing digital', 'Expertise en SEO/SEM y redes sociales', 'Habilidades de creación de contenido'], en: ['Proven experience in digital marketing', 'Expertise in SEO/SEM and social media', 'Content creation skills'], fr: ['Expérience avérée en marketing numérique', 'Expertise en SEO/SEM et médias sociaux', 'Compétences en création de contenu']},
      postedDate: '2024-07-20',
      expiryDate: calculateExpiry('2024-07-20'),
      isInternal: true,
      status: 'active',
      imageUrl: 'https://picsum.photos/seed/jobdt2/800/400',
  }
];

const MOCK_EXPERIENCE: Experience[] = [
    { id: 'exp1', title: {es: 'Desarrollador Frontend', en: 'Frontend Developer', fr: 'Développeur Frontend'}, company: {es: 'Soluciones Tecnológicas', en: 'Tech Solutions', fr: 'Solutions Tech'}, location: {es: 'Remoto', en: 'Remote', fr: 'À distance'}, startDate: '2020-01-01', endDate: 'Present', description: {es: 'Desarrollé y mantuve características orientadas al usuario usando React y TypeScript.', en: 'Developed and maintained user-facing features using React and TypeScript.', fr: 'Développement et maintenance de fonctionnalités orientées utilisateur avec React et TypeScript.'} },
];

const MOCK_EDUCATION: Education[] = [
    { id: 'edu1', institution: {es: 'Universidad Estatal', en: 'State University', fr: 'Université d\'État'}, degree: {es: 'Licenciatura en Ciencias', en: 'Bachelor of Science', fr: 'Licence en Sciences'}, fieldOfStudy: {es: 'Ciencias de la Computación', en: 'Computer Science', fr: 'Informatique'}, startDate: '2016-09-01', endDate: '2020-05-15' },
];

const MOCK_COURSES: Course[] = [
    { id: 'crs1', name: {es: 'TypeScript Avanzado', en: 'Advanced TypeScript', fr: 'TypeScript Avancé'}, institution: {es: 'Plataforma en Línea', en: 'Online Platform', fr: 'Plateforme en Ligne'}, completionDate: '2022-03-10' },
];

const MOCK_LANGUAGES: Language[] = [
    { id: 'lang1', name: 'English', proficiency: 'Fluent' },
    { id: 'lang2', name: 'Spanish', proficiency: 'Native' },
];

const MOCK_TEACHING_EXP: TeachingExperience[] = [];
const MOCK_VOLUNTEER_EXP: VolunteerExperience[] = [
    { id: 'vol1', organization: {es: 'Código para el Bien', en: 'Code for Good', fr: 'Code pour le Bien'}, role: {es: 'Mentor', en: 'Mentor', fr: 'Menteur'}, cause: {es: 'Educación', en: 'Education', fr: 'Éducation'}, startDate: '2021-01-01', endDate: 'Present' }
];

const MOCK_REFERENCES: Reference[] = [
    { id: 'ref1', name: 'John Smith', type: 'professional', company: {es: 'Soluciones Tecnológicas', en: 'Tech Solutions', fr: 'Solutions Tech'}, phone: '555-1234' }
];

const MOCK_SOCIAL_LINKS: SocialLink[] = [
    { id: 'soc1', platform: 'LinkedIn', url: 'https://linkedin.com/in/janedoe' },
    { id: 'soc2', platform: 'GitHub', url: 'https://github.com/janedoe' },
    { id: 'soc3', platform: 'Website', url: 'https://janedoe.dev' },
];

export const MOCK_PROFILES: CandidateProfile[] = [
    { 
        id: 'p1', 
        userId: 'u2', 
        fullName: 'Jane Doe', 
        headline: {es: 'Desarrolladora Frontend Apasionada', en: 'Passionate Frontend Developer', fr: 'Développeuse Frontend Passionnée'}, 
        summary: {es: 'Una desarrolladora frontend creativa y orientada a los detalles con 4 años de experiencia construyendo aplicaciones web hermosas y fáciles de usar.', en: 'A creative and detail-oriented frontend developer with 4 years of experience building beautiful and user-friendly web applications.', fr: 'Une développeuse frontend créative et soucieuse du détail avec 4 ans d\'expérience dans la création d\'applications web belles et conviviales.'},
        photoUrl: 'https://i.pravatar.cc/150?u=janedoe',
        cvUrl: '/cv/jane_doe_cv.pdf',
        
        professionalAreas: ['Marketing', 'Creatividad', 'Diseño', 'Multimedia'],
        location: {es: 'Santo Domingo, Distrito Nacional', en: 'Santo Domingo, National District', fr: 'Saint-Domingue, District National'},
        educationLevel: "Bachelor's Degree",

        academicLife: MOCK_EDUCATION,
        courses: MOCK_COURSES,
        workLife: MOCK_EXPERIENCE,
        
        languages: MOCK_LANGUAGES,
        teachingExperience: MOCK_TEACHING_EXP,
        volunteerExperience: MOCK_VOLUNTEER_EXP,

        skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Figma'],
        competencies: ['Problem Solving', 'Project Management', 'Agile Methodologies'],
        socialSkills: ['Communication', 'Teamwork', 'Leadership'],
        personalityType: 'INFJ',

        currentSalary: 80000,
        desiredSalary: 95000,
        desiredContractTypes: ['Full-time', 'Contract'],

        coverLetter: {es: 'Estoy emocionada por la oportunidad de contribuir con mis habilidades a un entorno desafiante e innovador. Mi objetivo es crear experiencias digitales excepcionales.', en: "I am excited about the opportunity to contribute my skills to a challenging and innovative environment. My goal is to create exceptional digital experiences.", fr: "Je suis ravie de pouvoir apporter mes compétences à un environnement stimulant et innovant. Mon objectif est de créer des expériences numériques exceptionnelles."},
        references: MOCK_REFERENCES,
        socialLinks: MOCK_SOCIAL_LINKS,

        blockedCompanyIds: ['c4'], // Blocks EcoBuilders
    },
];

export const MOCK_MESSAGES: Message[] = [
    { id: 'm1', conversationId: 'conv1', senderId: 'u3', text: 'Hello Jane, we were impressed with your profile and would like to schedule an interview.', timestamp: new Date(Date.now() - 86400000).toISOString() },
    { id: 'm2', conversationId: 'conv1', senderId: 'u2', text: 'That\'s great news! I am available tomorrow afternoon.', timestamp: new Date().toISOString() },
];

export const MOCK_CONVERSATIONS: Conversation[] = [
    { id: 'conv1', participantIds: ['u2', 'u3'], jobId: 'j1', messages: MOCK_MESSAGES },
];

export const MOCK_APPLICATIONS: Application[] = [
    { id: 'app1', jobId: 'j1', companyId: 'c1', candidateId: 'u2', profileId: 'p1', appliedDate: '2024-07-25', status: 'In Review', conversationId: 'conv1' }
];

export const MOCK_ROLES: Role[] = [
  { id: 'role_admin', name: 'Administrator', permissions: PERMISSIONS },
  { id: 'role_recruiter', name: 'Recruiter', permissions: ['view_dashboard', 'manage_jobs', 'manage_companies', 'manage_submissions', 'view_map'] },
  { id: 'role_content', name: 'Content Manager', permissions: ['view_dashboard', 'manage_content', 'manage_banners'] }
];

export const MOCK_USERS: User[] = [
    { id: 'u1', email: 'admin@hrportal.com', role: 'admin', password: 'password' }, // Super Admin
    { id: 'u2', email: 'candidate@example.com', role: 'candidate', profileId: 'p1', password: 'password' },
    { id: 'u3', email: 'company@example.com', role: 'company', companyId: 'c1', password: 'password' },
    { id: 'u4', email: 'company2@example.com', role: 'company', companyId: 'c2', password: 'password' },
    { id: 'u5', email: 'company3@example.com', role: 'company', companyId: 'c3', password: 'password' },
    { id: 'u6', email: 'company4@example.com', role: 'company', companyId: 'c4', password: 'password' },
    { id: 'u7', email: 'ditalent@example.com', role: 'company', companyId: 'c-ditalent', password: 'password' },
    { id: 'u8', email: 'recruiter@hrportal.com', role: 'admin', roleId: 'role_recruiter', password: 'password' },
    { id: 'u9', email: 'content@hrportal.com', role: 'admin', roleId: 'role_content', password: 'password' }
];

export const MOCK_SERVICES: Service[] = [
    {
      id: 's1',
      title: {es: 'Reclutamiento y Selección', en: 'Recruitment and Selection', fr: 'Recrutement et Sélection'},
      description: {es: 'Atraemos, evaluamos y seleccionamos a los profesionales más cualificados del mercado, asegurando que se alineen perfectamente con la cultura y los objetivos de tu empresa.', en: 'We attract, evaluate, and select the most qualified professionals on the market, ensuring they align perfectly with your company\'s culture and goals.', fr: 'Nous attirons, évaluons et sélectionnons les professionnels les plus qualifiés du marché, en veillant à ce qu\'ils correspondent parfaitement à la culture et aux objectifs de votre entreprise.'},
    },
    {
      id: 's2',
      title: {es: 'Consultoría de RRHH', en: 'HR Consulting', fr: 'Conseil en RH'},
      description: {es: 'Ofrecemos asesoramiento estratégico para optimizar la estructura organizativa, mejorar el clima laboral y desarrollar políticas de recursos humanos eficientes y escalables.', en: 'We offer strategic advice to optimize organizational structure, improve the work environment, and develop efficient and scalable human resources policies.', fr: 'Nous offrons des conseils stratégiques pour optimiser la structure organisationnelle, améliorer le climat de travail et développer des politiques de ressources humaines efficaces et évolutives.'},
    },
    {
      id: 's3',
      title: {es: 'Gestión de Nómina', en: 'Payroll Management', fr: 'Gestion de la Paie'},
      description: {es: 'Nos encargamos del cálculo preciso de salarios, impuestos y cumplimiento de las obligaciones legales (TSS, MT), liberando a tu equipo para que se enfoque en el negocio.', en: 'We handle the precise calculation of salaries, taxes, and compliance with legal obligations (TSS, MT), freeing up your team to focus on the business.', fr: 'Nous nous occupons du calcul précis des salaires, des impôts et du respect des obligations légales (TSS, MT), libérant ainsi votre équipe pour qu\'elle se concentre sur l\'entreprise.'},
    },
];

export const MOCK_TEAM_MEMBERS: TeamMember[] = [
    { id: 'tm1', name: {es: 'Laura Sánchez', en: 'Laura Sánchez', fr: 'Laura Sánchez'}, title: {es: 'CEO & Fundadora', en: 'CEO & Founder', fr: 'PDG & Fondatrice'}, photoUrl: 'https://i.pravatar.cc/150?u=team1' },
    { id: 'tm2', name: {es: 'Javier Morales', en: 'Javier Morales', fr: 'Javier Morales'}, title: {es: 'Director de Operaciones', en: 'Director of Operations', fr: 'Directeur des Opérations'}, photoUrl: 'https://i.pravatar.cc/150?u=team2' },
    { id: 'tm3', name: {es: 'Sofía Castro', en: 'Sofía Castro', fr: 'Sofía Castro'}, title: {es: 'Gerente de Reclutamiento', en: 'Recruitment Manager', fr: 'Responsable du Recrutement'}, photoUrl: 'https://i.pravatar.cc/150?u=team3' },
];

export const MOCK_TESTIMONIALS: Testimonial[] = [
    { id: 't1', quote: {es: 'El proceso de selección fue rápido y eficiente. Encontraron al candidato ideal en tiempo récord.', en: 'The selection process was fast and efficient. They found the ideal candidate in record time.', fr: 'Le processus de sélection a été rapide et efficace. Ils ont trouvé le candidat idéal en un temps record.'}, author: {es: 'Ana Pérez', en: 'Ana Pérez', fr: 'Ana Pérez'}, company: {es: 'Innovar Inc.', en: 'Innovate Inc.', fr: 'Innover Inc.'} },
    { id: 't2', quote: {es: 'Su consultoría de RRHH transformó nuestra manera de trabajar. Totalmente recomendados.', en: 'Their HR consulting transformed our way of working. Totally recommended.', fr: 'Leur conseil en RH a transformé notre façon de travailler. Totalement recommandé.'}, author: {es: 'Carlos Gómez', en: 'Carlos Gómez', fr: 'Carlos Gómez'}, company: {es: 'Mentes Creativas', en: 'Creative Minds', fr: 'Esprits Créatifs'} },
];

export const MOCK_BLOG_POSTS: BlogPost[] = [
    { id: 'bp1', title: {es: '5 Consejos para una Entrevista de Trabajo Exitosa', en: '5 Tips for a Successful Job Interview', fr: '5 Conseils pour un Entretien d\'Embauche Réussi'}, content: {es: 'Prepararse para una entrevista es clave. Investiga la empresa, practica tus respuestas y vístete apropiadamente...', en: 'Preparing for an interview is key. Research the company, practice your answers, and dress appropriately...', fr: 'Se préparer à un entretien est essentiel. Renseignez-vous sur l\'entreprise, pratiquez vos réponses et habillez-vous convenablement...'}, author: {es: 'Sofía Castro', en: 'Sofía Castro', fr: 'Sofía Castro'}, publishedDate: '2024-07-20', imageUrl: 'https://picsum.photos/seed/blog1/800/400' },
    { id: 'bp2', title: {es: 'La Importancia del Employer Branding en 2024', en: 'The Importance of Employer Branding in 2024', fr: 'L\'Importance de la Marque Employeur en 2024'}, content: {es: 'Atraer talento de calidad ya no solo se trata de salarios. Una marca empleadora fuerte es tu mejor activo...', en: 'Attracting quality talent is no longer just about salaries. A strong employer brand is your best asset...', fr: 'Attirer des talents de qualité ne se résume plus aux salaires. Une marque employeur forte est votre meilleur atout...'}, author: {es: 'Javier Morales', en: 'Javier Morales', fr: 'Javier Morales'}, publishedDate: '2024-07-15', imageUrl: 'https://picsum.photos/seed/blog2/800/400' },
];

export const MOCK_RESOURCES: Resource[] = [
    { id: 'r1', title: {es: 'Guía de Empleabilidad 2024', en: 'Employability Guide 2024', fr: 'Guide de l\'Employabilité 2024'}, description: {es: 'Descarga nuestra guía completa para navegar el mercado laboral actual.', en: 'Download our complete guide to navigating the current job market.', fr: 'Téléchargez notre guide complet pour naviguer sur le marché du travail actuel.'}, fileUrl: '/resources/guia_empleabilidad.pdf' },
    { id: 'r2', title: {es: 'Plantilla de CV Profesional', en: 'Professional CV Template', fr: 'Modèle de CV Professionnel'}, description: {es: 'Una plantilla moderna y efectiva para destacar tus habilidades y experiencia.', en: 'A modern and effective template to highlight your skills and experience.', fr: 'Un modèle de CV moderne et efficace pour mettre en valeur vos compétences et votre expérience.'}, fileUrl: '/resources/plantilla_cv.pdf' }
];

export const MOCK_BANNERS: Banner[] = [
  {
    id: 'b1',
    name: 'Homepage Main Banner',
    location: 'homepage',
    slides: [
      {
        id: 's1',
        imageUrl: 'https://picsum.photos/seed/slide1/1920/1080',
        title: { es: 'Encuentra el Trabajo de Tus Sueños', en: 'Find Your Dream Job', fr: 'Trouvez l\'emploi de vos rêves' },
        subtitle: { es: 'Explora miles de oportunidades en las mejores empresas.', en: 'Explore thousands of opportunities in top companies.', fr: 'Explorez des milliers d\'opportunités dans les meilleures entreprises.' },
        ctaButtons: [
          { id: 'cta1', text: { es: 'Buscar Empleos', en: 'Find Jobs', fr: 'Trouver un emploi' }, link: '/jobs', size: 'md', backgroundColor: '#1b355d', textColor: '#ffffff', borderRadius: 'md' },
          { id: 'cta2', text: { es: 'Publicar Vacante', en: 'Post a Job', fr: 'Publier une offre' }, link: '/company', size: 'md', backgroundColor: '#ff6b00', textColor: '#ffffff', borderRadius: 'md', showTo: ['company'] }
        ]
      },
      {
        id: 's2',
        imageUrl: 'https://picsum.photos/seed/slide2/1920/1080',
        title: { es: 'Conectando Talento con Oportunidades', en: 'Connecting Talent with Opportunities', fr: 'Connecter les talents aux opportunités' },
        subtitle: { es: 'Tu próximo paso profesional comienza aquí.', en: 'Your next career move starts here.', fr: 'Votre prochaine étape de carrière commence ici.' },
        ctaButtons: [
          { id: 'cta3', text: { es: 'Regístrate Ahora', en: 'Register Now', fr: 'S\'inscrire maintenant' }, link: '/register', size: 'md', backgroundColor: '#f0f5ff', textColor: '#1b355d', borderRadius: 'md' }
        ]
      }
    ],
    config: {
      transition: 'slide',
      interval: 5000,
      autoplay: true,
      loop: true,
      showArrows: true,
      showDots: true,
      height_px: 600,
      fontFamily: 'sans',
      overlayColor: '#1b355d',
      overlayOpacity: 0.5,
      textShadow: true,
    }
  }
];

export const MOCK_FOOTER_LINKS: FooterLink[] = [
  { id: 'fl1', title: { es: 'Política de Privacidad', en: 'Privacy Policy', fr: 'Politique de confidentialité' }, url: '/privacy-policy' },
  { id: 'fl2', title: { es: 'Términos de Servicio', en: 'Terms of Service', fr: 'Conditions d\'utilisation' }, url: '/terms' },
  { id: 'fl3', title: { es: 'Contáctanos', en: 'Contact Us', fr: 'Nous contacter' }, url: '/contact' },
];

export const MOCK_SITE_SETTINGS: SiteSettings = {
    mission: { es: 'Nuestra misión es conectar a los mejores talentos con las empresas más innovadoras, creando oportunidades que impulsen el crecimiento profesional y empresarial.', en: 'Our mission is to connect the best talent with the most innovative companies, creating opportunities that drive professional and business growth.', fr: 'Notre mission est de connecter les meilleurs talents avec les entreprises les plus innovantes, créant des opportunités qui stimulent la croissance professionnelle et commerciale.' },
    vision: { es: 'Ser la plataforma líder en gestión de talento humano en la región, reconocida por nuestra eficiencia, tecnología y calidad de servicio.', en: 'To be the leading human talent management platform in the region, recognized for our efficiency, technology, and quality of service.', fr: 'Être la première plateforme de gestion des talents humains de la région, reconnue pour notre efficacité, notre technologie et la qualité de notre service.' },
    values: { es: 'Innovación\nCompromiso\nExcelencia\nIntegridad', en: 'Innovation\nCommitment\nExcellence\nIntegrity', fr: 'Innovation\nEngagement\nExcellence\nIntégrité' },
    contactAddress: '123 Calle Principal, Santo Domingo, República Dominicana',
    contactPhone: '+1 (809) 123-4567',
    contactEmail: 'contacto@ditalent.com',
    contactLatitude: 18.4861,
    contactLongitude: -69.9312,
    careersPageTitle: { es: 'Únete a Nuestro Equipo', en: 'Join Our Team', fr: 'Rejoignez notre équipe' },
    careersPageSubtitle: { es: 'Buscamos personas apasionadas y talentosas para formar parte de Ditalent.', en: 'We are looking for passionate and talented people to be part of Ditalent.', fr: 'Nous recherchons des personnes passionnées et talentueuses pour faire partie de Ditalent.' },
    careersPageCtaTitle: { es: '¿No encuentras una vacante para ti?', en: 'Don\'t see a vacancy for you?', fr: 'Vous ne voyez pas de poste vacant pour vous ?' },
    careersPageCtaText: { es: 'No te preocupes. Envíanos tu CV y te consideraremos para futuras oportunidades.', en: 'Don\'t worry. Send us your CV and we will consider you for future opportunities.', fr: 'Ne vous inquiétez pas. Envoyez-nous votre CV et nous vous considérerons pour de futures opportunités.' },
    jobTypes: ['Full-time', 'Part-time', 'Contract', 'Internship'],
    educationLevels: ["High School", "Technical Degree", "Bachelor's Degree", "Master's Degree", "PhD"],
    footerCopyright: { es: `© ${new Date().getFullYear()} Ditalent. Todos los derechos reservados.`, en: `© ${new Date().getFullYear()} Ditalent. All rights reserved.`, fr: `© ${new Date().getFullYear()} Ditalent. Tous droits réservés.` },
    footerLinks: MOCK_FOOTER_LINKS,
    paymentGateways: {
      stripe: { publicKey: 'pk_test_stripe123', secretKey: 'sk_test_stripe123' },
      paypal: { clientId: 'paypal_client_id_123', clientSecret: 'paypal_client_secret_123' }
    },
    enableLanguageSwitcher: true,
    availableLanguages: ['es', 'en', 'fr'],
    defaultLanguage: 'es',
};

export const MOCK_CONTACT_SUBMISSIONS: ContactSubmission[] = [
  { id: 'sub1', name: 'John Doe', email: 'john.doe@example.com', subject: 'Inquiry about services', message: 'Hello, I would like to know more about your HR consulting services.', submittedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'sub2', name: 'Maria Garcia', email: 'maria.garcia@example.com', subject: 'Partnership Proposal', message: 'We are interested in a potential partnership. Please let me know who to contact.', submittedAt: new Date().toISOString() }
];

export const MOCK_CV_SUBMISSIONS: CVSubmission[] = [
  { id: 'cvsub1', name: 'Carlos Rodriguez', email: 'carlos.r@example.com', cvBase64: 'data:application/pdf;base64,JVBERi0xLjQK...', fileName: 'Carlos_Rodriguez_CV.pdf', submittedAt: new Date().toISOString() }
];

export const MOCK_POPUP_ADS: PopupAd[] = [
  {
    id: 'popup1',
    name: 'Welcome Offer',
    isActive: true,
    content: {
      imageUrl: 'https://picsum.photos/seed/popup1/400/200',
      title: { es: '¡Oferta de Bienvenida!', en: 'Welcome Offer!', fr: 'Offre de Bienvenue !' },
      text: { es: 'Regístrate hoy y obtén un 10% de descuento en tu primer plan.', en: 'Sign up today and get 10% off your first plan.', fr: 'Inscrivez-vous aujourd\'hui et obtenez 10% de réduction sur votre premier forfait.' },
      ctaButton: {
        text: { es: 'Registrarse', en: 'Sign Up', fr: 'S\'inscrire' },
        link: '/register'
      }
    },
    appearance: {
      size: 'md',
      position: 'center',
      overlayOpacity: 0.7
    },
    triggers: {
      type: 'delay',
      value: 5 // 5 seconds
    },
    frequency: {
      type: 'days',
      value: 1 // show once per day
    },
    targeting: {
      pages: ['/'],
      devices: ['desktop', 'mobile'],
      users: ['guest']
    }
  },
  {
    id: 'popup2',
    name: 'Complete Profile Reminder',
    isActive: true,
    content: {
      imageUrl: 'https://picsum.photos/seed/popup2/400/200',
      title: { es: 'Completa tu Perfil', en: 'Complete Your Profile', fr: 'Complétez votre profil' },
      text: { es: 'Un perfil completo atrae más reclutadores. ¡No te quedes atrás!', en: 'A complete profile attracts more recruiters. Don\'t miss out!', fr: 'Un profil complet attire plus de recruteurs. Ne manquez pas cette chance !' },
      ctaButton: {
        text: { es: 'Ir a mi Perfil', en: 'Go to My Profile', fr: 'Aller à mon profil' },
        link: '/candidate/profile'
      }
    },
    appearance: {
      size: 'sm',
      position: 'bottom-right',
      overlayOpacity: 0
    },
    triggers: {
      type: 'scroll',
      value: 50 // 50% scroll
    },
    frequency: {
      type: 'session',
    },
    targeting: {
      pages: ['/jobs'],
      devices: ['desktop'],
      users: ['candidate']
    }
  }
];
