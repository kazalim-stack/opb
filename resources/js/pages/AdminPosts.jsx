import React, {
    useEffect,
    useState,
} from 'react';

import api from '../api';

function AdminPosts({ onBack }) {
    const [posts, setPosts] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState('');

    const [actionLoading, setActionLoading] =
        useState(null);

    const [confirmAction, setConfirmAction] =
        useState(null);

    const loadPosts = async () => {
        try {
            setError('');

            const data =
                await api(
                    '/api/admin/posts'
                );

            setPosts(
                data.posts || []
            );
        } catch (err) {
            setError(
                err.message
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPosts();
    }, []);

    const openConfirm = (
        type,
        post
    ) => {
        setConfirmAction({
            type,
            post,
        });
    };

    const closeConfirm = () => {
        if (actionLoading) {
            return;
        }

        setConfirmAction(null);
    };

    const handleHide = async (
        post
    ) => {
        setActionLoading(
            `hide-${post.id}`
        );

        setError('');

        try {
            const data =
                await api(
                    `/api/admin/posts/${post.id}/hide`,
                    {
                        method: 'PATCH',
                    }
                );

            setPosts(
                (currentPosts) =>
                    currentPosts.map(
                        (currentPost) =>
                            currentPost.id ===
                            post.id
                                ? data.post
                                : currentPost
                    )
            );

            setConfirmAction(null);
        } catch (err) {
            setError(
                err.message
            );
        } finally {
            setActionLoading(null);
        }
    };

    const handleUnhide = async (
        post
    ) => {
        setActionLoading(
            `unhide-${post.id}`
        );

        setError('');

        try {
            const data =
                await api(
                    `/api/admin/posts/${post.id}/unhide`,
                    {
                        method: 'PATCH',
                    }
                );

            setPosts(
                (currentPosts) =>
                    currentPosts.map(
                        (currentPost) =>
                            currentPost.id ===
                            post.id
                                ? data.post
                                : currentPost
                    )
            );

            setConfirmAction(null);
        } catch (err) {
            setError(
                err.message
            );
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (
        post
    ) => {
        setActionLoading(
            `delete-${post.id}`
        );

        setError('');

        try {
            await api(
                `/api/admin/posts/${post.id}`,
                {
                    method: 'DELETE',
                }
            );

            setPosts(
                (currentPosts) =>
                    currentPosts.filter(
                        (currentPost) =>
                            currentPost.id !==
                            post.id
                    )
            );

            setConfirmAction(null);
        } catch (err) {
            setError(
                err.message
            );
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
            post,
        } = confirmAction;

        if (type === 'hide') {
            handleHide(post);

            return;
        }

        if (type === 'unhide') {
            handleUnhide(post);

            return;
        }

        if (type === 'delete') {
            handleDelete(post);
        }
    };

    if (loading) {
        return (
            <main className="admin-page">
                <div className="admin-loading-card">
                    <div className="admin-loading-spinner" />

                    <h2>
                        Loading posts
                    </h2>

                    <p>
                        Preparing your post management
                        panel...
                    </p>
                </div>
            </main>
        );
    }

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
                                CONTENT MANAGEMENT
                            </span>

                            <h1>
                                Manage Posts
                            </h1>

                            <p>
                                Review, control, and manage
                                community content.
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
                    <div className="admin-posts-error">
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

                <section className="admin-posts-summary">
                    <div>
                        <span className="section-label">
                            POST OVERVIEW
                        </span>

                        <h2>
                            Community content
                        </h2>

                        <p>
                            {posts.length === 0
                                ? 'There are currently no posts to manage.'
                                : `Showing ${posts.length} ${
                                      posts.length === 1
                                          ? 'post'
                                          : 'posts'
                                  } in the community.`}
                        </p>
                    </div>

                    <div className="admin-posts-summary-count">
                        <span>
                            TOTAL POSTS
                        </span>

                        <strong>
                            {posts.length}
                        </strong>
                    </div>
                </section>

                {posts.length === 0 ? (
                    <section className="admin-empty-posts">
                        <div className="admin-empty-posts-icon">
                            P
                        </div>

                        <h2>
                            No posts found
                        </h2>

                        <p>
                            There are no community posts
                            available to manage right now.
                        </p>
                    </section>
                ) : (
                    <section className="admin-posts-list">
                        {posts.map(
                            (post) => {
                                const busy =
                                    actionLoading !==
                                    null;

                                const isHidden =
                                    post.status ===
                                    'hidden';

                                return (
                                    <article
                                        key={
                                            post.id
                                        }
                                        className={`admin-post-card ${
                                            isHidden
                                                ? 'admin-post-hidden'
                                                : ''
                                        }`}
                                    >
                                        <div className="admin-post-card-top">
                                            <div className="admin-post-identity">
                                                <div className="admin-post-avatar">
                                                    {(
                                                        post
                                                            .user
                                                            ?.username ||
                                                        '?'
                                                    )
                                                        .charAt(
                                                            0
                                                        )
                                                        .toUpperCase()}
                                                </div>

                                                <div>
                                                    <span className="admin-post-author-label">
                                                        POST #
                                                        {
                                                            post.id
                                                        }
                                                    </span>

                                                    <strong className="admin-post-author">
                                                        {post
                                                            .user
                                                            ?.username ||
                                                            'Unknown user'}
                                                    </strong>
                                                </div>
                                            </div>

                                            <span
                                                className={`admin-post-status ${
                                                    isHidden
                                                        ? 'admin-post-status-hidden'
                                                        : 'admin-post-status-visible'
                                                }`}
                                            >
                                                <span>
                                                    ●
                                                </span>

                                                {isHidden
                                                    ? 'Hidden'
                                                    : 'Visible'}
                                            </span>
                                        </div>

                                        <div className="admin-post-content">
                                            <h2>
                                                {
                                                    post.title
                                                }
                                            </h2>

                                            <div className="admin-post-meta">
                                                <span>
                                                    💬{' '}
                                                    {post.comments_count ??
                                                        0}{' '}
                                                    comments
                                                </span>

                                                <span>
                                                    ♥{' '}
                                                    {post.likes_count ??
                                                        0}{' '}
                                                    likes
                                                </span>
                                            </div>
                                        </div>

                                        <div className="admin-post-card-footer">
                                            <div className="admin-post-management-label">
                                                {isHidden
                                                    ? 'This post is currently hidden from the community.'
                                                    : 'This post is currently visible to the community.'}
                                            </div>

                                            <div className="admin-post-actions">
                                                {isHidden ? (
                                                    <button
                                                        type="button"
                                                        className="admin-post-action admin-post-action-success"
                                                        onClick={() =>
                                                            openConfirm(
                                                                'unhide',
                                                                post
                                                            )
                                                        }
                                                        disabled={
                                                            busy
                                                        }
                                                    >
                                                        Unhide
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className="admin-post-action admin-post-action-warning"
                                                        onClick={() =>
                                                            openConfirm(
                                                                'hide',
                                                                post
                                                            )
                                                        }
                                                        disabled={
                                                            busy
                                                        }
                                                    >
                                                        Hide
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    className="admin-post-action admin-post-action-danger"
                                                    onClick={() =>
                                                        openConfirm(
                                                            'delete',
                                                            post
                                                        )
                                                    }
                                                    disabled={
                                                        busy
                                                    }
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                );
                            }
                        )}
                    </section>
                )}
            </main>

            {confirmAction && (
                <ConfirmationModal
                    action={
                        confirmAction
                    }
                    loading={
                        actionLoading !==
                        null
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

function ConfirmationModal({
    action,
    loading,
    onCancel,
    onConfirm,
}) {
    const {
        type,
        post,
    } = action;

    const isDelete =
        type === 'delete';

    const isHide =
        type === 'hide';

    const isUnhide =
        type === 'unhide';

    let title =
        'Confirm action';

    let description =
        '';

    let confirmLabel =
        'Confirm';

    if (isHide) {
        title =
            'Hide this post?';

        description =
            `Are you sure you want to hide "${post.title}"? It will no longer be visible to the community.`;

        confirmLabel =
            'Hide Post';
    }

    if (isUnhide) {
        title =
            'Unhide this post?';

        description =
            `Are you sure you want to make "${post.title}" visible to the community again.`;

        confirmLabel =
            'Unhide Post';
    }

    if (isDelete) {
        title =
            'Delete this post?';

        description =
            `You are about to permanently delete "${post.title}". This action cannot be undone.`;

        confirmLabel =
            'Delete Post';
    }

    return (
        <div
            className="admin-confirm-overlay"
            onMouseDown={(
                event
            ) => {
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
                        : isHide
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
                        : isHide
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
                        onClick={
                            onCancel
                        }
                        disabled={
                            loading
                        }
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        className={`admin-confirm-submit ${
                            isDelete
                                ? 'admin-confirm-submit-danger'
                                : isHide
                                    ? 'admin-confirm-submit-warning'
                                    : 'admin-confirm-submit-success'
                        }`}
                        onClick={
                            onConfirm
                        }
                        disabled={
                            loading
                        }
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

export default AdminPosts;