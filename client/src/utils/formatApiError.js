export function formatApiError(error, fallback = 'Something went wrong. Please try again.') {
  if (!error?.response) {
    return 'Cannot reach the server. Start the backend with: cd server && .\\.venv\\Scripts\\uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload';
  }

  const detail = error.response.data?.detail;

  if (typeof detail === 'string') {
    return detail;
  }

  if (Array.isArray(detail)) {
    const messages = detail.map((item) => item.msg || item.message).filter(Boolean);
    if (messages.length) {
      return messages.join(', ');
    }
  }

  return fallback;
}
