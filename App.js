import React, { useState, useEffect, useCallback } from 'react';
import Login from './data/Login';
import Register from '../ecomerce-store/src/components/Register';
import Dashboard from '../ecomerce-store/src/components/Dashboard';
import AdminPanel from './AdminPanel';
import { products as initialSeedProducts } from './products';

const DEFAULT_STOCK_QTY = 20;

const buildInitialCatalog = () => {
  try {
    const saved = localStorage.getItem('storeCatalogProducts');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item) => ({
          ...item,
          stock:
            typeof item.stock === 'number' && Number.isFinite(item.stock)
              ? Math.max(0, Math.floor(item.stock))
              : DEFAULT_STOCK_QTY,
        }));
      }
    }
  } catch {
    // ignore storage parse errors
  }

  return initialSeedProducts.map((item) => ({
    ...item,
    stock:
      typeof item.stock === 'number' && Number.isFinite(item.stock)
        ? Math.max(0, Math.floor(item.stock))
        : DEFAULT_STOCK_QTY,
  }));
};

const normalizePath = (pathname) => {
  if (!pathname || pathname === '/') return '/dashboard';
  return pathname.length > 1 && pathname.endsWith('/')
    ? pathname.slice(0, -1)
    : pathname;
};

export default function App() {
  const [currentPath, setCurrentPath] = useState(() =>
    normalizePath(window.location.pathname)
  );

  const [isLoggedIn, setIsLoggedIn] = useState(
    () => sessionStorage.getItem('isLoggedIn') === 'true'
  );
  const [userRole, setUserRole] = useState(
    () => sessionStorage.getItem('currentUserRole') || 'user'
  );
  const [userName, setUserName] = useState(
    () => sessionStorage.getItem('currentUserName') || 'User'
  );
  const [userAddress, setUserAddress] = useState(
    () => sessionStorage.getItem('currentUserAddress') || ''
  );
  const [userAvatar, setUserAvatar] = useState(
    () => sessionStorage.getItem('currentUserAvatar') || ''
  );

  const [catalogProducts, setCatalogProducts] = useState(buildInitialCatalog);

  const navigate = useCallback((to, { replace = false } = {}) => {
    const target = normalizePath(to);
    if (window.location.pathname !== target) {
      if (replace) {
        window.history.replaceState({}, '', target);
      } else {
        window.history.pushState({}, '', target);
      }
    }
    setCurrentPath(target);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(normalizePath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('storeCatalogProducts', JSON.stringify(catalogProducts));
    } catch {
      // ignore storage quota errors
    }
  }, [catalogProducts]);

  // Keep URL aligned with auth & role state
  useEffect(() => {
    if (!isLoggedIn) {
      if (currentPath !== '/login' && currentPath !== '/register') {
        navigate('/login', { replace: true });
      }
      return;
    }

    if (userRole === 'admin') {
      if (currentPath !== '/admin') {
        navigate('/admin', { replace: true });
      }
      return;
    }

    if (currentPath === '/login' || currentPath === '/register' || currentPath === '/admin') {
      navigate('/dashboard', { replace: true });
    }
  }, [isLoggedIn, userRole, currentPath, navigate]);

  const handleLogin = (payload) => {
    const isObject = typeof payload === 'object' && payload !== null;
    const role = (isObject ? payload.role : 'user') || 'user';
    const displayName =
      (isObject ? payload.name : payload) || (role === 'admin' ? 'Admin' : 'User');
    const address = isObject ? payload.address || '' : '';
    const avatar = isObject ? payload.avatar || '' : '';

    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('currentUserRole', role);
    sessionStorage.setItem('currentUserName', displayName);
    sessionStorage.setItem('currentUserAddress', address);
    sessionStorage.setItem('currentUserAvatar', avatar);

    setUserRole(role);
    setUserName(displayName);
    setUserAddress(address);
    setUserAvatar(avatar);
    setIsLoggedIn(true);

    navigate(role === 'admin' ? '/admin' : '/dashboard', { replace: true });
  };

  const handleUpdateProfile = ({ name, address, avatar }) => {
    const nextName = (name ?? userName) || 'User';
    const nextAddress = address ?? '';
    const nextAvatar = avatar ?? '';

    sessionStorage.setItem('currentUserName', nextName);
    sessionStorage.setItem('currentUserAddress', nextAddress);
    sessionStorage.setItem('currentUserAvatar', nextAvatar);

    setUserName(nextName);
    setUserAddress(nextAddress);
    setUserAvatar(nextAvatar);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('currentUserRole');
    sessionStorage.removeItem('currentUserName');
    sessionStorage.removeItem('currentUserEmail');
    sessionStorage.removeItem('currentUserAddress');
    sessionStorage.removeItem('currentUserAvatar');
    setUserRole('user');
    setUserName('');
    setUserAddress('');
    setUserAvatar('');
    setIsLoggedIn(false);
    navigate('/login', { replace: true });
  };

  const handleAddProduct = (newProduct) => {
    setCatalogProducts((prev) => [newProduct, ...prev]);
  };

  const handleUpdateStock = (productId, nextStock) => {
    setCatalogProducts((prev) =>
      prev.map((item) =>
        item.id === productId
          ? { ...item, stock: Math.max(0, Math.floor(Number(nextStock) || 0)) }
          : item
      )
    );
  };

  const handleDeductStockForOrder = (purchasedItems) => {
    if (!Array.isArray(purchasedItems) || purchasedItems.length === 0) return;

    const qtyById = new Map();
    purchasedItems.forEach((pItem) => {
      const current = qtyById.get(pItem.id) || 0;
      qtyById.set(pItem.id, current + (Number(pItem.quantity) || 0));
    });

    setCatalogProducts((prev) =>
      prev.map((prod) => {
        const boughtQty = qtyById.get(prod.id) || 0;
        if (!boughtQty) return prod;
        const available = Math.max(0, Number(prod.stock ?? 0));
        return {
          ...prod,
          stock: Math.max(0, available - boughtQty),
        };
      })
    );
  };

  const handleRestoreStockForOrder = (orderItems) => {
    if (!Array.isArray(orderItems) || orderItems.length === 0) return;

    const qtyById = new Map();
    orderItems.forEach((item) => {
      const current = qtyById.get(item.id) || 0;
      qtyById.set(
        item.id,
        current + Math.max(0, Math.floor(Number(item.quantity) || 0))
      );
    });

    setCatalogProducts((prev) =>
      prev.map((prod) => {
        const restoreQty = qtyById.get(prod.id) || 0;
        if (!restoreQty) return prod;
        const available = Math.max(0, Math.floor(Number(prod.stock ?? 0)));
        return {
          ...prod,
          stock: available + restoreQty,
        };
      })
    );
  };

  if (!isLoggedIn) {
    if (currentPath === '/register') {
      return (
        <Register
          onSwitchToLogin={() => navigate('/login')}
          onSwitchToRegister={() => navigate('/register')}
        />
      );
    }
    return (
      <Login
        onLogin={handleLogin}
        onSwitchToRegister={() => navigate('/register')}
        onSwitchToLogin={() => navigate('/login')}
      />
    );
  }

  if (userRole === 'admin') {
    return (
      <AdminPanel
        userName={userName}
        userAvatar={userAvatar}
        products={catalogProducts}
        onAddProduct={handleAddProduct}
        onUpdateStock={handleUpdateStock}
        onLogout={handleLogout}
        onNavigate={navigate}
      />
    );
  }

  return (
    <Dashboard
      currentPath={currentPath}
      onNavigate={navigate}
      userName={userName}
      userAddress={userAddress}
      userAvatar={userAvatar}
      products={catalogProducts}
      onDeductStock={handleDeductStockForOrder}
      onRestoreStockForOrder={handleRestoreStockForOrder}
      onUpdateProfile={handleUpdateProfile}
      onLogout={handleLogout}
    />
  );
}