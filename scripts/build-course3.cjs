const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

const DOCX_PATH = path.join('C:\\Users\\fujitsu\\Downloads', 
  fs.readdirSync('C:\\Users\\fujitsu\\Downloads').find(f => f.includes('Giao-trinh') && f.endsWith('.docx')));
const IMG_DIR = path.join(__dirname, '..', 'public', 'course-images');
const COURSE_TS_PATH = path.join(__dirname, '..', 'data', 'pc-hardware-course.ts');

fs.mkdirSync(IMG_DIR, { recursive: true });

function stripHtml(str) {
  return str.replace(/<[^>]+>/g, ' ').replace(/&[^;]+;/g, ' ').replace(/\s+/g, ' ').trim();
}

async function main() {
  const result = await mammoth.convertToHtml({ path: DOCX_PATH });
  let html = result.value;

  // Save images, replace base64 with local paths
  const imgRegex = /<img[^>]+src="data:image\/(jpeg|png|gif|webp);base64,([^"]+)"[^>]*\/?>/g;
  let match;
  let imgIndex = 0;
  while ((match = imgRegex.exec(html)) !== null) {
    imgIndex++;
    const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
    const filename = `img${String(imgIndex).padStart(4, '0')}.${ext}`;
    const fp = path.join(IMG_DIR, filename);
    if (!fs.existsSync(fp)) {
      fs.writeFileSync(fp, Buffer.from(match[2], 'base64'));
    }
    html = html.replace(match[0], `<img src="/course-images/${filename}" alt="" style="max-width:100%;margin:16px 0;border-radius:4px;" />`);
  }
  console.log(`Saved ${imgIndex} images`);

  // Split by h3 tags for chapters
  const chapters = [];
  const h3Regex = /<h3[^>]*>.*?<\/h3>/;
  let remaining = html;
  let lastTitle = 'Mở đầu';
  let lastContent = '';

  while (remaining.length > 0) {
    const match = remaining.match(h3Regex);
    if (!match) {
      if (lastContent || remaining.trim()) lastContent += remaining;
      break;
    }
    const before = remaining.substring(0, match.index);
    if (lastTitle && before.trim()) lastContent += before;
    
    if (lastTitle && lastContent.trim()) {
      chapters.push({ title: lastTitle, content: lastContent.trim() });
    }
    
    lastTitle = stripHtml(match[0]);
    lastContent = '';
    remaining = remaining.substring(match.index + match[0].length);
  }
  if (lastTitle && lastContent.trim()) {
    chapters.push({ title: lastTitle, content: lastContent.trim() });
  }

  console.log(`Found ${chapters.length} chapters`);

  // Filter: keep "Chương" chapters
  const keep = chapters.filter(c => /chương|chuong|^tham khảo/i.test(c.title));
  const finalChapters = keep.length >= 3 ? keep : chapters;
  console.log(`Using ${finalChapters.length} chapters`);

  const icons = ['🖥️','📦','🔌','💻','🧮','💾','💿','🖨️','🎮','🔧','⚙️','💿','💽','🔲','🪟','🧰','🛡️','🎵','💾','📀','🛠️','📚'];

  let ts = `export interface CourseSection {
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

export const PC_HARDWARE_COURSE: CourseStage[] = [
`;

  finalChapters.forEach((ch, ci) => {
    const sn = ci + 1;
    const cleanTitle = ch.title.replace(/^Chương\s+\d+\s*[-–—]\s*/i, '').trim() || ch.title;

    // Clean content: remove empty paragraphs
    let content = ch.content;
    content = content.replace(/<p>\s*<\/p>/gi, '');

    // Create one section per chapter containing all text+images as HTML
    ts += `  {
    id: 'stage-${sn}',
    stageNumber: ${sn},
    icon: '${icons[ci] || '📚'}',
    color: '#4f46e5',
    titleVn: ${JSON.stringify(ch.title)},
    titleEn: ${JSON.stringify(ch.title)},
    pages: '1 chương',
    parts: [{
      id: 'stage-${sn}-p1',
      titleVn: ${JSON.stringify(cleanTitle.substring(0, 80))},
      titleEn: ${JSON.stringify(cleanTitle.substring(0, 80))},
      pages: '1 chương',
      sections: [{
        id: 'stage-${sn}-s1',
        title: ${JSON.stringify(cleanTitle.substring(0, 80))},
        content: ${JSON.stringify(content.substring(0, 30000))},
        imagePrompt: '',
        quiz: []
      }]
    }]
  },
`;
  });

  ts += `];\n`;
  
  fs.writeFileSync(COURSE_TS_PATH, ts, 'utf-8');
  const size = (fs.statSync(COURSE_TS_PATH).size / 1024 / 1024).toFixed(1);
  console.log(`Done! ${finalChapters.length} chapters, ${imgIndex} images, ${size}MB`);
}

main().catch(e => console.error('Error:', e));
