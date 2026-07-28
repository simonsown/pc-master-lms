const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

const docxPath = path.join('C:\\Users\\fujitsu\\Downloads\\639594946-Giao-trinh-kỹ-thuật-phần-cứng-PC-toan-tập.docx');

async function main() {
  const result = await mammoth.convertToHtml({path: docxPath});
  console.log(result.value);
  const messages = result.messages;
  if (messages.length > 0) {
    console.error('Messages:', JSON.stringify(messages.slice(0, 5)));
  }
}

main().catch(e => console.error(e.message));
