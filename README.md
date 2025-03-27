# PasaGym - Terveyspäiväkirja

PasaGym on parodia terveyden seurannan web-sovelluksesta, joka tarjoaa käyttäjille mahdollisuuden lisätä, muokata, sekä poistaa päiväkirjatietoa, laskea painoindeksiä, pelata huonosti kerrottua kaloripeliä ja etsiä lähimmän keksityn kuntosalin.

## Sovelluksen käyttöliittymä
<img width="427" alt="31f1a73301688072f5142e3ac1ea8ac1" src= "https://github.com/user-attachments/assets/ce3f43e5-10b7-4598-ad23-2d6c68f1daab" />
<img width="427" alt="0175d5be4fd6039fea3b25831a9c907e" src= "https://github.com/user-attachments/assets/db7bcf5a-84c0-47f8-8d24-f9304cf037c1" />
<img width="427" alt="e3dfc26a51310babdc0fbe9d848467e5" src= "https://github.com/user-attachments/assets/f93699c7-95eb-4b20-ab25-a8b353a76696" />
<img width="427" alt="f6a143e845e723b4d5af7aab69fc5638" src= "https://github.com/user-attachments/assets/55e4724f-aa85-44ba-ad74-9b8aec3c9e5b" />
<img width="427" alt="f7de9a3c6ae5540c64e67d57f70ce495" src= "https://github.com/user-attachments/assets/f67e265d-aa2c-459c-842c-1ad70e4b7d54" />
<img width="427" alt="81292f4c84c2cc6e1fe5ae41af3ddc33" src= "https://github.com/user-attachments/assets/67e67aae-262f-46a3-989f-929b05b979a6" />
<img width="986" alt="289557e0a866d5b9b119d3ff83153ed8" src= "https://github.com/user-attachments/assets/e23ae72b-e74a-43b1-9dd3-221ec7f879ae" />



## Linkki sovellukseen

Front-end: [http://localhost:5173](http://localhost:5173)

## Back-end

Back-end API: [http://localhost:3000/api](http://localhost:3000/api)

## API-dokumentaatio

API-dokumentaatio on saatavilla osoitteessa: [API-Dokumentaatio](https://github.com/jonathan0079/Projekti_WEBDEV/blob/main/API-Doc)

API tarjoaa seuraavat päätepisteet:
- `/api/auth` - Käyttäjien autentikaatio
- `/api/diary` - Päiväkirjamerkintöjen hallinta
- `/api/game` - Pelitulosten hallinta

## Tietokannan kuvaus

Sovellus käyttää MySQL-tietokantaa nimeltä "HealthDiary", joka sisältää seuraavat taulut:

### Users
Käyttäjien tiedot:
- `user_id` - Käyttäjän ID (primary key)
- `username` - Käyttäjänimi (uniikki)
- `password` - Salasana (bcrypt-suojattu)
- `email` - Sähköposti (uniikki)
- `created_at` - Luontiaika
- `user_level` - Käyttäjän rooli (default: 'regular')

### DiaryEntries
Käyttäjien päiväkirjamerkinnät:
- `id` - Merkinnän ID (primary key)
- `user_id` - Käyttäjän ID (foreign key)
- `entry_date` - Merkinnän päivämäärä
- `mood` - Mieliala
- `weight` - Paino
- `sleep_hours` - Unitunnit
- `notes` - Muistiinpanot
- `created_at` - Luontiaika

### GameScores
Pelitulokset:
- `id` - Tuloksen ID (primary key)
- `user_id` - Käyttäjän ID (foreign key)
- `score` - Pistemäärä
- `game_type` - Pelin tyyppi
- `created_at` - Luontiaika

## Toiminnallisuudet

### Käyttäjähallinta
- Rekisteröityminen
- Kirjautuminen
- Kirjautumisen tarkistus
- Käyttäjävalikko kirjautuneille käyttäjille

### Painoindeksilaskuri
- Painoindeksin (BMI) laskeminen
- Tuloksen luokittelu (alipaino, normaali paino, ylipaino)
- Visuaalinen tuloksen esitys

### Terveyspäiväkirja
- Päiväkirjamerkintöjen lisääminen
- Päiväkirjamerkintöjen muokkaaminen
- Päiväkirjamerkintöjen poistaminen
- Merkintöjen listaus

### Kaloritreeni-peli
- Interaktiivinen pelimekaniikka
- Pisteiden kerääminen
- Tulosten tallentaminen
- Tulostaulukko (leaderboard)

### Kuntosalikartta
- Kuntosalien näyttäminen kartalla
- Lähimmän kuntosalin etsiminen
- Käyttäjän sijainnin näyttäminen kartalla

## Tunnetut ongelmat ja rajoitukset

- Karttaominaisuus vaatii Google Maps API-avaimen, joka puuttuu tästä toteutuksesta
- Peli toimii parhaiten työpöytälaitteilla, mobiilituki on rajallinen
- Kuvia ei tallenneta palvelimelle

## Teknologiat ja kirjastot

### Frontend
- Vanilla JavaScript
- HTML5/CSS3
- Vite (build-työkalu)

### Backend
- Node.js
- Express.js
- MySQL (tietokanta)
- bcrypt (salasanojen suojaus)
- jsonwebtoken (JWT-autentikaatio)
- cors (cross-origin resource sharing)
