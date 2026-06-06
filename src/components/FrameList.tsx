import { component$ } from '@builder.io/qwik';
import type { AppState } from '~/store/appStore';
import { getFilteredFrames } from '~/store/appStore';
import {
  FRAME_TYPES,
  INVENTORY_STATUS_LIST,
  INVENTORY_STATUS_COLORS,
  TRY_ON_STATUS_COLORS,
} from '~/types';

interface FrameListProps {
  store: AppState;
}

export default component$<FrameListProps>(({ store }) => {
  const filteredFrames = getFilteredFrames(store);

  return (
    <div class="space-y-4">
      <div class="card">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div class="flex flex-col sm:flex-row gap-3 flex-1">
            <input
              type="text"
              placeholder="搜索镜架编号、名称、品牌..."
              value={store.searchKeyword}
              onInput$={(e) => {
                store.searchKeyword = (e.target as HTMLInputElement).value;
              }}
              class="input sm:max-w-xs"
            />
            <select
              value={store.filterType}
              onChange$={(e) => {
                store.filterType = (e.target as HTMLSelectElement).value;
              }}
              class="select sm:max-w-xs"
            >
              <option value="">全部类型</option>
              {FRAME_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <select
              value={store.filterInventory}
              onChange$={(e) => {
                store.filterInventory = (e.target as HTMLSelectElement).value;
              }}
              class="select sm:max-w-xs"
            >
              <option value="">全部库存状态</option>
              {INVENTORY_STATUS_LIST.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <button
            class="btn-primary whitespace-nowrap"
            onClick$={() => {
              store.editingFrame = null;
              store.showFrameModal = true;
            }}
          >
            + 新增镜架
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  镜架编号
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  镜架名称
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  类型
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  品牌系列
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  存放位置
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  试戴状态
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  库存状态
                </th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {filteredFrames.length === 0 && (
                <tr>
                  <td colSpan={8} class="px-4 py-8 text-center text-gray-500">
                    暂无镜架数据
                  </td>
                </tr>
              )}
              {filteredFrames.map((frame) => (
                <tr
                  key={frame.id}
                  class={
                    frame.inventoryStatus === '待上架' ? 'pending-highlight bg-yellow-50' : 'hover:bg-gray-50'
                  }
                >
                  <td class="table-cell font-mono font-medium">{frame.frameNo}</td>
                  <td class="table-cell">
                    <div class="flex items-center gap-2">
                      {frame.inventoryStatus === '待上架' && (
                        <span class="badge bg-yellow-400 text-yellow-900 animate-pulse">待上架</span>
                      )}
                      {frame.frameName}
                    </div>
                  </td>
                  <td class="table-cell">{frame.frameType}</td>
                  <td class="table-cell">{frame.brandSeries}</td>
                  <td class="table-cell">{frame.location}</td>
                  <td class="table-cell">
                    <span class={`badge ${TRY_ON_STATUS_COLORS[frame.tryOnStatus]}`}>
                      {frame.tryOnStatus}
                    </span>
                  </td>
                  <td class="table-cell">
                    <span class={`badge ${INVENTORY_STATUS_COLORS[frame.inventoryStatus]}`}>
                      {frame.inventoryStatus}
                    </span>
                  </td>
                  <td class="table-cell text-right whitespace-nowrap">
                    <div class="flex justify-end gap-2">
                      <button
                        class="btn-primary text-xs py-1 px-3"
                        onClick$={() => {
                          store.editingFrame = frame;
                          store.showFrameModal = true;
                        }}
                      >
                        编辑
                      </button>
                      {frame.inventoryStatus === '在库' && (
                        <button
                          class="btn-success text-xs py-1 px-3"
                          onClick$={() => {
                            store.selectedFrameId = frame.id;
                            store.showTryOnModal = true;
                          }}
                        >
                          试戴登记
                        </button>
                      )}
                      {frame.inventoryStatus === '试戴中' && (
                        <button
                          class="btn-warning text-xs py-1 px-3"
                          onClick$={() => {
                            const record = store.records.find(
                              (r) => r.frameId === frame.id && r.status === '进行中'
                            );
                            if (record) {
                              store.selectedRecordId = record.id;
                              store.showReturnModal = true;
                            }
                          }}
                        >
                          归还处理
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});
