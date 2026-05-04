<script setup>
import { reactive, ref } from 'vue'
import { store } from '../store'

const loading = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

const form = reactive({
  name: store.currentUser?.name || '',
  faculty: store.currentUser?.faculty || '',
  mahallah: store.currentUser?.mahallah || '',
  password: '',
  confirmPassword: ''
})

const updateProfile = async () => {
  loading.value = true
  successMsg.value = ''
  errorMsg.value = ''
  
  try {
    await store.updateProfile({
      name: form.name,
      faculty: form.faculty.trim(),
      mahallah: form.mahallah.trim()
    })
    successMsg.value = 'Identity updated successfully'
  } catch (err) {
    errorMsg.value = 'Failed to update identity'
  } finally {
    loading.value = false
  }
}

const updatePassword = async () => {
  if (!form.password) {
    errorMsg.value = 'Please enter a new password'
    return
  }
  if (form.password !== form.confirmPassword) {
    errorMsg.value = 'Passwords do not match'
    return
  }

  loading.value = true
  successMsg.value = ''
  errorMsg.value = ''

  try {
    await store.changePassword(form.password)
    successMsg.value = 'Password updated successfully'
    form.password = ''
    form.confirmPassword = ''
  } catch (err) {
    errorMsg.value = err.message || 'Failed to update password. You may need to re-login to perform this action.'
  } finally {
    loading.value = false
  }
}

const logout = () => {
  store.logout()
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<template>
  <div class="max-w-6xl mx-auto px-6 py-10">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
      <div>
        <h1 class="text-4xl font-black text-slate-900 tracking-tight">
          Account Settings
        </h1>
        <p class="text-slate-500 mt-2 text-lg">
          Manage your professional identity and security preferences.
        </p>
      </div>
      <div class="flex items-center gap-3">
        <span class="px-4 py-2 bg-slate-100 text-slate-600 rounded-full text-sm font-bold border border-slate-200 capitalize">
          {{ store.currentUser?.role }} Account
        </span>
      </div>
    </div>

    <transition name="slide-down">
      <div
        v-if="successMsg"
        class="mb-8 p-5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl flex items-center gap-4 shadow-sm"
      >
        <div class="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center flex-none">
          <i class="fas fa-check" />
        </div>
        <p class="font-bold">
          {{ successMsg }}
        </p>
      </div>
    </transition>

    <transition name="slide-down">
      <div
        v-if="errorMsg"
        class="mb-8 p-5 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl flex items-center gap-4 shadow-sm"
      >
        <div class="w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center flex-none">
          <i class="fas fa-exclamation" />
        </div>
        <p class="font-bold">
          {{ errorMsg }}
        </p>
      </div>
    </transition>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
      <div class="lg:col-span-4 space-y-8">
        <div class="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div class="h-32 bg-gradient-to-br from-blue-600 to-indigo-700" />
          <div class="px-8 pb-8 -mt-16">
            <div class="relative inline-block mb-6">
              <div class="w-32 h-32 bg-white rounded-3xl p-1.5 shadow-lg">
                <div class="w-full h-full bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 text-5xl border border-slate-100">
                  <i class="fas fa-user" />
                </div>
              </div>
              <div
                class="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center text-white text-xs"
                title="Account Active"
              >
                <i class="fas fa-check" />
              </div>
            </div>

            <h3 class="text-2xl font-black text-slate-900 mb-1">
              {{ store.currentUser?.name || 'User' }}
            </h3>
            <p class="text-slate-500 font-medium mb-6">
              {{ store.currentUser?.email }}
            </p>
            
            <div
              v-if="store.currentUser?.role === 'student'"
              class="space-y-4 pt-6 border-t border-slate-100"
            >
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-400 font-medium">Faculty</span>
                <span class="text-slate-900 font-bold">{{ store.currentUser?.faculty || 'Not set' }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-400 font-medium">Mahallah</span>
                <span class="text-slate-900 font-bold">{{ store.currentUser?.mahallah || 'Not set' }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-400 font-medium">Member Since</span>
                <span class="text-slate-900 font-bold">{{ formatDate(store.currentUser?.createdAt) }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-400 font-medium">Account Type</span>
                <span class="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-black uppercase tracking-wider">{{ store.currentUser?.role }}</span>
              </div>
            </div>
            <div
              v-else
              class="space-y-4 pt-6 border-t border-slate-100"
            >
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-400 font-medium">Member Since</span>
                <span class="text-slate-900 font-bold">{{ formatDate(store.currentUser?.createdAt) }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-400 font-medium">Account Type</span>
                <span class="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-black uppercase tracking-wider">{{ store.currentUser?.role }}</span>
              </div>
            </div>

            <button
              class="w-full mt-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-lg shadow-slate-200"
              @click="logout"
            >
              <i class="fas fa-sign-out-alt text-slate-400" />
              Sign Out
            </button>
          </div>
        </div>

        <div class="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
          <div class="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
          <h4 class="text-xl font-black mb-3 relative z-10">
            Security Center
          </h4>
          <p class="text-indigo-100 text-sm mb-6 leading-relaxed relative z-10">
            Keep your account safe by using a strong password and updating it regularly.
          </p>
          <div class="flex items-center gap-2 text-xs font-black uppercase tracking-widest relative z-10">
            <span class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            System Protected
          </div>
        </div>
      </div>

      <div class="lg:col-span-8 space-y-10">
        <section class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
                <i class="fas fa-id-card text-xl" />
              </div>
              <div>
                <h2 class="text-xl font-black text-slate-900">
                  Identity Management
                </h2>
                <p class="text-xs text-slate-500 font-medium">
                  Update your public profile information.
                </p>
              </div>
            </div>
          </div>

          <div class="p-8">
            <form
              class="space-y-8"
              @submit.prevent="updateProfile"
            >
              <div :class="store.currentUser?.role === 'student' ? 'grid grid-cols-1 md:grid-cols-2 gap-8' : 'grid grid-cols-1 gap-8'">
                <div class="space-y-2">
                  <label class="text-sm font-black text-slate-700 uppercase tracking-wider ml-1">Display Name</label>
                  <div class="relative">
                    <i class="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      v-model="form.name"
                      type="text"
                      placeholder="Your full name"
                      class="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none font-bold text-slate-900"
                    >
                  </div>
                </div>

                <div
                  v-if="store.currentUser?.role === 'student'"
                  class="space-y-2"
                >
                  <label class="text-sm font-black text-slate-700 uppercase tracking-wider ml-1">Faculty / Kulliyah</label>
                  <div class="relative">
                    <i class="fas fa-university absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      v-model="form.faculty"
                      type="text"
                      placeholder="e.g. KICT, Engineering"
                      class="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none font-bold text-slate-900"
                    >
                  </div>
                </div>

                <div
                  v-if="store.currentUser?.role === 'student'"
                  class="space-y-2"
                >
                  <label class="text-sm font-black text-slate-700 uppercase tracking-wider ml-1">Mahallah (Campus Building)</label>
                  <div class="relative">
                    <i class="fas fa-building absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      v-model="form.mahallah"
                      type="text"
                      placeholder="e.g. Ali, Bilal, Maryam"
                      class="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none font-bold text-slate-900"
                    >
                  </div>
                </div>
              </div>

              <div class="flex justify-end pt-4">
                <button
                  type="submit"
                  :disabled="loading"
                  class="px-10 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:opacity-50 flex items-center gap-3"
                >
                  <i
                    v-if="loading"
                    class="fas fa-spinner animate-spin"
                  />
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </section>

        <section class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-100">
                <i class="fas fa-lock text-xl" />
              </div>
              <div>
                <h2 class="text-xl font-black text-slate-900">
                  Security & Password
                </h2>
                <p class="text-xs text-slate-500 font-medium">
                  Update your account access credentials.
                </p>
              </div>
            </div>
          </div>

          <div class="p-8">
            <form
              class="space-y-8"
              @submit.prevent="updatePassword"
            >
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="space-y-2">
                  <label class="text-sm font-black text-slate-700 uppercase tracking-wider ml-1">New Password</label>
                  <div class="relative">
                    <i class="fas fa-key absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      v-model="form.password"
                      type="password"
                      placeholder="••••••••"
                      class="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all outline-none font-bold text-slate-900"
                    >
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="text-sm font-black text-slate-700 uppercase tracking-wider ml-1">Confirm New Password</label>
                  <div class="relative">
                    <i class="fas fa-check-double absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      v-model="form.confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      class="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all outline-none font-bold text-slate-900"
                    >
                  </div>
                </div>
              </div>

              <div class="flex justify-end pt-4">
                <button
                  type="submit"
                  :disabled="loading"
                  class="px-10 py-4 bg-amber-500 text-white font-black rounded-2xl hover:bg-amber-600 transition-all shadow-xl shadow-amber-200 disabled:opacity-50 flex items-center gap-3"
                >
                  <i
                    v-if="loading"
                    class="fas fa-spinner animate-spin"
                  />
                  Update Security Key
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.slide-down-enter-active, .slide-down-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-down-enter-from, .slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

input::placeholder {
  font-weight: 500;
  color: #94a3b8;
}
</style>
