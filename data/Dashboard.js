import React, { useState, useMemo, useEffect } from 'react';
import Navbar from '../Navbar';
import AppSidebar from '../AppSidebar';
import ProductCard from '../ProductCard';
import CartPage from '../../ecomerce-store/src/components/CartPage';
import './Dashboard.css';
import { CATEGORY_TREE, products as fallbackProducts } from '../products';

const PAGE_SIZE = 20;
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

export default function Dashboard({
  currentPath = '/dashboard',
  onNavigate,
  userName,
  userAddress = '',
  userAvatar = '',
  products = fallbackProducts,
  onDeductStock,
  onRestoreStockForOrder,
  onUpdateProfile,
  onLogout,
}) {
  const currentUserEmail =
    sessionStorage.getItem('currentUserEmail') || 'piyush@gmail.com';
  const currentUserRole = sessionStorage.getItem('currentUserRole') || 'user';

  const [cart, setCart] = useState(() => {
    try {
      const saved = sessionStorage.getItem('storeCart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState(() => {
    try {
      const savedOrders = sessionStorage.getItem('storeOrders');
      return savedOrders ? JSON.parse(savedOrders) : [];
    } catch {
      return [];
    }
  });

  const [orderToDelete, setOrderToDelete] = useState(null);

  const [isEditingOrderAddress, setIsEditingOrderAddress] = useState(false);
  const [orderAddressDraft, setOrderAddressDraft] = useState('');
  const [orderAddressError, setOrderAddressError] = useState('');

  // Edit Profile page state (/profile/edit)
  const [profileName, setProfileName] = useState(userName || 'User');
  const [profileAddress, setProfileAddress] = useState(userAddress || '');
  const [profileAvatar, setProfileAvatar] = useState(userAvatar || '');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubCategory, setSelectedSubCategory] = useState('All');
  const [selectedPromos, setSelectedPromos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState(60000);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    sessionStorage.setItem('storeCart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    sessionStorage.setItem('storeOrders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    setProfileName(userName || 'User');
    setProfileAddress(userAddress || '');
    setProfileAvatar(userAvatar || '');
  }, [userName, userAddress, userAvatar]);

  const userOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        order.userEmail &&
        order.userEmail === currentUserEmail.toLowerCase()
    );
  }, [orders, currentUserEmail]);

  const orderDetailMatch = useMemo(() => {
    if (!currentPath.startsWith('/orders/')) return null;
    const rawId = decodeURIComponent(currentPath.replace('/orders/', '')).trim();
    return userOrders.find((o) => o.id === rawId) || null;
  }, [currentPath, userOrders]);

  useEffect(() => {
    setIsEditingOrderAddress(false);
    setOrderAddressError('');
    setOrderAddressDraft(orderDetailMatch ? orderDetailMatch.deliveryAddress || '' : '');
  }, [currentPath, orderDetailMatch]);

  const getProductStock = (productId, fallbackStock = 20) => {
    const match = products.find((p) => p.id === productId);
    const val = match ? match.stock : fallbackStock;
    return typeof val === 'number' && Number.isFinite(val)
      ? Math.max(0, val)
      : 20;
  };

  const handleUpdateOrderPaymentStatus = (orderId, nextStatus) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? {
            ...ord,
            payment: {
              ...(ord.payment || {}),
              paymentStatus: nextStatus,
            },
          }
          : ord
      )
    );
  };

  const handleSaveSpecificOrderAddress = () => {
    if (!orderDetailMatch) return;
    const trimmed = orderAddressDraft.trim();
    if (!trimmed) {
      setOrderAddressError('Please enter a delivery address for this order.');
      return;
    }

    const targetOrderId = orderDetailMatch.id;
    setOrderAddressError('');

    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === targetOrderId
          ? {
            ...ord,
            deliveryAddress: trimmed,
            payment: ord.payment
              ? { ...ord.payment, deliveryAddress: trimmed }
              : ord.payment,
          }
          : ord
      )
    );

    setIsEditingOrderAddress(false);
  };

  const syncUserProfileToStorage = ({ name, address, avatar }) => {
    try {
      const existingUsers =
        JSON.parse(localStorage.getItem('storeRegisteredUsers')) || [];
      const hasRegisteredMatch = existingUsers.some(
        (u) =>
          u.email && u.email.toLowerCase() === currentUserEmail.toLowerCase()
      );

      if (hasRegisteredMatch) {
        const updatedUsers = existingUsers.map((u) =>
          u.email && u.email.toLowerCase() === currentUserEmail.toLowerCase()
            ? {
              ...u,
              name: name ?? u.name,
              address: address ?? u.address,
              avatar: avatar ?? u.avatar,
            }
            : u
        );
        localStorage.setItem(
          'storeRegisteredUsers',
          JSON.stringify(updatedUsers)
        );
      }
    } catch {
      // ignore storage errors
    }

    if (onUpdateProfile) {
      onUpdateProfile({
        name: name ?? userName,
        address: address ?? userAddress,
        avatar: avatar ?? userAvatar,
      });
    }
  };

  const handleProfileImageChange = (e) => {
    setProfileError('');
    setProfileSuccess('');
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setProfileError('Please select a valid image file (JPG, PNG, WEBP).');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setProfileError('Image size must be 2MB or smaller.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileAvatar(typeof reader.result === 'string' ? reader.result : '');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveEditProfilePage = (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!profileName.trim()) {
      setProfileError('Full name cannot be empty.');
      return;
    }

    try {
      syncUserProfileToStorage({
        name: profileName.trim(),
        address: profileAddress.trim(),
        avatar: profileAvatar || '',
      });
      setProfileSuccess('Profile updated successfully!');
    } catch {
      setProfileError(
        'Could not save profile. Image may be too large for browser storage.'
      );
    }
  };

  const addToCart = (product) => {
    const available = getProductStock(product.id, product.stock);
    if (available <= 0) return false;

    const existing = cart.find((item) => item.id === product.id);
    const currentQty = existing ? existing.quantity : 0;
    if (currentQty + 1 > available) {
      return false;
    }

    setCart((prev) => {
      const found = prev.find((item) => item.id === product.id);
      if (found) {
        return prev.map((item) =>
          item.id === product.id
            ? {
              ...item,
              quantity: Math.min(available, item.quantity + 1),
              stock: available,
            }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1, stock: available }];
    });
    return true;
  };

  const increaseQty = (productId) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id !== productId) return item;
        const available = getProductStock(productId, item.stock);
        if (item.quantity >= available) return item;
        return { ...item, quantity: item.quantity + 1, stock: available };
      })
    );
  };

  const decreaseQty = (productId) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const handleCheckoutFromCart = (
    checkedOutItems,
    grandTotal,
    paymentDetails
  ) => {
    const newOrder = {
      id: 'ORD-' + Date.now().toString().slice(-6),
      userEmail: currentUserEmail.toLowerCase(),
      deliveryAddress: paymentDetails?.deliveryAddress || userAddress || '',
      date: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      items: checkedOutItems,
      totalAmount: grandTotal,
      payment: paymentDetails || {
        method: 'UPI QR Payment',
        merchantUpiId: 'ninamamanish45@okicici',
        paymentStatus: 'Pending Verification',
        paymentId: 'PAY-' + Date.now(),
      },
    };
    setOrders((prev) => [newOrder, ...prev]);

    if (onDeductStock) {
      onDeductStock(checkedOutItems);
    }
  };

  const handleConfirmDeleteOrder = () => {
    if (!orderToDelete) return;
    const targetOrder = orderToDelete;
    const targetId = targetOrder.id;

    setOrders((prev) => prev.filter((ord) => ord.id !== targetId));

    if (onRestoreStockForOrder && Array.isArray(targetOrder.items)) {
      onRestoreStockForOrder(targetOrder.items);
    }

    if (currentPath === `/orders/${encodeURIComponent(targetId)}`) {
      onNavigate('/orders');
    }
    setOrderToDelete(null);
  };

  const totalSpent = useMemo(
    () =>
      userOrders.reduce(
        (sum, ord) => sum + (Number(ord.totalAmount) || 0),
        0
      ),
    [userOrders]
  );

  const totalCartItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const handleCategoryClick = (category) => {
    if (selectedCategory === category) {
      setSelectedCategory('All');
      setSelectedSubCategory('All');
    } else {
      setSelectedCategory(category);
      setSelectedSubCategory('All');
    }
    setVisibleCount(PAGE_SIZE);
  };

  const handleSubCategoryClick = (sub) => {
    setSelectedSubCategory((prev) => (prev === sub ? 'All' : sub));
    setVisibleCount(PAGE_SIZE);
  };

  const togglePromoTag = (tag) => {
    setSelectedPromos((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setVisibleCount(PAGE_SIZE);
  };

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedSubCategory('All');
    setSelectedPromos([]);
    setSearchQuery('');
    setMaxPrice(60000);
    setVisibleCount(PAGE_SIZE);
  };

  const categoryCounts = useMemo(() => {
    const counts = {};
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesCat =
        selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSub =
        selectedSubCategory === 'All' || item.subCategory === selectedSubCategory;
      const matchesPromo =
        selectedPromos.length === 0 ||
        (item.promoTag && selectedPromos.includes(item.promoTag));
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = item.price <= maxPrice;

      return (
        matchesCat &&
        matchesSub &&
        matchesPromo &&
        matchesSearch &&
        matchesPrice
      );
    });
  }, [
    products,
    selectedCategory,
    selectedSubCategory,
    selectedPromos,
    searchQuery,
    maxPrice,
  ]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  return (
    <div className="dashboard-wrapper">
      <Navbar
        userName={userName}
        userAvatar={userAvatar}
        cartCount={totalCartItems}
        onLogout={onLogout}
        onOpenCart={() => onNavigate('/cart')}
        onOpenProfile={() => onNavigate('/profile')}
        onGoHome={() => onNavigate('/dashboard')}
      />

      <div className={`dashboard-layout ${!isCollapsed ? 'sidebar-expanded' : ''}`}>
        <AppSidebar
          currentPath={currentPath}
          onNavigate={onNavigate}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
          userOrdersCount={userOrders.length}
          cartCount={totalCartItems}
          totalProductsCount={products.length}
          categoryCounts={categoryCounts}
          selectedCategory={selectedCategory}
          selectedSubCategory={selectedSubCategory}
          selectedPromos={selectedPromos}
          searchQuery={searchQuery}
          maxPrice={maxPrice}
          onCategoryClick={handleCategoryClick}
          onSubCategoryClick={handleSubCategoryClick}
          onSelectAllCategories={() => {
            setSelectedCategory('All');
            setSelectedSubCategory('All');
            setVisibleCount(PAGE_SIZE);
          }}
          onTogglePromoTag={togglePromoTag}
          onSearchChange={(q) => {
            setSearchQuery(q);
            setVisibleCount(PAGE_SIZE);
          }}
          onMaxPriceChange={(priceVal) => {
            setMaxPrice(priceVal);
            setVisibleCount(PAGE_SIZE);
          }}
          onResetFilters={resetFilters}
        />

        <main className="main-content">
          {currentPath === '/cart' ? (
            <CartPage
              cartItems={cart}
              products={products}
              userAddress={userAddress}
              onIncreaseQty={increaseQty}
              onDecreaseQty={decreaseQty}
              onRemoveItem={removeFromCart}
              onClearCart={clearCart}
              onBackToShop={() => onNavigate('/dashboard')}
              onCheckout={handleCheckoutFromCart}
            />
          ) : currentPath === '/profile' ? (
            <div style={{ maxWidth: '760px', margin: '12px auto', textAlign: 'left', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <div>
                  <h1 style={{ margin: '0 0 4px', fontSize: '25px', color: '#1b2433' }}>Profile Page</h1>
                  <p style={{ margin: 0, fontSize: '14px', color: '#5d6676' }}>URL: /profile</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => onNavigate('/profile/edit')}
                    style={{
                      padding: '10px 16px',
                      background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '9px',
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Edit Profile
                  </button>
                  <button
                    type="button"
                    className="back-shop-btn"
                    onClick={() => onNavigate('/dashboard')}
                  >
                    ← Back to Dashboard
                  </button>
                </div>
              </div>

              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 4px 18px rgba(15,23,42,0.06)',
                  borderTop: '4px solid #7c3aed',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt={userName}
                      style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid #2563eb',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '26px',
                      }}
                    >
                      {(userName || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div>
                    <h2 style={{ margin: '0 0 4px', fontSize: '20px', color: '#1b2433' }}>
                      {userName || 'User'}
                    </h2>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                      Role: <strong style={{ textTransform: 'capitalize', color: '#2563eb' }}>{currentUserRole}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', fontSize: '14px', color: '#374151' }}>
                  <div><strong>Email:</strong> {currentUserEmail}</div>
                  <div><strong>Total Orders:</strong> {userOrders.length}</div>
                  <div><strong>Total Spent:</strong> ₹{totalSpent.toLocaleString()}</div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <strong>Saved Address:</strong>{' '}
                    {userAddress || <span style={{ color: '#64748b' }}>Not added yet</span>}
                  </div>
                </div>
              </div>
            </div>
          ) : currentPath === '/profile/edit' ? (
            <div style={{ maxWidth: '640px', margin: '12px auto', textAlign: 'left', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <div>
                  <h1 style={{ margin: '0 0 4px', fontSize: '25px', color: '#1b2433' }}>Edit Profile</h1>
                  <p style={{ margin: 0, fontSize: '14px', color: '#5d6676' }}>URL: /profile/edit</p>
                </div>
                <button
                  type="button"
                  className="back-shop-btn"
                  onClick={() => onNavigate('/profile')}
                >
                  ← Back to Profile
                </button>
              </div>

              <form
                onSubmit={handleSaveEditProfilePage}
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 4px 18px rgba(15,23,42,0.06)',
                  borderTop: '4px solid #2563eb',
                }}
              >
                {profileError && (
                  <div
                    role="alert"
                    style={{
                      background: '#fee2e2',
                      color: '#b91c1c',
                      border: '1px solid #fca5a5',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      fontSize: '13.5px',
                      fontWeight: 600,
                      marginBottom: '14px',
                    }}
                  >
                    {profileError}
                  </div>
                )}

                {profileSuccess && (
                  <div
                    role="status"
                    style={{
                      background: '#dcfce7',
                      color: '#166534',
                      border: '1px solid #86efac',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      fontSize: '13.5px',
                      fontWeight: 600,
                      marginBottom: '14px',
                    }}
                  >
                    {profileSuccess}
                  </div>
                )}

                <div style={{ marginBottom: '14px' }}>
                  <label
                    htmlFor="edit-page-avatar"
                    style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}
                  >
                    Profile Image (Max 2MB)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <input
                      id="edit-page-avatar"
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                      style={{ fontSize: '12.5px', maxWidth: '100%' }}
                    />
                    {profileAvatar && (
                      <button
                        type="button"
                        onClick={() => {
                          setProfileAvatar('');
                          setProfileSuccess('');
                        }}
                        style={{
                          padding: '5px 10px',
                          background: '#fee2e2',
                          color: '#b91c1c',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label
                    htmlFor="edit-page-name"
                    style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}
                  >
                    Full Name
                  </label>
                  <input
                    id="edit-page-name"
                    type="text"
                    value={profileName}
                    onChange={(e) => {
                      setProfileName(e.target.value);
                      setProfileSuccess('');
                    }}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px 12px',
                      borderRadius: '9px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '14px',
                      color: '#0f172a',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label
                    htmlFor="edit-page-address"
                    style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}
                  >
                    Default Address
                  </label>
                  <textarea
                    id="edit-page-address"
                    rows={3}
                    value={profileAddress}
                    onChange={(e) => {
                      setProfileAddress(e.target.value);
                      setProfileSuccess('');
                    }}
                    placeholder="House/Flat no., Street, City, State, PIN Code"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px 12px',
                      borderRadius: '9px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      color: '#0f172a',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '11px 20px',
                    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Save Profile Changes
                </button>
              </form>
            </div>
          ) : currentPath === '/orders' ? (
            <div style={{ maxWidth: '1050px', margin: '12px auto', textAlign: 'left', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
                <h1>My Order ({userName || 'User'})</h1>
                <button
                  type="button"
                  className="back-shop-btn"
                  onClick={() => onNavigate('/dashboard')}
                >
                  ← Back to Dashboard
                </button>
              </div>

              {userOrders.length === 0 ? (
                <div className="cart-empty">
                  <h2>No orders placed yet</h2>
                  <p>Your completed purchases will appear here.</p>
                  <button
                    type="button"
                    onClick={() => onNavigate('/dashboard')}
                    style={{
                      padding: '11px 24px',
                      background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '15px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {userOrders.map((order) => (
                    <div
                      key={order.id}
                      onClick={() => onNavigate(`/orders/${encodeURIComponent(order.id)}`)}
                      style={{
                        background: '#fff',
                        padding: '20px',
                        borderRadius: '14px',
                        boxShadow: '0 4px 16px rgba(15,23,42,0.06)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '16px',
                        borderLeft: '5px solid #7c3aed',
                      }}
                    >
                      <div>
                        <h3 style={{ margin: '0 0 4px', color: '#1b2433' }}>Order ID: {order.id}</h3>
                        <p style={{ margin: '0', color: '#5d6676', fontSize: '13px' }}>Placed on: {order.date}</p>
                        <p style={{ margin: '6px 0 0', color: '#4b5563', fontSize: '14px' }}>
                          Items: <strong>{order.items.reduce((s, i) => s + i.quantity, 0)}</strong> • Payment:{' '}
                          <strong>{order.payment?.paymentStatus || 'Pending Verification'}</strong>
                        </p>
                        {order.deliveryAddress && (
                          <p style={{ margin: '6px 0 0', color: '#334155', fontSize: '13px' }}>
                            <strong>Address:</strong> {order.deliveryAddress}
                          </p>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                        <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>
                          ₹{order.totalAmount.toLocaleString()}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOrderToDelete(order);
                            }}
                            style={{
                              padding: '6px 12px',
                              background: '#fee2e2',
                              color: '#b91c1c',
                              border: '1px solid rgba(220, 38, 38, 0.25)',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            Delete
                          </button>

                          <span style={{ fontSize: '13px', color: '#2563eb', fontWeight: 600 }}>
                            View Details →
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : currentPath.startsWith('/orders/') && orderDetailMatch ? (
            <div style={{ maxWidth: '1050px', margin: '12px auto', textAlign: 'left', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
                <div>
                  <h1 style={{ margin: '0 0 4px' }}>Order Details: {orderDetailMatch.id}</h1>
                  <span style={{ color: '#5d6676', fontSize: '14px' }}>Placed on {orderDetailMatch.date}</span>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setOrderToDelete(orderDetailMatch)}
                    style={{
                      padding: '10px 16px',
                      background: '#fee2e2',
                      color: '#b91c1c',
                      border: '1.5px solid #fca5a5',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Delete Order
                  </button>
                  <button
                    type="button"
                    className="back-shop-btn"
                    onClick={() => onNavigate('/orders')}
                  >
                    ← Back to My Order
                  </button>
                </div>
              </div>

              <div style={{ background: '#fff', borderRadius: '14px', padding: '24px', boxShadow: '0 4px 16px rgba(15,23,42,0.06)', marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 12px', color: '#111827', fontSize: '16px' }}>Payment &amp; Delivery Info</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px', fontSize: '14px', color: '#374151' }}>
                  <div><strong>Method:</strong> {orderDetailMatch.payment?.method || 'Online Payment'}</div>
                  <div>
                    <strong>Payment Entry:</strong>{' '}
                    <select
                      value={orderDetailMatch.payment?.paymentStatus || 'Pending Verification'}
                      onChange={(e) =>
                        handleUpdateOrderPaymentStatus(orderDetailMatch.id, e.target.value)
                      }
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontWeight: 600,
                        marginLeft: '4px',
                        background: '#ffffff',
                        color: '#0f172a',
                      }}
                    >
                      <option value="Pending Verification">Pending Verification</option>
                      <option value="Paid - Confirmed">Paid - Confirmed</option>
                      <option value="Not Paid / Failed">Not Paid / Failed</option>
                    </select>
                  </div>
                  <div><strong>Transaction ID:</strong> {orderDetailMatch.payment?.paymentId || 'N/A'}</div>
                  {orderDetailMatch.payment?.merchantUpiId && (
                    <div><strong>Merchant UPI:</strong> {orderDetailMatch.payment.merchantUpiId}</div>
                  )}
                  {orderDetailMatch.payment?.upiOrderRef && (
                    <div><strong>QR Order Ref:</strong> {orderDetailMatch.payment.upiOrderRef}</div>
                  )}
                  {orderDetailMatch.payment?.utrNumber && (
                    <div><strong>UTR Ref:</strong> {orderDetailMatch.payment.utrNumber}</div>
                  )}
                </div>

                <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '14px', color: '#111827' }}>
                      Delivery Address (Order {orderDetailMatch.id}):
                    </strong>
                    {!isEditingOrderAddress && (
                      <button
                        type="button"
                        onClick={() => {
                          setOrderAddressDraft(orderDetailMatch.deliveryAddress || '');
                          setOrderAddressError('');
                          setIsEditingOrderAddress(true);
                        }}
                        style={{
                          padding: '6px 12px',
                          background: '#eef2ff',
                          color: '#2563eb',
                          border: '1px solid rgba(37, 99, 235, 0.3)',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Update Address
                      </button>
                    )}
                  </div>

                  {isEditingOrderAddress ? (
                    <div>
                      {orderAddressError && (
                        <div
                          role="alert"
                          style={{
                            background: '#fee2e2',
                            color: '#b91c1c',
                            border: '1px solid #fca5a5',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: 600,
                            marginBottom: '8px',
                          }}
                        >
                          {orderAddressError}
                        </div>
                      )}
                      <textarea
                        rows={2}
                        value={orderAddressDraft}
                        onChange={(e) => setOrderAddressDraft(e.target.value)}
                        placeholder="Enter specific delivery address for this order..."
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                          padding: '10px 12px',
                          borderRadius: '9px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '14px',
                          fontFamily: 'inherit',
                          color: '#0f172a',
                          marginBottom: '10px',
                          resize: 'vertical',
                        }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setOrderAddressDraft(orderDetailMatch.deliveryAddress || '');
                            setOrderAddressError('');
                            setIsEditingOrderAddress(false);
                          }}
                          style={{
                            padding: '7px 14px',
                            background: '#f1f5f9',
                            color: '#334155',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveSpecificOrderAddress}
                          style={{
                            padding: '7px 16px',
                            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Save Address
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p style={{ margin: 0, fontSize: '14px', color: '#374151', lineHeight: 1.5 }}>
                      {orderDetailMatch.deliveryAddress || (
                        <span style={{ color: '#64748b' }}>
                          No specific address set for this order. Click &ldquo;Update Address&rdquo; to add one.
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>

              <div style={{ background: '#fff', borderRadius: '14px', padding: '24px', boxShadow: '0 4px 16px rgba(15,23,42,0.06)' }}>
                <h3 style={{ margin: '0 0 16px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>Purchased Items</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {orderDetailMatch.items.map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <img src={item.image} alt={item.title} style={{ width: '70px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                        <div>
                          <h4 style={{ margin: '0 0 4px', fontSize: '15px', color: '#1b2433' }}>{item.title}</h4>
                          <span style={{ fontSize: '13px', color: '#4b5563' }}>Qty: {item.quantity} × ₹{item.price.toLocaleString()}</span>
                        </div>
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '2px solid #e5e7eb' }}>
                  <span style={{ fontSize: '18px', fontWeight: 700 }}>Total Amount Paid</span>
                  <span style={{ fontSize: '22px', fontWeight: 700, color: '#16a34a' }}>₹{orderDetailMatch.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="content-header">
                <div>
                  <h1>Explore Our Products</h1>
                  <div className="results-meta">
                    Showing <strong>{filteredProducts.length}</strong> products
                    {selectedCategory !== 'All' ? ' in ' + selectedCategory : ''}
                    {selectedSubCategory !== 'All'
                      ? ' > ' + selectedSubCategory
                      : ''}
                  </div>
                </div>
              </div>

              {visibleProducts.length > 0 ? (
                <>
                  <div className="product-grid">
                    {visibleProducts.map((item) => (
                      <ProductCard
                        key={item.id}
                        product={item}
                        addToCart={addToCart}
                      />
                    ))}
                  </div>

                  {visibleCount < filteredProducts.length && (
                    <div className="load-more-wrap">
                      <button
                        type="button"
                        className="load-more-btn"
                        onClick={() =>
                          setVisibleCount((prev) => prev + PAGE_SIZE)
                        }
                      >
                        Load More ({filteredProducts.length - visibleCount}{' '}
                        remaining)
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="empty-state">
                  <h3>No products found</h3>
                  <p>
                    Try clearing some filters or increasing your maximum price
                    range.
                  </p>
                  <button
                    type="button"
                    className="load-more-btn"
                    onClick={resetFilters}
                    style={{ marginTop: '12px' }}
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {orderToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-order-modal-title"
          onClick={() => setOrderToDelete(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(7, 13, 31, 0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 1400,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '420px',
              background: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 24px 60px rgba(3, 7, 18, 0.35)',
              textAlign: 'left',
              borderTop: '4px solid #dc2626',
            }}
          >
            <h2 id="delete-order-modal-title" style={{ margin: '0 0 8px', fontSize: '19px', color: '#1b2433' }}>
              Delete Order?
            </h2>
            <p style={{ margin: '0 0 20px', fontSize: '14px', color: '#4b5563', lineHeight: 1.5 }}>
              Are you sure you want to delete order <strong>{orderToDelete.id}</strong> (₹{orderToDelete.totalAmount.toLocaleString()})? This action cannot be undone.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                style={{
                  padding: '10px 16px',
                  background: '#f1f5f9',
                  color: '#334155',
                  border: 'none',
                  borderRadius: '9px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteOrder}
                style={{
                  padding: '10px 18px',
                  background: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '9px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Delete Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}