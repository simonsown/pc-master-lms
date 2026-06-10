'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Cpu, Battery, Wallet, HardDrive, ChevronRight, Clock } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { vi } from 'date-fns/locale';

interface AssignmentRequirements {
  budget_max?: number;
  tdp_max?: number;
  min_ram_gb?: number;
  required_components?: string[];
  performance_min?: number;
}

interface AssignmentCardProps {
  id: string;
  classId: string;
  title: string;
  type: string;
  deadline?: string | Date;
  requirements: AssignmentRequirements;
  submittedCount?: number;
  totalMembers?: number;
  role: 'teacher' | 'student';
  hasSubmitted?: boolean;
}

export default function AssignmentCard({ id, classId, title, type, deadline, requirements, submittedCount, totalMembers, role, hasSubmitted }: AssignmentCardProps) {
  const linkHref = `/${role}/classes/${classId}/assignments/${id}`;
  
  let daysLeft = null;
  let isOverdue = false;
  if (deadline) {
    const dlDate = new Date(deadline);
    daysLeft = differenceInDays(dlDate, new Date());
    isOverdue = daysLeft < 0;
  }

  const getTypeLabel = () => {
    switch(type) {
      case 'build_config': return '[BUILD] Lắp ráp cơ bản';
      case 'optimize_budget': return '[TỐI ƯU] Tiết kiệm ngân sách';
      case 'minimize_tdp': return '[GREEN] Tiết kiệm điện';
      case 'maximize_perf': return '[PERF] Tối đa hiệu năng';
      default: return '[NHIỆM VỤ]';
    }
  };

  const formatCurrency = (val?: number) => {
    if (!val) return 'Không giới hạn';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div style={{
      background: 'rgba(12, 20, 36, 0.8)',
      borderRadius: '20px',
      border: isOverdue ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255,255,255,0.05)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#00f3ff', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
          {getTypeLabel()}
        </div>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 700, color: '#fff', lineHeight: 1.4 }}>{title}</h3>
        
        {deadline && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: isOverdue ? '#f87171' : '#fbbf24', fontWeight: 600, background: isOverdue ? 'rgba(239,68,68,0.1)' : 'rgba(251,191,36,0.1)', padding: '6px 12px', borderRadius: '100px', width: 'fit-content' }}>
            <Calendar size={14} />
            Hạn chót: {format(new Date(deadline), 'dd/MM/yyyy HH:mm', { locale: vi })}
            <span style={{ margin: '0 4px' }}>•</span>
            {isOverdue ? 'Đã quá hạn' : `Còn ${daysLeft} ngày`}
          </div>
        )}
      </div>

      {/* Requirements */}
      <div style={{ padding: '20px', flex: 1 }}>
        <p style={{ margin: '0 0 12px 0', fontSize: '12px', fontWeight: 700, color: '#8899a6', textTransform: 'uppercase', letterSpacing: '1px' }}>Yêu cầu kỹ thuật:</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {requirements.budget_max !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#e0e6ed' }}>
              <Wallet size={16} color="#10b981" />
              <span>&le; {formatCurrency(requirements.budget_max)}</span>
            </div>
          )}
          {requirements.tdp_max !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#e0e6ed' }}>
              <Battery size={16} color="#f59e0b" />
              <span>&le; {requirements.tdp_max}W</span>
            </div>
          )}
          {requirements.min_ram_gb !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#e0e6ed' }}>
              <HardDrive size={16} color="#3b82f6" />
              <span>&ge; {requirements.min_ram_gb}GB RAM</span>
            </div>
          )}
          {requirements.required_components && requirements.required_components.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#e0e6ed', gridColumn: '1 / -1' }}>
              <Cpu size={16} color="#8b5cf6" />
              <span>Bắt buộc có: {requirements.required_components.join(', ')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer / Action */}
      <div style={{ padding: '20px', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {role === 'teacher' ? (
          <div style={{ fontSize: '14px', color: '#8899a6', fontWeight: 600 }}>
            <span style={{ color: '#fff' }}>{submittedCount || 0}</span> / {totalMembers || 0} đã nộp
          </div>
        ) : (
          <div style={{ fontSize: '14px', fontWeight: 600, color: hasSubmitted ? '#10b981' : '#8899a6', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {hasSubmitted ? '✅ Đã nộp bài' : '⏳ Chưa nộp'}
          </div>
        )}

        <Link href={linkHref} style={{ textDecoration: 'none' }}>
          <button style={{
            padding: '8px 16px',
            borderRadius: '8px',
            background: hasSubmitted ? 'rgba(255,255,255,0.1)' : 'var(--brand-primary)',
            color: hasSubmitted ? '#fff' : '#000',
            border: 'none',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s'
          }}>
            {role === 'teacher' ? 'Quản lý' : (hasSubmitted ? 'Xem điểm' : 'Làm bài')} <ChevronRight size={14} />
          </button>
        </Link>
      </div>
    </div>
  );
}
