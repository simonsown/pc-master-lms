'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, ExternalLink, Star, RefreshCw } from 'lucide-react'

interface PriceInfo {
  site: string
  price: string
  link: string
  rating: number
}

interface Recommended {
  site: string
  price: string
  link: string
}

interface PriceTableProps {
  prices: PriceInfo[]
  recommended: Recommended
  onRefresh?: () => void
  isUpdating?: boolean
}

const SITE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  'GearVN': { bg: '#fff3e0', text: '#e65100', label: 'GearVN' },
  'Phong Vũ': { bg: '#e3f2fd', text: '#0d47a1', label: 'Phong Vũ' },
  'An Phát': { bg: '#ffebee', text: '#b71c1c', label: 'An Phát' },
  'Hoàng Hà': { bg: '#e8f5e9', text: '#1b5e20', label: 'Hoàng Hà' },
  'FPT Shop': { bg: '#fff8e1', text: '#f57f17', label: 'FPT Shop' },
}

export default function PriceTable({ prices, recommended, onRefresh, isUpdating }: PriceTableProps) {
  const getNumericPrice = (priceStr: string): number => {
    const num = priceStr.replace(/[^0-9]/g, '')
    return parseInt(num, 10) || 1
  }

  const numericPrices = prices.map(p => getNumericPrice(p.price))
  const maxPrice = Math.max(...numericPrices)
  const minPrice = Math.min(...numericPrices)
  const totalPrice = numericPrices.reduce((a, b) => a + b, 0)
  const avgPrice = Math.round(totalPrice / numericPrices.length)

  useEffect(() => {
    if (!onRefresh) return
    const interval = setInterval(() => {
      onRefresh()
    }, 30000)
    return () => clearInterval(interval)
  }, [onRefresh])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        marginTop: '16px',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid var(--border-default)',
        background: 'var(--bg-elevated)',
      }}
    >
      <div style={{
        padding: '12px 16px',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-default)',
        fontSize: '13px',
        fontWeight: 700,
        color: 'var(--text-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <ExternalLink size={16} /> So sánh giá từ các trang thương mại điện tử
      </div>

      <div style={{ padding: '12px' }}>
        {prices.map((item, i) => {
          const numericPrice = getNumericPrice(item.price)
          const barWidth = (numericPrice / maxPrice) * 100
          const isBest = numericPrice === minPrice
          const siteStyle = SITE_COLORS[item.site] || { bg: '#f5f5f5', text: '#333', label: item.site }

          return (
            <motion.div
              key={item.site}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{
                padding: '10px 12px',
                borderRadius: '12px',
                marginBottom: '8px',
                background: isBest ? 'rgba(34,197,94,0.08)' : 'transparent',
                border: isBest ? '1px solid rgba(34,197,94,0.3)' : '1px solid transparent',
                position: 'relative',
              }}
            >
              {isBest && (
                <div style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '12px',
                  background: '#22c55e',
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  <CheckCircle size={10} /> Giá tốt nhất
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    textDecoration: 'none',
                    padding: '4px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    background: siteStyle.bg,
                    color: siteStyle.text,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {siteStyle.label}
                </a>

                <div style={{
                  fontSize: '16px',
                  fontWeight: 800,
                  color: '#22c55e',
                  flexShrink: 0,
                }}>
                  {item.price}
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  marginLeft: 'auto',
                }}>
                  <Star size={12} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                  {item.rating}
                </div>
              </div>

              <div style={{
                height: '6px',
                borderRadius: '3px',
                background: 'var(--bg-base)',
                overflow: 'hidden',
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidth}%` }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  style={{
                    height: '100%',
                    borderRadius: '3px',
                    background: isBest
                      ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                      : 'linear-gradient(90deg, var(--brand-primary), var(--brand-primary))',
                    opacity: isBest ? 1 : 0.4,
                  }}
                />
              </div>

              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginTop: '6px',
                  fontSize: '11px',
                  color: 'var(--brand-primary)',
                  textDecoration: 'none',
                }}
              >
                <ExternalLink size={10} /> Mở trang
              </a>
            </motion.div>
          )
        })}
      </div>

      {/* Average Price Bar */}
      <div style={{
        padding: '10px 16px',
        borderTop: '1px solid var(--border-default)',
        borderBottom: '1px solid var(--border-default)',
        background: 'rgba(34,197,94,0.04)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        fontSize: '13px',
      }}>
        <span style={{ color: 'var(--text-muted)' }}>
          Giá trung bình:{' '}
          <strong style={{ color: '#22c55e', fontSize: '15px' }}>
            {avgPrice.toLocaleString('vi-VN')}₫
          </strong>
        </span>
        <span style={{ color: 'var(--text-muted)' }}>
          Tổng giá:{' '}
          <strong style={{ color: '#22c55e', fontSize: '15px' }}>
            {totalPrice.toLocaleString('vi-VN')}₫
          </strong>
        </span>
        {onRefresh && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRefresh}
            disabled={isUpdating}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 16px',
              borderRadius: '8px',
              border: 'none',
              background: isUpdating ? 'rgba(34,197,94,0.4)' : '#22c55e',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 700,
              cursor: isUpdating ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
          >
            <RefreshCw size={14} style={{ animation: isUpdating ? 'spin 1s linear infinite' : 'none' }} />
            {isUpdating ? 'Đang cập nhật...' : 'Thay thế'}
          </motion.button>
        )}
      </div>

      {recommended && (
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border-default)',
          background: 'rgba(34,197,94,0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
        }}>
          <CheckCircle size={16} style={{ color: '#22c55e', flexShrink: 0 }} />
          <span style={{ color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Khuyên dùng:</strong>{' '}
            Mua tại <strong style={{ color: '#22c55e' }}>{recommended.site}</strong> với giá{' '}
            <strong style={{ color: '#22c55e' }}>{recommended.price}</strong>
          </span>
          <a
            href={recommended.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              marginLeft: 'auto',
              padding: '4px 12px',
              borderRadius: '8px',
              background: 'var(--brand-primary)',
              color: '#000',
              fontSize: '11px',
              fontWeight: 700,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            Đến trang
          </a>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  )
}
