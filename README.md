# Guida per Configurare il Progetto

Benvenuti! Seguite questi semplici passaggi per configurare e avviare il progetto basato sul template. Questa guida è pensata per aiutarvi a iniziare facilmente.

## 1. Creare una Nuova Repository

### Accedere al Template

Vai alla pagina del template su GitHub: https://github.com/LivingtonMerello98/vue-template
### Creare una Nuova Repository

1. Clicca sul pulsante **"Use this template"**.
2. Inserisci un nome per la nuova repository.
3. Clicca su **"Create repository from template"**.

## 2. Clonare la Nuova Repository

Ora che hai creato una nuova repository, devi clonarla sul tuo computer.

### Aprire VSCode

1. Apri Visual Studio Code.
2. Seleziona la voce **'Clone Git Repository'**.
3. Seleziona la cartella in cui vuoi salvare la repository.

### Eseguire il comando di installazione

Apri il terminale integrato di VSCode e esegui il comando:

Esegui il comando per installare tutte le dipendenze necessarie:

Copia codice

npm install

Questo comando installerà tutto ciò di cui il progetto ha bisogno per funzionare.


3. Avviare il Server di Sviluppo
Ora sei pronto per vedere il progetto in azione!

Avviare il Server
Esegui il comando:

npm run dev

Questo avvierà un server di sviluppo e il progetto sarà disponibile su http://localhost:5173. Apri questo URL nel tuo browser per vedere il progetto.

Dipendenze del Progetto
Il progetto utilizza i seguenti pacchetti:

sass: Permette di usare SCSS per gli stili.
bootstrap: Framework CSS per un design reattivo e moderno.
axios: Libreria per fare richieste HTTP.
vue-router: Gestisce la navigazione tra le pagine in Vue.js.
@fortawesome/fontawesome-free: Icone FontAwesome per aggiungere icone al progetto.
@fortawesome/vue-fontawesome: Integrazione di FontAwesome con Vue.js.
Tutti questi pacchetti sono già inclusi e configurati nel progetto. L'installazione con npm install li aggiungerà al tuo ambiente di sviluppo.