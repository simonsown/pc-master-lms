export interface ShopInfo {
  name: string
  url: string
  logo: string
  type: 'online' | 'retail' | 'marketplace'
  rating: number
}

export const SHOPS: ShopInfo[] = [
  { name: 'GearVN', url: 'https://gearvn.com', logo: '/shops/gearvn.png', type: 'online', rating: 4.8 },
  { name: 'Phong Vũ', url: 'https://phongvu.vn', logo: '/shops/phongvu.png', type: 'online', rating: 4.7 },
  { name: 'An Phát', url: 'https://anphatpc.com.vn', logo: '/shops/anphat.png', type: 'online', rating: 4.6 },
  { name: 'Hoàng Hà', url: 'https://hoanghapc.vn', logo: '/shops/hoangha.png', type: 'online', rating: 4.5 },
  { name: 'ThinkPro', url: 'https://thinkpro.vn', logo: '/shops/thinkpro.png', type: 'online', rating: 4.6 },
  { name: 'CellphoneS', url: 'https://cellphones.com.vn', logo: '/shops/cellphones.png', type: 'online', rating: 4.4 },
  { name: 'FPT Shop', url: 'https://fptshop.com.vn', logo: '/shops/fpt.png', type: 'online', rating: 4.3 },
]

export interface ProductLink {
  shop: string
  url: string
  price?: number
}

export interface ComponentShops {
  [componentId: string]: ProductLink[]
}

const SEARCH_URLS: Record<string, (query: string) => string> = {
  'GearVN': (q) => `https://gearvn.com/search?q=${encodeURIComponent(q)}`,
  'Phong Vũ': (q) => `https://phongvu.vn/search?q=${encodeURIComponent(q)}`,
  'An Phát': (q) => `https://anphatpc.com.vn/tim-kiem?keyword=${encodeURIComponent(q)}`,
  'Hoàng Hà': (q) => `https://hoanghapc.vn/search?q=${encodeURIComponent(q)}`,
  'ThinkPro': (q) => `https://thinkpro.vn/search?q=${encodeURIComponent(q)}`,
  'CellphoneS': (q) => `https://cellphones.com.vn/tim-kiem?q=${encodeURIComponent(q)}`,
  'FPT Shop': (q) => `https://fptshop.com.vn/tim-kiem?q=${encodeURIComponent(q)}`,
}

export function getComponentSearchLinks(name: string, type: string): ProductLink[] {
  const query = `${name} ${type}`
  const shops = ['GearVN', 'Phong Vũ', 'An Phát', 'Hoàng Hà', 'ThinkPro', 'CellphoneS', 'FPT Shop']
  return shops.map(shop => ({
    shop,
    url: SEARCH_URLS[shop](query),
  }))
}

export const CATEGORY_LINKS: Record<string, ProductLink[]> = {
  CPU: [
    { shop: 'GearVN', url: 'https://gearvn.com/collections/cpu-bo-vi-xu-ly' },
    { shop: 'Phong Vũ', url: 'https://phongvu.vn/c/linh-kien-may-tinh/cpu-bo-vi-xu-ly' },
    { shop: 'An Phát', url: 'https://anphatpc.com.vn/cpu-bo-vi-xu-ly' },
    { shop: 'Hoàng Hà', url: 'https://hoanghapc.vn/cpu-bo-vi-xu-ly' },
    { shop: 'ThinkPro', url: 'https://thinkpro.vn/cpu-bo-vi-xu-ly' },
    { shop: 'CellphoneS', url: 'https://cellphones.com.vn/linh-kien/cpu.html' },
  ],
  GPU: [
    { shop: 'GearVN', url: 'https://gearvn.com/collections/vga-card-man-hinh' },
    { shop: 'Phong Vũ', url: 'https://phongvu.vn/c/linh-kien-may-tinh/card-man-hinh-vga' },
    { shop: 'An Phát', url: 'https://anphatpc.com.vn/vga-card-man-hinh' },
    { shop: 'Hoàng Hà', url: 'https://hoanghapc.vn/vga-card-man-hinh' },
    { shop: 'ThinkPro', url: 'https://thinkpro.vn/vga-card-do-hoa' },
    { shop: 'CellphoneS', url: 'https://cellphones.com.vn/linh-kien/vga.html' },
  ],
  RAM: [
    { shop: 'GearVN', url: 'https://gearvn.com/collections/ram-desktop' },
    { shop: 'Phong Vũ', url: 'https://phongvu.vn/c/linh-kien-may-tinh/ram-may-tinh' },
    { shop: 'An Phát', url: 'https://anphatpc.com.vn/ram-may-tinh' },
    { shop: 'Hoàng Hà', url: 'https://hoanghapc.vn/ram' },
    { shop: 'ThinkPro', url: 'https://thinkpro.vn/ram' },
    { shop: 'CellphoneS', url: 'https://cellphones.com.vn/linh-kien/ram.html' },
  ],
  Mainboard: [
    { shop: 'GearVN', url: 'https://gearvn.com/collections/mainboard-bo-mach-chu' },
    { shop: 'Phong Vũ', url: 'https://phongvu.vn/c/linh-kien-may-tinh/mainboard-bo-mach-chu' },
    { shop: 'An Phát', url: 'https://anphatpc.com.vn/mainboard-bo-mach-chu' },
    { shop: 'Hoàng Hà', url: 'https://hoanghapc.vn/mainboard' },
    { shop: 'ThinkPro', url: 'https://thinkpro.vn/mainboard' },
  ],
  Storage: [
    { shop: 'GearVN', url: 'https://gearvn.com/collections/ssd-o-cung-ran' },
    { shop: 'Phong Vũ', url: 'https://phongvu.vn/c/linh-kien-may-tinh/o-cung-ssd' },
    { shop: 'An Phát', url: 'https://anphatpc.com.vn/o-cung-ssd' },
    { shop: 'Hoàng Hà', url: 'https://hoanghapc.vn/ssd' },
    { shop: 'ThinkPro', url: 'https://thinkpro.vn/o-cung-ssd' },
    { shop: 'CellphoneS', url: 'https://cellphones.com.vn/linh-kien/ssd.html' },
  ],
  PSU: [
    { shop: 'GearVN', url: 'https://gearvn.com/collections/psu-nguon-may-tinh' },
    { shop: 'Phong Vũ', url: 'https://phongvu.vn/c/linh-kien-may-tinh/nguon-may-tinh-psu' },
    { shop: 'An Phát', url: 'https://anphatpc.com.vn/nguon-may-tinh-psu' },
    { shop: 'Hoàng Hà', url: 'https://hoanghapc.vn/nguon-may-tinh' },
    { shop: 'ThinkPro', url: 'https://thinkpro.vn/nguon-may-tinh' },
  ],
  Cooler: [
    { shop: 'GearVN', url: 'https://gearvn.com/collections/tan-nhiet' },
    { shop: 'Phong Vũ', url: 'https://phongvu.vn/c/linh-kien-may-tinh/tan-nhiet' },
    { shop: 'An Phát', url: 'https://anphatpc.com.vn/tan-nhiet' },
    { shop: 'Hoàng Hà', url: 'https://hoanghapc.vn/tan-nhiet' },
    { shop: 'ThinkPro', url: 'https://thinkpro.vn/tan-nhiet' },
  ],
  Case: [
    { shop: 'GearVN', url: 'https://gearvn.com/collections/case-vo-may-tinh' },
    { shop: 'Phong Vũ', url: 'https://phongvu.vn/c/linh-kien-may-tinh/case-vo-may-tinh' },
    { shop: 'An Phát', url: 'https://anphatpc.com.vn/case-vo-may-tinh' },
    { shop: 'Hoàng Hà', url: 'https://hoanghapc.vn/case-vo-may-tinh' },
    { shop: 'ThinkPro', url: 'https://thinkpro.vn/case-vo-case' },
  ],
  Monitor: [
    { shop: 'GearVN', url: 'https://gearvn.com/collections/man-hinh' },
    { shop: 'Phong Vũ', url: 'https://phongvu.vn/c/man-hinh-may-tinh' },
    { shop: 'An Phát', url: 'https://anphatpc.com.vn/man-hinh' },
    { shop: 'Hoàng Hà', url: 'https://hoanghapc.vn/man-hinh' },
    { shop: 'ThinkPro', url: 'https://thinkpro.vn/man-hinh' },
    { shop: 'CellphoneS', url: 'https://cellphones.com.vn/man-hinh-may-tinh.html' },
    { shop: 'FPT Shop', url: 'https://fptshop.com.vn/man-hinh-may-tinh' },
  ],
}

export function getCategoryLinks(type: string): ProductLink[] {
  return CATEGORY_LINKS[type] || CATEGORY_LINKS['CPU']
}
