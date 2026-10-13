import React, {
    useState,
} from 'react';

import api from '../api';

function Login({
    onLogin,
    onShowRegister,
}) {
    const [form, setForm] = useState({
        username: '',
        password: '',
    });

    const [error, setError] =
        useState('');

    const [loading, setLoading] =
        useState(false);

    const handleChange = (event) => {
        setForm({
            ...form,
            [event.target.name]:
                event.target.value,
        });
    };

    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();

        setError('');
        setLoading(true);

        try {
            const data = await api(
                '/api/login',
                {
                    method: 'POST',
                    body: JSON.stringify(
                        form
                    ),
                }
            );

            onLogin(
                data.user,
                data.csrf_token
            );
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <div className="auth-brand">
                <div className="auth-brand-mark">
                    O
                </div>

                <div>
                    <h1>OpenBook</h1>

                    <p>
                        Connect. Share.
                        Discover.
                    </p>
                </div>
            </div>

            <section className="auth-card">
                <div className="auth-card-header">
                    <span className="section-label">
                        WELCOME BACK
                    </span>

                    <h2>
                        Sign in to OpenBook
                    </h2>

                    <p>
                        Log in to continue to
                        your community.
                    </p>
                </div>

                {error && (
                    <div className="auth-error">
                        <strong>
                            Login failed
                        </strong>

                        <span>
                            {error}
                        </span>
                    </div>
                )}

                <form
                    className="auth-form"
                    onSubmit={
                        handleSubmit
                    }
                >
                    <div className="auth-field">
                        <label
                            htmlFor="username"
                        >
                            Username
                        </label>

                        <input
                            id="username"
                            name="username"
                            type="text"
                            value={
                                form.username
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="Enter your username"
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div className="auth-field">
                        <label
                            htmlFor="password"
                        >
                            Password
                        </label>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={
                                form.password
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-primary-button"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="button-spinner" />
                                Logging in...
                            </>
                        ) : (
                            'Login'
                        )}
                    </button>
                </form>

                <div className="auth-divider">
                    <span>
                        New to OpenBook?
                    </span>
                </div>

                <button
                    type="button"
                    className="auth-secondary-button"
                    onClick={
                        onShowRegister
                    }
                >
                    Create an Account
                </button>
            </section>

            <p className="auth-footer">
                OpenBook Community
            </p>
        </main>
    );
}

export default Login;