import { API_URL, authFetch } from '../utils/utils';

const ADMIN_API_URL = `${API_URL}/server/api/admin`;

/**
 * Helper function to construct a query string for date ranges.
 * @param {string} [startDate] - Start date in 'YYYY-MM-DD' format.
 * @param {string} [endDate] - End date in 'YYYY-MM-DD' format.
 * @returns {string} The URL query string.
 */
const buildDateQuery = (startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) {
    params.append('startDate', startDate);
  }
  if (endDate) {
    params.append('endDate', endDate);
  }
  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

/**
 * A generic function to fetch a report from an admin endpoint.
 * @param {string} endpoint - The specific admin endpoint (e.g., 'new-members.php').
 * @param {string} [startDate] - Optional start date.
 * @param {string} [endDate] - Optional end date.
 * @returns {Promise<Object>} The report data from the API.
 */
const fetchAdminReport = async (endpoint, startDate, endDate) => {
  const queryString = buildDateQuery(startDate, endDate);
  const url = `${ADMIN_API_URL}/${endpoint}${queryString}`;
  
  const response = await authFetch(url);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ 
      message: `Failed to fetch ${endpoint}. Server returned status ${response.status}.` 
    }));
    throw new Error(errorData.message);
  }

  return response.json();
};

/**
 * Fetches the new members report.
 */
export const getNewMembers = (startDate, endDate) => {
  return fetchAdminReport('new-members.php', startDate, endDate);
};

/**
 * Fetches the new scavenger hunts report.
 */
export const getNewHunts = (startDate, endDate) => {
  return fetchAdminReport('new-hunts.php', startDate, endDate);
};

/**
 * Fetches the visitor data report.
 */
export const getVisitorData = (startDate, endDate) => {
  return fetchAdminReport('visitors.php', startDate, endDate);
};

/**
 * Fetches the AI API usage report.
 */
export const getAiUsageData = (startDate, endDate) => {
  return fetchAdminReport('ai-usage.php', startDate, endDate);
};

const adminService = {
  getNewMembers: (startDate, endDate) => {
    return fetchAdminReport('new-members.php', startDate, endDate);
  },

  getNewHunts: (startDate, endDate) => {
    return fetchAdminReport('new-hunts.php', startDate, endDate);
  },
  getVisitorData,
  getAiUsageData,
};

export default adminService;