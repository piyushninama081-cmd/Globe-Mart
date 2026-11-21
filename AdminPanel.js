import React, { useState, useMemo } from 'react';
import Navbar from './Navbar';
import { CATEGORY_TREE, PROMO_TAGS, makeProductImage } from './products';

const DEFAULT_SUBCATEGORIES = {
    "Men's Wear": ['Shirts', 'T-Shirts', 'Jeans'],
    "Women's Wear": ['Kurtis', 'Dresses', 'Tops'],
    "Kids' Wear": ['Sets', 'Frocks', 'Hoodies'],
    'Footwear & Accessories': ['Sneakers', 'Bags', 'Watches'],
    'Electronics & Gadgets': ['Audio', 'Wearables', 'Accessories'],
    'Home & Kitchen': ['Cookware', 'Decor', 'Storage'],
    'Grocery & Essentials': ['Staples', 'Beverages', 'Snacks'],
};

export default function AdminPanel({
    userName,
    userAvatar,
    products,
    onAddProduct,
    onUpdateStock,
    onLogout,
}) {
    const categories = Object.keys(CATEGORY_TREE);
    const initialCategory = categories[0] || "Men's Wear";
    const initialSubCategory =
        (CATEGORY_TREE[initialCategory] && CATEGORY_TREE[initialCategory][0]) ||
        (DEFAULT_SUBCATEGORIES[initialCategory] && DEFAULT_SUBCATEGORIES[initialCategory][0]) ||
        'General';

    const [title, setTitle] = useState('');
    const [category, setCategory] = useState(initialCategory);
    const [subCategory, setSubCategory] = useState(initialSubCategory);
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('10');
    const [promoTag, setPromoTag] = useState(PROMO_TAGS[0] || 'Best Seller');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const availableSubCategories = useMemo(() => {
        const fromTree = CATEGORY_TREE[category];
        if (Array.isArray(fromTree) && fromTree.length > 0) return fromTree;
        return DEFAULT_SUBCATEGORIES[category] || ['General'];
    }, [category]);

    const handleCategoryChange = (nextCat) => {
        setCategory(nextCat);
        const subs =
            (Array.isArray(CATEGORY_TREE[nextCat]) && CATEGORY_TREE[nextCat].length > 0
                ? CATEGORY_TREE[nextCat]
                : DEFAULT_SUBCATEGORIES[nextCat]) || ['General'];
        setSubCategory(subs[0]);
    };

    const handleCreateProduct = (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const parsedPrice = Number(price);
        const parsedStock = Number(stock);

        if (!title.trim()) {
            setError('Please enter a product title.');
            return;
        }
        if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
            setError('Please enter a valid price greater than 0.');
            return;
        }
        if (!Number.isInteger(parsedStock) || parsedStock < 0) {
            setError('Stock quantity must be a whole number (0 or more).');
            return;
        }

        const finalImage =
            imageUrl.trim() ||
            (typeof makeProductImage === 'function'
                ? makeProductImage(title.trim(), category, 999)
                : 'https://via.placeholder.com/400x300?text=Product');

        const newProduct = {
            id: Date.now(),
            title: title.trim(),
            category,
            subCategory,
            price: parsedPrice,
            stock: parsedStock,
            promoTag,
            description:
                description.trim() || `${title.trim()} in ${category} (${subCategory}).`,
            image: finalImage,
        };

        onAddProduct(newProduct);
        setSuccess(`Added "${newProduct.title}" with ${parsedStock} in stock.`);
        setTitle('');
        setPrice('');
        setStock('10');
        setDescription('');
        setImageUrl('');
    };

    const filteredInventory = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        if (!q) return products;
        return products.filter(
            (p) =>
                p.title.toLowerCase().includes(q) ||
                p.category.toLowerCase().includes(q) ||
                String(p.id).toLowerCase().includes(q)
        );
    }, [products, searchTerm]);

    return (
        <div className="dashboard-wrapper">
            <Navbar
                userName={`${userName || 'Admin'} (Admin)`}
                userAvatar={userAvatar}
                cartCount={0}
                onLogout={onLogout}
                onOpenCart={() => { }}
                onGoHome={() => { }}
            />

            <div style={{ maxWidth: '1180px', margin: '28px auto 48px', padding: '0 20px', textAlign: 'left', width: '100%' }}>
                <div style={{ marginBottom: '22px' }}>
                    <h1 style={{ margin: '0 0 6px', fontSize: '26px', color: '#1b2433' }}>
                        Protected Admin Panel — Inventory &amp; Products
                    </h1>
                    <p style={{ margin: 0, fontSize: '14px', color: '#5d6676' }}>
                        Add products with stock quantities and manage live stock levels. Orders automatically deduct purchased quantities.
                    </p>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                        gap: '24px',
                        alignItems: 'start',
                    }}
                >
                    {/* Add Product Form */}
                    <form
                        onSubmit={handleCreateProduct}
                        style={{
                            background: '#ffffff',
                            borderRadius: '16px',
                            padding: '22px',
                            boxShadow: '0 6px 24px rgba(15, 23, 42, 0.06)',
                            borderTop: '4px solid #2563eb',
                        }}
                    >
                        <h2 style={{ margin: '0 0 16px', fontSize: '19px', color: '#1b2433' }}>
                            Add New Product
                        </h2>

                        {error && (
                            <div
                                role="alert"
                                style={{
                                    background: '#fee2e2',
                                    color: '#b91c1c',
                                    border: '1px solid #fca5a5',
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    marginBottom: '14px',
                                }}
                            >
                                {error}
                            </div>
                        )}

                        {success && (
                            <div
                                role="status"
                                style={{
                                    background: '#dcfce7',
                                    color: '#166534',
                                    border: '1px solid #86efac',
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    marginBottom: '14px',
                                }}
                            >
                                {success}
                            </div>
                        )}

                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                                Product Title *
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Wireless Noise-Cancelling Headphones"
                                style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '9px', border: '1.5px solid #cbd5e1', fontSize: '14px' }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                                    Category
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) => handleCategoryChange(e.target.value)}
                                    style={{ width: '100%', boxSizing: 'border-box', padding: '9px 10px', borderRadius: '9px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', background: '#fff' }}
                                >
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                                    Sub-Category
                                </label>
                                <select
                                    value={subCategory}
                                    onChange={(e) => setSubCategory(e.target.value)}
                                    style={{ width: '100%', boxSizing: 'border-box', padding: '9px 10px', borderRadius: '9px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', background: '#fff' }}
                                >
                                    {availableSubCategories.map((sub) => (
                                        <option key={sub} value={sub}>{sub}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                                    Price (₹) *
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="1499"
                                    style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '9px', border: '1.5px solid #cbd5e1', fontSize: '14px' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                                    Initial Stock Qty *
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={stock}
                                    onChange={(e) => setStock(e.target.value)}
                                    placeholder="10"
                                    style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '9px', border: '1.5px solid #cbd5e1', fontSize: '14px' }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                                Promo Tag
                            </label>
                            <select
                                value={promoTag}
                                onChange={(e) => setPromoTag(e.target.value)}
                                style={{ width: '100%', boxSizing: 'border-box', padding: '9px 10px', borderRadius: '9px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', background: '#fff' }}
                            >
                                {PROMO_TAGS.map((tag) => (
                                    <option key={tag} value={tag}>{tag}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                                Image URL (Optional — auto-generated if empty)
                            </label>
                            <input
                                type="text"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="https://..."
                                style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '9px', border: '1.5px solid #cbd5e1', fontSize: '13.5px' }}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                                Description
                            </label>
                            <textarea
                                rows={2}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Brief product details..."
                                style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '9px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', fontFamily: 'inherit', resize: 'vertical' }}
                            />
                        </div>

                        <button
                            type="submit"
                            style={{
                                width: '100%',
                                padding: '11px 18px',
                                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '14.5px',
                                fontWeight: 700,
                                cursor: 'pointer',
                            }}
                        >
                            + Add Product to Store
                        </button>
                    </form>

                    {/* Live Stock Table */}
                    <div
                        style={{
                            background: '#ffffff',
                            borderRadius: '16px',
                            padding: '22px',
                            boxShadow: '0 6px 24px rgba(15, 23, 42, 0.06)',
                            borderTop: '4px solid #7c3aed',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '14px' }}>
                            <h2 style={{ margin: 0, fontSize: '19px', color: '#1b2433' }}>
                                Live Stock Inventory ({products.length})
                            </h2>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search inventory..."
                                style={{ padding: '7px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px' }}
                            />
                        </div>

                        <div style={{ maxHeight: '520px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {filteredInventory.map((item) => {
                                const currentStock = Number(item.stock ?? 0);
                                return (
                                    <div
                                        key={item.id}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '10px 12px',
                                            borderRadius: '10px',
                                            background: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                        }}
                                    >
                                        <div style={{ minWidth: 0, flex: 1 }}>
                                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1b2433', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {item.title}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                                                {item.category} · ₹{Number(item.price).toLocaleString()}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                            <span
                                                style={{
                                                    fontSize: '12px',
                                                    fontWeight: 700,
                                                    padding: '3px 8px',
                                                    borderRadius: '999px',
                                                    background: currentStock > 0 ? '#dcfce7' : '#fee2e2',
                                                    color: currentStock > 0 ? '#166534' : '#b91c1c',
                                                }}
                                            >
                                                {currentStock > 0 ? `${currentStock} left` : 'Out of Stock'}
                                            </span>

                                            <input
                                                type="number"
                                                min="0"
                                                aria-label={`Stock for ${item.title}`}
                                                value={currentStock}
                                                onChange={(e) => {
                                                    const nextVal = Math.max(0, Math.floor(Number(e.target.value) || 0));
                                                    onUpdateStock(item.id, nextVal);
                                                }}
                                                style={{
                                                    width: '66px',
                                                    padding: '5px 7px',
                                                    borderRadius: '7px',
                                                    border: '1.5px solid #cbd5e1',
                                                    fontSize: '13px',
                                                    fontWeight: 700,
                                                    textAlign: 'center',
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}