const { createClient } = require('@supabase/supabase-js');
const url = 'https://ojjmdhrvivwvfgomonzd.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qam1kaHJ2aXZ3dmZnb21vbnpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDQ4MDYsImV4cCI6MjA5NDU4MDgwNn0.ZebNbh-YKmKOuAoR6-_e24rxAY4Hmpyc8CRz_1FXZMc';

const supabase = createClient(url, anonKey);

async function checkQuizzesTable() {
  const { data, error } = await supabase
    .from('quizzes')
    .insert({
      title: 'Test Quiz',
      time_limit_minutes: 10,
      max_attempts: 1,
      is_published: false
    })
    .select();
  
  if (error) {
    console.log('Error code:', error.code);
    console.log('Error message:', error.message);
    console.log('Error details:', error.details);
  } else {
    console.log('Insert succeeded! Row:', data);
  }
}

checkQuizzesTable();
