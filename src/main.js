import { createApp } from 'vue';
//import router from './router';
import './style.scss';
import App from './App.vue';

// bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';

// fontawesome
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

//importare l'icona
import { faCode, faPaintBrush, faRocket, faHandshake, faLaptopCode, faMobileAlt, faCloud, faDatabase, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';


// Aggiungi le icone alla libreria
library.add(faCode, faPaintBrush, faRocket, faHandshake, faLaptopCode, faMobileAlt, faCloud, faDatabase, faEdit, faTrash);

const app = createApp(App);
//app.use(router);
app.component('font-awesome-icon', FontAwesomeIcon); // Registrazione globale del componente FontAwesome
app.mount('#app');
