Varmista ensin että sinulla on järkevä hakemistorakenne sovelluksessasi. Alla näet yleisen rakenteen monisivuiselle web-projektille. Sinulla voi olla toisenkinlainen rakenne, kunhan saat järkevästi julkaistua projektisi dist kansioon ja polut toimivat.

Julkaisua sekä testaamista varten löydät vite-demoprojektin täältä. Mikäli olet epävarma omasta sovelluksesi toiminnasta, asenna tämä demoprojekti testausta varten. Katso myös miten tiedostoissa on viitattu erilaisiin tiedostojen relatiivisiin polkuihin.

```
my-vite-project/
│
├── public/               # Julkiset tiedostot (suoraan käytettävissä)
│   ├── favicon.ico       # Esim. favicon tai staattiset kuvat
│   └── img/
│       └── logo.png
│
├── src/                  # Lähdekoodi
│   │
│   ├── css/              # Tyylitiedostot
│   │   └── main.css
│   │
│   ├── js/               # JavaScript-tiedostot
│   │   ├── main.js       # Pääsivun JS
│   │   └── about.js      # About-sivun JS
│   │
│   └── pages/            # Kurssin testaussivut, ei julkaista
│       └── apitest.html  # Esim. apitest, ym. projektin testaus
│
├── dist/                 # Rakennettu projekti (automaattisesti luotu)
│
├── index.html            # Etusivu
├── bmi.html              # Toinen sivu
├── vite.config.js        # Vite-konfiguraatio
├── package.json          # Projektin riippuvuudet ja skriptit
└── README.md             # Projektin esittely

```
