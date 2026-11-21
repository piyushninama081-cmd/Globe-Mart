import React, { useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const MERCHANT_UPI_ID = 'ninamamanish45@okicici';
const MERCHANT_NAME = 'ShopSphere';

export default function UpiQrPaymentBox({
    amount,
    orderRef,
    paymentStatus,
    utrNumber,
    onStatusChange,
    onUtrChange,
}) {
    const numericAmount = Math.max(0, Number(amount) || 0);

    const upiUri = useMemo(() => {
        const params = new URLSearchParams({
            pa: MERCHANT_UPI_ID,
            pn: MERCHANT_NAME,
            am: numericAmount.toFixed(2),
            cu: 'INR',
            tr: orderRef,
            tn: `Order ${orderRef}`,
        });
        return `upi://pay?${params.toString()}`;
    }, [numericAmount, orderRef]);

    const handleCopyUpi = async () => {
        try {
            await navigator.clipboard.writeText(MERCHANT_UPI_ID);
        } catch {
            // ignore clipboard errors
        }
    };

    return (
        <div
            style={{
                marginTop: '14px',
                padding: '16px',
                borderRadius: '12px',
                border: '1.5px solid #cbd5e1',
                background: '#f8fafc',
                textAlign: 'left',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '8px',
                    flexWrap: 'wrap',
                    marginBottom: '12px',
                }}
            >
                <div>
                    <strong style={{ fontSize: '14px', color: '#0f172a' }}>
                        Scan UPI QR to Pay ₹{numericAmount.toLocaleString()}
                    </strong>
                    <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                        Order Ref: <strong>{orderRef}</strong>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleCopyUpi}
                    style={{
                        padding: '5px 10px',
                        borderRadius: '7px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        color: '#1e293b',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                    }}
                >
                    Copy UPI ID
                </button>
            </div>

            <div
                style={{
                    display: 'flex',
                    gap: '18px',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                }}
            >
                <div
                    style={{
                        background: '#ffffff',
                        padding: '12px',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <QRCodeSVG
                        value={upiUri}
                        size={172}
                        level="M"
                        includeMargin={false}
                    />
                </div>

                <div style={{ flex: 1, minWidth: '220px', fontSize: '13px', color: '#334155' }}>
                    <div style={{ marginBottom: '6px' }}>
                        <strong>Payee UPI:</strong> {MERCHANT_UPI_ID}
                    </div>
                    <div style={{ marginBottom: '6px' }}>
                        <strong>Amount:</strong>{' '}
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>
                            ₹{numericAmount.toLocaleString()}
                        </span>
                    </div>
                    <div style={{ marginBottom: '10px', fontSize: '12px', color: '#64748b' }}>
                        Scan this QR from any UPI app on another phone/device. The exact total amount and your UPI ID will appear automatically.
                    </div>

                    <a
                        href={upiUri}
                        style={{
                            display: 'inline-block',
                            padding: '7px 12px',
                            borderRadius: '8px',
                            background: '#eef2ff',
                            color: '#2563eb',
                            fontWeight: 700,
                            fontSize: '12.5px',
                            textDecoration: 'none',
                            marginBottom: '12px',
                        }}
                    >
                        Open UPI App on This Device
                    </a>

                    <div style={{ marginTop: '4px' }}>
                        <label
                            htmlFor="upi-payment-status-select"
                            style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}
                        >
                            Payment Entry Status
                        </label>
                        <select
                            id="upi-payment-status-select"
                            value={paymentStatus}
                            onChange={(e) => onStatusChange(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px 10px',
                                borderRadius: '8px',
                                border: '1.5px solid #cbd5e1',
                                fontSize: '13px',
                                fontWeight: 600,
                                background: '#ffffff',
                                color: '#0f172a',
                                marginBottom: '8px',
                            }}
                        >
                            <option value="Pending Verification">Pending Verification (Not Confirmed Yet)</option>
                            <option value="Paid - Confirmed">Paid (Payment Completed)</option>
                            <option value="Not Paid / Failed">Not Paid / Failed</option>
                        </select>

                        <label
                            htmlFor="upi-utr-input"
                            style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}
                        >
                            UPI UTR / Ref No. (Optional)
                        </label>
                        <input
                            id="upi-utr-input"
                            type="text"
                            value={utrNumber}
                            onChange={(e) => onUtrChange(e.target.value)}
                            placeholder="Enter 12-digit UTR if paid"
                            style={{
                                width: '100%',
                                boxSizing: 'border-box',
                                padding: '8px 10px',
                                borderRadius: '8px',
                                border: '1.5px solid #cbd5e1',
                                fontSize: '13px',
                                background: '#ffffff',
                                color: '#0f172a',
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}