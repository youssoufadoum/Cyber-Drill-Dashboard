<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { store } from '../store';

const router = useRouter();

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const role = ref('student');
const faculty = ref('');
const mahallah = ref('');
const error = ref('');
const isSubmitting = ref(false);

const handleSignup = async () => {
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match';
    return;
  }

  isSubmitting.value = true;
  error.value = '';

  try {
    await store.signup(email.value, password.value, role.value, faculty.value.trim(), mahallah.value.trim());
    router.push('/login');
  } catch (err) {
    error.value = err.message || 'Failed to sign up';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-slate-100 relative overflow-hidden">
        <div class="absolute -top-24 -right-24 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-60" />
        <div class="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-60" />

        <div class="relative z-10">
          <div class="text-center mb-10">
            <div class="inline-flex items-center justify-center w-20 h-20 mb-6">
              <img 
                src="https://i.imgur.com/9qDNvIO.png" 
                alt="CyberDrill Logo" 
                class="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              >
            </div>
            <h1 class="text-3xl font-black text-slate-900 tracking-tight mb-2">
              Create Account
            </h1>
            <p class="text-slate-500 font-medium">
              Join the training platform
            </p>
          </div>

          <form
            class="space-y-5"
            @submit.prevent="handleSignup"
          >
            <div>
              <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                Email Address
              </label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <i class="fas fa-envelope" />
                </div>
                <input
                  v-model="email"
                  type="email"
                  required
                  class="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-300"
                  placeholder="name@company.com"
                >
              </div>
            </div>

            <div v-if="role === 'student'">
              <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                Faculty / Kulliyah
              </label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <i class="fas fa-university" />
                </div>
                <input
                  v-model="faculty"
                  type="text"
                  required
                  class="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-300"
                  placeholder="e.g. KICT, Engineering"
                >
              </div>
            </div>

            <div v-if="role === 'student'">
              <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                Mahallah (Campus Building)
              </label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <i class="fas fa-building" />
                </div>
                <input
                  v-model="mahallah"
                  type="text"
                  required
                  class="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-300"
                  placeholder="e.g. Ali, Bilal, Maryam"
                >
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                Password
              </label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <i class="fas fa-lock" />
                </div>
                <input
                  v-model="password"
                  type="password"
                  required
                  class="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-300"
                  placeholder="••••••••"
                >
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                Confirm Password
              </label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <i class="fas fa-lock" />
                </div>
                <input
                  v-model="confirmPassword"
                  type="password"
                  required
                  class="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-300"
                  placeholder="••••••••"
                >
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">
                Register As
              </label>
              <div class="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  :class="role === 'student'
                    ? 'border-blue-600 bg-blue-50 ring-4 ring-blue-50'
                    : 'border-slate-100 bg-slate-50 hover:border-slate-200'"
                  class="relative border-2 rounded-2xl p-4 text-center transition-all group"
                  @click="role = 'student'"
                >
                  <div
                    v-if="role === 'student'"
                    class="absolute top-2 right-2 text-blue-600"
                  >
                    <i class="fas fa-check-circle text-sm" />
                  </div>
                  <i
                    class="fas fa-user-graduate text-2xl mb-2"
                    :class="role === 'student' ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-500'"
                  />
                  <p
                    class="font-bold text-sm"
                    :class="role === 'student' ? 'text-blue-600' : 'text-slate-600'"
                  >
                    Student
                  </p>
                </button>

                <button
                  type="button"
                  :class="role === 'trainer'
                    ? 'border-blue-600 bg-blue-50 ring-4 ring-blue-50'
                    : 'border-slate-100 bg-slate-50 hover:border-slate-200'"
                  class="relative border-2 rounded-2xl p-4 text-center transition-all group"
                  @click="role = 'trainer'"
                >
                  <div
                    v-if="role === 'trainer'"
                    class="absolute top-2 right-2 text-blue-600"
                  >
                    <i class="fas fa-check-circle text-sm" />
                  </div>
                  <i
                    class="fas fa-chalkboard-teacher text-2xl mb-2"
                    :class="role === 'trainer' ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-500'"
                  />
                  <p
                    class="font-bold text-sm"
                    :class="role === 'trainer' ? 'text-blue-600' : 'text-slate-600'"
                  >
                    Trainer
                  </p>
                </button>
              </div>
            </div>

            <div
              v-if="error"
              class="bg-red-50 text-red-600 text-sm p-4 rounded-xl font-bold flex items-center gap-3 animate-shake"
            >
              <i class="fas fa-exclamation-circle" />
              {{ error }}
            </div>

            <button 
              type="submit" 
              :disabled="isSubmitting"
              class="w-full py-4 bg-slate-900 hover:bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-slate-200 hover:shadow-blue-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 disabled:opacity-50 disabled:transform-none"
            >
              <span v-if="!isSubmitting">Create Account</span>
              <span
                v-else
                class="flex items-center gap-2"
              >
                <svg
                  class="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  />
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </span>
            </button>
          </form>

          <div class="mt-10 text-center">
            <p class="text-slate-500 font-medium text-sm">
              Already have an account? 
              <router-link
                to="/login"
                class="text-blue-600 font-bold hover:underline"
              >
                Login here
              </router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
.animate-shake {
  animation: shake 0.2s ease-in-out 0s 2;
}
</style>
