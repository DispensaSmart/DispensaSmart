# Dispensa smart

La dispensa di tutta la famiglia: ognuno entra con il proprio account, la famiglia condivide dispensa, ricette e spesa in tempo reale, e le altre famiglie non vedono niente.

## Cosa fare una volta sola

### 1. Firebase (circa 5 minuti)
1. Apri [console.firebase.google.com](https://console.firebase.google.com) con il tuo solito account e tocca **Aggiungi progetto**. Nome: `dispensa-smart`. Google Analytics non serve.
2. **Authentication** → *Inizia* → *Email/password* → attiva il primo interruttore → *Salva*.
3. **Firestore Database** → *Crea database* → località **eur3 (Europa)** → *Modalità produzione* → *Crea*.
4. Sempre in Firestore, scheda **Regole**: cancella tutto, incolla il contenuto del file `firestore.rules` e tocca *Pubblica*.
5. ⚙️ **Impostazioni progetto** → in fondo *Le tue app* → icona **</>** (web) → nome `dispensa` → *Registra app*. Copia il blocco `firebaseConfig`.
6. Su GitHub apri `public/config.js`, tocca la matita e sostituisci `null` con il blocco copiato. *Commit changes*.
7. **Authentication** → *Impostazioni* → *Domini autorizzati* → *Aggiungi dominio* → `dispensasmart.github.io`.
8. **AI Logic** (menu a sinistra, sezione *Build*/*Crea*) → *Inizia* → scegli **Gemini Developer API** (gratuita) → *Abilita*. Serve per leggere foto di prodotti e scontrini.
   Se la lettura dice che *App Check è attivo*: in **App Check** → scheda **API** → **Firebase AI Logic**, togli l'applicazione forzata (l'app non usa App Check).

### 2. GitHub Pages
Nel repository: **Settings** → **Pages** → *Source*: **GitHub Actions**. A ogni modifica l'app si aggiorna da sola su
`https://dispensasmart.github.io/DispensaSmart/`.

## Come è fatta
- `src/app.js` logica, `src/shell.html` grafica, `data.js` prodotti e ricette. `./build.sh` li unisce in `public/index.html`.
- `firestore.rules` regole di sicurezza: ogni famiglia legge e scrive solo i propri dati; si entra solo con il codice di invito.
- I dati di `config.js` sono pubblici per natura: la protezione la fanno le regole.

## Prove in locale
Con Node e Java installati:
```
npm i firebase@12.19.0 firebase-tools@13 playwright
npx firebase emulators:start --project demo-dispensa --only auth,firestore
python3 -m http.server 5055 --directory public   # poi apri http://127.0.0.1:5055/?emu
node tests/regole.test.mjs                         # 14 controlli sulle regole
```
