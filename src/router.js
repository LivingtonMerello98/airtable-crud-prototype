// src/router.js
import { createRouter, createWebHistory } from 'vue-router';
import HomePage from './pages/HomePage.vue';
import RecordEditor from './components/RecordEditor.vue';

const routes = [
    { name: 'home', path: '/', component: HomePage },
    { name: 'edit-record', path: '/edit-record', component: RecordEditor },
];

const router = createRouter({
    history: createWebHistory(),  // <- history mode
    routes,
});

export default router;
