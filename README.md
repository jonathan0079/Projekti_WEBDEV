# Ohjelmistotestaus - yksilötehtävät
## 1	Tehtävä
Ensimmäisessä tehtävässä oli tavoitteena asentaa projektissa käytettävä Robot Framework automaatiotestaustyökalu ja sen lisäosat.
 Komponentit mitä asensin:
-	Python 3.13 virtuaaliympäristö (.venv)
-	Robot Framework 7.2
-	Browser Library 19.3, joka on web-sovellustestaamiseen
-	Requests Library 0.4.2, joka on salasanojen käsittelyyn
-	Robotidy 4.16, koodin muotoiluun

Asennukset suoritettiin opettajan antaman ohjeen mukaisesti (1)
Python-virtuaaliympäristöön, joka luotiin projektin juuri hakemistoon. Pip päivitettiin ennen kirjastojen asennusta. Browser Libraryyn asennettiin myös tarvit-tavat selainajurit komennolla: `rfbrowser init`. Asennusten onnistuminen varmistettiin asennustesti.py-skriptillä

![asennustesti py](https://github.com/user-attachments/assets/f534bba5-0622-4efb-a997-5c5a8e0ff283)

Kuvassa suoritettu onnistunut asennustesti.py-skripti. 


Riippuvuudet on dokumentoitu requirements.txt-tiedostoon, joka mahdollistaa samojen kirjastojen asennuksen toisessa laitteessa.

![requirements](https://github.com/user-attachments/assets/8cadb625-6e6b-49c3-be85-4c88718f4019)

Kuvassa käytetty komento: `pip install -r requirements.txt` tarvittujen kirjastojen asennukseen mikäli niitä ei löydy nykyisessä ympäristössä. Tässä tapauksessa kaikki löytyvät, koska joka riviltä löytyy "Requirement already satisfied:...".
