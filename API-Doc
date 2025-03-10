# PasaGym API Dokumentaatio

PasaGym-sovelluksen rajapinnat.

## Perus URL

```
http://localhost:3000/api
```

## Autentikaatio

API käyttää JWT-tokeneita suojattuihin päätepisteisiin. Token lisätään HTTP-pyyntöjen Authorization-otsikkoon:

```
Authorization: Bearer [token]
```

## Päätepisteet

### Autentikaatio

#### Rekisteröinti
- **URL**: `/api/auth/register`
- **Metodi**: POST
- **Body**: `{ "username": "käyttäjänimi", "email": "sähköposti", "password": "salasana" }`
- **Vastaus**: Token ja käyttäjän tiedot

#### Kirjautuminen
- **URL**: `/api/auth/login`
- **Metodi**: POST
- **Body**: `{ "username": "käyttäjänimi", "password": "salasana" }`
- **Vastaus**: Token ja käyttäjän tiedot

#### Käyttäjän tiedot
- **URL**: `/api/auth/me`
- **Metodi**: GET
- **Headers**: Authorization token
- **Vastaus**: Kirjautuneen käyttäjän tiedot

### Päiväkirja

Kaikki päiväkirjan päätepisteet pitäisivät vaatia autentikaation.

#### Hae kaikki merkinnät
- **URL**: `/api/diary`
- **Metodi**: GET
- **Headers**: Authorization token
- **Vastaus**: Lista käyttäjän päiväkirjamerkinnöistä

#### Luo merkintä
- **URL**: `/api/diary`
- **Metodi**: POST
- **Headers**: Authorization token
- **Body**: `{ "entry_date": "YYYY-MM-DD", "mood": "Mieliala", "weight": 75.5, "sleep_hours": 8, "notes": "Muistiinpanot" }`
- **Vastaus**: Luotu merkintä

#### Hae merkintä
- **URL**: `/api/diary/:id`
- **Metodi**: GET
- **Headers**: Authorization token
- **Vastaus**: Yksittäinen päiväkirjamerkintä

#### Päivitä merkintä
- **URL**: `/api/diary/:id`
- **Metodi**: PUT
- **Headers**: Authorization token
- **Body**: `{ "entry_date": "YYYY-MM-DD", "mood": "Mieliala", "weight": 75.5, "sleep_hours": 8, "notes": "Muistiinpanot" }`
- **Vastaus**: Päivitetty merkintä

#### Poista merkintä
- **URL**: `/api/diary/:id`
- **Metodi**: DELETE
- **Headers**: Authorization token
- **Vastaus**: Onnistumisviesti

### Peli

#### Tulostaulukko
- **URL**: `/api/game/leaderboard`
- **Metodi**: GET
- **Parametrit**: `game_type` (oletus: "calorie_clicker"), `limit` (oletus: 10)
- **Vastaus**: Lista parhaista tuloksista

#### Tallenna tulos
- **URL**: `/api/game/scores`
- **Metodi**: POST
- **Headers**: Authorization token
- **Body**: `{ "score": 850, "game_type": "calorie_clicker" }`
- **Vastaus**: Tallennettu tulos

#### Käyttäjän tulokset
- **URL**: `/api/game/user-scores`
- **Metodi**: GET
- **Headers**: Authorization token
- **Parametrit**: `game_type` (oletus: "calorie_clicker"), `limit` (oletus: 5)
- **Vastaus**: Lista käyttäjän tuloksista

#### Käyttäjän paras tulos
- **URL**: `/api/game/high-score`
- **Metodi**: GET
- **Headers**: Authorization token
- **Parametrit**: `game_type` (oletus: "calorie_clicker")
- **Vastaus**: Käyttäjän paras tulos

## Virheet

API käyttää standardeja HTTP-statuskoodeja:
- 200: OK
- 201: Luotu
- 400: Virheellinen pyyntö
- 401: Autentikaatio vaaditaan
- 403: Pääsy estetty
- 404: Ei löydy
- 500: Palvelinvirhe

Virhevastauksissa on aina `success: false` ja virheviesti:
```json
{
  "success": false,
  "message": "Virheviesti"
}
```