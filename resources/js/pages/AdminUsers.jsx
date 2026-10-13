import React, {
    useEffect,
    useState,
} from 'react';

import api from '../api';

function AdminUsers({
    currentUser,
    onBack,
}) {
    const [users, setUsers] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState('');

    const [actionLoading, setActionLoading] =
        useState(null);

    const [confirmAction, setConfirmAction] =
        useState(null);

    const loadUsers = async () => {
        try {
            setError('');

            const data = await api(
                '/api/admin/users'
            );

            setUsers(data.users || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const openConfirm = (
        type,
        user
    ) => {
        setConfirmAction({
            type,
            user,
        });
    };

    const closeConfirm = () => {
        if (actionLoading) {
            return;
        }

        setConfirmAction(null);
    };

    const handleBan = async (user) => {
        setActionLoading(
            `ban-${user.id}`
        );

        setError('');

        try {
            const data = await api(
                `/api/admin/users/${user.id}/ban`,
                {
                    method: 'PATCH',
                }
            );

            setUsers((currentUsers) =>
                currentUsers.map(
                    (currentUser) =>
                        currentUser.id === user.id
                            ? data.user
                            : currentUser
                )
            );

            setConfirmAction(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleUnban = async (user) => {
        setActionLoading(
            `unban-${user.id}`
        );

        setError('');

        try {
            const data = await api(
                `/api/admin/users/${user.id}/unban`,
                {
                    method: 'PATCH',
                }
            );

            setUsers((currentUsers) =>
                currentUsers.map(
                    (currentUser) =>
                        currentUser.id === user.id
                            ? data.user
                            : currentUser
                )
            );

            setConfirmAction(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (user) => {
        setActionLoading(
            `delete-${user.id}`
        );

        setError('');

        try {
            await api(
                `/api/admin/users/${user.id}`,
                {
                    method: 'DELETE',
                }
            );

            setUsers((currentUsers) =>
                currentUsers.filter(
                    (currentUser) =>
                        currentUser.id !== user.id
                )
            );

            setConfirmAction(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleConfirm = () => {
        if (!confirmAction) {
            return;
        }

        const {
            type,
            user,
        } = confirmAction;

        if (type === 'ban') {
            handleBan(user);
            return;
        }

        if (type === 'unban') {
            handleUnban(user);
            return;
        }

        if (type === 'delete') {
            handleDelete(user);
        }
    };

    if (loading) {
        return (
            <main className="admin-page">
                <div className="admin-loading-card">
                    <div className="admin-loading-spinner" />

                    <h2>
                        Loading users
                    </h2>

                    <p>
                        Preparing your user management
                        panel...
                    </p>
                </div>
            </main>
        );
    }

    const totalUsers =
        users.length;

    const activeUsers =
        users.filter(
            (user) =>
                user.status === 'active'
        ).length;

    const bannedUsers =
        users.filter(
            (user) =>
                user.status === 'banned'
        ).length;

    const adminUsers =
        users.filter(
            (user) =>
                user.role === 'admin'
        ).length;

    return (
        <>
            <main className="admin-page">
                <header className="admin-header">
                    <div className="admin-brand">
                        <div className="admin-brand-mark">
                            O
                        </div>

                        <div>
                            <span className="section-label">
                                USER MANAGEMENT
                            </span>

                            <h1>
                                Manage Users
                            </h1>

                            <p>
                                Review accounts and control
                                community access.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="admin-secondary-button"
                        onClick={onBack}
                    >
                        ← Back to Dashboard
                    </button>
                </header>

                {error && (
                    <div className="admin-users-error">
                        <div className="admin-error-icon">
                            !
                        </div>

                        <div>
                            <strong>
                                Something went wrong
                            </strong>

                            <p>
                                {error}
                            </p>
                        </div>
                    </div>
                )}

                <section className="admin-users-summary-grid">
                    <SummaryCard
                        label="Total Users"
                        value={totalUsers}
                        tone="primary"
                    />

                    <SummaryCard
                        label="Active Users"
                        value={activeUsers}
                        tone="success"
                    />

                    <SummaryCard
                        label="Banned Users"
                        value={bannedUsers}
                        tone="danger"
                    />

                    <SummaryCard
                        label="Administrators"
                        value={adminUsers}
                        tone="warning"
                    />
                </section>

                <section className="admin-users-panel">
                    <div className="admin-users-panel-heading">
                        <div>
                            <span className="section-label">
                                COMMUNITY ACCOUNTS
                            </span>

                            <h2>
                                Registered users
                            </h2>

                            <p>
                                Manage account status and
                                access permissions.
                            </p>
                        </div>

                        <span className="admin-status-badge">
                            ● {totalUsers} registered
                        </span>
                    </div>

                    {users.length === 0 ? (
                        <div className="admin-empty-users">
                            <div className="admin-empty-users-icon">
                                U
                            </div>

                            <h2>
                                No users found
                            </h2>

                            <p>
                                There are currently no
                                registered accounts to
                                manage.
                            </p>
                        </div>
                    ) : (
                        <div className="admin-users-list">
                            {users.map((user) => {
                                const isCurrentUser =
                                    user.id ===
                                    currentUser.id;

                                const isAdmin =
                                    user.role ===
                                    'admin';

                                const busy =
                                    actionLoading !==
                                    null;

                                const isBanned =
                                    user.status ===
                                    'banned';

                                return (
                                    <article
                                        key={user.id}
                                        className={`admin-user-card ${
                                            isBanned
                                                ? 'admin-user-banned'
                                                : ''
                                        }`}
                                    >
                                        <div className="admin-user-main">
                                            <div className="admin-user-avatar">
                                                {(
                                                    user.username ||
                                                    '?'
                                                )
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>

                                            <div className="admin-user-information">
                                                <div className="admin-user-name-row">
                                                    <strong>
                                                        {
                                                            user.username
                                                        }
                                                    </strong>

                                                    {isCurrentUser && (
                                                        <span className="admin-user-current-badge">
                                                            You
                                                        </span>
                                                    )}

                                                    {isAdmin && (
                                                        <span className="admin-user-role-badge">
                                                            Admin
                                                        </span>
                                                    )}
                                                </div>

                                                <span className="admin-user-email">
                                                    {user.email}
                                                </span>

                                                <span className="admin-user-id">
                                                    User ID #{user.id}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="admin-user-status-area">
                                            <span
                                                className={`admin-user-status ${
                                                    isBanned
                                                        ? 'admin-user-status-banned'
                                                        : 'admin-user-status-active'
                                                }`}
                                            >
                                                <span>
                                                    ●
                                                </span>

                                                {isBanned
                                                    ? 'Banned'
                                                    : 'Active'}
                                            </span>
                                        </div>

                                        <div className="admin-user-actions">
                                            {isCurrentUser ? (
                                                <span className="admin-user-protected">
                                                    Current Account
                                                </span>
                                            ) : isAdmin ? (
                                                <span className="admin-user-protected">
                                                    Admin Account
                                                </span>
                                            ) : (
                                                <>
                                                    {isBanned ? (
                                                        <button
                                                            type="button"
                                                            className="admin-user-action admin-user-action-success"
                                                            onClick={() =>
                                                                openConfirm(
                                                                    'unban',
                                                                    user
                                                                )
                                                            }
                                                            disabled={
                                                                busy
                                                            }
                                                        >
                                                            Unban
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            className="admin-user-action admin-user-action-warning"
                                                            onClick={() =>
                                                                openConfirm(
                                                                    'ban',
                                                                    user
                                                                )
                                                            }
                                                            disabled={
                                                                busy
                                                            }
                                                        >
                                                            Ban
                                                        </button>
                                                    )}

                                                    <button
                                                        type="button"
                                                        className="admin-user-action admin-user-action-danger"
                                                        onClick={() =>
                                                            openConfirm(
                                                                'delete',
                                                                user
                                                            )
                                                        }
                                                        disabled={
                                                            busy
                                                        }
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>
            </main>

            {confirmAction && (
                <ConfirmationModal
                    action={confirmAction}
                    loading={
                        actionLoading !== null
                    }
                    onCancel={
                        closeConfirm
                    }
                    onConfirm={
                        handleConfirm
                    }
                />
            )}
        </>
    );
}

function SummaryCard({
    label,
    value,
    tone,
}) {
    return (
        <article
            className={`admin-user-summary-card admin-user-summary-${tone}`}
        >
            <span className="admin-user-summary-label">
                {label}
            </span>

            <strong>
                {value}
            </strong>
        </article>
    );
}

function ConfirmationModal({
    action,
    loading,
    onCancel,
    onConfirm,
}) {
    const {
        type,
        user,
    } = action;

    const isDelete =
        type === 'delete';

    const isBan =
        type === 'ban';

    const isUnban =
        type === 'unban';

    let title =
        'Confirm action';

    let description =
        '';

    let confirmLabel =
        'Confirm';

    if (isBan) {
        title = 'Ban this account?';

        description =
            `Are you sure you want to ban ${user.username}? They will no longer be able to access their account.`;

        confirmLabel =
            'Ban User';
    }

    if (isUnban) {
        title = 'Unban this account?';

        description =
            `Are you sure you want to restore access for ${user.username}?`;

        confirmLabel =
            'Unban User';
    }

    if (isDelete) {
        title =
            'Delete this account?';

        description =
            `You are about to permanently delete ${user.username}. This action cannot be undone.`;

        confirmLabel =
            'Delete Account';
    }

    return (
        <div
            className="admin-confirm-overlay"
            onMouseDown={(event) => {
                if (
                    event.target ===
                    event.currentTarget &&
                    !loading
                ) {
                    onCancel();
                }
            }}
        >
            <div
                className={`admin-confirm-modal ${
                    isDelete
                        ? 'admin-confirm-danger'
                        : isBan
                            ? 'admin-confirm-warning'
                            : 'admin-confirm-normal'
                }`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="admin-confirm-title"
            >
                <div className="admin-confirm-icon">
                    {isDelete
                        ? '!'
                        : isBan
                            ? '!'
                            : '✓'}
                </div>

                <div className="admin-confirm-content">
                    <span className="section-label">
                        CONFIRM ACTION
                    </span>

                    <h2 id="admin-confirm-title">
                        {title}
                    </h2>

                    <p>
                        {description}
                    </p>
                </div>

                <div className="admin-confirm-actions">
                    <button
                        type="button"
                        className="admin-confirm-cancel"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        className={`admin-confirm-submit ${
                            isDelete
                                ? 'admin-confirm-submit-danger'
                                : isBan
                                    ? 'admin-confirm-submit-warning'
                                    : 'admin-confirm-submit-success'
                        }`}
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading
                            ? 'Processing...'
                            : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AdminUsers;