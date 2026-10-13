import React, {
    useState,
} from 'react';

import api from '../api';

function Register({
    onRegisterSuccess,
    onBackToLogin,
}) {
    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
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
            await api('/api/register', {
                method: 'POST',
                body: JSON.stringify(
                    form
                ),
            });

            onRegisterSuccess();
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
                        GET STARTED
                    </span>

                    <h2>
                        Create your account
                    </h2>

                    <p>
                        Join OpenBook and
                        start sharing with
                        the community.
                    </p>
                </div>

                {error && (
                    <div className="auth-error">
                        <strong>
                            Registration failed
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
                            htmlFor="register-username"
                        >
                            Username
                        </label>

                        <input
                            id="register-username"
                            name="username"
                            type="text"
                            value={
                                form.username
                            }
                            onChange={
                                handleChange
                            }
                            maxLength={50}
                            placeholder="Choose a username"
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div className="auth-field">
                        <label
                            htmlFor="register-email"
                        >
                            Email
                        </label>

                        <input
                            id="register-email"
                            name="email"
                            type="email"
                            value={
                                form.email
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="Enter your email"
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className="auth-field">
                        <label
                            htmlFor="register-password"
                        >
                            Password
                        </label>

                        <input
                            id="register-password"
                            name="password"
                            type="password"
                            value={
                                form.password
                            }
                            onChange={
                                handleChange
                            }
                            minLength={6}
                            placeholder="Create a password"
                            autoComplete="new-password"
                            required
                        />

                        <small className="auth-field-help">
                            Minimum 6 characters.
                        </small>
                    </div>

                    <div className="auth-field">
                        <label
                            htmlFor="register-password-confirmation"
                        >
                            Confirm Password
                        </label>

                        <input
                            id="register-password-confirmation"
                            name="password_confirmation"
                            type="password"
                            value={
                                form.password_confirmation
                            }
                            onChange={
                                handleChange
                            }
                            minLength={6}
                            placeholder="Re-enter your password"
                            autoComplete="new-password"
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
                                Creating Account...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>

                <div className="auth-divider">
                    <span>
                        Already have an
                        account?
                    </span>
                </div>

                <button
                    type="button"
                    className="auth-secondary-button"
                    onClick={
                        onBackToLogin
                    }
                >
                    Back to Login
                </button>
            </section>

            <p className="auth-footer">
                OpenBook Community
            </p>
        </main>
    );
}

export default Register;