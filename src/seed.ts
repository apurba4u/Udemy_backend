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

const categories = [
  { name: 'Web Development', slug: 'web-development', description: 'Learn HTML, CSS, JavaScript, React, and modern web technologies', featured: true, active: true, courseCount: 0 },
  { name: 'Mobile Development', slug: 'mobile-development', description: 'Build iOS and Android apps with React Native and Flutter', featured: true, active: true, courseCount: 0 },
  { name: 'Data Science', slug: 'data-science', description: 'Learn Python, Machine Learning, and Data Analysis', featured: true, active: true, courseCount: 0 },
  { name: 'UI/UX Design', slug: 'ui-ux-design', description: 'Master user interface and experience design principles', featured: true, active: true, courseCount: 0 },
  { name: 'Digital Marketing', slug: 'digital-marketing', description: 'SEO, Social Media Marketing, and Content Strategy', featured: false, active: true, courseCount: 0 },
  { name: 'Business', slug: 'business', description: 'Entrepreneurship, Finance, and Business Strategy', featured: false, active: true, courseCount: 0 },
  { name: 'IT & Software', slug: 'it-software', description: 'Cloud Computing, DevOps, and System Administration', featured: false, active: true, courseCount: 0 },
  { name: 'Photography', slug: 'photography', description: 'Digital Photography, Photo Editing, and Video Production', featured: false, active: true, courseCount: 0 },
  { name: 'Music', slug: 'music', description: 'Music Production, Audio Engineering, and Instrument Lessons', featured: false, active: true, courseCount: 0 },
  { name: 'Health & Fitness', slug: 'health-fitness', description: 'Yoga, Nutrition, Mental Health, and Personal Development', featured: false, active: true, courseCount: 0 },
];

const coursesData = [
  // Web Development
  { title: 'Complete React Developer in 2024', subtitle: 'Zero to Mastery', description: 'Master React from scratch. Learn Hooks, Redux, Context API, Next.js, and more. Build real-world projects.', shortDescription: 'Complete React course from zero to hero', price: 89.99, discountPrice: 12.99, category: 0, level: CourseLevel.BEGINNER, language: CourseLanguage.ENGLISH, tags: ['react', 'javascript', 'frontend'], learningOutcomes: ['Build modern React apps', 'Understand hooks and state management', 'Deploy to production'], requirements: ['Basic HTML/CSS', 'JavaScript fundamentals'], estimatedDuration: 42, enrolledStudents: 15420, rating: 4.7, reviewCount: 3241, isPublished: true, isFeatured: true },
  { title: 'Node.js API Masterclass', subtitle: 'Build REST APIs', description: 'Build scalable REST APIs with Node.js, Express, and MongoDB. Learn authentication, testing, and deployment.', shortDescription: 'Complete Node.js backend development', price: 79.99, discountPrice: 14.99, category: 0, level: CourseLevel.INTERMEDIATE, language: CourseLanguage.ENGLISH, tags: ['nodejs', 'express', 'mongodb'], learningOutcomes: ['Build REST APIs', 'Implement authentication', 'Deploy applications'], requirements: ['JavaScript basics'], estimatedDuration: 35, enrolledStudents: 8930, rating: 4.6, reviewCount: 2156, isPublished: true, isFeatured: true },
  { title: 'Full Stack Web Development', subtitle: 'MERN Stack', description: 'Complete full-stack development with MongoDB, Express, React, and Node.js. Build complete applications.', shortDescription: 'Full stack development with MERN', price: 129.99, discountPrice: 19.99, category: 0, level: CourseLevel.INTERMEDIATE, language: CourseLanguage.ENGLISH, tags: ['fullstack', 'mern', 'mongodb'], learningOutcomes: ['Build full stack apps', 'Master MERN stack', 'Deploy to cloud'], requirements: ['Basic programming'], estimatedDuration: 60, enrolledStudents: 12340, rating: 4.8, reviewCount: 4521, isPublished: true, isFeatured: true },
  { title: 'TypeScript for Professionals', subtitle: 'Complete Guide', description: 'Master TypeScript from basics to advanced patterns. Learn generics, decorators, and type safety.', shortDescription: 'Professional TypeScript development', price: 69.99, category: 0, level: CourseLevel.INTERMEDIATE, language: CourseLanguage.ENGLISH, tags: ['typescript', 'javascript'], learningOutcomes: ['Master TypeScript', 'Write type-safe code', 'Use advanced patterns'], requirements: ['JavaScript knowledge'], estimatedDuration: 28, enrolledStudents: 6780, rating: 4.5, reviewCount: 1834, isPublished: true, isFeatured: false },
  { title: 'Next.js 14 Complete Guide', subtitle: 'App Router & Server Components', description: 'Build production-ready Next.js applications with App Router, Server Components, and Server Actions.', shortDescription: 'Modern Next.js development', price: 99.99, discountPrice: 17.99, category: 0, level: CourseLevel.ADVANCED, language: CourseLanguage.ENGLISH, tags: ['nextjs', 'react', 'ssr'], learningOutcomes: ['Build Next.js apps', 'Use App Router', 'Implement SSR/SSG'], requirements: ['React knowledge', 'TypeScript basics'], estimatedDuration: 38, enrolledStudents: 9870, rating: 4.8, reviewCount: 2890, isPublished: true, isFeatured: true },
  { title: 'Vue.js 3 & Composition API', subtitle: 'Complete Course', description: 'Master Vue.js 3 with Composition API, Pinia, Vue Router, and build amazing applications.', shortDescription: 'Complete Vue.js development', price: 74.99, category: 0, level: CourseLevel.BEGINNER, language: CourseLanguage.ENGLISH, tags: ['vue', 'javascript', 'frontend'], learningOutcomes: ['Build Vue apps', 'Master Composition API', 'Use Pinia for state'], requirements: ['HTML/CSS/JS basics'], estimatedDuration: 32, enrolledStudents: 4560, rating: 4.4, reviewCount: 1234, isPublished: true, isFeatured: false },
  { title: 'CSS Grid & Flexbox Mastery', subtitle: 'Layout Techniques', description: 'Master modern CSS layouts with Grid and Flexbox. Build responsive designs effortlessly.', shortDescription: 'Modern CSS layout mastery', price: 49.99, category: 0, level: CourseLevel.BEGINNER, language: CourseLanguage.ENGLISH, tags: ['css', 'grid', 'flexbox'], learningOutcomes: ['Master CSS Grid', 'Master Flexbox', 'Build responsive layouts'], requirements: ['Basic CSS'], estimatedDuration: 18, enrolledStudents: 7890, rating: 4.6, reviewCount: 2100, isPublished: true, isFeatured: false },
  // Mobile Development
  { title: 'React Native - Build Mobile Apps', subtitle: 'iOS & Android', description: 'Build cross-platform mobile apps with React Native. Learn navigation, state, and native modules.', shortDescription: 'Cross-platform mobile development', price: 94.99, discountPrice: 16.99, category: 1, level: CourseLevel.BEGINNER, language: CourseLanguage.ENGLISH, tags: ['react-native', 'mobile', 'ios', 'android'], learningOutcomes: ['Build mobile apps', 'Deploy to stores', 'Use native modules'], requirements: ['React basics'], estimatedDuration: 45, enrolledStudents: 8760, rating: 4.5, reviewCount: 2345, isPublished: true, isFeatured: true },
  { title: 'Flutter & Dart Complete Course', subtitle: 'Mobile Development', description: 'Master Flutter and Dart to build beautiful, natively compiled mobile applications.', shortDescription: 'Complete Flutter development', price: 84.99, category: 1, level: CourseLevel.BEGINNER, language: CourseLanguage.ENGLISH, tags: ['flutter', 'dart', 'mobile'], learningOutcomes: ['Build Flutter apps', 'Master Dart language', 'Deploy to stores'], requirements: ['Basic programming'], estimatedDuration: 50, enrolledStudents: 6540, rating: 4.6, reviewCount: 1987, isPublished: true, isFeatured: true },
  // Data Science
  { title: 'Python for Data Science & ML', subtitle: 'Complete Bootcamp', description: 'Learn Python, NumPy, Pandas, Matplotlib, Scikit-Learn, and TensorFlow for data science.', shortDescription: 'Python data science bootcamp', price: 99.99, discountPrice: 18.99, category: 2, level: CourseLevel.BEGINNER, language: CourseLanguage.ENGLISH, tags: ['python', 'data-science', 'machine-learning'], learningOutcomes: ['Master Python for DS', 'Build ML models', 'Visualize data'], requirements: ['Basic math'], estimatedDuration: 55, enrolledStudents: 11230, rating: 4.7, reviewCount: 3456, isPublished: true, isFeatured: true },
  { title: 'Machine Learning A-Z', subtitle: 'Complete Course', description: 'Master machine learning algorithms from linear regression to neural networks.', shortDescription: 'Machine learning mastery', price: 109.99, discountPrice: 21.99, category: 2, level: CourseLevel.INTERMEDIATE, language: CourseLanguage.ENGLISH, tags: ['machine-learning', 'python', 'ai'], learningOutcomes: ['Implement ML algorithms', 'Build predictive models', 'Deploy ML models'], requirements: ['Python basics', 'Math fundamentals'], estimatedDuration: 65, enrolledStudents: 9870, rating: 4.6, reviewCount: 2876, isPublished: true, isFeatured: true },
  { title: 'SQL for Data Analysis', subtitle: 'Complete Guide', description: 'Master SQL for data analysis. Learn queries, joins, aggregations, and database design.', shortDescription: 'SQL mastery for analysts', price: 59.99, category: 2, level: CourseLevel.BEGINNER, language: CourseLanguage.ENGLISH, tags: ['sql', 'database', 'analytics'], learningOutcomes: ['Write complex queries', 'Analyze data', 'Design databases'], requirements: ['None'], estimatedDuration: 22, enrolledStudents: 7650, rating: 4.5, reviewCount: 2134, isPublished: true, isFeatured: false },
  // UI/UX Design
  { title: 'UI/UX Design Complete Course', subtitle: 'Figma & Design Thinking', description: 'Master UI/UX design with Figma. Learn wireframing, prototyping, and user research.', shortDescription: 'Complete UI/UX design course', price: 89.99, discountPrice: 15.99, category: 3, level: CourseLevel.BEGINNER, language: CourseLanguage.ENGLISH, tags: ['uiux', 'figma', 'design'], learningOutcomes: ['Design in Figma', 'Apply design thinking', 'Create prototypes'], requirements: ['None'], estimatedDuration: 40, enrolledStudents: 8900, rating: 4.7, reviewCount: 2567, isPublished: true, isFeatured: true },
  { title: 'Adobe XD - UI Design Course', subtitle: 'Complete Guide', description: 'Learn UI design with Adobe XD from beginner to advanced level.', shortDescription: 'Adobe XD design mastery', price: 69.99, category: 3, level: CourseLevel.BEGINNER, language: CourseLanguage.ENGLISH, tags: ['adobexd', 'ui-design'], learningOutcomes: ['Design in Adobe XD', 'Create interactive prototypes', 'Design responsive layouts'], requirements: ['None'], estimatedDuration: 25, enrolledStudents: 4560, rating: 4.3, reviewCount: 1234, isPublished: true, isFeatured: false },
  // Digital Marketing
  { title: 'Digital Marketing Masterclass', subtitle: 'Complete Guide', description: 'Master digital marketing including SEO, social media, email marketing, and analytics.', shortDescription: 'Complete digital marketing course', price: 79.99, discountPrice: 13.99, category: 4, level: CourseLevel.BEGINNER, language: CourseLanguage.ENGLISH, tags: ['marketing', 'seo', 'social-media'], learningOutcomes: ['Master SEO', 'Run social campaigns', 'Analyze performance'], requirements: ['None'], estimatedDuration: 35, enrolledStudents: 6780, rating: 4.4, reviewCount: 1890, isPublished: true, isFeatured: true },
  // Business
  { title: 'Startup Business Course', subtitle: 'From Idea to Launch', description: 'Learn how to start and grow a successful business from scratch.', shortDescription: 'Start your own business', price: 99.99, category: 5, level: CourseLevel.BEGINNER, language: CourseLanguage.ENGLISH, tags: ['business', 'startup', 'entrepreneurship'], learningOutcomes: ['Launch a startup', 'Validate ideas', 'Build business models'], requirements: ['None'], estimatedDuration: 30, enrolledStudents: 5430, rating: 4.3, reviewCount: 1456, isPublished: true, isFeatured: false },
  // IT & Software
  { title: 'AWS Cloud Practitioner', subtitle: 'Complete Guide', description: 'Prepare for the AWS Cloud Practitioner certification and learn cloud fundamentals.', shortDescription: 'AWS certification prep', price: 89.99, discountPrice: 14.99, category: 6, level: CourseLevel.BEGINNER, language: CourseLanguage.ENGLISH, tags: ['aws', 'cloud', 'devops'], learningOutcomes: ['Pass AWS certification', 'Understand cloud concepts', 'Use AWS services'], requirements: ['Basic IT knowledge'], estimatedDuration: 30, enrolledStudents: 8760, rating: 4.6, reviewCount: 2345, isPublished: true, isFeatured: true },
];

const studentsData = [
  { fullName: 'John Smith', email: 'john@example.com', password: 'Password123!' },
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

Practice daily, build projects, and do not be afraid to make mistakes. Every expert was once a beginner.`, category: 'Programming', published: true },
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
10. Critical Thinking - Solving complex problems`, category: 'Career', published: true },
  { title: 'The Future of Online Learning', excerpt: 'Explore how online education is evolving and what it means for learners.', content: `Online learning has transformed education, making quality learning accessible to millions worldwide.

Key trends shaping the future:

1. AI-Powered Personalization - Learning paths tailored to individual needs
2. Microlearning - Bite-sized content for busy professionals
3. Immersive Experiences - VR/AR in education
4. Mobile-First Learning - Learn anywhere, anytime
5. Social Learning - Collaborative online experiences

The future of learning is bright, flexible, and more accessible than ever.`, category: 'Education', published: true },
];

const faqData = [
  { question: 'How do I enroll in a course?', answer: 'Simply browse our courses, find one you like, and click the "Enroll Now" button. Once enrolled, you can start learning immediately.', category: 'general', active: true },
  { question: 'Can I get a refund?', answer: 'Yes, we offer a 30-day money-back guarantee on all courses. If you\'re not satisfied, you can request a refund within 30 days of purchase.', category: 'payment', active: true },
  { question: 'Are the courses self-paced?', answer: 'Yes, all our courses are self-paced. You can learn at your own speed, anytime, anywhere. There are no deadlines or time limits.', category: 'general', active: true },
  { question: 'Do I get a certificate?', answer: 'Yes, you\'ll receive a certificate of completion after finishing all the lessons in a course.', category: 'general', active: true },
  { question: 'How do I access my courses?', answer: 'After enrolling in a course, you can access it from your dashboard under "My Learning".', category: 'general', active: true },
];

const testimonialData = [
  { name: 'Sarah Johnson', designation: 'Software Developer', company: 'Tech Corp', review: 'This platform transformed my career. The courses are comprehensive and the instructors are amazing. I went from knowing nothing about programming to landing my dream job.', rating: 5, active: true },
  { name: 'Michael Chen', designation: 'Product Manager', company: 'Innovate Inc', review: 'I learned more here than in my entire college education. The practical approach to teaching really makes a difference. Highly recommended for anyone serious about learning.', rating: 5, active: true },
  { name: 'Emily Rodriguez', designation: 'UX Designer', company: 'Design Studio', review: 'The quality of courses here is unmatched. Every course is worth the investment. The instructors are industry professionals who know what they\'re talking about.', rating: 5, active: true },
  { name: 'David Kim', designation: 'Data Scientist', company: 'DataFlow', review: 'The data science courses here are top-notch. I was able to transition from a non-technical role to a data science position within 6 months.', rating: 5, active: true },
  { name: 'Lisa Thompson', designation: 'Marketing Manager', company: 'Growth Co', review: 'The digital marketing courses helped me boost my company\'s online presence by 300%. The strategies taught here actually work in the real world.', rating: 4, active: true },
];

const couponData = [
  { code: 'WELCOME10', type: 'percentage', value: 10, minimumPurchase: 20, usageLimit: 1000, perUserLimit: 1, expiresAt: new Date('2025-12-31'), active: true },
  { code: 'SAVE20', type: 'fixed', value: 20, minimumPurchase: 50, usageLimit: 500, perUserLimit: 2, expiresAt: new Date('2025-12-31'), active: true },
  { code: 'LEARN50', type: 'percentage', value: 50, minimumPurchase: 100, usageLimit: 100, perUserLimit: 1, expiresAt: new Date('2025-12-31'), active: true },
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
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

    // Create users
    console.log('Creating users...');
    const admin = await User.create({
      fullName: 'Admin User',
      email: env.ADMIN_EMAIL,
      password: env.ADMIN_PASSWORD,
      role: UserRole.ADMIN,
      isVerified: true,
    });

    const students = await User.insertMany(
      studentsData.map((s) => ({
        ...s,
        role: UserRole.STUDENT,
        isVerified: true,
      }))
    );
    console.log(`Created ${students.length} students`);

    // Create categories
    console.log('Creating categories...');
    const createdCategories = await Category.insertMany(categories);
    console.log(`Created ${createdCategories.length} categories`);

    // Create courses
    console.log('Creating courses...');
    const createdCourses: any[] = [];
    for (const courseData of coursesData) {
      const categoryIndex = courseData.category;
      const category = createdCategories[categoryIndex];

      const course = await Course.create({
        title: courseData.title,
        subtitle: courseData.subtitle,
        description: courseData.description,
        thumbnail: 'https://placehold.co/800x450/9333ea/white?text=' + encodeURIComponent(courseData.title.substring(0, 20)),
        instructor: admin._id,
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
        published: courseData.isPublished,
        featured: courseData.isFeatured,
      });

      await Category.findByIdAndUpdate(category._id, { $inc: { courseCount: 1 } });
      createdCourses.push(course);
    }
    console.log(`Created ${createdCourses.length} courses`);

    // Create sections and lessons for each course
    console.log('Creating sections and lessons...');
    let totalSections = 0;
    let totalLessons = 0;

    for (const course of createdCourses) {
      const sectionCount = Math.floor(Math.random() * 3) + 3; // 3-5 sections
      for (let s = 0; s < sectionCount; s++) {
        const section = await CourseSection.create({
          title: `Section ${s + 1}: ${['Getting Started', 'Core Concepts', 'Advanced Topics', 'Real World Projects', 'Final Project'][s % 5]}`,
          course: course._id,
          order: s + 1,
        });
        totalSections++;

        const lessonCount = Math.floor(Math.random() * 3) + 2; // 2-4 lessons per section
        for (let l = 0; l < lessonCount; l++) {
          await Lesson.create({
            section: section._id,
            title: `Lesson ${l + 1}: ${['Introduction', 'Deep Dive', 'Hands-on Practice', 'Review', 'Quiz Preparation'][l % 5]}`,
            description: `Learn about this important topic in this lesson.`,
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            preview: l === 0,
            duration: Math.floor(Math.random() * 1200) + 300, // 5-25 minutes
            order: l + 1,
          });
          totalLessons++;
        }
      }
    }
    console.log(`Created ${totalSections} sections, ${totalLessons} lessons`);

    // Create enrollments and progress
    console.log('Creating enrollments and progress...');
    let totalEnrollments = 0;
    const studentIds = students.map((s) => s._id);
    const courseIds = createdCourses.map((c) => c._id);

    for (const studentId of studentIds) {
      const enrolledCount = Math.floor(Math.random() * 3) + 1; // 1-3 courses per student
      const shuffledCourses = [...courseIds].sort(() => Math.random() - 0.5);

      for (let i = 0; i < enrolledCount && i < shuffledCourses.length; i++) {
        const courseId = shuffledCourses[i];
        const progress = Math.floor(Math.random() * 100);

        await Enrollment.create({
          student: studentId,
          course: courseId,
          enrolledAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          completed: progress === 100,
          completedAt: progress === 100 ? new Date() : undefined,
        });

        await Progress.create({
          student: studentId,
          course: courseId,
          completedLessons: [],
          progressPercentage: progress,
        });
        totalEnrollments++;
      }
    }
    console.log(`Created ${totalEnrollments} enrollments`);

    // Create reviews
    console.log('Creating reviews...');
    let totalReviews = 0;
    const reviewComments = [
      'Excellent course! Very well structured and easy to follow.',
      'Great content and instructor. Highly recommended!',
      'Learned so much from this course. Worth every penny.',
      'Very practical and hands-on. Perfect for beginners.',
      'Outstanding course with real-world examples.',
      'The instructor explains concepts clearly. Great course!',
      'Best course I\'ve taken on this platform.',
      'Very comprehensive and well-organized content.',
      'Helped me land my dream job. Thank you!',
      'Highly recommended for anyone serious about learning.',
    ];

    for (const studentId of studentIds) {
      const reviewedCourses = courseIds.slice(0, Math.floor(Math.random() * 3) + 1);
      for (const courseId of reviewedCourses) {
        try {
          await Review.create({
            student: studentId,
            course: courseId,
            rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
            comment: reviewComments[Math.floor(Math.random() * reviewComments.length)],
          });
          totalReviews++;
        } catch (e) {
          // Skip duplicate reviews
        }
      }
    }
    console.log(`Created ${totalReviews} reviews`);

    // Create blogs
    console.log('Creating blogs...');
    for (const blog of blogData) {
      await Blog.create({
        ...blog,
        author: admin._id,
        thumbnail: 'https://placehold.co/800x400/22c55e/white?text=Blog',
      });
    }
    console.log(`Created ${blogData.length} blogs`);

    // Create FAQs
    console.log('Creating FAQs...');
    for (let i = 0; i < faqData.length; i++) {
      await FAQ.create({
        ...faqData[i],
        order: i + 1,
      });
    }
    console.log(`Created ${faqData.length} FAQs`);

    // Create coupons
    console.log('Creating coupons...');
    await Coupon.insertMany(couponData);
    console.log(`Created ${couponData.length} coupons`);

    // Create testimonials
    console.log('Creating testimonials...');
    for (let i = 0; i < testimonialData.length; i++) {
      await Testimonial.create({
        ...testimonialData[i],
        order: i + 1,
      });
    }
    console.log(`Created ${testimonialData.length} testimonials`);

    console.log('\n=== SEED COMPLETE ===');
    console.log(`Users: ${students.length + 1} (1 admin + ${students.length} students)`);
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
    console.log('\nAdmin credentials:');
    console.log(`  Email: ${env.ADMIN_EMAIL}`);
    console.log(`  Password: ${env.ADMIN_PASSWORD}`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Seed error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
