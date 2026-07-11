import mongoose from 'mongoose';
import { env } from './config/env.js';
import { Course } from './models/Course.js';

async function check() {
  await mongoose.connect(env.MONGODB_URI);
  const courses = await Course.find().limit(3).select('title slug published');
  console.log(JSON.stringify(courses, null, 2));
  await mongoose.disconnect();
}

check().catch(console.error);
