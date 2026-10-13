import React, {
    useEffect,
    useState,
} from 'react';

import api from '../api';

function AdminDashboard({
    user,
    onLogout,
    onManageUsers,
    onManagePosts,
    onViewFeed,
}) {
    const [stats, setStats] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState('');

    useEffect(() => {
        const loadDashboard =
            async () => {
                try {
                    const data =
                        await api(
                            '/api/admin/dashboard'
                        );

                    setStats(data);
                } catch (err) {
                    setError(
                        err.message
                    );
                } finally {
                    setLoading(false);
                }
            };

        loadDashboard();
    }, []);

    if (loading) {
        return (
            <main className="admin-page">
                <div className="admin-loading-card">
                    <div className="admin-loading-spinner" />

                    <h2>
                        Loading dashboard
                    </h2>

                    <p>
                        Preparing your OpenBook
                        administration panel...
                    </p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="admin-page">
                <div className="admin-error-card">
                    <div className="admin-error-icon">
                        !
                    </div>

                    <div>
                        <span className="section-label">
                            DASHBOARD ERROR
                        </span>

                        <h2>
                            Unable to load dashboard
                        </h2>

                        <p>
                            {error}
                        </p>
                    </div>
                </div>

                <div className="admin-error-actions">
                    <button
                        type="button"
                        className="admin-secondary-button"
                        onClick={onLogout}
                    >
                        Logout
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="admin-page">
            <header className="admin-header">
                <div className="admin-brand">
                    <div className="admin-brand-mark">
                        O
                    </div>

                    <div>
                        <span className="section-label">
                            ADMINISTRATION
                        </span>

                        <h1>
                            OpenBook Admin
                        </h1>

                        <p>
                            Manage your community
                            from one place.
                        </p>
                    </div>
                </div>

                <div className="admin-account">
                    <div className="admin-account-info">
                        <span>
                            Signed in as
                        </span>

                        <strong>
                            {user.username}
                        </strong>
                    </div>

                    <button
                        type="button"
                        className="admin-logout-button"
                        onClick={onLogout}
                    >
                        Logout
                    </button>
                </div>
            </header>

            <section className="admin-action-panel">
                <div>
                    <span className="section-label">
                        QUICK ACTIONS
                    </span>

                    <h2>
                        Community management
                    </h2>

                    <p>
                        Access the feed or manage
                        users and posts.
                    </p>
                </div>

                <div className="admin-action-buttons">
                    <button
                        type="button"
                        className="admin-action-button admin-action-primary"
                        onClick={onViewFeed}
                    >
                        <span className="admin-action-icon">
                            ↗
                        </span>

                        <span>
                            <strong>
                                View Feed
                            </strong>

                            <small>
                                Open the community
                            </small>
                        </span>
                    </button>

                    <button
                        type="button"
                        className="admin-action-button"
                        onClick={onManageUsers}
                    >
                        <span className="admin-action-icon">
                            U
                        </span>

                        <span>
                            <strong>
                                Manage Users
                            </strong>

                            <small>
                                Accounts and access
                            </small>
                        </span>
                    </button>

                    <button
                        type="button"
                        className="admin-action-button"
                        onClick={onManagePosts}
                    >
                        <span className="admin-action-icon">
                            P
                        </span>

                        <span>
                            <strong>
                                Manage Posts
                            </strong>

                            <small>
                                Content and visibility
                            </small>
                        </span>
                    </button>
                </div>
            </section>

            <section className="admin-section">
                <div className="admin-section-heading">
                    <div>
                        <span className="section-label">
                            OVERVIEW
                        </span>

                        <h2>
                            Community statistics
                        </h2>
                    </div>

                    <span className="admin-status-badge">
                        ● System overview
                    </span>
                </div>

                <div className="admin-stat-grid">
                    <StatCard
                        title="Total Users"
                        value={
                            stats.users.total
                        }
                        detail="Registered accounts"
                        tone="primary"
                    />

                    <StatCard
                        title="Active Users"
                        value={
                            stats.users.active
                        }
                        detail="Currently active"
                        tone="success"
                    />

                    <StatCard
                        title="Banned Users"
                        value={
                            stats.users.banned
                        }
                        detail="Restricted accounts"
                        tone="danger"
                    />

                    <StatCard
                        title="Total Posts"
                        value={
                            stats.posts.total
                        }
                        detail="All published content"
                        tone="primary"
                    />

                    <StatCard
                        title="Visible Posts"
                        value={
                            stats.posts.visible
                        }
                        detail="Currently visible"
                        tone="success"
                    />

                    <StatCard
                        title="Hidden Posts"
                        value={
                            stats.posts.hidden
                        }
                        detail="Currently hidden"
                        tone="warning"
                    />

                    <StatCard
                        title="Total Comments"
                        value={
                            stats.comments.total
                        }
                        detail="Community discussions"
                        tone="primary"
                    />

                    <StatCard
                        title="Total Likes"
                        value={
                            stats.likes.total
                        }
                        detail="Community reactions"
                        tone="primary"
                    />
                </div>
            </section>
        </main>
    );
}

function StatCard({
    title,
    value,
    detail,
    tone = 'primary',
}) {
    return (
        <article
            className={`admin-stat-card admin-stat-${tone}`}
        >
            <div className="admin-stat-top">
                <span className="admin-stat-icon">
                    {tone === 'danger'
                        ? '!'
                        : tone === 'warning'
                            ? '−'
                            : tone === 'success'
                                ? '✓'
                                : '•'}
                </span>

                <span className="admin-stat-label">
                    {title}
                </span>
            </div>

            <strong className="admin-stat-value">
                {value}
            </strong>

            <span className="admin-stat-detail">
                {detail}
            </span>
        </article>
    );
}

export default AdminDashboard;