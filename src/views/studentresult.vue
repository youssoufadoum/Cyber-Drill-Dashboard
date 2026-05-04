<script setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { store } from '../store';

const route = useRoute();
const router = useRouter();

const name = route.params.name;

const results = computed(() => {
  const source = store.currentUser?.role === 'trainer' ? store.results : store.myResults;
  return source.filter(r => r.studentName === name || r.studentId === name);
});

const drillsCompleted = computed(() =>
  results.value.map(r => ({
    drill: store.drills.find(d => d.id === r.drillId),
    score: r.score,
    maxScore: r.maxScore,
    date: r.date,
    drillId: r.drillId,
    studentId: r.studentId
  }))
);

const gradedResults = computed(() => results.value.filter(r => r.score !== undefined && r.score !== null));

const average = computed(() => {
  if (gradedResults.value.length === 0) return 0;
  const sum = gradedResults.value.reduce((a, b) => a + b.score, 0);
  return Math.round(sum / gradedResults.value.length);
});

const attempted = computed(() => results.value.length > 0);
const passed = computed(() => average.value >= 70);
const excellent = computed(() => average.value >= 85);

const goToFeedback = (drillId, studentId) => {
  router.push({
    name: 'feedback',
    params: {
      name,
      drillId,
      studentId
    },
  });
};

const selectedDrillId = ref(null);

const toggleAnswers = (drillId) => {
  if (selectedDrillId.value === drillId) {
    selectedDrillId.value = null;
  } else {
    selectedDrillId.value = drillId;
  }
};

const getResultForDrill = (drillId) => {
  return results.value.find(r => r.drillId === drillId);
};
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <div>
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold">
            {{ name.charAt(0) }}
          </div>
          <div>
            <h1 class="text-2xl font-extrabold text-dark">
              {{ name }}
            </h1>
            <p class="text-muted">
              Drills completed: {{ results.length }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3 mt-4">
          <div :class="['flex items-center gap-2', attempted ? 'text-blue-600' : 'text-gray-400']">
            <div class="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 font-bold">
              1
            </div>
            Attempted
          </div>
          →
          <div :class="['flex items-center gap-2', passed ? 'text-blue-600' : 'text-gray-400']">
            <div class="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 font-bold">
              P
            </div>
            Passed
          </div>
          →
          <div :class="['flex items-center gap-2', excellent ? 'text-blue-600' : 'text-gray-400']">
            <div class="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 font-bold">
              ★
            </div>
            Excellent
          </div>
        </div>
      </div>

      <div class="text-center">
        <div class="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center text-2xl font-extrabold">
          {{ average }}%
        </div>
        <div class="text-sm text-muted mt-2">
          Average Score
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4">
      <div
        v-for="row in drillsCompleted"
        :key="row.drillId"
        class="flex flex-col bg-white rounded-xl shadow-sm border overflow-hidden"
      >
        <div class="p-4 flex items-center gap-6">
          <button
            class="px-4 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md transition flex items-center gap-2"
            @click="goToFeedback(row.drillId, row.studentId)"
          >
            ✍️ Feedback
          </button>

          <div class="flex-1">
            <div class="font-semibold text-dark">
              {{ row.drill?.title || 'Unknown Drill' }}
            </div>
            <div class="text-sm text-muted">
              {{ row.date }} • Max: {{ row.maxScore }}
            </div>
          </div>

          <div class="w-48">
            <div class="flex items-center gap-3">
              <div class="font-semibold">
                {{ row.score }} / {{ row.maxScore }}
              </div>
              <div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  :style="{ width: (row.score / row.maxScore * 100) + '%' }"
                  :class="row.score >= 85 ? 'bg-green-500' : row.score >= 75 ? 'bg-yellow-500' : 'bg-red-500'"
                  class="h-full"
                />
              </div>
            </div>
          </div>

          <button 
            @click="toggleAnswers(row.drillId)"
            class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            :title="selectedDrillId === row.drillId ? 'Hide Answers' : 'View Answers'"
          >
            <svg class="w-5 h-5 transition-transform" :class="{ 'rotate-180': selectedDrillId === row.drillId }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 9l-7 7-7-7"/></svg>
          </button>
        </div>

        <div v-if="selectedDrillId === row.drillId" class="border-t bg-slate-50 p-6 space-y-4">
          <div v-if="!getResultForDrill(row.drillId)?.answers" class="text-center text-muted py-4 italic">
            No detailed answer data available for this submission.
          </div>
          <div v-else class="space-y-4">
            <div v-for="(q, idx) in row.drill?.questions" :key="q.id" class="bg-white p-4 rounded-xl border border-gray-200">
              <div class="flex gap-3 mb-3">
                <span class="font-bold text-slate-400">{{ idx + 1 }}.</span>
                <div class="font-bold text-slate-700">{{ q.question }}</div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 ml-6">
                <div class="text-sm p-2 rounded-lg border" :class="getResultForDrill(row.drillId).answers[q.id] === q.correctAnswer ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'">
                  <span class="font-bold uppercase text-[10px] block opacity-60">Student Answer</span>
                  {{ getResultForDrill(row.drillId).answers[q.id] || 'N/A' }}
                </div>
                <div class="text-sm p-2 rounded-lg border bg-blue-50 border-blue-100 text-blue-700">
                  <span class="font-bold uppercase text-[10px] block opacity-60">Correct Answer</span>
                  {{ q.correctAnswer }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="drillsCompleted.length === 0"
        class="p-6 text-center text-muted bg-white rounded-lg border"
      >
        No records for this student.
      </div>
    </div>
  </div>
</template>
