import {fetchData} from './fetch';

/////////////////////
// Dialogi
const dialog = document.querySelector('.info_dialog');
const closeButton = document.querySelector('.info_dialog button');

closeButton.addEventListener('click', () => {
  dialog.close();
});

/////////////////////
// Snackbar
const snackbar = document.getElementById('snackbar');

const showSnackbar = (message, type = '') => {
  snackbar.innerText = message;
  snackbar.className = `show ${type}`.trim(); // Add optional type class (e.g., 'error')

  setTimeout(() => {
    snackbar.className = snackbar.className.replace('show', '').trim();
  }, 3000);
};

/////////////////////
// getUsers
const getUsers = async () => {
  const url = 'http://localhost:3000/api/users';
  const users = await fetchData(url);

  if (users.error) {
    console.log('Tapahtui virhe fetch haussa!!');
    return;
  }

  console.log(users);

  const tableBody = document.querySelector('.tbody');
  tableBody.innerHTML = ''; //tyhjennetään taulukko

  // TODO, myöhemmin järkevä erotella omaksi funktiokseen
  users.forEach((user) => {
    const row = document.createElement('tr');

    row.innerHTML = `
        <td>${user.username}</td>
        <td>${user.email}</td>
        <td><button class="check" data-id="${user.user_id}">Info</button></td>
        <td><button class="del" data-id="${user.user_id}">Delete</button></td>
        <td>${user.user_id}</td>
      `;

    tableBody.appendChild(row);
  });

  addEventListeners();
};

const addEventListeners = () => {
  const nappulat = document.querySelectorAll('.check');
  console.log(nappulat);
  nappulat.forEach((button) => {
    button.addEventListener('click', async (event) => {
      console.log('Klikkasit nappulaa:', event.target);
      const userId = event.target.dataset.id;
      console.log('Haetaan tietoja käyttäjälle id:llä:', userId);

      const user = await getUserById(userId);
      console.log(user);

      if (user) {
        dialog.querySelector('p').innerHTML = '';
        dialog.showModal();
        dialog.querySelector('p').innerHTML = `
          <div>User ID: <span>${user.user_id}</span></div>
          <div>User Name: <span>${user.username}</span></div>
          <div>Email: <span>${user.email}</span></div>
          <div>Role: <span>${user.user_level}</span></div>`;
      }
    });
  });
};

/////////////////////
// getUsersById
const getUserById = async (userId) => {
  const user = await fetchData(`http://localhost:3000/api/users/${userId}`);

  if (user.error) {
    console.error(`Error fetching item with ID ${userId}:`, user.error);
    alert(`Error: ${user.error}`);
    return null;
  }
  return user;
};

/////////////////////
// addUser
const addUser = async (event) => {
  event.preventDefault();

  // Haetaan formista oikea tieto mikä on täytetty .value
  const username = document.querySelector('#username').value.trim();
  const password = document.querySelector('#password').value.trim();
  const email = document.querySelector('#email').value.trim();

  // url
  const url = 'http://localhost:3000/api/users';

  // POST
  //content-type: application/json

  const bodyData = {
    username: username,
    password: password,
    email: email,
  };

  // options eli mikä metodi, headers ja JSON
  const options = {
    body: JSON.stringify(bodyData),
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
  };
  console.log(options);

  const response = await fetchData(url, options);

  if (response.error) {
    // On hyvä jättää oikea virhe ns. koodareille luettavaksi
    console.log(response.error);
    // Käyttäjän viesti!!
    showSnackbar(
      'Virhe lähettämisessä, täytä kaikki vaadittavat kentät!',
      'error',
    );
    return;
  }

  if (response.message) {
    console.log(response.message);
    showSnackbar('Onnistunut käyttäjän lisääminen :) 💕', 'success');
  }

  console.log(response);
  document.querySelector('.addform').reset(); // tyhjennetään formi
  getUsers();
};

// TODOO
// Tee tänne funktio joka hakee yksittäiset käyttäjän tiedot
// KÄytä tähän reittiä
// GET http://localhost:3000/api/users/:id

export {getUsers, addUser};
