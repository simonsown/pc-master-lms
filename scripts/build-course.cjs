const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

const DOCX_PATH = path.join('C:\\Users\\fujitsu\\Downloads', 
  fs.readdirSync('C:\\Users\\fujitsu\\Downloads').find(f => f.includes('Giao-trinh') && f.endsWith('.docx')));
const OUT_DIR = path.join(__dirname, '..', 'public', 'course-images');
const COURSE_TS_PATH = path.join(__dirname, '..', 'data', 'pc-hardware-course.ts');

fs.mkdirSync(OUT_DIR, { recursive: true });

async function main() {
  const result = await mammoth.convertToHtml({ path: DOCX_PATH });
  let html = result.value;

  // Fix encoding issues: replace common garbled chars
  html = html.replace(/---/g, '—');

  // Extract and save images, replace with local paths
  const imgRegex = /<img[^>]+src="data:image\/(jpeg|png|gif|webp);base64,([^"]+)"[^>]*>/g;
  let match;
  let imgIndex = 0;

  while ((match = imgRegex.exec(html)) !== null) {
    imgIndex++;
    const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
    const base64Data = match[2];
    const filename = `img${String(imgIndex).padStart(4, '0')}.${ext}`;
    const filePath = path.join(OUT_DIR, filename);
    
    // Save image
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(filePath, buffer);
    
    // Replace in HTML
    html = html.replace(match[0], `<img src="/course-images/${filename}" alt="" style="max-width:100%;border-radius:8px;margin:12px 0" />`);
  }

  console.log(`Saved ${imgIndex} images to ${OUT_DIR}`);

  // Parse structure: extract chapters (h3) and subsections (h4)
  // Strip HTML tags for text-only version
  const stripHtml = (str) => str.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').trim();

  const chapterRegex = /<h3[^>]*>(.*?)<\/h3>/g;
  const chapters = [];
  let chapterMatch;
  
  // Split by h3 tags
  const sections = html.split(/<h3[^>]*>.*?<\/h3>/);
  const h3Tags = [...html.matchAll(/<h3[^>]*>(.*?)<\/h3>/g)];
  
  let courseData = [];
  let currentChapter = null;
  let currentPart = null;

  // Simple approach: split into chapters by h3, each chapter has sections from ol/li
  const lines = html.split('\n');
  let inChapter = false;
  let chapterContent = '';
  let chapterTitle = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('<h3')) {
      if (currentChapter) {
        courseData.push({ title: chapterTitle, content: chapterContent });
      }
      chapterTitle = stripHtml(line);
      chapterContent = '';
      currentChapter = chapterTitle;
    } else if (currentChapter) {
      chapterContent += line + '\n';
    }
  }
  if (currentChapter) {
    courseData.push({ title: chapterTitle, content: chapterContent });
  }

  // Generate course stages from chapters
  const stageIcons = ['🖥️', '📦', '🔌', '💻', '🧮', '💾', '💿', '🖨️', '🎮', '🔧', '⚙️', '💿', '💽', '💽', '🪟', '🧰', '🛡️', '🎵', '💾'];
  const stageColors = ['#6366f1','#22c55e','#a855f7','#f59e0b','#06b6d4','#ef4444','#8b5cf6','#3b82f6','#00d4aa','#ff6b6b','#f97316','#00CEC9','#FFD700','#A29BFE','#FF6348','#1ABC9C','#E74C3C','#3498DB','#2ECC71'];

  let tsOutput = `import { CourseStage } from './pc-hardware-course';

export const PC_HARDWARE_COURSE: CourseStage[] = [
`;

  courseData.forEach((ch, idx) => {
    const stageNum = idx + 1;
    const chContent = ch.content;
    
    // Extract ol/li items as parts
    const liRegex = /<li[^>]*>(.*?)<\/li>/g;
    const liMatches = [...chContent.matchAll(liRegex)];
    
    // Extract paragraphs and images between li items
    const parts = [];
    let currentLiContent = '';
    let currentLiTitle = '';
    let inLi = false;
    
    const contentLines = chContent.split('\n');
    for (const line of contentLines) {
      if (line.match(/<li[^>]*>/)) {
        if (currentLiTitle) {
          parts.push({ title: currentLiTitle, content: currentLiContent });
        }
        currentLiTitle = stripHtml(line);
        currentLiContent = '';
        inLi = true;
      } else if (line.match(/<\/li>/)) {
        if (currentLiTitle) {
          currentLiContent += line.replace('</li>', '');
          parts.push({ title: currentLiTitle, content: currentLiContent });
        }
        currentLiTitle = '';
        currentLiContent = '';
        inLi = false;
      } else if (inLi) {
        currentLiContent += line + '\n';
      }
    }
    if (currentLiTitle) {
      parts.push({ title: currentLiTitle, content: currentLiContent });
    }

    // If no li items, use the whole content as one part
    if (parts.length === 0) {
      parts.push({ title: ch.title, content: chContent });
    }

    const stageId = `stage-${stageNum}`;
    const titleVn = ch.title.replace(/Chương \d+ - /, '');
    const shortTitle = titleVn.substring(0, 40);

    tsOutput += `  {
    id: '${stageId}',
    stageNumber: ${stageNum},
    icon: '${stageIcons[idx] || '📚'}',
    color: '${stageColors[idx] || '#6366f1'}',
    titleVn: ${JSON.stringify(ch.title)},
    titleEn: ${JSON.stringify(ch.title)},
    pages: '${parts.length} chủ đề',
    parts: [\n`;

    parts.forEach((part, pi) => {
      const partId = `${stageId}-p${pi + 1}`;
      const partContent = part.content;
      
      // Split content into sections by paragraphs with images
      const sectionRegex = /<p[^>]*>(.*?)<\/p>/g;
      const paraMatches = [...partContent.matchAll(sectionRegex)];
      
      // Combine into sections (group by images)
      const sections = [];
      let currentSection = { title: part.title, content: '', images: [] };
      let contentText = '';
      
      // Process the raw content preserving images
      const imgInContent = [...partContent.matchAll(/<img[^>]+src="[^"]+"[^>]*\/?>/g)];
      
      // Create one section per part
      sections.push({
        title: part.title,
        content: partContent.replace(/<ol>|<\/ol>|<li>|<\/li>|<ul>|<\/ul>/g, ''),
        images: imgInContent.map(m => m[0])
      });

      tsOutput += `      {
        id: ${JSON.stringify(partId)},
        titleVn: ${JSON.stringify(part.title)},
        titleEn: ${JSON.stringify(part.title)},
        pages: '1 phần',
        sections: [\n`;

      sections.forEach((sec, si) => {
        const secContent = sec.content
          .replace(/<[^>]+>/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&nbsp;/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 2000); // Limit content length

        const imageHtml = sec.images.join('\n');
        const fullContent = imageHtml ? `${imageHtml}\n\n${secContent}` : secContent;

        tsOutput += `          {
            id: ${JSON.stringify(`${partId}-s${si + 1}`)},
            title: ${JSON.stringify(sec.title || part.title)},
            content: ${JSON.stringify(fullContent)},
            imagePrompt: '',
            quiz: []
          },\n`;
      });

      tsOutput += `        ]\n      },\n`;
    });

    tsOutput += `    ]\n  },\n`;
  });

  tsOutput += `];\n`;
  
  fs.writeFileSync(COURSE_TS_PATH, tsOutput, 'utf-8');
  console.log(`Generated course data: ${COURSE_TS_PATH}`);
  console.log(`Total stages: ${courseData.length}`);
}

main().catch(e => console.error('Error:', e.message));
