<script setup>
import { computed, ref, onMounted } from 'vue';
import { store } from '../store';

onMounted(async () => {
  await store.fetchResults();
  if (store.drills.length === 0) await store.fetchDrills();
});

const results = computed(() => {
  if (store.currentUser?.role === 'trainer') {
    return store.results || [];
  }
  return store.myResults || [];
});

const evaluatedResults = computed(() => {
  return results.value.filter(r => r.status === 'completed' || r.score !== undefined);
});

const totalEvaluated = computed(() => evaluatedResults.value.length);
const average = computed(() => {
  if (totalEvaluated.value === 0) return 0;
  const sum = evaluatedResults.value.reduce((a,b) => a + b.score, 0);
  return Math.round(sum / totalEvaluated.value);
});

const passRate = computed(() => {
  if (evaluatedResults.value.length === 0) return 0;
  const passed = evaluatedResults.value.filter(r => r.score >= (r.maxScore * 0.7)).length;
  return Math.round((passed / evaluatedResults.value.length) * 100);
});

const recent = computed(() => evaluatedResults.value.slice(-8));
const chartPoints = computed(() => {
  const pts = [];
  const data = recent.value;
  if (data.length === 0) return pts;
  
  const xStart = 40, xEnd = 360;
  const yTop = 20, yBottom = 160; // SVG coordinates
  const width = xEnd - xStart;
  const height = yBottom - yTop;
  const values = data.map(d => (d.score / d.maxScore) * 100);
  const step = data.length > 1 ? width / (data.length - 1) : 0;
  
  values.forEach((v, i) => {
    const x = Math.round(xStart + step * i);
    const y = Math.round(yBottom - (v / 100) * height);
    pts.push({ 
      x, 
      y, 
      value: Math.round(v),
      rawScore: data[i].score,
      maxScore: data[i].maxScore
    });
  });
  return pts;
});
const getBezierPath = (points) => {
  if (points.length < 2) return '';
  
  let path = `M ${points[0].x},${points[0].y}`;
  
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cp1x = p0.x + (p1.x - p0.x) / 2;
    const cp1y = p0.y;
    const cp2x = p0.x + (p1.x - p0.x) / 2;
    const cp2y = p1.y;
    
    path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p1.x},${p1.y}`;
  }
  
  return path;
};

const chartLinePath = computed(() => getBezierPath(chartPoints.value));

const chartAreaPath = computed(() => {
  const pts = chartPoints.value;
  if (pts.length === 0) return '';
  const xStart = pts[0].x;
  const xEnd = pts[pts.length - 1].x;
  const baseY = 160;
  
  let path = getBezierPath(pts);
  path += ` L ${xEnd},${baseY} L ${xStart},${baseY} Z`;
  return path;
});

const getDrillName = (id) => {
  if (!store || !store.drills) return 'Unknown Drill';
  const drill = store.drills.find(d => d.id === id);
  return drill ? drill.title : 'Unknown Drill';
};

const getScoreClass = (score) => {
  if (score >= 80) return 'text-secondary font-bold';
  if (score >= 60) return 'text-warning font-bold';
  return 'text-danger font-bold';
};
const avgRadius = 34;
const avgCircumference = 2 * Math.PI * avgRadius;
const dashOffset = computed(() => 
  Math.round(avgCircumference * (1 - (average.value / 100)))
);

const progressStroke = computed(() => 
  average.value >= 85 ? 'url(#avgGradient)' : 
  average.value >= 70 ? '#f59e0b' : '#ef4444'
);
const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
};
const tooltip = ref({
  show: false,
  x: 0,
  y: 0,
  data: null
});

const showTooltip = (event, point, index) => {
  const rect = event.currentTarget.getBoundingClientRect();
  tooltip.value = {
    show: true,
    x: event.clientX - rect.left,
    y: event.clientY - rect.top - 60,
    data: {
      ...point,
      drillName: getDrillName(recent.value[index].drillId),
      date: recent.value[index].date
    }
  };
};

const hideTooltip = () => {
  tooltip.value.show = false;
};
</script>

<template>
  <div>
    <div class="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 class="text-4xl font-black text-slate-900 tracking-tight">
          {{ store.currentUser?.role === 'trainer' ? 'Performance Analytics' : 'My Progress' }}
        </h1>
        <p class="text-slate-500 mt-2 text-lg">
          {{ store.currentUser?.role === 'trainer' ? 'Comprehensive overview of student achievements and drill effectiveness.' : 'Track your skill development and evaluation history.' }}
        </p>
      </div>
      <div
        v-if="store.currentUser?.role === 'trainer'"
        class="flex items-center gap-3"
      >
        <div class="px-4 py-2 bg-blue-50 text-blue-700 rounded-2xl text-sm font-bold border border-blue-100 flex items-center gap-2">
          <span class="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          Live Data
        </div>
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <div class="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
        <div class="relative z-10">
          <div class="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-100">
            <i class="fas fa-chart-line text-xl" />
          </div>
          <div class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">
            Overall Average
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-4xl font-black text-slate-900">{{ average }}%</span>
            <span class="text-emerald-500 text-sm font-bold flex items-center gap-1">
              <i class="fas fa-caret-up" />
              Stable
            </span>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
        <div class="relative z-10">
          <div class="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-100">
            <i class="fas fa-check-double text-xl" />
          </div>
          <div class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">
            Pass Rate
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-4xl font-black text-slate-900">{{ passRate }}%</span>
            <span class="text-slate-400 text-xs font-medium">Target: 70%</span>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
        <div class="relative z-10">
          <div class="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-amber-100">
            <i class="fas fa-clipboard-check text-xl" />
          </div>
          <div class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">
            Total Evaluated
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-4xl font-black text-slate-900">{{ totalEvaluated }}</span>
            <span class="text-slate-400 text-xs font-medium">Submissions</span>
          </div>
        </div>
      </div>
    </div>
    <div class="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-200 shadow-sm mb-10 relative overflow-hidden">
      <div class="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />
      
      <div class="relative z-10">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h3 class="text-2xl font-black text-slate-900 tracking-tight">
              Performance Trend
            </h3>
            <p class="text-slate-500 font-medium">
              Historical score distribution for the last {{ recent.length }} attempts.
            </p>
          </div>
          <div class="flex flex-wrap gap-4">
            <div class="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
              <div class="w-2 h-2 rounded-full bg-emerald-500" />
              <span class="text-[10px] font-black uppercase tracking-wider text-emerald-700">Excellent (≥85%)</span>
            </div>
            <div class="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-full border border-amber-100">
              <div class="w-2 h-2 rounded-full bg-amber-500" />
              <span class="text-[10px] font-black uppercase tracking-wider text-amber-700">Average (70-84%)</span>
            </div>
            <div class="flex items-center gap-2 px-3 py-1.5 bg-rose-50 rounded-full border border-rose-100">
              <div class="w-2 h-2 rounded-full bg-rose-500" />
              <span class="text-[10px] font-black uppercase tracking-wider text-rose-700">Critical (≤69%)</span>
            </div>
          </div>
        </div>

        <div class="line-chart-wrap relative h-[300px] group/chart">
          <svg
            class="line-chart w-full h-full"
            viewBox="0 0 400 200"
            preserveAspectRatio="none"
            role="img"
            aria-label="Recent performance line chart"
          >
            <defs>
              <linearGradient
                id="areaGradient"
                x1="0"
                x2="0"
                y1="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stop-color="#3b82f6"
                  stop-opacity="0.15"
                />
                <stop
                  offset="100%"
                  stop-color="#3b82f6"
                  stop-opacity="0"
                />
              </linearGradient>
              <linearGradient
                id="lineGradient"
                x1="0"
                x2="1"
              >
                <stop
                  offset="0%"
                  stop-color="#2563eb"
                />
                <stop
                  offset="100%"
                  stop-color="#8b5cf6"
                />
              </linearGradient>
              <filter
                id="glow"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feGaussianBlur
                  stdDeviation="3"
                  result="blur"
                />
                <feComposite
                  in="SourceGraphic"
                  in2="blur"
                  operator="over"
                />
              </filter>
            </defs>
            <g
              class="chart-grid"
              stroke="#f1f5f9"
              stroke-width="1"
            >
              <line
                x1="40"
                y1="20"
                x2="360"
                y2="20"
              />
              <line
                x1="40"
                y1="55"
                x2="360"
                y2="55"
              />
              <line
                x1="40"
                y1="90"
                x2="360"
                y2="90"
              />
              <line
                x1="40"
                y1="125"
                x2="360"
                y2="125"
              />
              <line
                x1="40"
                y1="160"
                x2="360"
                y2="160"
              />
            </g>
            <g
              class="chart-ylabels"
              fill="#94a3b8"
              font-size="8"
              font-weight="bold"
            >
              <text
                x="30"
                y="23"
                text-anchor="end"
              >100</text>
              <text
                x="30"
                y="58"
                text-anchor="end"
              >75</text>
              <text
                x="30"
                y="93"
                text-anchor="end"
              >50</text>
              <text
                x="30"
                y="128"
                text-anchor="end"
              >25</text>
              <text
                x="30"
                y="163"
                text-anchor="end"
              >0</text>
            </g>
            <line
              v-if="tooltip.show"
              :x1="tooltip.data.x"
              y1="20"
              :x2="tooltip.data.x"
              y2="160"
              stroke="#e2e8f0"
              stroke-width="1"
              stroke-dasharray="4,4"
            />
            <path
              v-if="chartAreaPath"
              :d="chartAreaPath"
              fill="url(#areaGradient)"
              class="chart-area"
            />
            <path
              v-if="chartLinePath"
              :d="chartLinePath"
              fill="none"
              stroke="url(#lineGradient)"
              stroke-width="4"
              stroke-linecap="round"
              stroke-linejoin="round"
              filter="url(#glow)"
              class="chart-line"
            />
            <g
              v-for="(pt, i) in chartPoints"
              :key="i"
            >
              <circle
                :cx="pt.x"
                :cy="pt.y"
                r="20"
                fill="transparent" 
                class="cursor-pointer"
                @mouseenter="showTooltip($event, pt, i)"
                @mouseleave="hideTooltip"
              />
              <circle
                :cx="pt.x"
                :cy="pt.y"
                r="6" 
                :class="pt.value >= 85 ? 'fill-emerald-500' : pt.value >= 70 ? 'fill-amber-500' : 'fill-rose-500'" 
                class="transition-all duration-300"
                :opacity="tooltip.show && tooltip.data.x === pt.x ? 1 : 0.8"
              />
              <circle
                :cx="pt.x"
                :cy="pt.y"
                r="3"
                fill="white"
              />
              <text
                :x="pt.x"
                :y="185"
                text-anchor="middle"
                class="text-[8px] font-bold fill-slate-400 uppercase tracking-tighter"
              >
                {{ formatDate(recent[i].date) }}
              </text>
            </g>
          </svg>
          <div
            v-if="tooltip.show && tooltip.data" 
            class="absolute bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700 p-4 min-w-[200px] z-50 pointer-events-none transition-all duration-200"
            :style="{ 
              left: tooltip.x + 'px', 
              top: tooltip.y + 'px',
              transform: 'translateX(-50%) translateY(-10px)'
            }"
          >
            <div class="flex items-center gap-3 mb-3">
              <div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs">
                <i class="fas fa-bolt" />
              </div>
              <div>
                <div class="font-black text-xs text-white uppercase tracking-widest">
                  {{ tooltip.data.drillName }}
                </div>
                <div class="text-[10px] text-slate-400 font-bold">
                  {{ new Date(tooltip.data.date).toLocaleDateString() }}
                </div>
              </div>
            </div>
            <div class="flex items-end justify-between">
              <div class="text-2xl font-black text-white">
                {{ tooltip.data.value }}%
              </div>
              <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                {{ tooltip.data.rawScore }} / {{ tooltip.data.maxScore }} PTS
              </div>
            </div>
            <div class="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
              <div
                class="h-full transition-all duration-500" 
                :class="tooltip.data.value >= 85 ? 'bg-emerald-500' : tooltip.data.value >= 70 ? 'bg-amber-500' : 'bg-rose-500'"
                :style="{ width: tooltip.data.value + '%' }"
              />
            </div>
          </div>
          
          <div
            v-if="recent.length === 0"
            class="text-muted p-4 text-center"
          >
            <div class="mb-2">
              📊
            </div>
            <div>No attempts yet</div>
            <div class="text-sm text-gray-400">
              Complete drills to see your performance chart
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
      <div class="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200">
            <i class="fas fa-list-ul text-xl" />
          </div>
          <div>
            <h2 class="text-xl font-black text-slate-900">
              Detailed Records
            </h2>
            <p class="text-xs text-slate-500 font-medium">
              Individual submission history and feedback.
            </p>
          </div>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-white">
              <th v-if="store.currentUser?.role === 'trainer'" class="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">
                Student
              </th>
              <th class="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">
                Drill Name
              </th>
              <th class="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">
              </th>
              <th class="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">
                Date
              </th>
              <th class="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">
                Score
              </th>
              <th class="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">
                Status
              </th>
              <th class="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">
                Feedback
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="(res, index) in results"
              :key="index"
              class="hover:bg-slate-50/80 transition-colors group"
            >
              <td v-if="store.currentUser?.role === 'trainer'" class="px-8 py-6">
                <div class="font-bold text-slate-900">
                  {{ res.studentName || 'Unknown Student' }}
                </div>
              </td>
              <td class="px-8 py-6">
                <div class="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {{ getDrillName(res.drillId) }}
                </div>
              </td>
              <td class="px-8 py-6">
                <div class="text-sm font-medium text-slate-500">
                  {{ res.date }}
                </div>
              </td>
              <td class="px-8 py-6">
                <div class="flex items-center gap-2">
                  <span
                    class="text-lg font-black"
                    :class="getScoreClass(res.score)"
                  >{{ res.score }}</span>
                  <span class="text-xs font-bold text-slate-400">/ {{ res.maxScore }}</span>
                </div>
              </td>
              <td class="px-8 py-6">
                <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
                  {{ res.status }}
                </span>
              </td>
              <td class="px-8 py-6">
                <div class="max-w-xs">
                  <p class="text-sm text-slate-600 font-medium line-clamp-1 italic">
                    "{{ res.feedback || 'No feedback provided yet.' }}"
                  </p>
                </div>
              </td>
            </tr>
            <tr v-if="results.length === 0">
              <td
                :colspan="store.currentUser?.role === 'trainer' ? 6 : 5"
                class="px-8 py-20 text-center"
              >
                <div class="flex flex-col items-center gap-3">
                  <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 text-2xl">
                    <i class="fas fa-folder-open" />
                  </div>
                  <p class="text-slate-400 font-bold">
                    No results found. Start a drill!
                  </p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.avg-ring {
  display: block;
}

.avg-ring .ring-bg {
  stroke-linecap: round;
}

.avg-ring .ring-progress {
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
  transition: stroke-dashoffset 0.8s ease, stroke 0.3s ease;
  filter: drop-shadow(0 6px 12px rgba(99,102,241,0.12));
}

.text-muted {
  color: #6b7280;
}

.line-chart {
  width: 100%;
  height: 200px;
}

.chart-area {
  transition: opacity 0.5s ease;
}

.chart-line {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: drawLine 1.5s cubic-bezier(.2,.9,.2,1) forwards;
}

.chart-area {
  animation: fadeIn 1s ease-out 0.5s forwards;
  opacity: 0;
}

@keyframes fadeIn {
  to { opacity: 1; }
}

@keyframes drawLine {
  to {
    stroke-dashoffset: 0;
  }
}
</style>