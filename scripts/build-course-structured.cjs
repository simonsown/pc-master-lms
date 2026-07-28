const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

const DOCX_PATH = path.join(__dirname, '..', '639594946-Giao-trinh-kỹ-thuật-phần-cứng-PC-toan-tập.docx');
const IMG_DIR = path.join(__dirname, '..', 'public', 'course-images');
const COURSE_TS_PATH = path.join(__dirname, '..', 'data', 'pc-hardware-course.ts');

fs.mkdirSync(IMG_DIR, { recursive: true });

function stripTags(str) {
  return str.replace(/<[^>]+>/g, ' ').replace(/&[^;]+;/g, ' ').replace(/\s+/g, ' ').trim();
}

const CHAPTER_ICONS = [
  '🖥️', '📦', '🔌', '💻', '🧮', '💾', '💿', '🖨️', '🎮', '🔧',
  '⚙️', '💻', '💽', '🔲', '🪟', '🧰', '🛡️', '🎵', '💾', '🛠️'
];

async function main() {
  console.log('--- Trích xuất Giáo trình Kỹ thuật Phần cứng PC ---');
  console.log('Tải file DOCX:', DOCX_PATH);

  const result = await mammoth.convertToHtml({
    path: DOCX_PATH,
    styleMap: [
      "p[style-name='Heading 3'] => h3:fresh",
      "p[style-name='Heading 4'] => h4:fresh",
      "p[style-name='Heading 8'] => h4:fresh"
    ]
  });

  let html = result.value;

  console.log('Lưu hình ảnh vào public/course-images...');
  let imgIndex = 0;
  const imgRegex = /<img[^>]+src="data:image\/(jpeg|png|gif|webp);base64,([^"]+)"[^>]*\/?>/gi;

  html = html.replace(imgRegex, (match, mime, base64) => {
    imgIndex++;
    const ext = mime.toLowerCase() === 'jpeg' ? 'jpg' : mime.toLowerCase();
    const filename = `img${String(imgIndex).padStart(4, '0')}.${ext}`;
    const filePath = path.join(IMG_DIR, filename);

    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, Buffer.from(base64, 'base64'));
    }

    return `<div class="course-img-wrapper"><img src="/course-images/${filename}" alt="Hình minh họa ${imgIndex}" class="course-img" loading="lazy" /></div>`;
  });

  console.log(`Đã trích xuất và lưu ${imgIndex} hình ảnh minh họa.`);

  // Split by h3 headings
  const h3Split = html.split(/(?=<h3[^>]*>)/gi);
  const chapters = [];
  let currentChapter = null;

  for (const block of h3Split) {
    const match = block.match(/<h3[^>]*>(.*?)<\/h3>/i);
    if (match) {
      const headerText = stripTags(match[1]);
      if (/chương\s*\d+/i.test(headerText) || /tham khảo/i.test(headerText)) {
        if (currentChapter) chapters.push(currentChapter);
        currentChapter = { title: headerText, rawHtml: block };
      } else if (currentChapter) {
        currentChapter.rawHtml += block;
      }
    } else if (currentChapter) {
      currentChapter.rawHtml += block;
    }
  }
  if (currentChapter) chapters.push(currentChapter);

  console.log(`Phân tích thành công ${chapters.length} Chương chính.`);

  // Build Course Stages
  const stages = chapters.map((ch, cIndex) => {
    const stageNum = cIndex + 1;
    const cleanChapterTitle = ch.title.replace(/^Chương\s+\d+\s*[-–—:]\s*/i, '').trim();

    // Divide rawHtml into sub-parts by <h4> or paragraph blocks
    const subBlocks = ch.rawHtml.split(/(?=<h4[^>]*>)/gi);
    const parts = [];

    subBlocks.forEach((subHtml, pIndex) => {
      const h4Match = subHtml.match(/<h4[^>]*>(.*?)<\/h4>/i);
      let partTitle = h4Match ? stripTags(h4Match[1]) : '';
      if (!partTitle) {
        partTitle = pIndex === 0 ? `Lý thuyết trọng tâm` : `Phần ${pIndex + 1}`;
      }

      // Clean HTML
      let cleanContent = subHtml.replace(/<p>\s*<\/p>/gi, '').trim();
      if (!cleanContent) return;

      // Section split if content is long
      parts.push({
        id: `stage-${stageNum}-p${parts.length + 1}`,
        titleVn: partTitle,
        titleEn: partTitle,
        pages: '1 bài học',
        sections: [
          {
            id: `stage-${stageNum}-p${parts.length + 1}-s1`,
            title: partTitle,
            content: cleanContent,
            imagePrompt: '',
            quiz: []
          }
        ]
      });
    });

    if (parts.length === 0) {
      parts.push({
        id: `stage-${stageNum}-p1`,
        titleVn: cleanChapterTitle || `Nội dung Chương ${stageNum}`,
        titleEn: cleanChapterTitle || `Nội dung Chương ${stageNum}`,
        pages: '1 bài học',
        sections: [
          {
            id: `stage-${stageNum}-p1-s1`,
            title: cleanChapterTitle || `Nội dung Chương ${stageNum}`,
            content: ch.rawHtml,
            imagePrompt: '',
            quiz: []
          }
        ]
      });
    }

    const totalSectionsInStage = parts.reduce((sum, p) => sum + p.sections.length, 0);

    return {
      id: `stage-${stageNum}`,
      stageNumber: stageNum,
      icon: CHAPTER_ICONS[cIndex % CHAPTER_ICONS.length],
      color: '#4f46e5',
      titleVn: ch.title,
      titleEn: ch.title,
      pages: `${totalSectionsInStage} bài học`,
      parts
    };
  });

  // Write TS file
  let tsCode = `export interface CourseSection {
  id: string;
  title: string;
  content: string;
  imagePrompt?: string;
  quiz?: { question: string; options: string[]; correctIndex: number; explanation: string; }[];
}

export interface CoursePart {
  id: string;
  titleVn: string;
  titleEn: string;
  pages: string;
  sections: CourseSection[];
}

export interface CourseStage {
  id: string;
  stageNumber: number;
  icon: string;
  color: string;
  titleVn: string;
  titleEn: string;
  pages: string;
  parts: CoursePart[];
}

export const PC_HARDWARE_COURSE: CourseStage[] = ${JSON.stringify(stages, null, 2)};
`;

  fs.writeFileSync(COURSE_TS_PATH, tsCode, 'utf-8');
  const sizeMB = (fs.statSync(COURSE_TS_PATH).size / (1024 * 1024)).toFixed(2);
  console.log(`Đã xuất thành công data/pc-hardware-course.ts (${sizeMB} MB) với ${stages.length} Chương!`);
}

main().catch(err => {
  console.error('Lỗi khi xây dựng khóa học:', err);
  process.exit(1);
});
