import {fetchData} from './fetch';

const getEntries = async () => {
  console.log('Moikka, maailma');
  console.log('Haetaan paikallisesta tiedostosta');

  // haetaan alue joho luodaan kortit
  const diaryContainer = document.getElementById('diary');
  console.log(diaryContainer);

  // haetaan data joko json tai fetch rajapinnasta
  const url = '/diary.json';
  const response = await fetchData(url);

  if (response.error) {
    console.log('Tapahtui virhe fetch haussa!!');
    return;
  }

  console.log(response);

  // looppi jossa luodaan yksittäiset kortit
  diaryContainer.innerHTML = '';
  response.forEach((entry) => {
    const card = document.createElement('div');
    card.classList.add('card');

    const cardImg = document.createElement('div');
    cardImg.classList.add('card-img');

    const img = document.createElement('img');
    img.src = '/img/diary.jpg';
    img.alt = 'Diary Image';
    cardImg.appendChild(img);

    const cardDiary = document.createElement('div');
    cardDiary.classList.add('card-diary');
    cardDiary.innerHTML = `
      <p><strong>Date:</strong> ${entry.entry_date}</p>
      <p><strong>Mood:</strong> ${entry.mood}</p>
      <p><strong>Weight:</strong> ${entry.weight} kg</p>
      <p><strong>Sleep:</strong> ${entry.sleep_hours} hours</p>
      <p><strong>Notes:</strong> ${entry.notes}</p>
    `;

    card.appendChild(cardImg);
    card.appendChild(cardDiary);
    diaryContainer.appendChild(card);
  });
};

export {getEntries};
