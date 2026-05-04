<script setup>
import { onMounted, ref } from 'vue';
import { store } from '../store';
import { useRouter } from 'vue-router';

const router = useRouter();

onMounted(async () => {
  await store.fetchDrills();
  if (store.currentUser?.role === 'student') {
    await store.fetchResults();
  }
});

const getAttemptsCount = (drillId) => {
  if (!store.results) return 0;
  return store.results.filter(r => r.drillId === drillId && r.studentId === store.currentUser?.uid).length;
};

const isAttemptLimitReached = (drill) => {
  if (store.currentUser?.role !== 'student') return false;
  const maxAttempts = drill.maxAttempts || 1;
  return getAttemptsCount(drill.id) >= maxAttempts;
};

const startDrill = (drill) => {
  if (isAttemptLimitReached(drill)) {
    alert('You have reached the maximum number of attempts for this drill.');
    return;
  }
  router.push({ name: 'drill', params: { id: drill.id } });
};

const editDrill = (drillId) => {
  router.push({ name: 'edit-drill', params: { id: drillId } });
};

const drillToDelete = ref(null);

const deleteDrill = async (drillId) => {
  drillToDelete.value = drillId;
};

const confirmDelete = async () => {
  if (!drillToDelete.value) return;
  try {
    await store.deleteDrill(drillToDelete.value);
    drillToDelete.value = null;
  } catch (error) {
    console.error('Failed to delete drill:', error);
    alert('Failed to delete drill.');
    drillToDelete.value = null;
  }
};
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-8 pb-6 border-b border-gray-200">
      <div>
        <h1 class="text-3xl font-extrabold text-dark">Training Drills</h1>
        <p class="text-gray-500 mt-2">Select a drill to begin training</p>
      </div>
      <div v-if="store.currentUser?.role === 'trainer'">
        <router-link
          to="/create"
          class="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-100 flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Create New Drill
        </router-link>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <div
        v-for="drill in store.drills"
        :key="drill.id"
        class="bg-surface rounded-2xl overflow-hidden shadow-sm border border-transparent hover:border-surface-border hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col h-full relative"
      >

        <div
          v-if="store.currentUser?.role === 'trainer'"
          class="absolute top-4 right-4 z-10 group"
        >
          <button
            class="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50"
          >
            <svg
              class="w-5 h-5 text-gray-600"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>

          <div
            class="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all"
          >
            <button
              @click="editDrill(drill.id)"
              class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-xl"
            >
              ✏️ Edit Drill
            </button>
            <button
              @click="deleteDrill(drill.id)"
              class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-xl"
            >
              🗑️ Delete Drill
            </button>
          </div>
        </div>

        <div class="p-6 flex-1 relative">
          <span
            class="absolute top-5 right-5 bg-linear-to-r from-primary to-primary-dark text-white text-xs font-bold px-3 py-1 rounded-full uppercase"
          >
            {{ drill.category }}
          </span>

          <h3 class="text-xl font-extrabold text-dark mb-3 pr-16">
            {{ drill.title }}
          </h3>

          <p class="text-gray-500 text-sm mb-6">
            {{ drill.description }}
          </p>

          <div class="flex flex-wrap gap-3 mb-4">
            <span class="bg-slate-50 text-gray-500 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2">
              <i class="fas fa-clock"></i> {{ drill.duration }} min
            </span>
            <span class="bg-slate-50 text-gray-500 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2">
              <i class="fas fa-signal"></i> {{ drill.difficulty }}
            </span>
            <span 
              v-if="store.currentUser?.role === 'student'"
              class="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2"
              :class="isAttemptLimitReached(drill) ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'"
            >
              <i class="fas fa-redo"></i> {{ getAttemptsCount(drill.id) }} / {{ drill.maxAttempts || 1 }} Attempts
            </span>
            <span 
              v-else
              class="bg-slate-50 text-gray-500 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2"
            >
              <i class="fas fa-redo"></i> Limit: {{ drill.maxAttempts || 1 }}
            </span>
          </div>

          <div class="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
            <span class="text-xs font-bold text-primary block mb-1">
              Scenario:
            </span>
            <p class="text-xs text-gray-600 italic">
              {{ drill.scenario }}
            </p>
          </div>
        </div>

        <div
          class="p-5 bg-slate-50 border-t border-gray-100 flex justify-between items-center mt-auto"
        >
          <span class="font-bold text-gray-600 text-sm">
            Max: {{ drill.maxScore }} pts
          </span>

          <div>
            <router-link
              v-if="store.currentUser?.role === 'trainer'"
              :to="{ name: 'drill-students', params: { id: drill.id } }"
              class="px-5 py-2 rounded-lg font-bold text-sm btn-accent inline-flex items-center gap-2"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 13h4v8H3zM10 3h4v18h-4zM18 8h4v13h-4z" />
              </svg>
              View Results
            </router-link>

            <button
              v-else
              @click="startDrill(drill)"
              :disabled="isAttemptLimitReached(drill)"
              class="px-5 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2"
              :class="isAttemptLimitReached(drill) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'btn-accent'"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              {{ isAttemptLimitReached(drill) ? 'Limit Reached' : 'Start' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="drillToDelete" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl scale-in">
        <div class="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h3 class="text-xl font-extrabold text-dark text-center mb-2">Delete Drill?</h3>
        <p class="text-gray-500 text-center mb-8">This action cannot be undone. All associated results will remain but the drill will be removed.</p>
        <div class="flex gap-3">
          <button @click="drillToDelete = null" class="flex-1 px-4 py-3 font-bold text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 transition">
            Cancel
          </button>
          <button @click="confirmDelete" class="flex-1 px-4 py-3 font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 transition shadow-lg shadow-red-200">
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
