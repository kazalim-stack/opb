import React, {
    useEffect,
    useState,
} from 'react';

import {
    createRoot,
} from 'react-dom/client';

import '../css/app.css';

import api from './api';

import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminPosts from './pages/AdminPosts';

function App() {
    const [user, setUser] = useState(null);

    const [loading, setLoading] =
        useState(true);

    const [showRegister, setShowRegister] =
        useState(false);

    const [adminPage, setAdminPage] =
        useState('dashboard');

    const [adminViewingFeed, setAdminViewingFeed] =
        useState(false);

    useEffect(() => {
        const checkAuthentication =
            async () => {
                try {
                    const data =
                        await api('/api/me');

                    setUser(data.user);
                } catch {
                    setUser(null);
                } finally {
                    setLoading(false);
                }
            };

        checkAuthentication();
    }, []);

    const updateCsrfToken = (token) => {
        if (!token) {
            return;
        }

        const csrfMeta =
            document.querySelector(
                'meta[name="csrf-token"]'
            );

        if (csrfMeta) {
            csrfMeta.setAttribute(
                'content',
                token
            );
        }
    };

    const handleLogin = (
        loggedInUser,
        csrfToken
    ) => {
        updateCsrfToken(csrfToken);

        setUser(loggedInUser);

        setShowRegister(false);

        setAdminPage('dashboard');

        setAdminViewingFeed(false);
    };

    const handleLogout = async () => {
        try {
            const data =
                await api('/api/logout', {
                    method: 'POST',
                });

            updateCsrfToken(
                data.csrf_token
            );

            setUser(null);

            setAdminPage('dashboard');

            setAdminViewingFeed(false);
        } catch (error) {
            console.error(
                'Logout failed:',
                error
            );
        }
    };

    const handleRegistrationSuccess =
        () => {
            setShowRegister(false);
        };

    if (loading) {
        return (
            <div className="app-loading">
                <div className="app-loading-spinner" />

                <span>
                    Loading OpenBook...
                </span>
            </div>
        );
    }

    if (!user) {
        if (showRegister) {
            return (
                <Register
                    onRegisterSuccess={
                        handleRegistrationSuccess
                    }
                    onBackToLogin={() =>
                        setShowRegister(
                            false
                        )
                    }
                />
            );
        }

        return (
            <Login
                onLogin={handleLogin}
                onShowRegister={() =>
                    setShowRegister(
                        true
                    )
                }
            />
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Admin
    |--------------------------------------------------------------------------
    */

    if (user.role === 'admin') {
        if (adminViewingFeed) {
            return (
                <div className="admin-feed-page">
                    <header className="admin-feed-header">
                        <div className="admin-feed-brand">
                            <div className="admin-feed-brand-mark">
                                O
                            </div>

                            <div>
                                <h1>
                                    OpenBook
                                </h1>

                                <p>
                                    Logged in as{' '}
                                    <strong>
                                        {
                                            user.username
                                        }
                                    </strong>
                                </p>
                            </div>
                        </div>

                        <div className="admin-feed-actions">
                            <button
                                type="button"
                                className="admin-feed-back-button"
                                onClick={() =>
                                    setAdminViewingFeed(
                                        false
                                    )
                                }
                            >
                                <span>
                                    ←
                                </span>

                                Back to Admin Dashboard
                            </button>

                            <button
                                type="button"
                                className="admin-feed-logout-button"
                                onClick={
                                    handleLogout
                                }
                            >
                                Logout
                            </button>
                        </div>
                    </header>

                    <div className="admin-feed-divider" />

                    <Feed user={user} />
                </div>
            );
        }

        if (adminPage === 'users') {
            return (
                <AdminUsers
                    currentUser={user}
                    onBack={() =>
                        setAdminPage(
                            'dashboard'
                        )
                    }
                />
            );
        }

        if (adminPage === 'posts') {
            return (
                <AdminPosts
                    onBack={() =>
                        setAdminPage(
                            'dashboard'
                        )
                    }
                />
            );
        }

        return (
            <AdminDashboard
                user={user}
                onLogout={handleLogout}
                onManageUsers={() =>
                    setAdminPage(
                        'users'
                    )
                }
                onManagePosts={() =>
                    setAdminPage(
                        'posts'
                    )
                }
                onViewFeed={() =>
                    setAdminViewingFeed(
                        true
                    )
                }
            />
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Regular User
    |--------------------------------------------------------------------------
    */

    return (
        <div className="user-feed-page">
            <header className="user-feed-header">
                <div className="user-feed-brand">
                    <div className="user-feed-brand-mark">
                        O
                    </div>

                    <div>
                        <h1>
                            OpenBook
                        </h1>

                        <p>
                            Logged in as{' '}
                            <strong>
                                {user.username}
                            </strong>
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    className="user-feed-logout-button"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </header>

            <div className="user-feed-divider" />

            <Feed user={user} />
        </div>
    );
}

createRoot(
    document.getElementById('app')
).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);