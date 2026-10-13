import React, {
    useEffect,
    useRef,
    useState,
} from 'react';

import Quill from 'quill';
import 'quill/dist/quill.snow.css';

import api from '../api';
import CreatePost from './CreatePost';


function Feed({ user }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [currentPage, setCurrentPage] =
        useState(1);

    const [lastPage, setLastPage] =
        useState(1);


    const loadPosts = async (page = 1) => {
        try {
            setLoading(true);
            setError('');

            const data = await api(
                `/api/posts?page=${page}`
            );

            setPosts(data.data || []);

            setCurrentPage(
                data.current_page || page
            );

            setLastPage(
                data.last_page || 1
            );
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        loadPosts(1);
    }, []);


    const handlePageChange = (page) => {
        if (
            page < 1 ||
            page > lastPage ||
            page === currentPage
        ) {
            return;
        }

        loadPosts(page);

        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };


    const handlePostCreated = (post) => {
        setError('');

        setPosts((currentPosts) => [
            {
                ...post,
                liked: false,
            },
            ...currentPosts,
        ]);
    };


    const handlePostUpdated = (updatedPost) => {
        setError('');

        setPosts((currentPosts) =>
            currentPosts.map((post) =>
                post.id === updatedPost.id
                    ? {
                          ...updatedPost,
                          liked:
                              post.liked ??
                              false,
                      }
                    : post
            )
        );
    };


    const handleLike = async (post) => {
        try {
            setError('');

            const data = await api(
                `/api/posts/${post.id}/like`,
                {
                    method: 'POST',
                }
            );

            setPosts((currentPosts) =>
                currentPosts.map((currentPost) =>
                    currentPost.id === post.id
                        ? {
                              ...currentPost,
                              liked: data.liked,
                              likes_count:
                                  data.likes_count,
                          }
                        : currentPost
                )
            );
        } catch (err) {
            setError(err.message);
        }
    };


    const handleUnlike = async (post) => {
        try {
            setError('');

            const data = await api(
                `/api/posts/${post.id}/like`,
                {
                    method: 'DELETE',
                }
            );

            setPosts((currentPosts) =>
                currentPosts.map((currentPost) =>
                    currentPost.id === post.id
                        ? {
                              ...currentPost,
                              liked: data.liked,
                              likes_count:
                                  data.likes_count,
                          }
                        : currentPost
                )
            );
        } catch (err) {
            setError(err.message);
        }
    };


    const handleComment = async (
        post,
        commentText
    ) => {
        try {
            setError('');

            const data = await api(
                `/api/posts/${post.id}/comments`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        comment: commentText,
                    }),
                }
            );

            setPosts((currentPosts) =>
                currentPosts.map((currentPost) =>
                    currentPost.id === post.id
                        ? {
                              ...currentPost,
                              comments: [
                                  ...(currentPost.comments ||
                                      []),
                                  {
                                      ...data.comment,
                                      liked: false,
                                      likes_count: 0,
                                  },
                              ],
                              comments_count:
                                  (currentPost.comments_count ||
                                      0) + 1,
                          }
                        : currentPost
                )
            );
        } catch (err) {
            setError(err.message);
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Comment Like
    |--------------------------------------------------------------------------
    */

    const handleCommentLike = async (
        postId,
        commentId
    ) => {
        try {
            setError('');

            const data = await api(
                `/api/comments/${commentId}/like`,
                {
                    method: 'POST',
                }
            );

            setPosts((currentPosts) =>
                currentPosts.map((post) =>
                    post.id === postId
                        ? {
                              ...post,
                              comments: (
                                  post.comments || []
                              ).map((comment) =>
                                  comment.id === commentId
                                      ? {
                                            ...comment,
                                            liked:
                                                data.liked,
                                            likes_count:
                                                data.likes_count,
                                        }
                                      : comment
                              ),
                          }
                        : post
                )
            );
        } catch (err) {
            setError(err.message);
        }
    };


    const handleCommentUnlike = async (
        postId,
        commentId
    ) => {
        try {
            setError('');

            const data = await api(
                `/api/comments/${commentId}/like`,
                {
                    method: 'DELETE',
                }
            );

            setPosts((currentPosts) =>
                currentPosts.map((post) =>
                    post.id === postId
                        ? {
                              ...post,
                              comments: (
                                  post.comments || []
                              ).map((comment) =>
                                  comment.id === commentId
                                      ? {
                                            ...comment,
                                            liked:
                                                data.liked,
                                            likes_count:
                                                data.likes_count,
                                        }
                                      : comment
                              ),
                          }
                        : post
                )
            );
        } catch (err) {
            setError(err.message);
        }
    };


    const handleCommentDeleted = async (
        postId,
        commentId
    ) => {
        try {
            setError('');

            await api(
                `/api/comments/${commentId}`,
                {
                    method: 'DELETE',
                }
            );

            setPosts((currentPosts) =>
                currentPosts.map((post) =>
                    post.id === postId
                        ? {
                              ...post,
                              comments: (
                                  post.comments ||
                                  []
                              ).filter(
                                  (comment) =>
                                      comment.id !==
                                      commentId
                              ),
                              comments_count:
                                  Math.max(
                                      0,
                                      (post.comments_count ||
                                          0) - 1
                                  ),
                          }
                        : post
                )
            );
        } catch (err) {
            setError(err.message);
        }
    };


    const handlePostDeleted = async (
        postId
    ) => {
        try {
            setError('');

            await api(
                `/api/posts/${postId}`,
                {
                    method: 'DELETE',
                }
            );

            setPosts((currentPosts) =>
                currentPosts.filter(
                    (post) =>
                        post.id !== postId
                )
            );
        } catch (err) {
            setError(err.message);
        }
    };


    if (loading) {
        return (
            <div className="feed-page">
                <div className="feed-container">
                    <div className="loading-card">
                        <div className="loading-spinner" />
                        <p>
                            Loading OpenBook...
                        </p>
                    </div>
                </div>
            </div>
        );
    }


    return (
        <div className="feed-page">
            <div className="feed-container">

                {error && (
                    <div className="feed-error">
                        <div>
                            <strong>
                                Something went wrong
                            </strong>

                            <p>{error}</p>
                        </div>

                        <button
                            type="button"
                            className="text-button"
                            onClick={() =>
                                setError('')
                            }
                        >
                            Dismiss
                        </button>
                    </div>
                )}


                <section className="create-post-card">
                    <div className="section-heading">
                        <div>
                            <span className="section-label">
                                SHARE SOMETHING
                            </span>

                            <h2>
                                Create a Post
                            </h2>
                        </div>
                    </div>

                    <CreatePost
                        onPostCreated={
                            handlePostCreated
                        }
                    />
                </section>


                <section className="feed-section">
                    <div className="feed-heading">
                        <div>
                            <span className="section-label">
                                COMMUNITY
                            </span>

                            <h2>
                                OpenBook Feed
                            </h2>
                        </div>

                        <span className="post-count">
                            {posts.length}{' '}
                            {posts.length === 1
                                ? 'post'
                                : 'posts'}
                        </span>
                    </div>


                    {posts.length === 0 ? (
                        <div className="empty-feed-card">
                            <div className="empty-feed-icon">
                                ○
                            </div>

                            <h3>
                                No posts yet
                            </h3>

                            <p>
                                Be the first to share
                                something with the
                                OpenBook community.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="post-list">
                                {posts.map(
                                    (post) => (
                                        <PostItem
                                            key={
                                                post.id
                                            }
                                            post={post}
                                            user={user}
                                            onLike={
                                                handleLike
                                            }
                                            onUnlike={
                                                handleUnlike
                                            }
                                            onComment={
                                                handleComment
                                            }
                                            onCommentDeleted={
                                                handleCommentDeleted
                                            }
                                            onCommentLike={
                                                handleCommentLike
                                            }
                                            onCommentUnlike={
                                                handleCommentUnlike
                                            }
                                            onPostDeleted={
                                                handlePostDeleted
                                            }
                                            onPostUpdated={
                                                handlePostUpdated
                                            }
                                        />
                                    )
                                )}
                            </div>


                            {lastPage > 1 && (
                                <Pagination
                                    currentPage={
                                        currentPage
                                    }
                                    lastPage={
                                        lastPage
                                    }
                                    onPageChange={
                                        handlePageChange
                                    }
                                />
                            )}
                        </>
                    )}
                </section>

            </div>
        </div>
    );
}


function Pagination({
    currentPage,
    lastPage,
    onPageChange,
}) {
    const pages = [];

    for (
        let page = 1;
        page <= lastPage;
        page++
    ) {
        pages.push(page);
    }

    return (
        <nav
            className="pagination"
            aria-label="Post pagination"
        >
            <button
                type="button"
                className="pagination-button"
                onClick={() =>
                    onPageChange(
                        currentPage - 1
                    )
                }
                disabled={currentPage === 1}
            >
                ← Previous
            </button>


            <div className="pagination-pages">
                {pages.map((page) => (
                    <button
                        key={page}
                        type="button"
                        className={`pagination-page ${
                            page === currentPage
                                ? 'active'
                                : ''
                        }`}
                        onClick={() =>
                            onPageChange(page)
                        }
                        disabled={
                            page === currentPage
                        }
                    >
                        {page}
                    </button>
                ))}
            </div>


            <button
                type="button"
                className="pagination-button"
                onClick={() =>
                    onPageChange(
                        currentPage + 1
                    )
                }
                disabled={
                    currentPage === lastPage
                }
            >
                Next →
            </button>
        </nav>
    );
}


function PostItem({
    post,
    user,
    onLike,
    onUnlike,
    onComment,
    onCommentDeleted,
    onCommentLike,
    onCommentUnlike,
    onPostDeleted,
    onPostUpdated,
}) {
    const [commentText, setCommentText] =
        useState('');

    const [editing, setEditing] =
        useState(false);


    const submitComment = async (event) => {
        event.preventDefault();

        if (!commentText.trim()) {
            return;
        }

        await onComment(
            post,
            commentText.trim()
        );

        setCommentText('');
    };


    const handleDeletePost = async () => {
        const confirmed = window.confirm(
            'Are you sure you want to delete this post?'
        );

        if (!confirmed) {
            return;
        }

        await onPostDeleted(post.id);
    };


    const isOwner =
        post.user_id === user?.id;

    const canEdit =
        isOwner ||
        user?.role === 'admin';


    return (
        <article className="post-card">
            {editing ? (
                <EditPostForm
                    post={post}
                    onPostUpdated={
                        onPostUpdated
                    }
                    onCancel={() =>
                        setEditing(false)
                    }
                />
            ) : (
                <>
                    <div className="post-header">
                        <div className="post-avatar">
                            {(
                                post.user
                                    ?.username ||
                                '?'
                            )
                                .charAt(0)
                                .toUpperCase()}
                        </div>

                        <div className="post-author">
                            <strong>
                                {
                                    post.user
                                        ?.username
                                }
                            </strong>

                            <span>
                                OpenBook member
                            </span>
                        </div>
                    </div>


                    <div className="post-body">
                        <h3 className="post-title">
                            {post.title}
                        </h3>

                        <div
                            className="post-content rich-text-content"
                            dangerouslySetInnerHTML={{
                                __html:
                                    post.content,
                            }}
                        />

                        {post.image && (
                            <PostMedia
                                post={post}
                            />
                        )}
                    </div>


                    <div className="post-stats">
                        <span>
                            {post.likes_count}{' '}
                            {post.likes_count === 1
                                ? 'like'
                                : 'likes'}
                        </span>

                        <span>
                            {post.comments_count}{' '}
                            {post.comments_count === 1
                                ? 'comment'
                                : 'comments'}
                        </span>
                    </div>


                    <div className="post-actions">
                        {post.liked ? (
                            <button
                                type="button"
                                className="post-action active"
                                onClick={() =>
                                    onUnlike(post)
                                }
                            >
                                ♥ Liked
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="post-action"
                                onClick={() =>
                                    onLike(post)
                                }
                            >
                                ♡ Like
                            </button>
                        )}


                        {canEdit && (
                            <>
                                <button
                                    type="button"
                                    className="post-action"
                                    onClick={() =>
                                        setEditing(
                                            true
                                        )
                                    }
                                >
                                    Edit
                                </button>

                                <button
                                    type="button"
                                    className="post-action danger"
                                    onClick={
                                        handleDeletePost
                                    }
                                >
                                    Delete
                                </button>
                            </>
                        )}
                    </div>


                    <div className="comments-section">
                        <div className="comments-heading">
                            <h4>
                                Comments
                            </h4>

                            <span>
                                {post.comments_count ||
                                    0}
                            </span>
                        </div>


                        {post.comments?.length >
                        0 ? (
                            <div className="comment-list">
                                {post.comments.map(
                                    (comment) => (
                                        <div
                                            className="comment-item"
                                            key={
                                                comment.id
                                            }
                                        >
                                            <div className="comment-avatar">
                                                {(
                                                    comment
                                                        .user
                                                        ?.username ||
                                                    '?'
                                                )
                                                    .charAt(
                                                        0
                                                    )
                                                    .toUpperCase()}
                                            </div>


                                            <div className="comment-content">
                                                <div className="comment-top">
                                                    <strong>
                                                        {
                                                            comment
                                                                .user
                                                                ?.username
                                                        }
                                                    </strong>


                                                    {(comment.user_id ===
                                                        user?.id ||
                                                        user?.role ===
                                                            'admin') && (
                                                        <button
                                                            type="button"
                                                            className="comment-delete"
                                                            onClick={() =>
                                                                onCommentDeleted(
                                                                    post.id,
                                                                    comment.id
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>


                                                <p>
                                                    {
                                                        comment.comment
                                                    }
                                                </p>


                                                {/* 
                                                |--------------------------------------------------------------------------
                                                | Comment Like Button
                                                |--------------------------------------------------------------------------
                                                */}

                                                <div className="comment-actions">
                                                    {comment.liked ? (
                                                        <button
                                                            type="button"
                                                            className="post-action active"
                                                            onClick={() =>
                                                                onCommentUnlike(
                                                                    post.id,
                                                                    comment.id
                                                                )
                                                            }
                                                        >
                                                            ♥ Liked{' '}
                                                            {comment.likes_count ||
                                                                0}
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            className="post-action"
                                                            onClick={() =>
                                                                onCommentLike(
                                                                    post.id,
                                                                    comment.id
                                                                )
                                                            }
                                                        >
                                                            ♡ Like{' '}
                                                            {comment.likes_count ||
                                                                0}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        ) : (
                            <p className="no-comments">
                                No comments yet.
                            </p>
                        )}


                        <form
                            className="comment-form"
                            onSubmit={
                                submitComment
                            }
                        >
                            <input
                                type="text"
                                value={
                                    commentText
                                }
                                onChange={(
                                    event
                                ) =>
                                    setCommentText(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                placeholder="Write a comment..."
                            />

                            <button type="submit">
                                Comment
                            </button>
                        </form>
                    </div>
                </>
            )}
        </article>
    );
}


function PostMedia({ post }) {
    const mediaUrl =
        `/storage/posts/${post.image}`;

    if (
        post.media_type === 'video'
    ) {
        return (
            <div className="post-media">
                <video
                    src={mediaUrl}
                    controls
                    preload="metadata"
                >
                    Your browser does not
                    support video playback.
                </video>
            </div>
        );
    }

    return (
        <div className="post-media">
            <img
                src={mediaUrl}
                alt={post.title}
                loading="lazy"
            />
        </div>
    );
}


function EditPostForm({
    post,
    onPostUpdated,
    onCancel,
}) {
    const editorWrapperRef =
        useRef(null);

    const editorRef =
        useRef(null);

    const quillRef =
        useRef(null);

    const [title, setTitle] =
        useState(post.title);

    const [error, setError] =
        useState('');

    const [saving, setSaving] =
        useState(false);


    useEffect(() => {
        const wrapper =
            editorWrapperRef.current;

        if (!wrapper) {
            return;
        }

        wrapper.innerHTML = '';

        const editor =
            document.createElement('div');

        editorRef.current = editor;

        wrapper.appendChild(editor);

        const quill = new Quill(
            editor,
            {
                theme: 'snow',

                placeholder:
                    'Edit your post...',

                modules: {
                    toolbar: [
                        [
                            {
                                header: [
                                    1,
                                    2,
                                    3,
                                    false,
                                ],
                            },
                        ],

                        [
                            'bold',
                            'italic',
                            'underline',
                            'strike',
                        ],

                        [
                            {
                                color: [],
                            },
                            {
                                background: [],
                            },
                        ],

                        [
                            {
                                list: 'ordered',
                            },
                            {
                                list: 'bullet',
                            },
                        ],

                        [
                            {
                                align: [],
                            },
                        ],

                        ['clean'],
                    ],
                },
            }
        );

        quillRef.current = quill;

        if (post.content) {
            quill.clipboard.dangerouslyPasteHTML(
                post.content
            );
        }

        return () => {
            quillRef.current = null;

            if (wrapper) {
                wrapper.innerHTML = '';
            }
        };
    }, [post.content]);


    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();

        setError('');

        if (!quillRef.current) {
            setError(
                'The editor is not ready yet.'
            );

            return;
        }

        const content =
            quillRef.current.root.innerHTML;

        const text =
            quillRef.current
                .getText()
                .trim();

        if (!title.trim()) {
            setError(
                'Please enter a post title.'
            );

            return;
        }

        if (!text) {
            setError(
                'Please enter post content.'
            );

            return;
        }

        setSaving(true);

        try {
            const data = await api(
                `/api/posts/${post.id}`,
                {
                    method: 'PUT',
                    body: JSON.stringify({
                        title:
                            title.trim(),
                        content,
                    }),
                }
            );

            onPostUpdated(data.post);

            onCancel();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };


    return (
        <form
            className="edit-post-form"
            onSubmit={handleSubmit}
        >
            <div className="edit-post-header">
                <div>
                    <span className="section-label">
                        EDITING
                    </span>

                    <h3>
                        Edit Post
                    </h3>
                </div>
            </div>


            {error && (
                <div className="form-error">
                    {error}
                </div>
            )}


            <div className="form-field">
                <label
                    htmlFor={`edit-title-${post.id}`}
                >
                    Title
                </label>

                <input
                    id={`edit-title-${post.id}`}
                    name="title"
                    type="text"
                    value={title}
                    onChange={(event) =>
                        setTitle(
                            event.target.value
                        )
                    }
                    maxLength={150}
                    required
                />
            </div>


            <div className="form-field">
                <label>
                    Content
                </label>

                <div
                    ref={editorWrapperRef}
                    className="edit-editor"
                >
                    <div
                        ref={editorRef}
                    />
                </div>
            </div>


            <div className="edit-actions">
                <button
                    type="submit"
                    className="primary-button"
                    disabled={saving}
                >
                    {saving
                        ? 'Saving...'
                        : 'Save Changes'}
                </button>

                <button
                    type="button"
                    className="secondary-button"
                    onClick={onCancel}
                    disabled={saving}
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}


export default Feed;