import { createRouter, createWebHistory } from 'vue-router';
import { store } from '../store';

import Dashboard from '../views/Dashboard.vue';
import Login from '../views/login.vue';
import Signup from '../views/signup.vue';
import Drills from '../views/Drills.vue';
import CreateDrill from '../views/CreateDrill.vue';
import EditDrill from '../views/EditDrill.vue';
import Results from '../views/Results.vue';
import Profile from '../views/profile.vue';
import Students from '../views/students.vue';
import DrillStudents from '../views/drill-students.vue';
import DrillRes from '../views/drillres.vue';
import StudentResult from '../views/studentresult.vue';
import Feedback from '../views/feedback.vue';

const routes = [
  { path: '/', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/login', component: Login, name: 'login' },
  { path: '/signup', component: Signup },
  { path: '/drills', component: Drills, meta: { requiresAuth: true } },
  { path: '/create', component: CreateDrill, meta: { requiresAuth: true, role: 'trainer' } },
  { path: '/edit/:id', component: EditDrill, name: 'edit-drill', meta: { requiresAuth: true, role: 'trainer' } },
  { path: '/results', component: Results, meta: { requiresAuth: true } },
  { path: '/profile', component: Profile, meta: { requiresAuth: true } },
  { path: '/students', component: Students, meta: { requiresAuth: true, role: 'trainer' } },
  { path: '/drill-students/:id', component: DrillStudents, name: 'drill-students', meta: { requiresAuth: true, role: 'trainer' } },
  { path: '/drill/:id', component: DrillRes, name: 'drill', meta: { requiresAuth: true } },
  { path: '/student-result/:name', component: StudentResult, name: 'student-result', meta: { requiresAuth: true } },
  { path: '/feedback/:drillId/:studentId/:name', component: Feedback, name: 'feedback', meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiredRole = to.meta.role;

  if (requiresAuth && !store.currentUser) {
    next('/login');
  } else if (requiredRole && store.currentUser?.role !== requiredRole) {
    next('/');
  } else {
    next();
  }
});

export default router;
