// Script to seed courses and lessons data
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Sample courses data
const courses = [
  {
    title: '30 Day Journal Challenge - Establish a Habit of Daily Journaling',
    description: 'Learn how to establish a daily journaling habit in just 30 days with this comprehensive course.',
    thumbnail_url: '/images/courses/journal-challenge.jpg',
    duration: '2h 41m',
    difficulty: 'beginner',
    category: 'habit',
    is_featured: true,
    is_published: true
  },
  {
    title: 'Self Help Series: How to Create and Maintain Good Habits',
    description: 'Discover proven strategies to build lasting habits that will transform your life.',
    thumbnail_url: '/images/courses/self-help-habits.jpg',
    duration: '4h 6m',
    difficulty: 'intermediate',
    category: 'habit',
    is_featured: false,
    is_published: true
  },
  {
    title: 'Mindfulness Meditation for Beginners',
    description: 'Start your meditation journey with this beginner-friendly course on mindfulness practices.',
    thumbnail_url: '/images/courses/meditation.jpg',
    duration: '1h 30m',
    difficulty: 'beginner',
    category: 'wellness',
    is_featured: false,
    is_published: true
  },
  {
    title: 'Nutrition Fundamentals: Eating for Optimal Health',
    description: 'Learn the basics of nutrition and how to create a balanced diet for your health goals.',
    thumbnail_url: '/images/courses/nutrition.jpg',
    duration: '3h 15m',
    difficulty: 'beginner',
    category: 'nutrition',
    is_featured: false,
    is_published: true
  },
  {
    title: 'Strength Training Essentials',
    description: 'Master the fundamentals of strength training with proper form and effective programming.',
    thumbnail_url: '/images/courses/strength-training.jpg',
    duration: '5h 20m',
    difficulty: 'intermediate',
    category: 'fitness',
    is_featured: false,
    is_published: true
  }
];

// Sample lessons for the first course
const journalChallengeLessons = [
  {
    title: 'Introduction',
    description: 'Overview of the 30-day journaling challenge and what to expect.',
    content: '<p>Welcome to the 30-day journaling challenge! In this course, you will learn how to establish a daily journaling habit that can transform your life. Journaling has been shown to reduce stress, improve mental clarity, and boost creativity.</p><p>Throughout this challenge, we will provide you with daily prompts, techniques, and guidance to make journaling a sustainable habit.</p>',
    video_url: 'https://example.com/videos/journal-intro.mp4',
    duration: '2:16',
    order_number: 1,
    is_free: true,
    is_published: true
  },
  {
    title: 'Adopting Prompts to Covid-19 Pandemic',
    description: 'How to adapt journaling prompts to process experiences during challenging times.',
    content: '<p>In this lesson, we will explore how to adapt journaling prompts to help process experiences during challenging times like the COVID-19 pandemic. Journaling can be a powerful tool for emotional processing during difficult periods.</p>',
    video_url: 'https://example.com/videos/journal-covid.mp4',
    duration: '3:08',
    order_number: 2,
    is_free: false,
    is_published: true
  },
  {
    title: 'Choosing a Notebook',
    description: 'Tips for selecting the right notebook for your journaling practice.',
    content: '<p>The notebook you choose for journaling can significantly impact your experience and consistency. In this lesson, we will discuss different types of notebooks, paper quality, binding styles, and how to select the perfect journal for your needs.</p>',
    video_url: 'https://example.com/videos/journal-notebook.mp4',
    duration: '6:06',
    order_number: 3,
    is_free: false,
    is_published: true
  },
  {
    title: 'Optional Supplies',
    description: 'Additional supplies that can enhance your journaling experience.',
    content: '<p>While all you really need is a notebook and pen to start journaling, there are many supplies that can enhance your experience and make journaling more enjoyable. In this lesson, we will explore various optional supplies such as colored pens, washi tape, stickers, and more.</p>',
    video_url: 'https://example.com/videos/journal-supplies.mp4',
    duration: '2:04',
    order_number: 4,
    is_free: false,
    is_published: true
  },
  {
    title: 'Day 1',
    description: 'Your first day of the journaling challenge with initial prompts.',
    content: '<p>Today marks the beginning of your journaling journey! We will start with some simple prompts to help you get comfortable with the practice. Remember, there is no right or wrong way to journal - the most important thing is consistency.</p><p>Today\'s prompts:<br>1. How are you feeling right now?<br>2. What are three things you\'re grateful for today?<br>3. What is one thing you\'re looking forward to this month?</p>',
    video_url: 'https://example.com/videos/journal-day1.mp4',
    duration: '3:38',
    order_number: 5,
    is_free: false,
    is_published: true
  }
];

// Function to seed the database
async function seedDatabase() {
  try {
    console.log('Starting to seed courses and lessons...');

    // Insert courses
    for (const course of courses) {
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .insert(course)
        .select()
        .single();

      if (courseError) {
        console.error('Error inserting course:', courseError);
        continue;
      }

      console.log(`Course created: ${courseData.title} (${courseData.id})`);

      // Insert lessons for the first course only
      if (courseData.title.includes('30 Day Journal Challenge')) {
        for (const lesson of journalChallengeLessons) {
          const { data: lessonData, error: lessonError } = await supabase
            .from('lessons')
            .insert({
              ...lesson,
              course_id: courseData.id
            })
            .select()
            .single();

          if (lessonError) {
            console.error('Error inserting lesson:', lessonError);
            continue;
          }

          console.log(`Lesson created: ${lessonData.title} (${lessonData.id})`);
        }
      }
    }

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Run the seed function
seedDatabase();
