import { createClient } from '@/lib/supabase-ssr-server';
import { NextResponse } from 'next/server';
import { autoGrade } from '@/lib/grading/auto-grade';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { assignment_id, class_id, pc_config } = body;

    // 1. Fetch assignment requirements
    const { data: assignment, error: asgError } = await supabase
      .from('assignments')
      .select('*')
      .eq('id', assignment_id)
      .single();

    if (asgError || !assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    // 2. Auto-grade
    const gradingResult = autoGrade(pc_config, assignment.requirements, assignment.max_score);

    // 3. Check if late
    const isLate = assignment.deadline ? new Date() > new Date(assignment.deadline) : false;

    // 4. Save submission
    const { data: submission, error: subError } = await supabase
      .from('submissions')
      .upsert({
        assignment_id,
        student_id: user.id,
        class_id,
        pc_config,
        auto_score: gradingResult.score,
        total_score: gradingResult.score, // Ban đầu tổng điểm bằng điểm tự động
        is_late: isLate,
        submitted_at: new Date().toISOString()
      })
      .select()
      .single();

    if (subError) throw subError;

    return NextResponse.json({ 
      success: true, 
      submission,
      gradingResult 
    });

  } catch (err: any) {
    console.error('Submission API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
