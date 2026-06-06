import { component$ } from '@builder.io/qwik';
import type { AppState } from '~/store/appStore';
import { getStats } from '~/store/appStore';

interface StatsOverviewProps {
  store: AppState;
}

export default component$<StatsOverviewProps>(({ store }) => {
  const stats = getStats(store);

  const statCards = [
    { label: '镜架总数', value: stats.total, color: 'bg-blue-500', icon: '👓' },
    { label: '在库', value: stats.inStock, color: 'bg-green-500', icon: '✅' },
    { label: '试戴中', value: stats.inTryOn, color: 'bg-blue-600', icon: '👁️' },
    { label: '待上架', value: stats.pending, color: 'bg-yellow-500', icon: '⏳' },
    { label: '已停用', value: stats.disabled, color: 'bg-gray-500', icon: '⛔' },
    { label: '进行中试戴', value: stats.activeRecords, color: 'bg-purple-500', icon: '📋' },
  ];

  return (
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map((card) => (
        <div key={card.label} class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">{card.label}</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
            </div>
            <div class={`w-12 h-12 rounded-full ${card.color} flex items-center justify-center text-2xl`}>
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});
