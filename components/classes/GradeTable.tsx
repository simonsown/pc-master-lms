'use client';

import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  SortingState
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ArrowUpDown, Download, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import Link from 'next/link';

interface SubmissionData {
  id: string;
  student_name: string;
  student_id: string;
  submitted_at: string;
  is_late: boolean;
  auto_score: number | null;
  teacher_score: number | null;
  total_score: number | null;
  status: 'graded' | 'submitted' | 'missing';
}

interface GradeTableProps {
  data: SubmissionData[];
  assignmentId: string;
  classId: string;
}

const columnHelper = createColumnHelper<SubmissionData>();

export default function GradeTable({ data, assignmentId, classId }: GradeTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = [
    columnHelper.accessor('student_name', {
      header: 'Học sinh',
      cell: info => <span style={{ fontWeight: 600, color: '#fff' }}>{info.getValue()}</span>,
    }),
    columnHelper.accessor('status', {
      header: 'Trạng thái',
      cell: info => {
        const status = info.getValue();
        const isLate = info.row.original.is_late;
        if (status === 'missing') return <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}><AlertCircle size={14}/> Chưa nộp</span>;
        if (status === 'graded') return <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}><CheckCircle size={14}/> Đã chấm {isLate && <span style={{ color: '#f59e0b', fontSize: '11px' }}>(Trễ)</span>}</span>;
        return <span style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}><Clock size={14}/> Đã nộp {isLate && <span style={{ color: '#f59e0b', fontSize: '11px' }}>(Trễ)</span>}</span>;
      }
    }),
    columnHelper.accessor('submitted_at', {
      header: 'Thời gian nộp',
      cell: info => info.getValue() ? format(new Date(info.getValue()), 'dd/MM/yyyy HH:mm', { locale: vi }) : '-',
    }),
    columnHelper.accessor('auto_score', {
      header: 'Điểm hệ thống',
      cell: info => info.getValue() !== null ? <span style={{ color: '#8899a6' }}>{info.getValue()}</span> : '-',
    }),
    columnHelper.accessor('teacher_score', {
      header: 'Điểm cộng/trừ',
      cell: info => {
        const val = info.getValue();
        if (val === null) return '-';
        return <span style={{ color: val > 0 ? '#10b981' : (val < 0 ? '#ef4444' : '#8899a6') }}>{val > 0 ? `+${val}` : val}</span>;
      }
    }),
    columnHelper.accessor('total_score', {
      header: 'Tổng điểm',
      cell: info => info.getValue() !== null ? <strong style={{ color: '#00f3ff', fontSize: '16px' }}>{info.getValue()}</strong> : '-',
    }),
    columnHelper.display({
      id: 'actions',
      cell: info => {
        if (info.row.original.status === 'missing') return null;
        return (
          <Link href={`/teacher/classes/${classId}/assignments/${assignmentId}/grade/${info.row.original.id}`}>
            <button style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff', padding: '6px 12px', borderRadius: '6px', fontSize: '12px',
              cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s'
            }}>
              {info.row.original.status === 'graded' ? 'Sửa điểm' : 'Chấm bài'}
            </button>
          </Link>
        )
      }
    })
  ];

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const handleExportCSV = () => {
    const headers = ['Học sinh', 'Trạng thái', 'Thời gian nộp', 'Điểm hệ thống', 'Điểm cộng/trừ', 'Tổng điểm'];
    const csvData = data.map(row => [
      row.student_name,
      row.status === 'missing' ? 'Chưa nộp' : (row.status === 'graded' ? 'Đã chấm' : 'Đã nộp'),
      row.submitted_at ? format(new Date(row.submitted_at), 'dd/MM/yyyy HH:mm') : '',
      row.auto_score ?? '',
      row.teacher_score ?? '',
      row.total_score ?? ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob(["\ufeff"+csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bang_diem_${assignmentId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ background: '#0a0f1a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
      {/* Table Header Controls */}
      <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <input 
          value={globalFilter ?? ''}
          onChange={e => setGlobalFilter(e.target.value)}
          placeholder="Tìm kiếm học sinh..."
          style={{
            background: '#050a14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
            padding: '10px 16px', color: '#fff', fontSize: '14px', width: '300px', outline: 'none'
          }}
        />
        <button onClick={handleExportCSV} style={{
          background: 'rgba(0, 243, 255, 0.1)', color: '#00f3ff', border: '1px solid rgba(0, 243, 255, 0.2)',
          padding: '10px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <Download size={16} /> Xuất CSV
        </button>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} style={{ background: 'rgba(255,255,255,0.02)' }}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} style={{ padding: '16px 20px', color: '#8899a6', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: header.column.getCanSort() ? 'pointer' : 'default' }} onClick={header.column.getToggleSortingHandler()}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && <ArrowUpDown size={12} color="rgba(255,255,255,0.2)" />}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} style={{ padding: '16px 20px', color: '#e0e6ed', fontSize: '14px' }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length} style={{ padding: '40px', textAlign: 'center', color: '#8899a6' }}>
                  Chưa có dữ liệu bài nộp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
