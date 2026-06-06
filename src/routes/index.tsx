import { component$ } from '@builder.io/qwik';
import { createAppStore } from '~/store/appStore';
import StatsOverview from '~/components/StatsOverview';
import FrameList from '~/components/FrameList';
import FrameFormModal from '~/components/FrameFormModal';
import TryOnModal from '~/components/TryOnModal';
import ReturnModal from '~/components/ReturnModal';
import RecordList from '~/components/RecordList';

export default component$(() => {
  const store = createAppStore();

  return (
    <div class="min-h-screen bg-gray-100">
      <header class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">眼镜门店镜架试戴看板</h1>
              <p class="text-sm text-gray-500 mt-1">管理镜架信息、试戴记录和库存状态</p>
            </div>
          </div>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <StatsOverview store={store} />

        <div class="mt-6 border-b border-gray-200">
          <nav class="-mb-px flex space-x-8">
            <button
              onClick$={() => {
                store.activeTab = 'frames';
              }}
              class={`py-2 px-1 border-b-2 font-medium text-sm ${
                store.activeTab === 'frames'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              镜架管理
            </button>
            <button
              onClick$={() => {
                store.activeTab = 'records';
              }}
              class={`py-2 px-1 border-b-2 font-medium text-sm ${
                store.activeTab === 'records'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              试戴记录
            </button>
          </nav>
        </div>

        <div class="mt-6">
          {store.activeTab === 'frames' && <FrameList store={store} />}
          {store.activeTab === 'records' && <RecordList store={store} />}
        </div>
      </main>

      {store.showFrameModal && <FrameFormModal store={store} />}
      {store.showTryOnModal && <TryOnModal store={store} />}
      {store.showReturnModal && <ReturnModal store={store} />}
    </div>
  );
});
