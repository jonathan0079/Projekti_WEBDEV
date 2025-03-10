
// main.js - Yhdistetään kaikki toiminnallisuudet
import { getItems } from './items.js';
import { getUsers, addUser } from './users.js';

document.addEventListener('DOMContentLoaded', async () => {
    document.querySelector('#fetch-items').addEventListener('click', getItems);
    document.querySelector('#fetch-users').addEventListener('click', async () => {
        const users = await getUsers();
        console.log('Users:', users);
    });

    document.querySelector('#add-user-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = document.querySelector('#username').value;
        const email = document.querySelector('#email').value;
        const password = document.querySelector('#password').value;

        const newUser = await addUser({ username, email, password });
        console.log('New user added:', newUser);
    });
});
