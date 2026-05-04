<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { store } from '../store';

const route = useRoute();
const router = useRouter();

const studentName = route.params.name;
const studentId = route.params.studentId;
const drillId = route.params.drillId;

const drill = store.drills.find(d => String(d.id) === String(drillId));
const result = computed(() => {
  return store.results.find(r => String(r.drillId) === String(drillId) && r.studentId === studentId);
});

const score = ref(drill ? drill.maxScore : 100);
const notes = ref('');
const isSubmitting = ref(false);

onMounted(() => {
  if (result.value) {
    score.value = result.value.score || drill?.maxScore || 100;
    notes.value = result.value.feedback || '';
  }
});

const submitFeedback = async () => {
  if (!drill) return;
  isSubmitting.value = true;
  
  try {
    await store.submitEvaluation(drillId, studentId, score.value, drill.maxScore, notes.value);
    
    await store.fetchResults();
    
    router.push({ name: 'drill-students', params: { id: drillId } });
  } catch (e) {
    console.error("Failed to submit evaluation", e);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="max-w-3xl mx-auto">
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-extrabold text-dark cursor-pointer flex items-center gap-2">
           <button @click="router.back()" class="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors mr-2">
             <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
           </button>
           Evaluate: {{ drill?.title }}
        </h1>
        <p class="text-muted mt-2 ml-14">
          Student: <span class="font-bold text-primary text-lg">{{ studentName }}</span>
        </p>
      </div>
      <div v-if="drill" class="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-bold border border-blue-100 ring-4 ring-blue-50">
        Max Score: {{ drill.maxScore }}
      </div>
    </div>

    <div v-if="!drill" class="text-center p-10 text-muted">Drill not found.</div>

    <div v-else class="space-y-8">
      <div v-if="result && result.answers" class="bg-white rounded-3xl p-8 shadow-sm border border-surface-border">
        <h2 class="text-xl font-black text-dark mb-6 flex items-center gap-2">
          <svg class="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          Student Submissions
        </h2>
        
        <div class="space-y-6">
          <div v-for="(q, index) in drill.questions" :key="q.id" class="p-6 bg-slate-50 rounded-2xl border border-gray-100">
            <div class="flex items-start gap-4 mb-4">
              <span class="w-8 h-8 flex-none bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-sm">{{ index + 1 }}</span>
              <div class="font-bold text-slate-800 text-lg">{{ q.question }}</div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 ml-12">
              <div class="p-4 rounded-xl border-2" :class="result.answers[q.id] === q.correctAnswer ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'">
                <div class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Student Answer</div>
                <div class="font-bold flex items-center gap-2" :class="result.answers[q.id] === q.correctAnswer ? 'text-emerald-700' : 'text-rose-700'">
                  <i class="fas" :class="result.answers[q.id] === q.correctAnswer ? 'fa-check-circle' : 'fa-times-circle'"></i>
                  {{ result.answers[q.id] || 'No answer' }}
                </div>
              </div>
              
              <div class="p-4 rounded-xl border-2 bg-blue-50 border-blue-200">
                <div class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Correct Answer</div>
                <div class="font-bold text-blue-700 flex items-center gap-2">
                  <i class="fas fa-info-circle"></i>
                  {{ q.correctAnswer }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form @submit.prevent="submitFeedback" class="bg-surface rounded-3xl p-8 shadow-sm border border-surface-border relative overflow-hidden">
      <div class="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full filter blur-3xl opacity-60 pointer-events-none"></div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 relative z-10">
        <div class="p-5 bg-slate-50 rounded-2xl border border-gray-100">
          <label class="block font-bold text-dark mb-3 text-lg flex items-center gap-2">
             <svg class="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg> 
             Assign Total Score
          </label>
          <div class="flex items-center gap-4">
             <input
               type="number"
               v-model="score"
               required
               min="0"
               :max="drill.maxScore"
               class="w-full text-2xl font-bold text-center border-2 border-gray-200 rounded-xl p-4 focus:ring-4 focus:ring-blue-100 focus:border-primary focus:outline-none transition-all"
             />
             <span class="text-2xl font-black text-gray-300">/</span>
             <span class="text-2xl font-black text-gray-800 w-full text-center p-4 bg-gray-100 border-2 border-transparent rounded-xl">{{ drill.maxScore }}</span>
          </div>
        </div>

        <div class="p-5 bg-slate-50 rounded-2xl border border-gray-100 flex flex-col justify-center">
          <label class="block font-bold text-dark mb-3">Performance Overview</label>
          <div class="flex gap-2">
             <div class="flex-1 py-3 text-center rounded-lg font-bold transition-all border-2" :class="score >= (drill.maxScore * 0.85) ? 'bg-green-100 border-green-500 text-green-700' : 'bg-white border-transparent text-gray-400 opacity-50'">Excellent</div>
             <div class="flex-1 py-3 text-center rounded-lg font-bold transition-all border-2" :class="score >= (drill.maxScore * 0.70) && score < (drill.maxScore * 0.85) ? 'bg-blue-100 border-blue-500 text-blue-700' : 'bg-white border-transparent text-gray-400 opacity-50'">Good</div>
             <div class="flex-1 py-3 text-center rounded-lg font-bold transition-all border-2" :class="score < (drill.maxScore * 0.70) ? 'bg-red-100 border-red-500 text-red-700' : 'bg-white border-transparent text-gray-400 opacity-50'">Needs Review</div>
          </div>
        </div>
      </div>

      <div class="mb-8 relative z-10">
        <label class="block font-bold text-dark mb-3 text-lg flex items-center gap-2">
           <svg class="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
           Detailed Feedback
        </label>
        <textarea
          v-model="notes"
          required
          rows="6"
          class="w-full border-2 border-gray-200 rounded-2xl p-5 focus:ring-4 focus:ring-blue-50 focus:border-primary focus:outline-none transition-all placeholder-gray-400 text-dark"
          placeholder="Provide structured feedback. E.g., 'Excellent speed on detection, but mitigation steps missed critical isolation protocols...'"
        ></textarea>
      </div>

      <div class="flex justify-end gap-5 pt-4 border-t border-gray-100">
        <button
          type="button"
          @click="router.back()"
          class="px-8 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="isSubmitting"
          class="px-10 py-3 rounded-xl bg-gradient-primary hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-1 text-white font-black transition-all flex items-center gap-3 disabled:opacity-50 disabled:transform-none disabled:shadow-none"
        >
          <svg v-if="!isSubmitting" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <svg v-else class="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/></svg>
           {{ isSubmitting ? 'Submitting...' : 'Complete Evaluation' }}
        </button>
      </div>
    </form>
  </div>
</div>
</template>
