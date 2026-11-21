import React from 'react';
import { CATEGORY_TREE, PROMO_TAGS } from './products';

const CATEGORY_ICONS = {
    "Men's Wear": '👔',
    "Women's Wear": '👗',
    "Kids' Wear": '🧸',
    'Footwear & Accessories': '👟',
    'Electronics & Gadgets': '💻',
    'Home & Kitchen': '🏠',
    'Grocery & Essentials': '🛒',
};

export default function AppSidebar({
    currentPath,
    onNavigate,
    isCollapsed,
    onToggleCollapse,
    userOrdersCount = 0,
    cartCount = 0,
    totalProductsCount = 0,
    categoryCounts = {},
    selectedCategory = 'All',
    selectedSubCategory = 'All',
    selectedPromos = [],
    searchQuery = '',
    maxPrice = 60000,
    onCategoryClick,
    onSubCategoryClick,
    onSelectAllCategories,
    onTogglePromoTag,
    onSearchChange,
    onMaxPriceChange,
    onResetFilters,
}) {
    const isDashboardRoute = currentPath === '/dashboard';

    return (
        <aside
            className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}
            aria-label="Persistent Left Sidebar Navigation"
        >
            <div className="sidebar-header">
                <div className="sidebar-header-title-wrap">
                    <h2>Navigation</h2>
                    {isDashboardRoute && onResetFilters && (
                        <button
                            type="button"
                            className="clear-btn"
                            onClick={onResetFilters}
                        >
                            Clear All
                        </button>
                    )}
                </div>

                <button
                    type="button"
                    className="collapse-toggle-btn"
                    onClick={onToggleCollapse}
                    title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                    aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    aria-expanded={!isCollapsed}
                >
                    <span className="arrow-icon" aria-hidden="true">→</span>
                </button>
            </div>

            {/* Standalone Page Links */}
            <button
                type="button"
                className={`sidebar-orders-btn ${currentPath === '/dashboard' ? 'active' : ''}`}
                title="Dashboard (/dashboard)"
                onClick={() => onNavigate('/dashboard')}
            >
                <span className="sidebar-orders-label">
                    <span className="category-icon" aria-hidden="true">🏠</span>
                    <span className="sidebar-orders-text">Dashboard</span>
                </span>
            </button>

            <button
                type="button"
                className={`sidebar-orders-btn ${currentPath.startsWith('/orders') ? 'active' : ''}`}
                title={`My Order (${userOrdersCount})`}
                onClick={() => onNavigate('/orders')}
                style={{ marginTop: '6px' }}
            >
                <span className="sidebar-orders-label">
                    <span className="category-icon" aria-hidden="true">📦</span>
                    <span className="sidebar-orders-text">My Order</span>
                </span>
                <span className="sidebar-orders-badge">{userOrdersCount}</span>
            </button>

            <button
                type="button"
                className={`sidebar-orders-btn ${currentPath === '/profile' ? 'active' : ''}`}
                title="Profile Page (/profile)"
                onClick={() => onNavigate('/profile')}
                style={{ marginTop: '6px' }}
            >
                <span className="sidebar-orders-label">
                    <span className="category-icon" aria-hidden="true">👤</span>
                    <span className="sidebar-orders-text">Profile Page</span>
                </span>
            </button>

            <button
                type="button"
                className={`sidebar-orders-btn ${currentPath === '/profile/edit' ? 'active' : ''}`}
                title="Edit Profile (/profile/edit)"
                onClick={() => onNavigate('/profile/edit')}
                style={{ marginTop: '6px' }}
            >
                <span className="sidebar-orders-label">
                    <span className="category-icon" aria-hidden="true">✏️</span>
                    <span className="sidebar-orders-text">Edit Profile</span>
                </span>
            </button>

            <button
                type="button"
                className={`sidebar-orders-btn ${currentPath === '/cart' ? 'active' : ''}`}
                title={`Cart Page (${cartCount})`}
                onClick={() => onNavigate('/cart')}
                style={{ marginTop: '6px' }}
            >
                <span className="sidebar-orders-label">
                    <span className="category-icon" aria-hidden="true">🛒</span>
                    <span className="sidebar-orders-text">Cart Page</span>
                </span>
                <span className="sidebar-orders-badge">{cartCount}</span>
            </button>

            {/* Catalog Filters (active on /dashboard; clicking a category from another route goes to /dashboard) */}
            <div className="sidebar-collapsible-panel">
                <input
                    type="text"
                    className="sidebar-search"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => {
                        if (!isDashboardRoute) onNavigate('/dashboard');
                        onSearchChange(e.target.value);
                    }}
                />
            </div>

            <div className="sidebar-section-title">Categories</div>
            <ul className="category-list">
                <li>
                    <button
                        type="button"
                        title="All Categories"
                        className={
                            'category-btn ' +
                            (isDashboardRoute && selectedCategory === 'All' ? 'active' : '')
                        }
                        onClick={() => {
                            onSelectAllCategories();
                            if (!isDashboardRoute) onNavigate('/dashboard');
                        }}
                    >
                        <span className="category-btn-left">
                            <span className="category-icon" aria-hidden="true">✨</span>
                            <span className="category-text">All Categories</span>
                        </span>
                        <span className="count-badge">{totalProductsCount}</span>
                    </button>
                </li>

                {Object.keys(CATEGORY_TREE).map((category) => {
                    const isSelected = isDashboardRoute && selectedCategory === category;
                    const icon = CATEGORY_ICONS[category] || '🏷️';
                    return (
                        <li key={category}>
                            <button
                                type="button"
                                title={category}
                                className={'category-btn ' + (isSelected ? 'active' : '')}
                                onClick={() => {
                                    onCategoryClick(category);
                                    if (!isDashboardRoute) onNavigate('/dashboard');
                                }}
                            >
                                <span className="category-btn-left">
                                    <span className="category-icon" aria-hidden="true">{icon}</span>
                                    <span className="category-text">{category}</span>
                                </span>
                                <span className="count-badge">
                                    {categoryCounts[category] || 0}
                                </span>
                            </button>

                            {isSelected && !isCollapsed && (
                                <ul className="subcategory-list">
                                    {CATEGORY_TREE[category].map((sub) => (
                                        <li key={sub}>
                                            <button
                                                type="button"
                                                className={
                                                    'subcategory-btn ' +
                                                    (selectedSubCategory === sub ? 'active' : '')
                                                }
                                                onClick={() => onSubCategoryClick(sub)}
                                            >
                                                {sub}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    );
                })}
            </ul>

            <div className="sidebar-collapsible-panel">
                <div className="sidebar-section-title">Promotional Offers</div>
                <div className="promo-list">
                    {PROMO_TAGS.map((tag) => (
                        <label key={tag} className="promo-checkbox">
                            <input
                                type="checkbox"
                                checked={selectedPromos.includes(tag)}
                                onChange={() => {
                                    if (!isDashboardRoute) onNavigate('/dashboard');
                                    onTogglePromoTag(tag);
                                }}
                            />
                            <span>{tag}</span>
                        </label>
                    ))}
                </div>

                <div className="sidebar-section-title">Price Range</div>
                <div className="price-filter">
                    <div className="price-label">
                        <span>Up to:</span>
                        <span>₹{maxPrice.toLocaleString()}</span>
                    </div>
                    <input
                        type="range"
                        min="50"
                        max="60000"
                        step="50"
                        value={maxPrice}
                        onChange={(e) => {
                            if (!isDashboardRoute) onNavigate('/dashboard');
                            onMaxPriceChange(Number(e.target.value));
                        }}
                    />
                </div>
            </div>
        </aside>
    );
}