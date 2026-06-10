export interface PCConfig {
  components: string[];
  total_price: number;
  total_tdp: number;
  ram_gb: number;
  cpu?: string;
  gpu?: string;
}

export interface AssignmentRequirements {
  budget_max?: number;
  tdp_max?: number;
  min_ram_gb?: number;
  required_components?: string[];
  performance_min?: number;
}

export interface GradingResult {
  score: number;
  breakdown: {
    criterion: string;
    passed: boolean;
    points: number;
    feedback: string;
  }[];
}

export function autoGrade(submission: PCConfig, requirements: AssignmentRequirements, maxScore: number = 100): GradingResult {
  const breakdown = [];
  let score = 0;

  // 1. Budget check (30 points)
  if (requirements.budget_max) {
    const passed = submission.total_price <= requirements.budget_max;
    const points = passed ? 30 : 0;
    score += points;
    breakdown.push({
      criterion: 'Ngân sách',
      passed,
      points,
      feedback: passed
        ? `Đạt: Trong ngân sách (Cấu hình: ${submission.total_price.toLocaleString('vi-VN')}đ)`
        : `Chưa đạt: Vượt ngân sách ${(submission.total_price - requirements.budget_max).toLocaleString('vi-VN')}đ`
    });
  }

  // 2. TDP check (20 points)
  if (requirements.tdp_max) {
    const passed = submission.total_tdp <= requirements.tdp_max;
    const points = passed ? 20 : 0;
    score += points;
    breakdown.push({
      criterion: 'Tiêu thụ điện (TDP)',
      passed,
      points,
      feedback: passed
        ? `Đạt: TDP hợp lý (${submission.total_tdp}W)`
        : `Chưa đạt: TDP quá cao (${submission.total_tdp}W, yêu cầu < ${requirements.tdp_max}W)`
    });
  }

  // 3. RAM check (15 points)
  if (requirements.min_ram_gb) {
    const passed = submission.ram_gb >= requirements.min_ram_gb;
    const points = passed ? 15 : 0;
    score += points;
    breakdown.push({
      criterion: 'Dung lượng RAM',
      passed,
      points,
      feedback: passed
        ? `Đạt: RAM đáp ứng đủ (${submission.ram_gb}GB)`
        : `Chưa đạt: Thiếu RAM (${submission.ram_gb}GB, yêu cầu >= ${requirements.min_ram_gb}GB)`
    });
  }

  // 4. Required components check (35 points)
  if (requirements.required_components && requirements.required_components.length > 0) {
    const missing = requirements.required_components.filter(c => !submission.components.some(sc => sc.includes(c)));
    const passed = missing.length === 0;
    const points = passed ? 35 : 0;
    score += points;
    breakdown.push({
      criterion: 'Linh kiện bắt buộc',
      passed,
      points,
      feedback: passed
        ? `Đạt: Có đủ các linh kiện yêu cầu.`
        : `Chưa đạt: Thiếu linh kiện (${missing.join(', ')})`
    });
  }

  // Normalize score to maxScore (default 100) if not all criteria are present
  const totalPossible = breakdown.reduce((acc, curr) => acc + (curr.points > 0 || !curr.passed ? (curr.criterion === 'Ngân sách' ? 30 : curr.criterion === 'Tiêu thụ điện (TDP)' ? 20 : curr.criterion === 'Dung lượng RAM' ? 15 : 35) : 0), 0);
  
  const normalizedScore = totalPossible > 0 ? Math.round((score / totalPossible) * maxScore) : maxScore;

  return {
    score: normalizedScore,
    breakdown
  };
}

export function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}
