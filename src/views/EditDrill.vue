<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { store } from '../store'

const router = useRouter()
const route = useRoute()
const drillId = route.params.id

const loading = ref(true)
const form = ref({
  title: '',
  category: '',
  description: '',
  difficulty: 'beginner',
  duration: 30,
  scenario: '',
  maxScore: 100,
  maxAttempts: 1,
  dueDate: '',
  questions: []
})

onMounted(async () => {
  if (!store || !store.drills) return;
  if (store.drills.length === 0) {
    await store.fetchDrills()
  }
  const drill = store.drills.find(d => d.id === drillId)
  if (drill) {
    form.value = { ...drill }
    loading.value = false
  } else {
    alert('Drill not found')
    router.push('/drills')
  }
})

const addQuestion = (type) => {
  const id = Math.random().toString(36).substr(2, 9)
  if (type === 'mcq') {
    form.value.questions.push({
      id,
      type: 'mcq',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 10
    })
  } else if (type === 'true_false') {
    form.value.questions.push({
      id,
      type: 'true_false',
      question: '',
      correctAnswer: 'True',
      points: 10
    })
  }
}

const removeQuestion = (index) => {
  form.value.questions.splice(index, 1)
}

const submit = async () => {
  if (form.value.questions.length === 0) {
    alert('Please add at least one question to the drill.')
    return
  }

  const updatedDrill = {
    ...form.value
  }
  delete updatedDrill.id

  try {
    await store.updateDrill(drillId, updatedDrill)
    router.push('/drills')
  } catch (error) {
    console.error('Failed to update drill:', error)
    alert('Failed to update drill. Please check your inputs and try again.')
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <div v-if="loading" class="text-center py-20">
      <div class="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
      <p class="text-muted">Loading drill data...</p>
    </div>

    <div v-else>
      <div class="mb-8 pb-6 border-b border-gray-200">
        <h1 class="text-3xl font-extrabold text-dark">Edit Drill</h1>
        <p class="text-gray-500 mt-2">Update your training exercise</p>
      </div>

      <form
        @submit.prevent="submit"
        class="bg-surface rounded-2xl shadow-sm border border-surface-border p-8 space-y-6"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-bold text-dark mb-2">
              Drill Title *
            </label>
            <input
              v-model="form.title"
              required
              placeholder="e.g., Phishing Email Identification"
              class="w-full p-3 bg-slate-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label class="block text-sm font-bold text-dark mb-2">
              Category *
            </label>
            <select
              v-model="form.category"
              required
              class="w-full p-3 bg-slate-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary"
            >
              <option disabled value="">Select category</option>
              <option value="phishing">Phishing Awareness</option>
              <option value="malware">Malware Analysis</option>
              <option value="network">Network Security</option>
              <option value="social">Social Engineering</option>
              <option value="response">Incident Respose </option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-bold text-dark mb-2">
            Description *
          </label>
          <textarea
            v-model="form.description"
            rows="3"
            placeholder="Describe the training drill objectives..."
            class="w-full p-3 bg-slate-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-bold text-dark mb-2">
              Difficulty Level *
            </label>
            <select
              v-model="form.difficulty"
              class="w-full p-3 bg-slate-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-bold text-dark mb-2">
              Estimated Duration (minutes) *
            </label>
            <input
              type="number"
              v-model="form.duration"
              class="w-full p-3 bg-slate-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-bold text-dark mb-2">
            Training Scenario *
          </label>
          <textarea
            v-model="form.scenario"
            rows="4"
            placeholder="Describe the simulated cybersecurity scenario..."
            class="w-full p-3 bg-slate-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label class="block text-sm font-bold text-dark mb-2">
              Maximum Score
            </label>
            <input
              type="number"
              v-model="form.maxScore"
              class="w-full p-3 bg-slate-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label class="block text-sm font-bold text-dark mb-2">
              Max Attempts
            </label>
            <input
              type="number"
              v-model="form.maxAttempts"
              min="1"
              class="w-full p-3 bg-slate-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label class="block text-sm font-bold text-dark mb-2">
              Due Date
            </label>
            <input
              type="date"
              v-model="form.dueDate"
              class="w-full p-3 bg-slate-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div class="pt-6 border-t border-gray-200">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-extrabold text-dark">Drill Questions</h2>
            <div class="flex gap-2">
              <button
                type="button"
                @click="addQuestion('mcq')"
                class="px-4 py-2 bg-blue-50 text-blue-600 font-bold rounded-lg hover:bg-blue-100 transition text-sm"
              >
                + Add MCQ
              </button>
              <button
                type="button"
                @click="addQuestion('true_false')"
                class="px-4 py-2 bg-green-50 text-green-600 font-bold rounded-lg hover:bg-green-100 transition text-sm"
              >
                + Add True/False
              </button>
            </div>
          </div>

          <div class="space-y-6">
            <div
              v-for="(q, index) in form.questions"
              :key="q.id"
              class="p-6 bg-slate-50 rounded-2xl border border-gray-200 relative group"
            >
              <button
                type="button"
                @click="removeQuestion(index)"
                class="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>

              <div class="flex items-center gap-2 mb-4">
                <span class="w-8 h-8 flex items-center justify-center bg-dark text-white rounded-full text-sm font-bold">{{ index + 1 }}</span>
                <span class="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded" :class="q.type === 'mcq' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'">
                  {{ q.type === 'mcq' ? 'Multiple Choice' : 'True / False' }}
                </span>
              </div>

              <div class="space-y-4">
                <div>
                  <label class="block text-xs font-bold text-gray-500 mb-1">Question Text</label>
                  <input
                    v-model="q.question"
                    required
                    class="w-full p-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>

                <div v-if="q.type === 'mcq'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div v-for="(opt, optIdx) in q.options" :key="optIdx">
                    <label class="block text-xs font-bold text-gray-500 mb-1">Option {{ optIdx + 1 }}</label>
                    <input
                      v-model="q.options[optIdx]"
                      required
                      class="w-full p-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-gray-500 mb-1">Correct Answer</label>
                    <select
                      v-if="q.type === 'mcq'"
                      v-model="q.correctAnswer"
                      required
                      class="w-full p-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                    >
                      <option v-for="(opt, optIdx) in q.options" :key="optIdx" :value="opt">{{ opt || 'Option ' + (optIdx + 1) }}</option>
                    </select>
                    <select
                      v-else
                      v-model="q.correctAnswer"
                      required
                      class="w-full p-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                    >
                      <option value="True">True</option>
                      <option value="False">False</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-gray-500 mb-1">Points</label>
                    <input
                      type="number"
                      v-model="q.points"
                      required
                      class="w-full p-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="pt-4 flex gap-4">
          <button
            type="submit"
            class="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition"
          >
            Update Drill
          </button>

          <button
            type="button"
            @click="router.push('/drills')"
            class="px-8 py-3 bg-surface border-2 border-surface-border text-dark font-bold rounded-xl hover:bg-slate-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
