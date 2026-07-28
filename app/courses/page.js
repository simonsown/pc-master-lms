import PCourseViewer from '@/components/PCourseViewer';

export const metadata = {
  title: 'Giáo Trình Kỹ Thuật Phần Cứng PC | PC Master LMS',
  description: 'Giáo trình kỹ thuật phần cứng máy tính toàn tập - 20 chương lý thuyết & 572 hình ảnh minh họa chi tiết.',
};

export default function CoursesPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <PCourseViewer />
    </div>
  );
}
