import React from 'react';
import { makeProductImage } from './products';

export default function ProductCard({ product, addToCart }) {
  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
      : 0;

  const rawStock =
    typeof product.stock === 'number' && Number.isFinite(product.stock)
      ? product.stock
      : typeof product.stockCount === 'number' && Number.isFinite(product.stockCount)
        ? product.stockCount
        : 20;
  const availableStock = Math.max(0, Math.floor(rawStock));
  const isOutOfStock = availableStock <= 0;

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = makeProductImage(
      product.title,
      product.subCategory,
      product.color || '2f5bea'
    );
  };

  return (
    <div
      style={{
        width: '100%',
        boxSizing: 'border-box',
        background: '#fff',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
      }}
    >
      <div>
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '170px',
            backgroundColor: '#1e293b',
            overflow: 'hidden',
          }}
        >
          {product.promoTag && (
            <span
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                zIndex: 2,
                background: '#111827',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 700,
                padding: '4px 8px',
                borderRadius: '6px',
              }}
            >
              {product.promoTag}
            </span>
          )}

          <img
            src={product.image}
            alt={product.title}
            onError={handleImageError}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </div>

        <div style={{ padding: '14px 14px 0' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '6px',
            }}
          >
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#2f5bea',
                background: '#eef2ff',
                padding: '3px 8px',
                borderRadius: '6px',
              }}
            >
              {product.subCategory}
            </span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#d97706' }}>
              ★ {product.rating}
            </span>
          </div>

          <h3 style={{ margin: '0 0 6px', fontSize: '15px', color: '#1b2433' }}>
            {product.title}
          </h3>
          <p style={{ margin: '0 0 10px', color: '#555', fontSize: '13px' }}>
            {product.description}
          </p>
        </div>
      </div>

      <div style={{ padding: '0 14px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <strong style={{ fontSize: '16px', color: '#111827' }}>
            ₹{Number(product.price).toLocaleString()}
          </strong>
          {discount > 0 && (
            <>
              <span
                style={{
                  fontSize: '13px',
                  color: '#9ca3af',
                  textDecoration: 'line-through',
                }}
              >
                ₹{Number(product.originalPrice).toLocaleString()}
              </span>
              <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 700 }}>
                {discount}% OFF
              </span>
            </>
          )}
        </div>

        <div
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: isOutOfStock ? '#b91c1c' : '#6b7280',
            marginTop: '4px',
          }}
        >
          {isOutOfStock ? 'Out of Stock (0 units)' : `In Stock: ${availableStock} units`}
        </div>

        <button
          type="button"
          disabled={isOutOfStock}
          onClick={() => !isOutOfStock && addToCart(product)}
          style={{
            display: 'block',
            width: '100%',
            marginTop: '10px',
            padding: '10px',
            border: 'none',
            borderRadius: '6px',
            background: isOutOfStock ? '#cbd5e1' : '#2f5bea',
            color: isOutOfStock ? '#475569' : '#fff',
            cursor: isOutOfStock ? 'not-allowed' : 'pointer',
            fontWeight: 600,
          }}
        >
          {isOutOfStock ? 'Out of stock' : 'Add to cart'}
        </button>
      </div>
    </div>
  );
}