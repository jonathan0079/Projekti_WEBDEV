/**
 * Fetches JSON data from APIs
 *
 * @param {string} url - api endpoint url
 * @param {Object} options - request options, metodit GET default, POST, DELTE
 *
 * @returns {Object} response json data
 */
const fetchData = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json();
      return {error: errorData.message || 'An error occurred'};
    }
    return await response.json(); // Return successful response data
  } catch (error) {
    console.error('fetchData() error:', error.message);
    return {error: error.message};
  }
};

export {fetchData};
