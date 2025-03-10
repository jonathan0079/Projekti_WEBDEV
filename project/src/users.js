
// users.js - Käyttäjien käsittely
import { fetchData } from './fetch.js';

export const getUsers = async () => {
    const users = await fetchData('http://127.0.0.1:3000/api/users');
    return users;
};

export const addUser = async (userData) => {
    const response = await fetchData('http://127.0.0.1:3000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    });
    return response;
};
