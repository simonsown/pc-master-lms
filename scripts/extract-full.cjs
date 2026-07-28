const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

const docxPath = path.join('C:\\Users\\fujitsu\\Downloads', fs.readdirSync('C:\\Users\\fujitsu\\Downloads').find(f => f.includes('Giao-trinh') && f.endsWith('.docx')));

async function main() {
  const result = await mammoth.convertToHtml({
    path: docxPath,
    styleMap: [
      "p[style-name='Heading 3'] => h3 > h3:fresh",
      "p[style-name='Heading 8'] => h4 > h4:fresh",
      "p[style-name='Body Text'] => p.body-text"
    ]
  });
  
  const html = result.value;
  fs.writeFileSync(path.join(__dirname, 'docx-full.html'), html, 'utf-8');
  console.log('HTML extracted:', html.length, 'chars');
  
  // Count images
  const imgMatches = html.match(/<img[^>]+>/g);
  console.log('Images found:', imgMatches ? imgMatches.length : 0);
  
  // Extract base64 images
  const base64Images = html.match(/src="data:image\/(jpeg|png|gif|webp);base64,[^"]+"/g);
  console.log('Base64 images:', base64Images ? base64Images.length : 0);
  
  // Write messages
  if (result.messages.length > 0) {
    fs.writeFileSync(path.join(__dirname, 'docx-messages.json'), JSON.stringify(result.messages, null, 2), 'utf-8');
    console.log('Messages:', result.messages.length);
  }
}

main().catch(e => console.error('Error:', e.message));
