import { component$ } from '@builder.io/qwik';
import type { AppState } from '~/store/appStore';
import { getStats } from '~/store/appStore';

interface StatsOverviewProps {
  store: AppState;
}

export default component$<StatsOverviewProps>(({ store }) => {
  const stats = getStats(store);

  const statCards = [
    {
      label: '镜架总数',
      value: stats.total,
      gradient: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100',
      icon: '👓',
      iconColor: 'text-blue-600',
    },
    {
      label: '在库',
      value: stats.inStock,
      gradient: 'from-green-500 to-green-600',
      iconBg: 'bg-green-100',
      icon: '✅',
      iconColor: 'text-green-600',
    },
    {
      label: '试戴中',
      value: stats.inTryOn,
      gradient: 'from-cyan-500 to-cyan-600',
      iconBg: 'bg-cyan-100',
      icon: '👁️',
      iconColor: 'text-cyan-600',
    },
    {
      label: '待上架',
      value: stats.pending,
      gradient: 'from-yellow-500 to-orange-500',
      iconBg: 'bg-yellow-100',
      icon: '⏳',
      iconColor: 'text-yellow-600',
    },
    {
      label: '今日预约',
      value: stats.todayAppointmentCount,
      gradient: 'from-orange-500 to-orange-600',
      iconBg: 'bg-orange-100',
      icon: '📅',
      iconColor: 'text-orange-600',
    },
    {
      label: '待到店',
      value: stats.pendingArrival,
      gradient: 'from-pink-500 to-pink-600',
      iconBg: 'bg-pink-100',
      icon: '⏰',
      iconColor: 'text-pink-600',
    },
    {
      label: '维修中',
      value: stats.inRepair,
      gradient: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-100',
      icon: '🔧',
      iconColor: 'text-purple-600',
    },
    {
      label: '待返库',
      value: stats.pendingReturn,
      gradient: 'from-indigo-500 to-indigo-600',
      iconBg: 'bg-indigo-100',
      icon: '📦',
      iconColor: 'text-indigo-600',
    },
    {
      label: '本月维修次数',
      value: stats.thisMonthRepairs,
      gradient: 'from-rose-500 to-rose-600',
      iconBg: 'bg-rose-100',
      icon: '📊',
      iconColor: 'text-rose-600',
    },
    {
      label: '待回访人数',
      value: stats.pendingFollowUpCount,
      gradient: 'from-amber-500 to-amber-600',
      iconBg: 'bg-amber-100',
      icon: '📞',
      iconColor: 'text-amber-600',
    },
    {
      label: '成交人数',
      value: stats.dealtCount,
      gradient: 'from-emerald-500 to-emerald-600',
      iconBg: 'bg-emerald-100',
      icon: '🎉',
      iconColor: 'text-emerald-600',
    },
    {
      label: '成交金额',
      value: `¥${stats.totalDealAmount.toLocaleString()}`,
      gradient: 'from-teal-500 to-teal-600',
      iconBg: 'bg-teal-100',
      icon: '💰',
      iconColor: 'text-teal-600',
    },
    {
      label: '本月转化率',
      value: `${stats.thisMonthConversionRate.toFixed(1)}%`,
      gradient: 'from-fuchsia-500 to-fuchsia-600',
      iconBg: 'bg-fuchsia-100',
      icon: '📈',
      iconColor: 'text-fuchsia-600',
    },
  ];

  return (
    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-13 gap-5">
      {statCards.map((card) => (
        <div
          key={card.label}
          class="bg-white rounded-2xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-shadow duration-300"
        >
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">{card.label}</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
            </div>
            <div
              class={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center text-2xl`}
            >
              {card.icon}
            </div>
          </div>
          <div class={`mt-4 h-1.5 rounded-full bg-gradient-to-r ${card.gradient}`} />
        </div>
      ))}
    </div>
  );
});
