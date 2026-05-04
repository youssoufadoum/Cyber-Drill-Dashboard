<script setup>
import { computed, onMounted, ref } from 'vue';
import { store } from '../store';
import { useRouter } from 'vue-router';

const router = useRouter();
const selectedFaculty = ref('All');
const selectedMahallah = ref('All');

onMounted(async () => {
  await store.fetchStudents();
  await store.fetchResults();
});

const faculties = computed(() => {
  if (!store || !store.students) return ['All'];
  const uniqueFaculties = [...new Set(store.students.map(s => s.faculty?.trim().toUpperCase()).filter(Boolean))];
  return ['All', ...uniqueFaculties.sort()];
});

const mahallahs = computed(() => {
  if (!store || !store.students) return ['All'];
  const uniqueMahallahs = [...new Set(store.students.map(s => s.mahallah?.trim().toUpperCase()).filter(Boolean))];
  return ['All', ...uniqueMahallahs.sort()];
});

const filteredStudents = computed(() => {
  if (!store || !store.students) return [];
  let result = store.students;
  
  if (selectedFaculty.value !== 'All') {
    result = result.filter(s => s.faculty?.trim().toUpperCase() === selectedFaculty.value);
  }
  
  if (selectedMahallah.value !== 'All') {
    result = result.filter(s => s.mahallah?.trim().toUpperCase() === selectedMahallah.value);
  }
  
  return result;
});

const studentStats = computed(() => {
  return filteredStudents.value.map(s => {
    const results = (store.results || []).filter(r => r.studentId === s.uid);
    const attempts = results.length;
    const avg = attempts ? Math.round(results.reduce((a,b) => a + b.score, 0) / attempts) : 0;
    return { ...s, attempts, avg };
  });
});

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
};
</script>

<template>
  <div>
    <div class="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-dark">
          Students Results
        </h1>
        <p class="text-muted">
          All students and their summary performance
        </p>
      </div>
      
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center gap-3">
          <label class="text-sm font-bold text-muted whitespace-nowrap">Filter by Faculty:</label>
          <select 
            v-model="selectedFaculty"
            class="bg-surface border-2 border-surface-border rounded-xl px-4 py-2 text-sm font-bold focus:border-primary outline-none transition-all"
          >
            <option
              v-for="f in faculties"
              :key="f"
              :value="f"
            >
              {{ f }}
            </option>
          </select>
        </div>

        <div class="flex items-center gap-3">
          <label class="text-sm font-bold text-muted whitespace-nowrap">Filter by Mahallah:</label>
          <select 
            v-model="selectedMahallah"
            class="bg-surface border-2 border-surface-border rounded-xl px-4 py-2 text-sm font-bold focus:border-primary outline-none transition-all"
          >
            <option
              v-for="m in mahallahs"
              :key="m"
              :value="m"
            >
              {{ m }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div class="bg-surface rounded-2xl p-6 shadow-sm border border-surface-border">
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="text-muted text-sm">
              <th class="pb-3" />
              <th class="pb-3">
                Student
              </th>
              <th class="pb-3">
                Faculty
              </th>
              <th class="pb-3">
                Mahallah
              </th>
              <th class="pb-3">
                Email
              </th>
              <th class="pb-3">
                Joined
              </th>
              <th class="pb-3">
                Attempts
              </th>
              <th class="pb-3">
                Avg
              </th>
              <th class="pb-3" />
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="s in studentStats"
              :key="s.uid"
              class="border-t transition-all hover:shadow-sm"
            >
              <td class="py-3">
                <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-gray-500 font-bold border border-gray-200">
                  {{ s.name.charAt(0).toUpperCase() }}
                </div>
              </td>
              <td class="py-3 font-semibold">
                {{ s.name }}
              </td>
              <td class="py-3 text-sm font-medium text-primary">
                {{ s.faculty || 'N/A' }}
              </td>
              <td class="py-3 text-sm font-medium text-indigo-600">
                {{ s.mahallah || 'N/A' }}
              </td>
              <td class="py-3 text-sm text-muted">
                {{ s.email }}
              </td>
              <td class="py-3 text-sm text-muted">
                {{ formatDate(s.createdAt) }}
              </td>
              <td class="py-3">
                {{ s.attempts }}
              </td>
              <td class="py-3">
                <span :class="['px-3 py-1 rounded-full text-xs font-bold', s.avg >= 70 ? 'bg-green-100 text-green-700' : s.avg >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700']">{{ s.avg }}%</span>
              </td>
              <td class="py-3 text-right">
                <button
                  class="btn-primary px-3 py-2 rounded-md inline-flex items-center gap-2"
                  title="View student results"
                  @click="router.push({ name: 'student-result', params: { name: s.name } })"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"
                      stroke="currentColor"
                      stroke-width="1.6"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="3"
                      fill="currentColor"
                    />
                  </svg>
                  View
                </button>
              </td>
            </tr>
            <tr v-if="studentStats.length === 0">
              <td
                colspan="8"
                class="py-10 text-center text-muted"
              >
                No students found for this faculty.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
