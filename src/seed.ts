import mongoose from 'mongoose';
import { env } from './config/env.js';
import { User } from './models/User.js';
import { Category } from './models/Category.js';
import { Course } from './models/Course.js';
import { CourseSection } from './models/CourseSection.js';
import { Lesson } from './models/Lesson.js';
import { Enrollment } from './models/Enrollment.js';
import { Progress } from './models/Progress.js';
import { Review } from './models/Review.js';
import { Blog } from './models/Blog.js';
import { FAQ } from './models/FAQ.js';
import { Coupon } from './models/Coupon.js';
import { Testimonial } from './models/Testimonial.js';
import { UserRole, CourseLevel, CourseLanguage } from './types/index.js';

const MONGODB_URI = env.MONGODB_URI;

const instructors = [
  { fullName: 'Dr. Angela Yu', email: 'angela@udemy.com', bio: 'Lead Developer at the London App Brewery. Former Google Engineer. 15+ years of teaching experience.', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face' },
  { fullName: 'Maximilian Schwarzmuller', email: 'max@udemy.com', bio: 'Professional Web Developer and Instructor. 500K+ students worldwide. Creator of the Academind channel.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face' },
  { fullName: 'Colt Steele', email: 'colt@udemy.com', bio: 'Web Developer and Bootcamp Instructor. Former Lead Instructor at Dev Bootcamp. Passionate about teaching.', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face' },
  { fullName: 'Andrei Neagoie', email: 'andrei@udemy.com', bio: 'Senior Software Developer. ZTM Academy founder. Teaching programming to 800K+ students.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face' },
  { fullName: 'Jose Portilla', email: 'jose@udemy.com', bio: 'Head of Data Science at Pierian Training. 1M+ students. Python and ML expert.', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face' },
  { fullName: 'Dr. Ryan Ahmed', email: 'ryan@udemy.com', bio: 'Machine Learning & AI Expert. Former Amazon Engineer. Stanford MBA. 500K+ students.', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=face' },
  { fullName: 'Sarah Drasner', email: 'sarah@udemy.com', bio: 'VP of Developer Experience at Netlify. Former Google, GitHub. Vue.js core team.', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face' },
  { fullName: 'Traversy Media', email: 'traversy@udemy.com', bio: 'Web Development Training. 2M+ YouTube subscribers. Full stack JavaScript courses.', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face' },
  { fullName: 'Dr. Chuck Severance', email: 'chuck@udemy.com', bio: 'University of Michigan Professor. Python for Everybody. 3M+ learners worldwide.', avatar: 'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=200&h=200&fit=crop&crop=face' },
  { fullName: 'Mosh Hamedani', email: 'mosh@udemy.com', bio: 'CodeWithMosh founder. Software Engineer with 18 years experience. 3M+ students.', avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=200&h=200&fit=crop&crop=face' },
  { fullName: 'Dr. Tim Buchalka', email: "tim@udemy.com", bio: 'Android & Java Master Class instructor. 700K+ students. 35+ years programming experience.', avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=200&h=200&fit=crop&crop=face' },
];

const courseImages: Record<string, string> = {
  'react': 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop',
  'nodejs': 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=450&fit=crop',
  'fullstack': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=450&fit=crop',
  'typescript': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=450&fit=crop',
  'nextjs': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=450&fit=crop',
  'vue': 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=450&fit=crop',
  'css': 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800&h=450&fit=crop',
  'react-native': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=450&fit=crop',
  'flutter': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=450&fit=crop',
  'python': 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=450&fit=crop',
  'machine-learning': 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=450&fit=crop',
  'sql': 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&h=450&fit=crop',
  'uiux': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=450&fit=crop',
  'adobexd': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=450&fit=crop',
  'marketing': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop',
  'business': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&h=450&fit=crop',
  'aws': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=450&fit=crop',
};

const categories = [
  { name: 'Web Development', slug: 'web-development', description: 'Learn HTML, CSS, JavaScript, React, and modern web technologies', icon: 'code', featured: true, active: true, courseCount: 0, image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop' },
  { name: 'Mobile Development', slug: 'mobile-development', description: 'Build iOS and Android apps with React Native and Flutter', icon: 'smartphone', featured: true, active: true, courseCount: 0, image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop' },
  { name: 'Data Science', slug: 'data-science', description: 'Learn Python, Machine Learning, and Data Analysis', icon: 'bar-chart', featured: true, active: true, courseCount: 0, image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop' },
  { name: 'UI/UX Design', slug: 'ui-ux-design', description: 'Master user interface and experience design principles', icon: 'palette', featured: true, active: true, courseCount: 0, image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop' },
  { name: 'Digital Marketing', slug: 'digital-marketing', description: 'SEO, Social Media Marketing, and Content Strategy', icon: 'trending-up', featured: false, active: true, courseCount: 0, image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop' },
  { name: 'Business', slug: 'business', description: 'Entrepreneurship, Finance, and Business Strategy', icon: 'briefcase', featured: false, active: true, courseCount: 0, image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=300&fit=crop' },
  { name: 'IT & Software', slug: 'it-software', description: 'Cloud Computing, DevOps, and System Administration', icon: 'server', featured: false, active: true, courseCount: 0, image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop' },
  { name: 'Photography', slug: 'photography', description: 'Digital Photography, Photo Editing, and Video Production', icon: 'camera', featured: false, active: true, courseCount: 0, image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&h=300&fit=crop' },
];

const coursesData = [
  { title: 'Complete React Developer in 2024', subtitle: 'Zero to Mastery', description: 'Master React from scratch. Learn Hooks, Redux, Context API, Next.js, and more. Build real-world projects.', price: 89.99, discountPrice: 12.99, category: 0, level: CourseLevel.BEGINNER, language: CourseLanguage.ENGLISH, tags: ['react', 'javascript', 'frontend'], learningOutcomes: ['Build modern React apps', 'Understand hooks and state management', 'Deploy to production', 'Use React Router for navigation', 'Manage state with Redux and Context API'], requirements: ['Basic HTML/CSS', 'JavaScript fundamentals'], estimatedDuration: 42, enrolledStudents: 15420, rating: 4.7, reviewCount: 3241, instructorIndex: 0, imageKey: 'react' },
  { title: 'Node.js API Masterclass', subtitle: 'Build REST APIs', description: 'Build scalable REST APIs with Node.js, Express, and MongoDB. Learn authentication, testing, and deployment.', price: 79.99, discountPrice: 14.99, category: 0, level: CourseLevel.INTERMEDIATE, language: CourseLanguage.ENGLISH, tags: ['nodejs', 'express', 'mongodb'], learningOutcomes: ['Build REST APIs', 'Implement authentication', 'Deploy applications', 'Write unit tests', 'Use MongoDB effectively'], requirements: ['JavaScript basics'], estimatedDuration: 35, enrolledStudents: 8930, rating: 4.6, reviewCount: 2156, instructorIndex: 1, imageKey: 'nodejs' },
  { title: 'Full Stack Web Development', subtitle: 'MERN Stack', description: 'Complete full-stack development with MongoDB, Express, React, and Node.js. Build complete applications.', price: 129.99, discountPrice: 19.99, category: 0, level: CourseLevel.INTERMEDIATE, language: CourseLanguage.ENGLISH, tags: ['fullstack', 'mern', 'mongodb'], learningOutcomes: ['Build full stack apps', 'Master MERN stack', 'Deploy to cloud', 'Implement authentication', 'Build real projects'], requirements: ['Basic programming'], estimatedDuration: 60, enrolledStudents: 12340, rating: 4.8, reviewCount: 4521, instructorIndex: 2, imageKey: 'fullstack' },
  { title: 'TypeScript for Professionals', subtitle: 'Complete Guide', description: 'Master TypeScript from basics to advanced patterns. Learn generics, decorators, and type safety.', price: 69.99, category: 0, level: CourseLevel.INTERMEDIATE, language: CourseLanguage.ENGLISH, tags: ['typescript', 'javascript'], learningOutcomes: ['Master TypeScript', 'Write type-safe code', 'Use advanced patterns', 'Integrate with React', 'Build scalable applications'], requirements: ['JavaScript knowledge'], estimatedDuration: 28, enrolledStudents: 6780, rating: 4.5, reviewCount: 1834, instructorIndex: 3, imageKey: 'typescript' },
  { title: 'Next.js 14 Complete Guide', subtitle: 'App Router & Server Components', description: 'Build production-ready Next.js applications with App Router, Server Components, and Server Actions.', price: 99.99, discountPrice: 17.99, category: 0, level: CourseLevel.ADVANCED, language: CourseLanguage.ENGLISH, tags: ['nextjs', 'react', 'ssr'], learningOutcomes: ['Build Next.js apps', 'Use App Router', 'Implement SSR/SSG', 'Deploy to Vercel', 'Optimize performance'], requirements: ['React knowledge', 'TypeScript basics'], estimatedDuration: 38, enrolledStudents: 9870, rating: 4.8, reviewCount: 2890, instructorIndex: 4, imageKey: 'nextjs' },
  { title: 'Vue.js 3 & Composition API', subtitle: 'Complete Course', description: 'Master Vue.js 3 with Composition API, Pinia, Vue Router, and build amazing applications.', price: 74.99, category: 0, level: CourseLevel.BEGINNER, language: CourseLanguage.ENGLISH, tags: ['vue', 'javascript', 'frontend'], learningOutcomes: ['Build Vue apps', 'Master Composition API', 'Use Pinia for state', 'Create dynamic UIs', 'Deploy Vue applications'], requirements: ['HTML/CSS/JS basics'], estimatedDuration: 32, enrolledStudents: 4560, rating: 4.4, reviewCount: 1234, instructorIndex: 5, imageKey: 'vue' },
  { title: 'CSS Grid & Flexbox Mastery', subtitle: 'Layout Techniques', description: 'Master modern CSS layouts with Grid and Flexbox. Build responsive designs effortlessly.', price: 49.99, category: 0, level: CourseLevel.BEGINNER, language: CourseLanguage.ENGLISH, tags: ['css', 'grid', 'flexbox'], learningOutcomes: ['Master CSS Grid', 'Master Flexbox', 'Build responsive layouts', 'Create complex page layouts', 'Design mobile-first'], requirements: ['Basic CSS'], estimatedDuration: 18, enrolledStudents: 7890, rating: 4.6, reviewCount: 2100, instructorIndex: 6, imageKey: 'css' },
  { title: 'React Native - Build Mobile Apps', subtitle: 'iOS & Android', description: 'Build cross-platform mobile apps with React Native. Learn navigation, state, and native modules.', price: 94.99, discountPrice: 16.99, category: 1, level: CourseLevel.BEGINNER, language: CourseLanguage.ENGLISH, tags: ['react-native', 'mobile', 'ios', 'android'], learningOutcomes: ['Build mobile apps', 'Deploy to stores', 'Use native modules', 'Implement navigation', 'Handle device APIs'], requirements: ['React basics'], estimatedDuration: 45, enrolledStudents: 8760, rating: 4.5, reviewCount: 2345, instructorIndex: 7, imageKey: 'react-native' },
  { title: 'Flutter & Dart Complete Course', subtitle: 'Mobile Development', description: 'Master Flutter and Dart to build beautiful, natively compiled mobile applications.', price: 84.99, category: 1, level: CourseLevel.BEGINNER, language: CourseLanguage.ENGLISH, tags: ['flutter', 'dart', 'mobile'], learningOutcomes: ['Build Flutter apps', 'Master Dart language', 'Deploy to stores', 'Create beautiful UIs', 'Handle state management'], requirements: ['Basic programming'], estimatedDuration: 50, enrolledStudents: 6540, rating: 4.6, reviewCount: 1987, instructorIndex: 8, imageKey: 'flutter' },
  { title: 'Python for Data Science & ML', subtitle: 'Complete Bootcamp', description: 'Learn Python, NumPy, Pandas, Matplotlib, Scikit-Learn, and TensorFlow for data science.', price: 99.99, discountPrice: 18.99, category: 2, level: CourseLevel.BEGINNER, language: CourseLanguage.ENGLISH, tags: ['python', 'data-science', 'machine-learning'], learningOutcomes: ['Master Python for DS', 'Build ML models', 'Visualize data', 'Work with real datasets', 'Deploy models'], requirements: ['Basic math'], estimatedDuration: 55, enrolledStudents: 11230, rating: 4.7, reviewCount: 3456, instructorIndex: 4, imageKey: 'python' },
  { title: 'Machine Learning A-Z', subtitle: 'Complete Course', description: 'Master machine learning algorithms from linear regression to neural networks.', price: 109.99, discountPrice: 21.99, category: 2, level: CourseLevel.INTERMEDIATE, language: CourseLanguage.ENGLISH, tags: ['machine-learning', 'python', 'ai'], learningOutcomes: ['Implement ML algorithms', 'Build predictive models', 'Deploy ML models', 'Feature engineering', 'Model evaluation'], requirements: ['Python basics', 'Math fundamentals'], estimatedDuration: 65, enrolledStudents: 9870, rating: 4.6, reviewCount: 2876, instructorIndex: 5, imageKey: 'machine-learning' },
  { title: 'SQL for Data Analysis', subtitle: 'Complete Guide', description: 'Master SQL for data analysis. Learn queries, joins, aggregations, and database design.', price: 59.99, category: 2, level: CourseLevel.BEGINNER, language: CourseLanguage.ENGLISH, tags: ['sql', 'database', 'analytics'], learningOutcomes: ['Write complex queries', 'Analyze data', 'Design databases', 'Use window functions', 'Create reports'], requirements: ['None'], estimatedDuration: 22, enrolledStudents: 7650, rating: 4.5, reviewCount: 2134, instructorIndex: 9, imageKey: 'sql' },
  { title: 'UI/UX Design Complete Course', subtitle: 'Figma & Design Thinking', description: 'Master UI/UX design with Figma. Learn wireframing, prototyping, and user research.', price: 89.99, discountPrice: 15.99, category: 3, level: CourseLevel.BEGINNER, language: CourseLanguage.ENGLISH, tags: ['uiux', 'figma', 'design'], learningOutcomes: ['Design in Figma', 'Apply design thinking', 'Create prototypes', 'Conduct user research', 'Build design systems'], requirements: ['None'], estimatedDuration: 40, enrolledStudents: 8900, rating: 4.7, reviewCount: 2567, instructorIndex: 6, imageKey: 'uiux' },
  { title: 'Adobe XD - UI Design Course', subtitle: 'Complete Guide', description: 'Learn UI design with Adobe XD from beginner to advanced level.', price: 69.99, category: 3, level: CourseLevel.BEGINNER, language: CourseLanguage.ENGLISH, tags: ['adobexd', 'ui-design'], learningOutcomes: ['Design in Adobe XD', 'Create interactive prototypes', 'Design responsive layouts', 'Build component libraries', 'Export design assets'], requirements: ['None'], estimatedDuration: 25, enrolledStudents: 4560, rating: 4.3, reviewCount: 1234, instructorIndex: 6, imageKey: 'adobexd' },
  { title: 'Digital Marketing Masterclass', subtitle: 'Complete Guide', description: 'Master digital marketing including SEO, social media, email marketing, and analytics.', price: 79.99, discountPrice: 13.99, category: 4, level: CourseLevel.BEGINNER, language: CourseLanguage.ENGLISH, tags: ['marketing', 'seo', 'social-media'], learningOutcomes: ['Master SEO', 'Run social campaigns', 'Analyze performance', 'Create content strategy', 'Build marketing funnel'], requirements: ['None'], estimatedDuration: 35, enrolledStudents: 6780, rating: 4.4, reviewCount: 1890, instructorIndex: 7, imageKey: 'marketing' },
  { title: 'Startup Business Course', subtitle: 'From Idea to Launch', description: 'Learn how to start and grow a successful business from scratch.', price: 99.99, category: 5, level: CourseLevel.BEGINNER, language: CourseLanguage.ENGLISH, tags: ['business', 'startup', 'entrepreneurship'], learningOutcomes: ['Launch a startup', 'Validate ideas', 'Build business models', 'Raise funding', 'Scale operations'], requirements: ['None'], estimatedDuration: 30, enrolledStudents: 5430, rating: 4.3, reviewCount: 1456, instructorIndex: 8, imageKey: 'business' },
  { title: 'AWS Cloud Practitioner', subtitle: 'Complete Guide', description: 'Prepare for the AWS Cloud Practitioner certification and learn cloud fundamentals.', price: 89.99, discountPrice: 14.99, category: 6, level: CourseLevel.BEGINNER, language: CourseLanguage.ENGLISH, tags: ['aws', 'cloud', 'devops'], learningOutcomes: ['Pass AWS certification', 'Understand cloud concepts', 'Use AWS services', 'Deploy applications', 'Manage cloud resources'], requirements: ['Basic IT knowledge'], estimatedDuration: 30, enrolledStudents: 8760, rating: 4.6, reviewCount: 2345, instructorIndex: 9, imageKey: 'aws' },
  { title: 'Complete Web Developer Bootcamp', subtitle: 'Full Stack Mastery', description: 'The most comprehensive web development course. HTML, CSS, JavaScript, React, Node.js, and more.', price: 149.99, discountPrice: 24.99, category: 0, level: CourseLevel.BEGINNER, language: CourseLanguage.ENGLISH, tags: ['webdev', 'html', 'css', 'javascript'], learningOutcomes: ['Build websites from scratch', 'Master front-end and back-end', 'Deploy to production', 'Work with databases', 'Create full applications'], requirements: ['None'], estimatedDuration: 72, enrolledStudents: 18900, rating: 4.7, reviewCount: 5234, instructorIndex: 2, imageKey: 'fullstack' },
];

const studentsData = [
  { fullName: 'John Smith', email: 'student@demo.com', password: '@Student123' },
  { fullName: 'Emily Johnson', email: 'emily@example.com', password: 'Password123!' },
  { fullName: 'Michael Brown', email: 'michael@example.com', password: 'Password123!' },
  { fullName: 'Sarah Davis', email: 'sarah@example.com', password: 'Password123!' },
  { fullName: 'James Wilson', email: 'james@example.com', password: 'Password123!' },
  { fullName: 'Jessica Martinez', email: 'jessica@example.com', password: 'Password123!' },
  { fullName: 'David Anderson', email: 'david@example.com', password: 'Password123!' },
  { fullName: 'Lisa Thomas', email: 'lisa@example.com', password: 'Password123!' },
  { fullName: 'Robert Taylor', email: 'robert@example.com', password: 'Password123!' },
  { fullName: 'Jennifer White', email: 'jennifer@example.com', password: 'Password123!' },
];

const blogData = [
  { title: 'How to Start Learning Programming in 2024', excerpt: 'A comprehensive guide for beginners who want to start their programming journey.', content: `Programming is one of the most valuable skills you can learn in 2024. Whether you want to build websites, mobile apps, or work with data, programming opens doors to exciting opportunities.

Start with Python or JavaScript - both are beginner-friendly and have huge job markets. Python is great for data science and AI, while JavaScript powers the web.

Practice daily, build projects, and do not be afraid to make mistakes. Every expert was once a beginner.`, category: 'Programming', published: true, thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop' },
  { title: 'Top 10 Skills to Learn for Career Growth', excerpt: 'Discover the most in-demand skills that can help you advance in your career.', content: `In today's rapidly evolving job market, continuous learning is essential for career growth.

Here are the top 10 skills to focus on:

1. Data Analysis - Companies need people who can interpret data
2. Cloud Computing - AWS, Azure, and GCP are in high demand
3. AI and Machine Learning - The future of technology
4. Cybersecurity - Protecting digital assets
5. Project Management - Leading teams effectively
6. Communication Skills - Essential for any role
7. Emotional Intelligence - Understanding others
8. Adaptability - Thriving in change
9. Leadership - Inspiring others
10. Critical Thinking - Solving complex problems`, category: 'Career', published: true, thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop' },
  { title: 'The Future of Online Learning', excerpt: 'Explore how online education is evolving and what it means for learners.', content: `Online learning has transformed education, making quality learning accessible to millions worldwide.

Key trends shaping the future:

1. AI-Powered Personalization - Learning paths tailored to individual needs
2. Microlearning - Bite-sized content for busy professionals
3. Immersive Experiences - VR/AR in education
4. Mobile-First Learning - Learn anywhere, anytime
5. Social Learning - Collaborative online experiences

The future of learning is bright, flexible, and more accessible than ever.`, category: 'Education', published: true, thumbnail: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&h=400&fit=crop' },
];

const faqData = [
  { question: 'How do I enroll in a course?', answer: 'Simply browse our courses, find one you like, and click the "Enroll Now" button. Once enrolled, you can start learning immediately.', category: 'general', active: true },
  { question: 'Can I get a refund?', answer: 'Yes, we offer a 30-day money-back guarantee on all courses. If you are not satisfied, you can request a refund within 30 days of purchase.', category: 'payment', active: true },
  { question: 'Are the courses self-paced?', answer: 'Yes, all our courses are self-paced. You can learn at your own speed, anytime, anywhere. There are no deadlines or time limits.', category: 'general', active: true },
  { question: 'Do I get a certificate?', answer: 'Yes, you will receive a certificate of completion after finishing all the lessons in a course.', category: 'general', active: true },
  { question: 'How do I access my courses?', answer: 'After enrolling in a course, you can access it from your dashboard under "My Learning".', category: 'general', active: true },
  { question: 'Can I download course materials?', answer: 'Some courses offer downloadable resources like PDFs, code files, and templates. This depends on the instructor settings.', category: 'general', active: true },
];

const couponData = [
  { code: 'WELCOME20', type: 'percentage', value: 20, minimumPurchase: 30, usageLimit: 500, perUserLimit: 1, expiresAt: new Date('2025-12-31'), active: true },
  { code: 'SUMMER30', type: 'percentage', value: 30, minimumPurchase: 50, usageLimit: 200, perUserLimit: 1, expiresAt: new Date('2025-08-31'), active: true },
  { code: 'STUDENT15', type: 'percentage', value: 15, minimumPurchase: 25, usageLimit: 1000, perUserLimit: 2, expiresAt: new Date('2025-12-31'), active: true },
  { code: 'FLASH50', type: 'fixed', value: 50, minimumPurchase: 100, usageLimit: 50, perUserLimit: 1, expiresAt: new Date('2025-07-31'), active: true },
  { code: 'NEWUSER25', type: 'percentage', value: 25, minimumPurchase: 40, usageLimit: 300, perUserLimit: 1, expiresAt: new Date('2025-12-31'), active: true },
];

const testimonialData = [
  { name: 'Sarah Johnson', designation: 'Software Developer at Google', review: 'This platform transformed my career. The courses are comprehensive and the instructors are amazing. I went from knowing nothing about programming to landing my dream job at Google.', rating: 5, active: true, photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face' },
  { name: 'Michael Chen', designation: 'Product Manager at Microsoft', review: 'I learned more here than in my entire college education. The practical approach to teaching really makes a difference. Highly recommended for anyone serious about learning.', rating: 5, active: true, photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face' },
  { name: 'Emily Rodriguez', designation: 'UX Designer at Airbnb', review: 'The quality of courses here is unmatched. Every course is worth the investment. The instructors are industry professionals who know what they are talking about.', rating: 5, active: true, photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face' },
  { name: 'David Kim', designation: 'Data Scientist at Netflix', review: 'The data science courses here are top-notch. I was able to transition from a non-technical role to a data science position within 6 months.', rating: 5, active: true, photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face' },
  { name: 'Lisa Thompson', designation: 'Marketing Director at Shopify', review: 'The digital marketing courses helped me boost my company online presence by 300%. The strategies taught here actually work in the real world.', rating: 4, active: true, photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face' },
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Course.deleteMany({}),
      CourseSection.deleteMany({}),
      Lesson.deleteMany({}),
      Enrollment.deleteMany({}),
      Progress.deleteMany({}),
      Review.deleteMany({}),
      Blog.deleteMany({}),
      FAQ.deleteMany({}),
      Coupon.deleteMany({}),
      Testimonial.deleteMany({}),
    ]);

    console.log('Creating instructors...');
    const createdInstructors = [];
    for (const i of instructors) {
      const instructor = await User.create({
        ...i,
        role: UserRole.STUDENT,
        isVerified: true,
        password: 'Instructor123!',
      });
      createdInstructors.push(instructor);
    }

    console.log('Creating admin...');
    const admin = await User.create({
      fullName: 'Admin User',
      email: env.ADMIN_EMAIL,
      password: env.ADMIN_PASSWORD,
      role: UserRole.ADMIN,
      isVerified: true,
    });

    console.log('Creating students...');
    const students = [];
    for (const s of studentsData) {
      const student = await User.create({
        ...s,
        role: UserRole.STUDENT,
        isVerified: true,
      });
      students.push(student);
    }

    console.log('Creating categories...');
    const createdCategories = await Category.insertMany(categories);

    console.log('Creating courses...');
    const createdCourses: any[] = [];
    for (const courseData of coursesData) {
      const category = createdCategories[courseData.category];
      const instructor = createdInstructors[courseData.instructorIndex];
      const imageUrl = courseImages[courseData.imageKey] || courseImages['fullstack'];

      const course = await Course.create({
        title: courseData.title,
        subtitle: courseData.subtitle,
        description: courseData.description,
        thumbnail: imageUrl,
        instructor: instructor._id,
        category: category._id,
        level: courseData.level,
        language: courseData.language,
        tags: courseData.tags,
        price: courseData.price,
        discountPrice: courseData.discountPrice,
        estimatedDuration: courseData.estimatedDuration,
        learningOutcomes: courseData.learningOutcomes,
        requirements: courseData.requirements,
        enrolledStudents: courseData.enrolledStudents,
        rating: courseData.rating,
        reviewCount: courseData.reviewCount,
        published: true,
        featured: Math.random() > 0.5,
      });

      await Category.findByIdAndUpdate(category._id, { $inc: { courseCount: 1 } });
      createdCourses.push(course);
    }

    console.log('Creating sections and lessons...');
    let totalSections = 0;
    let totalLessons = 0;

    const sectionTemplates = [
      ['Getting Started', 'Setting Up Your Environment', 'Your First Project', 'Core Concepts Deep Dive'],
      ['Advanced Techniques', 'Best Practices', 'Real World Applications', 'Performance Optimization'],
      ['Building Complete Projects', 'Testing and Debugging', 'Deployment Strategies', 'Final Project'],
    ];

    const lessonTemplates = [
      ['Introduction and Overview', 'Installing Required Tools', 'Your First Hello World', 'Understanding the Basics'],
      ['Working with Variables', 'Control Flow and Logic', 'Functions and Scope', 'Arrays and Objects'],
      ['Error Handling', 'Async Programming', 'API Integration', 'Database Connections'],
      ['Building a Complete App', 'Testing Your Code', 'Deploying to Production', 'Next Steps and Resources'],
    ];

    for (const course of createdCourses) {
      const sectionCount = Math.floor(Math.random() * 2) + 3;
      const templateIndex = Math.floor(Math.random() * sectionTemplates.length);

      for (let s = 0; s < sectionCount; s++) {
        const section = await CourseSection.create({
          title: sectionTemplates[templateIndex][s % sectionTemplates[templateIndex].length],
          course: course._id,
          order: s + 1,
        });
        totalSections++;

        const lessonCount = Math.floor(Math.random() * 2) + 3;
        for (let l = 0; l < lessonCount; l++) {
          const lessonTemplate = lessonTemplates[templateIndex % lessonTemplates.length];
          await Lesson.create({
            section: section._id,
            title: lessonTemplate[l % lessonTemplate.length],
            description: 'Learn about this important topic in this comprehensive lesson.',
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            preview: l === 0,
            duration: Math.floor(Math.random() * 1200) + 600,
            order: l + 1,
          });
          totalLessons++;
        }
      }
    }

    console.log('Creating enrollments...');
    let totalEnrollments = 0;
    for (const student of students) {
      const enrolledCount = Math.floor(Math.random() * 4) + 1;
      const shuffledCourses = [...createdCourses].sort(() => Math.random() - 0.5);

      for (let i = 0; i < enrolledCount && i < shuffledCourses.length; i++) {
        const courseId = shuffledCourses[i]._id;
        const progress = Math.floor(Math.random() * 100);

        await Enrollment.create({
          student: student._id,
          course: courseId,
          enrolledAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          completed: progress === 100,
          completedAt: progress === 100 ? new Date() : undefined,
        });

        await Progress.create({
          student: student._id,
          course: courseId,
          completedLessons: [],
          progressPercentage: progress,
        });
        totalEnrollments++;
      }
    }

    console.log('Creating reviews...');
    let totalReviews = 0;
    const reviewComments = [
      'Excellent course! Very well structured and easy to follow.',
      'Great content and instructor. Highly recommended!',
      'Learned so much from this course. Worth every penny.',
      'Very practical and hands-on. Perfect for beginners.',
      'Outstanding course with real-world examples.',
      'The instructor explains concepts clearly. Great course!',
      'Best course I have taken on this platform.',
      'Very comprehensive and well-organized content.',
      'Helped me land my dream job. Thank you!',
      'Highly recommended for anyone serious about learning.',
    ];

    for (const student of students) {
      const reviewedCourses = createdCourses.slice(0, Math.floor(Math.random() * 3) + 1);
      for (const course of reviewedCourses) {
        try {
          await Review.create({
            student: student._id,
            course: course._id,
            rating: Math.floor(Math.random() * 2) + 4,
            comment: reviewComments[Math.floor(Math.random() * reviewComments.length)],
          });
          totalReviews++;
        } catch (e) {
          // Skip duplicate
        }
      }
    }

    console.log('Creating blogs...');
    for (const blog of blogData) {
      await Blog.create({
        ...blog,
        author: admin._id,
      });
    }

    console.log('Creating FAQs...');
    for (let i = 0; i < faqData.length; i++) {
      await FAQ.create({ ...faqData[i], order: i + 1 });
    }

    console.log('Creating coupons...');
    await Coupon.insertMany(couponData);

    console.log('Creating testimonials...');
    for (let i = 0; i < testimonialData.length; i++) {
      await Testimonial.create({ ...testimonialData[i], order: i + 1 });
    }

    console.log('\n=== SEED COMPLETE ===');
    console.log(`Instructors: ${instructors.length}`);
    console.log(`Students: ${students.length}`);
    console.log(`Categories: ${createdCategories.length}`);
    console.log(`Courses: ${createdCourses.length}`);
    console.log(`Sections: ${totalSections}`);
    console.log(`Lessons: ${totalLessons}`);
    console.log(`Enrollments: ${totalEnrollments}`);
    console.log(`Reviews: ${totalReviews}`);
    console.log(`Blogs: ${blogData.length}`);
    console.log(`FAQs: ${faqData.length}`);
    console.log(`Coupons: ${couponData.length}`);
    console.log(`Testimonials: ${testimonialData.length}`);
    console.log(`\nAdmin: ${env.ADMIN_EMAIL} / ${env.ADMIN_PASSWORD}`);
    console.log(`Demo Student: student@demo.com / @Student123`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Seed error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
