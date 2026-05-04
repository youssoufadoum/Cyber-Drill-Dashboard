<script setup>
import { store } from './store';
import { useRouter } from 'vue-router';
import { watch, ref, onErrorCaptured } from 'vue';

const router = useRouter();
const error = ref(null);

onErrorCaptured((err) => {
  console.error('Captured Error:', err);
  error.value = err.message || String(err);
  return false;
});

watch(() => store.currentUser, (newUser) => {
  if (newUser && (router.currentRoute.value.path === '/login' || router.currentRoute.value.path === '/signup')) {
    router.push('/');
  }
}, { immediate: true });

const handleLogout = async () => {
  await store.logout();
  router.push('/login');
};
</script>

<template>
  <div class="min-h-screen bg-slate-50 font-sans text-slate-900">
    <nav
      v-if="store.currentUser"
      class="bg-white border-b border-slate-200 sticky top-0 z-50"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center gap-8">
            <router-link
              to="/"
              class="flex items-center gap-2"
            >
              <img 
                src="https://i.imgur.com/9qDNvIO.png" 
                alt="CyberDrill Logo" 
                class="w-12 h-12 object-contain"
                referrerPolicy="no-referrer"
              >
            </router-link>
            
            <div class="hidden md:flex items-center gap-4">
              <router-link
                to="/"
                class="px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-100 transition-colors"
                active-class="bg-blue-50 text-blue-600"
              >
                Dashboard
              </router-link>
              <router-link
                to="/drills"
                class="px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-100 transition-colors"
                active-class="bg-blue-50 text-blue-600"
              >
                Drills
              </router-link>
              <router-link
                v-if="store.currentUser.role === 'trainer'"
                to="/students"
                class="px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-100 transition-colors"
                active-class="bg-blue-50 text-blue-600"
              >
                Students
              </router-link>
              <router-link
                to="/results"
                class="px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-100 transition-colors"
                active-class="bg-blue-50 text-blue-600"
              >
                Results
              </router-link>
              <router-link
                to="/profile"
                class="px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-100 transition-colors"
                active-class="bg-blue-50 text-blue-600"
              >
                Profile
              </router-link>
            </div>
          </div>
          
          <div class="flex items-center gap-4">
            <router-link
              to="/profile"
              class="flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-all group"
            >
              <div class="flex flex-col items-end">
                <span class="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{{ store.currentUser.name }}</span>
                <span class="text-xs text-slate-500 capitalize">{{ store.currentUser.role }}</span>
              </div>
              <div class="w-9 h-9 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center text-sm group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">
                <i class="fas fa-user" />
              </div>
            </router-link>
            
            <button
              class="p-2 text-slate-400 hover:text-red-600 transition-colors"
              title="Logout"
              @click="handleLogout"
            >
              <svg
                class="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              ><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line
                x1="21"
                y1="12"
                x2="9"
                y2="12"
              /></svg>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div
        v-if="error"
        class="bg-red-50 border-l-4 border-red-400 p-4 mb-8 rounded-r-xl"
      >
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <i class="fas fa-exclamation-circle text-red-400" />
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700 font-medium">
              Something went wrong: {{ error }}
            </p>
            <button
              class="mt-2 text-xs text-red-600 underline hover:text-red-800"
              @click="error = null"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>

      <router-view v-if="store.isAuthReady" />
      <div
        v-else
        class="flex items-center justify-center h-64"
      >
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    </main>
  </div>
</template>

<style scoped>
</style>
