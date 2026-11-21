import React, { useState } from 'react';
import './Login.css';

const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

export default function Register({ onRegisterSuccess, onSwitchToLogin }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [avatar, setAvatar] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleImageChange = (e) => {
        setError('');
        const file = e.target.files && e.target.files[0];
        if (!file) {
            setAvatar('');
            return;
        }

        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image file (JPG, PNG, WEBP).');
            e.target.value = '';
            return;
        }

        if (file.size > MAX_IMAGE_SIZE_BYTES) {
            setError('Image size must be 2MB or smaller.');
            e.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatar(typeof reader.result === 'string' ? reader.result : '');
        };
        reader.readAsDataURL(file);
    };

    const handleRegister = (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!name.trim() || !email.trim() || !address.trim() || !password || !confirmPassword) {
            setError('Please fill in all fields including address.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        try {
            const existingUsers = JSON.parse(localStorage.getItem('storeRegisteredUsers')) || [];
            const userExists = existingUsers.some(
                (u) => u.email.toLowerCase() === email.trim().toLowerCase()
            );

            if (userExists) {
                setError('An account with this email already exists.');
                return;
            }

            const newUser = {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                address: address.trim(),
                avatar: avatar || '',
                password,
            };

            localStorage.setItem(
                'storeRegisteredUsers',
                JSON.stringify([...existingUsers, newUser])
            );

            setSuccess('Account created successfully! Redirecting to login...');
            if (onRegisterSuccess) {
                onRegisterSuccess(newUser);
            }
            setTimeout(() => {
                onSwitchToLogin();
            }, 1500);
        } catch (err) {
            setError('Could not save account. Image may be too large for browser storage.');
        }
    };

    return (
        <div className="login-page">
            <form className="login-card" onSubmit={handleRegister} noValidate>
                <h1 className="login-title">Create Account</h1>
                <p className="login-sub">Sign up to start shopping.</p>

                {error && (
                    <div className="login-error" role="alert" style={{ marginBottom: '12px' }}>
                        {error}
                    </div>
                )}

                {success && (
                    <div
                        style={{
                            background: '#dcfce7',
                            color: '#166534',
                            border: '1px solid #86efac',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            marginBottom: '12px',
                            fontWeight: 600,
                        }}
                        role="alert"
                    >
                        {success}
                    </div>
                )}

                <label htmlFor="name">Full Name</label>
                <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                />

                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                />

                <label htmlFor="address">Address</label>
                <textarea
                    id="address"
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House/Flat no., Street, City, State, PIN Code"
                    style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '11px 14px',
                        background: '#f8fafc',
                        border: '1.5px solid #cbd5e1',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        color: '#0f172a',
                        marginBottom: '16px',
                        resize: 'vertical',
                    }}
                />

                <label htmlFor="avatar">Profile Image (Optional)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    {avatar && (
                        <img
                            src={avatar}
                            alt="Profile preview"
                            style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '2px solid #2563eb',
                                flexShrink: 0,
                            }}
                        />
                    )}
                    <input
                        id="avatar"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{
                            width: '100%',
                            padding: '8px',
                            fontSize: '13px',
                            background: '#f8fafc',
                            border: '1.5px solid #cbd5e1',
                            borderRadius: '12px',
                        }}
                    />
                </div>

                <label htmlFor="password">Password</label>
                <div className="password-row" style={{ marginBottom: '6px' }}>
                    <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                    />
                    <button
                        type="button"
                        className="toggle"
                        onClick={() => setShowPassword((s) => !s)}
                    >
                        {showPassword ? 'Hide' : 'Show'}
                    </button>
                </div>

                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                />

                <button type="submit" className="login-btn">
                    Register
                </button>

                <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: '#5d6676' }}>
                    Already have an account?{' '}
                    <button
                        type="button"
                        onClick={onSwitchToLogin}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#2f5bea',
                            fontWeight: 600,
                            cursor: 'pointer',
                            padding: 0,
                        }}
                    >
                        Sign in
                    </button>
                </div>
            </form>
        </div>
    );
}