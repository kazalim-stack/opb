const getCsrfToken = () => {
    return document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute('content');
};

const api = async (url, options = {}) => {
    const isFormData =
        options.body instanceof FormData;

    const headers = {
        Accept: 'application/json',
        'X-CSRF-TOKEN': getCsrfToken(),
        ...(options.headers || {}),
    };

    if (!isFormData) {
        headers['Content-Type'] =
            'application/json';
    }

    const response = await fetch(url, {
        credentials: 'same-origin',
        headers,
        ...options,
    });

    const contentType =
        response.headers.get('content-type') || '';

    const data = contentType.includes(
        'application/json'
    )
        ? await response.json()
        : {};

    if (!response.ok) {
        throw new Error(
            data.message ||
            Object.values(data.errors || {})
                .flat()
                .join(' ') ||
            'Something went wrong.'
        );
    }

    return data;
};

export default api;