<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { store } from '../store';

const route = useRoute();
const router = useRouter();
const id = route.params.id;
const drill = computed(() => store.drills.find(d => String(d.id) === String(id)));

const participants = ref([]);
const loading = ref(true);

onMounted(async () => {
  if (store.drills.length === 0) {
    await store.fetchDrills();
  }
  
  participants.value = await store.fetchParticipants(id);
  
  await store.fetchResults();
  
  loading.value = false;
});

const studentsMap = computed(() => {
  const map = [];
  
  const addedIds = new Set();
  
  participants.value.forEach(p => {
    if (!addedIds.has(p.studentId)) {
      const evaluation = store.results.find(r => r.drillId === id && r.studentId === p.studentId);
      
      map.push({
        studentId: p.studentId,
        studentName: p.studentName || 'Student',
        hasEvaluation: !!(evaluation && evaluation.feedback),
        evaluation: evaluation,
        joinedAt: p.joinedAt || p.timestamp
      });
      addedIds.add(p.studentId);
    }
  });

  return map;
});
</script>

<template>
  <div>
    <div class="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <button @click="router.push('/drills')" class="w-10 h-10 rounded-full bg-surface border border-surface-border flex items-center justify-center hover:bg-slate-50 transition-all shadow-sm">
           <svg class="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div class="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center text-white text-xl font-bold shadow-md">
           {{ drill?.title?.charAt(0) || 'D' }}
        </div>
        <div>
          <h1 class="text-2xl font-extrabold text-dark">{{ drill?.title || 'Drill' }}</h1>
          <p class="text-muted">Student Submissions</p>
        </div>
      </div>
      <div class="text-sm px-4 py-2 bg-blue-50 text-blue-800 rounded-lg font-bold border border-blue-100 flex items-center gap-2">
         <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-2.99 1.34-2.99 3s1.33 3 2.99 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5.01 6.34 5.01 8 6.34 11 8 11zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
         Total Submissions: {{ studentsMap.length }}
      </div>
    </div>

    <div v-if="loading" class="p-10 text-center text-muted font-medium">Loading submissions...</div>
    <div v-else-if="!drill" class="p-10 text-center text-muted font-medium">Drill not found.</div>

    <div v-else class="grid grid-cols-1 gap-4">
      <div v-if="studentsMap.length === 0" class="p-10 text-center text-muted bg-surface rounded-2xl border border-surface-border shadow-sm">
         <div class="text-4xl mb-4">📭</div>
         <p class="font-medium text-lg text-dark mb-1">No submissions yet</p>
         <p class="text-sm">Students who complete this drill will appear here.</p>
      </div>

      <div v-else>
        <div v-for="item in studentsMap" :key="item.studentId" class="bg-surface rounded-2xl p-5 shadow-sm border border-surface-border flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-blue-200 hover:shadow-md transition-all mb-4">
          
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-gray-500 font-bold border border-gray-200">
               {{ item.studentName.charAt(0).toUpperCase() }}
            </div>
            <div>
              <div class="font-extrabold text-dark text-lg">{{ item.studentName }}</div>
              <div class="text-sm text-gray-500 font-medium">
                 Status: <span :class="item.hasEvaluation ? 'text-green-600' : 'text-amber-500'">{{ item.hasEvaluation ? 'Graded' : 'Pending Evaluation' }}</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-6">
            <div class="w-48 hidden md:block">
              <div v-if="item.hasEvaluation" class="flex flex-col gap-1">
                <div class="text-sm font-bold flex justify-between">
                   <span class="text-dark">Score</span>
                   <span class="text-secondary">{{ item.evaluation.score }} / {{ item.evaluation.maxScore }}</span>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-2">
                  <div :style="{ width: (item.evaluation.score / item.evaluation.maxScore * 100) + '%' }" 
                       class="h-2 rounded-full"
                       :class="item.evaluation.score >= (item.evaluation.maxScore*0.8) ? 'bg-green-500' : item.evaluation.score >= (item.evaluation.maxScore*0.6) ? 'bg-amber-400' : 'bg-red-500'"
                  ></div>
                </div>
              </div>
            </div>
            
            <button 
              v-if="!item.hasEvaluation"
              @click="router.push({ name: 'feedback', params: { drillId: id, name: item.studentName, studentId: item.studentId } })" 
              class="btn-primary px-6 py-2.5 rounded-xl inline-flex items-center gap-2 font-bold whitespace-nowrap shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all w-full md:w-auto justify-center"
            >
               <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
               Evaluate
            </button>
            <button 
              v-else
              @click="router.push({ name: 'student-result', params: { name: item.studentName } })" 
              class="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-6 py-2.5 rounded-xl inline-flex items-center gap-2 font-bold transition-all w-full md:w-auto justify-center"
            >
               View Details
            </button>
          </div>
          
        </div>
      </div>
    </div>
  </div>
</template>