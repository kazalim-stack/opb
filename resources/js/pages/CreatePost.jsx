import React, {
    useEffect,
    useRef,
    useState,
} from 'react';

import Quill from 'quill';
import 'quill/dist/quill.snow.css';

import api from '../api';

function CreatePost({ onPostCreated, onClose, filePickerRequest = 0 }) {
    const editorWrapperRef =
        useRef(null);

    const editorRef =
        useRef(null);

    const quillRef =
        useRef(null);

    const fileInputRef =
        useRef(null);

    const [title, setTitle] =
        useState('');

    const [media, setMedia] =
        useState(null);

    const [error, setError] =
        useState('');

    const [loading, setLoading] =
        useState(false);

    useEffect(() => {
        if (filePickerRequest > 0) {
            fileInputRef.current?.click();
        }
    }, [filePickerRequest]);

    useEffect(() => {
        const wrapper =
            editorWrapperRef.current;

        if (!wrapper) {
            return;
        }

        wrapper.innerHTML = '';

        const editor =
            document.createElement(
                'div'
            );

        editorRef.current = editor;

        wrapper.appendChild(editor);

        const quill =
            new Quill(editor, {
                theme: 'snow',

                placeholder:
                    'Write your post...',

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

                        [
                            'clean',
                        ],
                    ],
                },
            });

        quillRef.current =
            quill;

        return () => {
            quillRef.current =
                null;

            if (wrapper) {
                wrapper.innerHTML = '';
            }
        };
    }, []);

    const handleMediaChange = (
        event
    ) => {
        const selectedFile =
            event.target.files?.[0];

        setError('');

        if (!selectedFile) {
            setMedia(null);

            return;
        }

        const maxSize =
            20 * 1024 * 1024;

        if (
            selectedFile.size >
            maxSize
        ) {
            setMedia(null);

            event.target.value = '';

            setError(
                'The selected file must be 20 MB or smaller.'
            );

            return;
        }

        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'video/mp4',
            'video/webm',
            'video/quicktime',
        ];

        if (
            !allowedTypes.includes(
                selectedFile.type
            )
        ) {
            setMedia(null);

            event.target.value = '';

            setError(
                'Please select a JPG, JPEG, PNG, GIF, WebP, MP4, WebM, or MOV file.'
            );

            return;
        }

        setMedia(
            selectedFile
        );
    };

    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();

        setError('');

        if (
            !quillRef.current
        ) {
            setError(
                'The editor is not ready yet.'
            );

            return;
        }

        const content =
            quillRef.current.root
                .innerHTML;

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

        setLoading(true);

        try {
            const formData =
                new FormData();

            formData.append(
                'title',
                title.trim()
            );

            formData.append(
                'content',
                content
            );

            if (media) {
                formData.append(
                    'media',
                    media
                );
            }

            const data =
                await api(
                    '/api/posts',
                    {
                        method: 'POST',
                        body: formData,
                    }
                );

            setTitle('');

            setMedia(null);

            if (
                fileInputRef.current
            ) {
                fileInputRef.current.value =
                    '';
            }

            quillRef.current
                .setContents([]);

            onPostCreated(
                data.post
            );
        } catch (err) {
            setError(
                err.message
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="create-post-card">
            <div className="create-post-heading">
                <span className="section-label">
                    SHARE SOMETHING
                </span>

                <h2>
                    Create a Post
                </h2>

                <p>
                    Share something with
                    the OpenBook community.
                </p>
            </div>

            {error && (
                <div className="create-post-error">
                    <span className="create-post-error-icon">
                        !
                    </span>

                    <span>
                        {error}
                    </span>
                </div>
            )}

            <form
                onSubmit={
                    handleSubmit
                }
                className="create-post-form"
            >
                <div className="create-post-field">
                    <label
                        htmlFor="post-title"
                    >
                        Title
                    </label>

                    <input
                        id="post-title"
                        name="title"
                        type="text"
                        value={title}
                        onChange={(
                            event
                        ) =>
                            setTitle(
                                event.target
                                    .value
                            )
                        }
                        maxLength={150}
                        placeholder="Give your post a title"
                        required
                    />
                </div>

                <div className="create-post-field">
                    <label>
                        Content
                    </label>

                    <div
                        ref={
                            editorWrapperRef
                        }
                        className="create-post-editor"
                    >
                        <div
                            ref={
                                editorRef
                            }
                        />
                    </div>
                </div>

                <div className="post-media-field">
                    <label
                        htmlFor="post-media"
                        className="post-media-label"
                    >
                        Image or Video
                    </label>

                    <div className="post-file-picker">
                        <input
                            ref={
                                fileInputRef
                            }
                            id="post-media"
                            name="media"
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime"
                            onChange={
                                handleMediaChange
                            }
                            className="post-file-input"
                        />

                        <label
                            htmlFor="post-media"
                            className="post-file-button"
                        >
                            <span className="post-file-icon">
                                ▣
                            </span>

                            <span>
                                Choose File
                            </span>
                        </label>

                        <div className="post-file-name">
                            {media ? (
                                <>
                                    <span className="post-file-selected-icon">
                                        ✓
                                    </span>

                                    <span className="post-file-selected-name">
                                        {
                                            media.name
                                        }
                                    </span>
                                </>
                            ) : (
                                <span className="post-file-placeholder">
                                    No file selected
                                </span>
                            )}
                        </div>
                    </div>

                    <small className="post-file-help">
                        JPG, PNG, GIF,
                        WebP, MP4, WebM,
                        or MOV. Maximum
                        file size: 20 MB.
                    </small>
                </div>

                <div className="create-post-submit-row">
                    {onClose && (
                        <button
                            type="button"
                            className="create-post-cancel-button"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="create-post-publish-button"
                    >
                        {loading ? (
                            <>
                                <span className="button-spinner" />

                                Publishing...
                            </>
                        ) : (
                            'Publish'
                        )}
                    </button>
                </div>
            </form>
        </section>
    );
}

export default CreatePost;
