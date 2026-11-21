import React, { useState, useMemo } from 'react';
import UpiQrPaymentBox from '../UpiQrPaymentBox';

const MERCHANT_UPI_ID = 'ninamamanish45@okicici';

export default function CartPage({
    cartItems = [],
    products = [],
    userAddress = '',
    onIncreaseQty,
    onDecreaseQty,
    onRemoveItem,
    onClearCart,
    onBackToShop,
    onCheckout,
}) {
    const [deliveryAddress, setDeliveryAddress] = useState(userAddress || '');
    const [addressError, setAddressError] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('UPI');
    const [upiPaymentStatus, setUpiPaymentStatus] = useState('Pending Verification');
    const [upiUtrNumber, setUpiUtrNumber] = useState('');
    const [orderPlacedSummary, setOrderPlacedSummary] = useState(null);

    const subtotal = useMemo(
        () =>
            cartItems.reduce(
                (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
                0
            ),
        [cartItems]
    );

    const deliveryFee = subtotal === 0 || subtotal >= 999 ? 0 : 49;
    const grandTotal = subtotal + deliveryFee;

    const uniqueOrderRef = useMemo(() => {
        return `UPI-${Date.now().toString().slice(-8)}-${Math.random()
            .toString(36)
            .substring(2, 6)
            .toUpperCase()}`;
    }, [cartItems.length, grandTotal]);

    const getMaxStockForItem = (item) => {
        const match = products.find((p) => p.id === item.id);
        const raw = match ? match.stock : item.stock;
        return typeof raw === 'number' && Number.isFinite(raw) ? Math.max(0, raw) : 20;
    };

    const handlePlaceOrder = (e) => {
        e.preventDefault();
        setAddressError('');

        if (!cartItems.length) return;

        const trimmedAddress = deliveryAddress.trim();
        if (!trimmedAddress) {
            setAddressError('Please enter a delivery address before placing the order.');
            return;
        }

        const paymentDetails =
            paymentMethod === 'UPI'
                ? {
                    method: 'UPI QR Payment',
                    merchantUpiId: MERCHANT_UPI_ID,
                    upiOrderRef: uniqueOrderRef,
                    paymentStatus: upiPaymentStatus,
                    utrNumber: upiUtrNumber.trim() || null,
                    paymentId: upiUtrNumber.trim() || uniqueOrderRef,
                    deliveryAddress: trimmedAddress,
                }
                : {
                    method: paymentMethod,
                    paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending (COD)' : 'Success',
                    paymentId: 'PAY-' + Date.now(),
                    deliveryAddress: trimmedAddress,
                };

        if (onCheckout) {
            onCheckout(cartItems, grandTotal, paymentDetails);
        }

        setOrderPlacedSummary({
            items: cartItems,
            grandTotal,
            deliveryAddress: trimmedAddress,
            payment: paymentDetails,
        });

        if (onClearCart) {
            onClearCart();
        }
        setUpiUtrNumber('');
        setUpiPaymentStatus('Pending Verification');
    };

    if (orderPlacedSummary) {
        return (
            <div style={{ maxWidth: '760px', margin: '12px auto', textAlign: 'left', width: '100%' }}>
                <div
                    style={{
                        background: '#ffffff',
                        borderRadius: '16px',
                        padding: '28px',
                        boxShadow: '0 4px 18px rgba(15,23,42,0.06)',
                        borderTop: '4px solid #16a34a',
                    }}
                >
                    <h2 style={{ margin: '0 0 8px', color: '#166534', fontSize: '22px' }}>
                        Order Recorded
                    </h2>
                    <p style={{ margin: '0 0 16px', color: '#475569', fontSize: '14px' }}>
                        Your order has been added to <strong>My Order</strong> with payment status:{' '}
                        <strong>{orderPlacedSummary.payment?.paymentStatus}</strong>.
                    </p>

                    <div style={{ fontSize: '14px', color: '#1e293b', marginBottom: '18px', lineHeight: 1.6 }}>
                        <div><strong>Total Amount:</strong> ₹{orderPlacedSummary.grandTotal.toLocaleString()}</div>
                        <div><strong>Payment Method:</strong> {orderPlacedSummary.payment?.method}</div>
                        {orderPlacedSummary.payment?.merchantUpiId && (
                            <div><strong>Payee UPI ID:</strong> {orderPlacedSummary.payment.merchantUpiId}</div>
                        )}
                        {orderPlacedSummary.payment?.upiOrderRef && (
                            <div><strong>QR Order Ref:</strong> {orderPlacedSummary.payment.upiOrderRef}</div>
                        )}
                        {orderPlacedSummary.payment?.utrNumber && (
                            <div><strong>UTR Ref:</strong> {orderPlacedSummary.payment.utrNumber}</div>
                        )}
                        <div><strong>Delivery Address:</strong> {orderPlacedSummary.deliveryAddress}</div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button
                            type="button"
                            onClick={() => {
                                setOrderPlacedSummary(null);
                                if (onBackToShop) onBackToShop();
                            }}
                            style={{
                                padding: '10px 18px',
                                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '14px',
                                fontWeight: 700,
                                cursor: 'pointer',
                            }}
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!cartItems.length) {
        return (
            <div style={{ maxWidth: '760px', margin: '24px auto', textAlign: 'left', width: '100%' }}>
                <div className="cart-empty">
                    <h2>Your cart is empty</h2>
                    <p>Add products from the catalog to generate a UPI payment QR or place an order.</p>
                    <button
                        type="button"
                        onClick={onBackToShop}
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
                        Back to Shop
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1080px', margin: '12px auto', textAlign: 'left', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <div>
                    <h1 style={{ margin: '0 0 4px', fontSize: '25px', color: '#1b2433' }}>Cart &amp; Checkout</h1>
                    <p style={{ margin: 0, fontSize: '13.5px', color: '#5d6676' }}>URL: /cart</p>
                </div>
                <button
                    type="button"
                    className="back-shop-btn"
                    onClick={onBackToShop}
                >
                    ← Back to Shop
                </button>
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '22px',
                    alignItems: 'start',
                }}
            >
                {/* Cart Items List */}
                <div
                    style={{
                        background: '#ffffff',
                        borderRadius: '16px',
                        padding: '20px',
                        boxShadow: '0 4px 18px rgba(15,23,42,0.06)',
                    }}
                >
                    <h2 style={{ margin: '0 0 16px', fontSize: '18px', color: '#1b2433' }}>
                        Cart Items ({cartItems.reduce((s, i) => s + i.quantity, 0)})
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {cartItems.map((item) => {
                            const maxStock = getMaxStockForItem(item);
                            const atStockLimit = item.quantity >= maxStock;

                            return (
                                <div
                                    key={item.id}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        gap: '12px',
                                        borderBottom: '1px solid #f1f5f9',
                                        paddingBottom: '12px',
                                        flexWrap: 'wrap',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            style={{ width: '64px', height: '56px', objectFit: 'cover', borderRadius: '8px' }}
                                        />
                                        <div>
                                            <h3 style={{ margin: '0 0 4px', fontSize: '15px', color: '#1b2433' }}>
                                                {item.title}
                                            </h3>
                                            <div style={{ fontSize: '13px', color: '#475569' }}>
                                                ₹{Number(item.price).toLocaleString()} each • Stock: {maxStock}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <button
                                            type="button"
                                            onClick={() => onDecreaseQty(item.id)}
                                            style={{
                                                width: '28px',
                                                height: '28px',
                                                borderRadius: '6px',
                                                border: '1px solid #cbd5e1',
                                                background: '#f8fafc',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            -
                                        </button>
                                        <span style={{ minWidth: '22px', textAlign: 'center', fontWeight: 700 }}>
                                            {item.quantity}
                                        </span>
                                        <button
                                            type="button"
                                            disabled={atStockLimit}
                                            onClick={() => onIncreaseQty(item.id)}
                                            style={{
                                                width: '28px',
                                                height: '28px',
                                                borderRadius: '6px',
                                                border: '1px solid #cbd5e1',
                                                background: atStockLimit ? '#e2e8f0' : '#f8fafc',
                                                fontWeight: 700,
                                                cursor: atStockLimit ? 'not-allowed' : 'pointer',
                                            }}
                                        >
                                            +
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onRemoveItem(item.id)}
                                            style={{
                                                marginLeft: '4px',
                                                padding: '5px 10px',
                                                borderRadius: '7px',
                                                border: '1px solid #fca5a5',
                                                background: '#fee2e2',
                                                color: '#b91c1c',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Delivery & Payment Form */}
                <form
                    onSubmit={handlePlaceOrder}
                    style={{
                        background: '#ffffff',
                        borderRadius: '16px',
                        padding: '22px',
                        boxShadow: '0 4px 18px rgba(15,23,42,0.06)',
                        borderTop: '4px solid #2563eb',
                    }}
                >
                    <h2 style={{ margin: '0 0 14px', fontSize: '18px', color: '#1b2433' }}>
                        Order Summary &amp; Payment
                    </h2>

                    <div style={{ fontSize: '14px', color: '#334155', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span>Subtotal</span>
                            <strong>₹{subtotal.toLocaleString()}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span>Delivery Fee</span>
                            <strong>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</strong>
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                paddingTop: '8px',
                                borderTop: '1px solid #e2e8f0',
                                fontSize: '17px',
                                fontWeight: 800,
                                color: '#0f172a',
                            }}
                        >
                            <span>Total Payable</span>
                            <span>₹{grandTotal.toLocaleString()}</span>
                        </div>
                    </div>

                    {addressError && (
                        <div
                            role="alert"
                            style={{
                                background: '#fee2e2',
                                color: '#b91c1c',
                                border: '1px solid #fca5a5',
                                padding: '9px 12px',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: 600,
                                marginBottom: '12px',
                            }}
                        >
                            {addressError}
                        </div>
                    )}

                    <div style={{ marginBottom: '14px' }}>
                        <label
                            htmlFor="cart-delivery-address"
                            style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}
                        >
                            Delivery Address
                        </label>
                        <textarea
                            id="cart-delivery-address"
                            rows={2}
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            placeholder="Enter complete delivery address..."
                            style={{
                                width: '100%',
                                boxSizing: 'border-box',
                                padding: '9px 12px',
                                borderRadius: '9px',
                                border: '1.5px solid #cbd5e1',
                                fontSize: '13.5px',
                                fontFamily: 'inherit',
                                resize: 'vertical',
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                        <label
                            htmlFor="payment-method-select"
                            style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}
                        >
                            Payment Method
                        </label>
                        <select
                            id="payment-method-select"
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '9px 12px',
                                borderRadius: '9px',
                                border: '1.5px solid #cbd5e1',
                                fontSize: '14px',
                                fontWeight: 600,
                                background: '#ffffff',
                                color: '#0f172a',
                            }}
                        >
                            <option value="UPI">UPI (Scan QR Code)</option>
                            <option value="Cash on Delivery">Cash on Delivery</option>
                        </select>
                    </div>

                    {paymentMethod === 'UPI' && (
                        <UpiQrPaymentBox
                            amount={grandTotal}
                            orderRef={uniqueOrderRef}
                            paymentStatus={upiPaymentStatus}
                            utrNumber={upiUtrNumber}
                            onStatusChange={setUpiPaymentStatus}
                            onUtrChange={setUpiUtrNumber}
                        />
                    )}

                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            marginTop: '16px',
                            padding: '12px 18px',
                            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '15px',
                            fontWeight: 700,
                            cursor: 'pointer',
                        }}
                    >
                        {paymentMethod === 'UPI'
                            ? `Record Order & Payment (₹${grandTotal.toLocaleString()})`
                            : `Place Order (₹${grandTotal.toLocaleString()})`}
                    </button>
                </form>
            </div>
        </div>
    );
}