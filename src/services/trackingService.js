import { API_URL, authFetch } from '../utils/utils'; // Assuming authFetch handles token sending if needed

const TRACKING_API_URL = `${API_URL}/server/api/tracking`;

/**
 * Logs a page view to the backend.
 * @param {string} pageUrl The URL of the page visited.
 * @returns {Promise<Object>} The response from the server.
 */
export const logPageView = async (pageUrl) => {
  if (!pageUrl) {
    console.warn('logPageView: pageUrl is required');
    return { status: 'error', message: 'pageUrl is required' };
  }

  try {
    // Using authFetch if you want to send authentication tokens,
    // otherwise, a regular fetch might be sufficient if the endpoint doesn't require auth
    // for simply logging a visit (though it does use authenticateUser() to get user_id if available).
    // Let's assume for now that sending the auth token (if present) is desired.
    const response = await authFetch(`${TRACKING_API_URL}/log_visit.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ page_url: pageUrl }),
    });

    if (!response.ok) {
      // Try to parse error message from server if available
      try {
        const errorData = await response.json();
        console.error('logPageView error:', errorData.message || `HTTP error! status: ${response.status}`);
        return { status: 'error', message: errorData.message || `HTTP error! status: ${response.status}` };
      } catch (e) {
        console.error('logPageView error: HTTP error!', response.status);
        return { status: 'error', message: `HTTP error! status: ${response.status}` };
      }
    }

    const data = await response.json();
    if (data.status === 'success') {
      // console.log('Page view logged:', pageUrl); // Optional: for debugging
    } else {
      console.warn('Failed to log page view:', data.message);
    }
    return data;
  } catch (error) {
    console.error('Error logging page view:', error);
    return { status: 'error', message: error.message || 'An unexpected error occurred' };
  }
};

export default {
  logPageView,
};