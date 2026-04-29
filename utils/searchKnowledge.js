import { KNOWLEDGE_BASE } from '../data/knowledgeBase';

/**
 * Tìm kiếm các đoạn kiến thức liên quan dựa trên topic.
 * Sử dụng Keyword Matching đơn giản.
 */
export function searchKnowledge(topic) {
  if (!topic) return "";

  const query = topic.toUpperCase();
  
  // Tìm các chunk có chứa topic trong tên hoặc nội dung
  const relatedChunks = KNOWLEDGE_BASE.filter(item => 
    item.topic.toUpperCase().includes(query) || 
    query.includes(item.topic.toUpperCase())
  );

  if (relatedChunks.length > 0) {
    return relatedChunks.map(chunk => chunk.content).join("\n\n");
  }

  // Nếu không tìm thấy chính xác, trả về toàn bộ dữ liệu làm context (fallback)
  return KNOWLEDGE_BASE.map(chunk => chunk.content).join("\n\n");
}
