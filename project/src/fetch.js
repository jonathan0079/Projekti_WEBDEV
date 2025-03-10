
// fetch.js - Yleiset API-pyynnöt
export const fetchData = async (url, options = {}) => {
    try {
        const response = await fetch(url, options);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Fetch error');
        }
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
};
