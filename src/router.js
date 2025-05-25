import { createRouter, createWebHistory } from 'vue-router';
// 1.importare la pagina
//import HomePage from './pages/HomePage.vue';


//2 definiamo la rotta con Name, Path e Component.
const routes = [
    {
        name: 'homePage',
        path: '/',
        component: HomePage
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;