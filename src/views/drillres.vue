<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { store } from '../store';

const route = useRoute();
const router = useRouter();
const id = route.params.id;
const drill = computed(() => {
  if (!store || !store.drills) return null;
  return store.drills.find(d => String(d.id) === String(id));
});
const score = ref(null);
const running = ref(false);

onMounted(async () => {
  if (store.drills.length === 0) {
    await store.fetchDrills();
  }
  
  if (store.currentUser?.role === 'student') {
    if (!store.results || store.results.length === 0) {
      await store.fetchResults();
    }
    
    const attempts = store.results.filter(r => r.drillId === id && r.studentId === store.currentUser?.uid).length;
    const maxAttempts = drill.value?.maxAttempts || 1;
    
    if (attempts >= maxAttempts) {
      alert('You have reached the maximum number of attempts for this drill.');
      router.push('/drills');
    }
  }
});

const answers = ref({})
const submitted = ref(false)

const submitDrill = async () => {
  if (!drill.value || running.value) return;
  
  const answeredCount = Object.keys(answers.value).length;
  const totalQuestions = drill.value.questions?.length || 0;
  
  if (answeredCount < totalQuestions) {
    alert(`Please answer all ${totalQuestions} questions before submitting.`);
    return;
  }

  running.value = true;
  
  let totalScore = 0;
  drill.value.questions.forEach(q => {
    if (answers.value[q.id] === q.correctAnswer) {
      totalScore += Number(q.points || 0);
    }
  });

  try {
    await store.submitResult({
      drillId: drill.value.id,
      drillTitle: drill.value.title,
      score: totalScore,
      maxScore: drill.value.maxScore,
      answers: answers.value,
      status: 'completed',
      date: new Date().toISOString().split('T')[0]
    });
    submitted.value = true;
    running.value = false;
    setTimeout(() => {
      router.push('/results');
    }, 2000);
  } catch (error) {
    console.error('Failed to submit result:', error);
    alert('Failed to submit result. Please try again.');
    running.value = false;
  }
};
</script>

<template>
  <div v-if="drill" class="max-w-4xl mx-auto">
    <div class="mb-8 pb-6 border-b border-gray-200">
      <h1 class="text-3xl font-extrabold text-dark">{{ drill.title }}</h1>
      <p class="text-muted mt-2">{{ drill.description }}</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-1 space-y-6">
        <div class="bg-surface rounded-2xl p-6 shadow-sm border border-surface-border">
          <h3 class="font-bold text-dark mb-4 border-b pb-2">Drill Details</h3>
          <div class="space-y-4">
            <div>
              <div class="text-xs text-muted uppercase font-bold tracking-wider">Duration</div>
              <div class="font-bold text-dark">{{ drill.duration }} min</div>
            </div>
            <div>
              <div class="text-xs text-muted uppercase font-bold tracking-wider">Difficulty</div>
              <div class="font-bold text-dark capitalize">{{ drill.difficulty }}</div>
            </div>
            <div>
              <div class="text-xs text-muted uppercase font-bold tracking-wider">Max Points</div>
              <div class="font-bold text-primary text-xl">{{ drill.maxScore }}</div>
            </div>
          </div>

          <div class="mt-6 pt-6 border-t border-gray-100">
            <div class="text-xs text-muted uppercase font-bold tracking-wider mb-2">Scenario</div>
            <p class="text-sm text-gray-600 italic leading-relaxed">{{ drill.scenario }}</p>
          </div>
        </div>
      </div>

      <div class="lg:col-span-2">
        <div v-if="submitted" class="bg-green-50 border-2 border-green-200 rounded-2xl p-8 text-center">
          <div class="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 class="text-2xl font-extrabold text-green-800 mb-2">Drill Submitted!</h2>
          <p class="text-green-700">Your results are being processed. Redirecting to dashboard...</p>
        </div>

        <div v-else class="space-y-6">
          <div v-for="(q, index) in drill.questions" :key="q.id" class="bg-surface rounded-2xl p-6 shadow-sm border border-surface-border">
            <div class="flex items-center gap-3 mb-4">
              <span class="w-8 h-8 flex items-center justify-center bg-dark text-white rounded-full text-sm font-bold">{{ index + 1 }}</span>
              <h4 class="font-bold text-dark">{{ q.question }}</h4>
            </div>

            <div v-if="q.type === 'mcq'" class="space-y-3">
              <button
                v-for="opt in q.options"
                :key="opt"
                @click="answers[q.id] = opt"
                :class="answers[q.id] === opt ? 'border-primary bg-blue-50 text-primary' : 'border-gray-100 bg-slate-50 text-gray-600 hover:border-gray-300'"
                class="w-full text-left p-4 rounded-xl border-2 transition-all font-medium"
              >
                {{ opt }}
              </button>
            </div>

            <div v-else class="flex gap-4">
              <button
                @click="answers[q.id] = 'True'"
                :class="answers[q.id] === 'True' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-100 bg-slate-50 text-gray-600 hover:border-gray-300'"
                class="flex-1 p-4 rounded-xl border-2 transition-all font-bold text-center"
              >
                True
              </button>
              <button
                @click="answers[q.id] = 'False'"
                :class="answers[q.id] === 'False' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-100 bg-slate-50 text-gray-600 hover:border-gray-300'"
                class="flex-1 p-4 rounded-xl border-2 transition-all font-bold text-center"
              >
                False
              </button>
            </div>
          </div>

          <div class="pt-4 flex items-center justify-between">
            <button @click="router.push('/drills')" class="px-6 py-3 font-bold text-gray-500 hover:text-dark transition">
              Cancel
            </button>
            
            <button
              v-if="store.currentUser?.role !== 'trainer'"
              @click="submitDrill"
              :disabled="running || Object.keys(answers).length < (drill.questions?.length || 0)"
              class="btn-accent px-10 py-4 font-bold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
            >
              <span v-if="!running">Submit Drill</span>
              <span v-else>Submitting...</span>
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="text-center py-20">
    <div class="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
    <p class="text-muted">Loading drill details...</p>
  </div>
</template>