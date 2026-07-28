const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

const DOCX_PATH = path.join('C:\\Users\\fujitsu\\Downloads', 
  fs.readdirSync('C:\\Users\\fujitsu\\Downloads').find(f => f.includes('Giao-trinh') && f.endsWith('.docx')));
const IMG_DIR = path.join(__dirname, '..', 'public', 'course-images');
const COURSE_TS_PATH = path.join(__dirname, '..', 'data', 'pc-hardware-course.ts');

fs.mkdirSync(IMG_DIR, { recursive: true });

function decodeHtmlEntities(text) {
  return text.replace(/&#(\d+);/g, (m, code) => String.fromCharCode(code))
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&aacute;/g, 'á').replace(/&eacute;/g, 'é').replace(/&iacute;/g, 'í')
    .replace(/&oacute;/g, 'ó').replace(/&uacute;/g, 'ú')
    .replace(/&agrave;/g, 'à').replace(/&egrave;/g, 'è').replace(/&igrave;/g, 'ì')
    .replace(/&ograve;/g, 'ò').replace(/&ugrave;/g, 'ù')
    .replace(/&atilde;/g, 'ã').replace(/&etilde;/g, 'ẽ').replace(/&itilde;/g, 'ĩ')
    .replace(/&otilde;/g, 'õ').replace(/&utilde;/g, 'ũ')
    .replace(/&auml;/g, 'ä').replace(/&euml;/g, 'ë').replace(/&iuml;/g, 'ï')
    .replace(/&ouml;/g, 'ö').replace(/&uuml;/g, 'ü')
    .replace(/&circ;/g, 'â').replace(/&ecirc;/g, 'ê').replace(/&ocirc;/g, 'ô')
    .replace(/&dgrave;/g, 'đ').replace(/&Dgrave;/g, 'Đ')
    .replace(/&yacute;/g, 'ý').replace(/&Yacute;/g, 'Ý');
}

function stripTags(str) {
  return decodeHtmlEntities(str.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')).trim();
}

async function main() {
  const result = await mammoth.convertToHtml({ path: DOCX_PATH });
  let html = result.value;

  // Save and replace all images
  const imgRegex = /<img[^>]+src="data:image\/(jpeg|png|gif|webp);base64,([^"]+)"[^>]*\/?>/g;
  let match;
  let imgIndex = 0;
  const imgMap = new Map(); // key: base64 hash -> filename

  while ((match = imgRegex.exec(html)) !== null) {
    imgIndex++;
    const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
    const base64Data = match[2];
    const filename = `img${String(imgIndex).padStart(4, '0')}.${ext}`;
    const filePath = path.join(IMG_DIR, filename);
    
    if (!fs.existsSync(filePath)) {
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(filePath, buffer);
    }
    
    const imgHtml = `<figure class="course-img"><img src="/course-images/${filename}" alt="" loading="lazy" /></figure>`;
    html = html.replace(match[0], imgHtml);
  }

  console.log(`Saved ${imgIndex} images`);

  // Extract chapters by h3 tags
  const chapterRegex = /<h3[^>]*>(.*?)<\/h3>/gi;
  const chapters = [];
  let lastIndex = 0;
  let lastH3 = '';

  const h3Matches = [...html.matchAll(chapterRegex)];
  
  for (let i = 0; i < h3Matches.length; i++) {
    const m = h3Matches[i];
    const h3Content = stripTags(m[1]);
    const startIdx = m.index;
    const endIdx = (i < h3Matches.length - 1) ? h3Matches[i + 1].index : html.length;
    const content = html.substring(startIdx + m[0].length, endIdx).trim();
    
    // Skip non-chapter headings (like MAINBOARD examples, "Tham khảo")
    if (!h3Content.toLowerCase().includes('chương') && 
        !h3Content.toLowerCase().includes('chuong') &&
        i > 0) continue;
    
    chapters.push({ title: h3Content, content });
  }

  console.log(`Found ${chapters.length} chapters`);

  // Build course stages
  const stageIcons = ['🖥️','📦','🔌','💻','🧮','💾','💿','🖨️','🎮','🔧','⚙️','💿','💽','💽','🪟','🧰','🛡️','🎵','💾'];
  const stageColors = ['#6366f1','#22c55e','#a855f7','#f59e0b','#06b6d4','#ef4444','#8b5cf6','#3b82f6','#00d4aa','#ff6b6b','#f97316','#00CEC9','#FFD700','#A29BFE','#FF6348','#1ABC9C','#E74C3C','#3498DB','#2ECC71'];

  let tsOutput = `import { CourseStage } from './pc-hardware-course';

export const PC_HARDWARE_COURSE: CourseStage[] = [
`;

  chapters.forEach((ch, ci) => {
    const stageNum = ci + 1;
    const shortTitle = ch.title.replace(/Chương\s+\d+\s*[-–—]\s*/i, '').trim();
    
    // Extract paragraphs preserving images
    const contentBlock = ch.content;
    
    // Split into parts by <ol> / <li> or by paragraphs
    const parts = [];
    const liRegex = /<li[^>]*>(.*?)<\/li>/gs;
    let liMatch;
    let partCounter = 0;
    
    // Check if there are <ol> lists
    if (contentBlock.includes('<ol>')) {
      const olSections = contentBlock.split(/<ol>|<\/ol>/).filter(s => s.trim());
      for (const section of olSections) {
        const liItems = [...section.matchAll(/<li[^>]*>(.*?)<\/li>/gs)];
        if (liItems.length > 0) {
          liItems.forEach((li, liIdx) => {
            partCounter++;
            const liContent = li[1].trim();
            // Split long li into sections with images
            const imgInContent = [...liContent.matchAll(/<figure class="course-img">.*?<\/figure>/gs)];
            const textContent = stripTags(liContent);
            
            // Create a section from this li
            const sectionContent = imgInContent.map(m => m[0]).join('\n') + '\n' + textContent;
            parts.push({
              title: textContent.substring(0, 60) || `Phần ${partCounter}`,
              sections: [{
                title: textContent.substring(0, 60) || `Phần ${partCounter}`,
                content: sectionContent.substring(0, 3000)
              }]
            });
          });
        }
      }
    }
    
    // If no list items found, create one part with the whole content split into sections
    if (parts.length === 0) {
      // Split content by images to create sections
      const imgBlocks = [...contentBlock.matchAll(/<figure class="course-img">.*?<\/figure>/gs)];
      const sections = [];
      
      if (imgBlocks.length > 0) {
        // Split content around images
        let remaining = contentBlock;
        imgBlocks.forEach((imgBlock, ii) => {
          const before = remaining.substring(0, remaining.indexOf(imgBlock[0]));
          if (stripTags(before)) {
            sections.push({
              title: `Mục ${ii + 1}`,
              content: stripTags(before).substring(0, 2000)
            });
          }
          sections.push({
            title: `Hình ${ii + 1}`,
            content: imgBlock[0]
          });
          remaining = remaining.substring(remaining.indexOf(imgBlock[0]) + imgBlock[0].length);
        });
        if (stripTags(remaining)) {
          sections.push({
            title: `Mục ${imgBlocks.length + 1}`,
            content: stripTags(remaining).substring(0, 2000)
          });
        }
      } else {
        sections.push({
          title: shortTitle,
          content: stripTags(contentBlock).substring(0, 3000)
        });
      }
      
      parts.push({
        title: shortTitle || `Phần 1`,
        sections: sections.length > 0 ? sections : [{ title: shortTitle || 'Nội dung', content: stripTags(contentBlock).substring(0, 3000) }]
      });
    }

    tsOutput += `  {
    id: 'stage-${stageNum}',
    stageNumber: ${stageNum},
    icon: '${stageIcons[ci] || '📚'}',
    color: '${stageColors[ci] || '#6366f1'}',
    titleVn: ${JSON.stringify(ch.title)},
    titleEn: ${JSON.stringify(ch.title)},
    pages: '${parts.length} phần',
    parts: [\n`;

    parts.forEach((part, pi) => {
      tsOutput += `      {
        id: 'stage-${stageNum}-p${pi + 1}',
        titleVn: ${JSON.stringify(part.title.substring(0, 80))},
        titleEn: ${JSON.stringify(part.title.substring(0, 80))},
        pages: '${part.sections.length} bài',
        sections: [\n`;

      part.sections.forEach((sec, si) => {
        tsOutput += `          {
            id: 'stage-${stageNum}-p${pi + 1}-s${si + 1}',
            title: ${JSON.stringify(sec.title.substring(0, 80))},
            content: ${JSON.stringify(sec.content)},
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
  console.log(`Generated ${COURSE_TS_PATH}`);
  console.log(`Done! ${chapters.length} stages`);
}

main().catch(e => console.error('Error:', e.message));
