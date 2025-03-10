
// items.js - Tavaroiden haku
import { fetchData } from './fetch.js';

export const getItems = async () => {
    const items = await fetchData('http://127.0.0.1:3000/api/items');
    console.log('Items:', items);
};
