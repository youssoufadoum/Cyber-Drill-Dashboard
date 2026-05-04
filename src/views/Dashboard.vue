<script setup>
import { computed, onMounted } from 'vue';
import { store } from '../store';
import { useRouter } from 'vue-router';

const router = useRouter();

onMounted(async () => {
  await store.fetchDrills();
  await store.fetchResults();
  if (store.currentUser?.role === 'trainer') {
    await store.fetchStudents();
  }
});

const stats = computed(() => {
  if (!store) return [];
  const isTrainer = store.currentUser?.role === 'trainer';
  if (isTrainer) {
    return [
      { label: 'Total Students', value: store.students?.length || 0, icon: 'users', bg: 'linear-gradient(90deg, var(--secondary), var(--secondary-dark))', fg: 'var(--secondary)' },
      { label: 'Active Drills', value: store.drills?.length || 0, icon: 'drills', bg: 'linear-gradient(90deg, var(--primary), var(--accent))', fg: 'var(--primary)' },
      { label: 'Total Results', value: store.results?.length || 0, icon: 'results', bg: 'linear-gradient(90deg, #f59e0b, #f97316)', fg: '#92400e' },
    ];
  } else {
    const totalDrills = store.drills?.length || 0;
    const completed = store.myResults?.length || 0;
    const avg = completed > 0 
      ? Math.round(store.myResults.reduce((a, b) => a + b.score, 0) / completed) 
      : 0;

    return [
      { label: 'Available Drills', value: totalDrills, icon: 'drills', bg: 'linear-gradient(90deg, var(--primary), var(--accent))', fg: 'var(--primary)' },
      { label: 'Completed', value: completed, icon: 'check', bg: 'linear-gradient(90deg, var(--secondary), var(--secondary-dark))', fg: 'var(--secondary)' },
      { label: 'Avg Score', value: avg + '%', icon: 'chart', bg: 'linear-gradient(90deg, #fbbf24, #f97316)', fg: 'var(--accent)' },
    ];
  }
});

const recentDrills = computed(() => store?.drills?.slice(0, 3) || []);
</script>

<template>
  <div>
    <div class="flex justify-between items-end mb-8 pb-6 border-b border-gray-200">
      <div>
        <h1 class="text-3xl font-extrabold text-dark">
          Dashboard
        </h1>
        <router-link
          to="/profile"
          class="text-gray-500 mt-2 block hover:text-blue-600 transition-colors group"
        >
          Welcome back, <span class="font-bold text-dark group-hover:text-blue-600 transition-colors">{{ store.currentUser?.name }}</span>
        </router-link>
      </div>
      <div class="text-gray-500 font-medium">
        {{ new Date().toLocaleDateString() }}
      </div>
    </div>

    <div class="flex flex-wrap gap-5 mb-8">
      <template v-if="store.currentUser?.role === 'trainer'">
        <div
          class="flex-1 min-w-50 bg-surface border-2 border-surface-border rounded-2xl p-5 flex items-center gap-4 cursor-pointer hover:border-primary hover:-translate-y-1 hover:shadow-lg transition-all group"
          @click="router.push('/drills')"
        >
          <div class="w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl bg-gradient-primary shadow-md">
            <svg
              class="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
              xmlns="http://www.w3.org/2000/svg"
            ><path d="M12 2L3 5v6c0 5 3.9 9.7 9 11 5.1-1.3 9-6 9-11V5l-9-3z" /></svg>
          </div>
          <div class="flex-1">
            <div class="font-bold text-dark text-lg">
              Manage Drills
            </div>
            <div class="text-sm text-muted">
              Create, edit and schedule drills
            </div>
          </div>
          <button
            class="btn-accent px-4 py-2 rounded-xl"
            @click.stop="router.push('/create')"
          >
            Create
          </button>
        </div>

        <div
          class="flex-1 min-w-50 bg-surface border-2 border-surface-border rounded-2xl p-5 flex items-center gap-4 cursor-pointer hover:border-primary hover:-translate-y-1 hover:shadow-lg transition-all group"
          @click="router.push('/students')"
        >
          <div class="w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl bg-gradient-primary shadow-md">
            <svg
              class="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
              xmlns="http://www.w3.org/2000/svg"
            ><path d="M17 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle
              cx="12"
              cy="7"
              r="4"
            /></svg>
          </div>
          <div class="flex-1">
            <div class="font-bold text-dark text-lg">
              Students
            </div>
            <div class="text-sm text-muted">
              View student results and progress
            </div>
          </div>
          <button
            class="btn-primary px-4 py-2 rounded-xl"
            @click.stop="router.push('/students')"
          >
            Open
          </button>
        </div>
      </template>

      <template v-else>
        <div
          class="flex-1 min-w-50 bg-surface border-2 border-surface-border rounded-2xl p-5 flex items-center gap-4 cursor-pointer hover:border-primary hover:-translate-y-1 hover:shadow-lg transition-all group"
          @click="router.push('/drills')"
        >
          <div class="w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl bg-gradient-primary shadow-md">
            <svg
              class="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
              xmlns="http://www.w3.org/2000/svg"
            ><path d="M12 2L3 5v6c0 5 3.9 9.7 9 11 5.1-1.3 9-6 9-11V5l-9-3z" /></svg>
          </div>
          <div class="flex-1">
            <div class="font-bold text-dark text-lg">
              Start Drill
            </div>
            <div class="text-sm text-muted">
              Begin exercise
            </div>
          </div>
          <button
            class="btn-accent px-4 py-2 rounded-xl"
            @click.stop="router.push('/drills')"
          >
            Start
          </button>
        </div>

        <div
          class="flex-1 min-w-50 bg-surface border-2 border-surface-border rounded-2xl p-5 flex items-center gap-4 cursor-pointer hover:border-primary hover:-translate-y-1 hover:shadow-lg transition-all group"
          @click="router.push('/results')"
        >
          <div class="w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl bg-gradient-primary shadow-md">
            <svg
              class="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
              xmlns="http://www.w3.org/2000/svg"
            ><path d="M3 21h4V10H3v11zM10 21h4V4h-4v17zM17 21h4v-7h-4v7z" /></svg>
          </div>
          <div class="flex-1">
            <div class="font-bold text-dark text-lg">
              Progress
            </div>
            <div class="text-sm text-muted">
              View analytics
            </div>
          </div>
          <button
            class="btn-primary px-4 py-2 rounded-xl"
            @click.stop="router.push('/results')"
          >
            Open
          </button>
        </div>
      </template>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="bg-surface rounded-2xl p-6 shadow-sm border border-transparent hover:border-surface-border hover:-translate-y-1 transition-all flex items-center gap-5"
      >
        <div
          class="stat-icon"
          :style="{ background: stat.bg }"
        >
          <svg
            v-if="stat.icon === 'users'"
            class="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          ><path d="M17 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle
            cx="12"
            cy="7"
            r="4"
          /></svg>
          <svg
            v-else-if="stat.icon === 'drills'"
            class="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          ><path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" /><path d="M8 12l8 0" /></svg>
          <svg
            v-else-if="stat.icon === 'check' || stat.icon === 'results'"
            class="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          ><path d="M20 6L9 17l-5-5" /></svg>
          <svg
            v-else
            class="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          ><path d="M3 3v18h18" /><path d="M3 9h18" /><path d="M9 3v6" /></svg>
        </div>
        <div>
          <div class="text-3xl font-black text-dark">
            {{ stat.value }}
          </div>
          <div class="text-sm font-medium text-muted mt-1">
            {{ stat.label }}
          </div>
        </div>
      </div>
    </div>

    <h2 class="text-2xl font-extrabold text-dark mb-6 flex items-center gap-3">
      <svg
        class="w-5 h-5 text-primary"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
        stroke-linejoin="round"
      ><path d="M12 8v4l3 3" /></svg>
      Recent Drills
    </h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div
        v-for="drill in recentDrills"
        :key="drill.id"
        class="bg-surface rounded-2xl p-0 border border-transparent hover:border-surface-border hover:shadow-lg hover:-translate-y-1 transition-all overflow-hidden shadow-sm"
      >
        <div class="p-6 relative">
          <span class="absolute top-5 right-5 bg-gradient-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">{{ drill.category }}</span>
          <h3 class="text-xl font-extrabold text-dark mb-2 pr-20">
            {{ drill.title }}
          </h3>
          <p class="text-muted text-sm mb-4 line-clamp-2">
            {{ drill.description }}
          </p>
          <div class="flex gap-4 text-sm text-muted">
            <span class="flex items-center gap-2"><svg
              class="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.4"
              stroke-linecap="round"
              stroke-linejoin="round"
            ><path d="M12 8v4l3 3" /></svg> {{ drill.duration }} min</span>
            <span class="flex items-center gap-2"><svg
              class="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.4"
              stroke-linecap="round"
              stroke-linejoin="round"
            ><path d="M3 17h6v4H3z" /><path d="M14 3h7v11h-7z" /></svg> {{ drill.difficulty }}</span>
          </div>
        </div>
        <div class="px-6 py-4 bg-slate-50 border-t border-gray-100 flex justify-between items-center">
          <span class="text-xs font-bold text-dark bg-blue-50 px-3 py-1 rounded-full">Max Score: {{ drill.maxScore }}</span>
          <router-link
            to="/drills"
            class="btn-accent text-sm font-bold"
          >
            View Details &rarr;
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
