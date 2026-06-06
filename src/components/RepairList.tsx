import { component$ } from '@builder.io/qwik';
import type { AppState } from '~/store/appStore';
import {
  getFilteredRepairs,
  updateRepairStatus,
  deleteRepairRecord,
} from '~/store/appStore';
import {
  REPAIR_STATUS_LIST,
  REPAIR_STATUS_COLORS,
  REPAIR_TYPE_COLORS,
  REPAIR_RESULT_COLORS,
  INVENTORY_STATUS_COLORS,
} from '~/types';

interface RepairListProps {
  store: AppState;
}

export default component$<RepairListProps>(({ store }) => {
  const filteredRepairs = getFilteredRepairs(store);
  const sortedRepairs = [...filteredRepairs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const getNextStatuses = (current: string): string[] => {
    const flow: Record<string, string[]> = {
      待送修: ['维修中'],
      维修中: ['待返库'],
      待返库: [],
      已完成: [],
    };
    return flow[current] || [];
  };

  const canComplete = (current: string): boolean => {
    return ['待送修', '维修中', '待返库'].includes(current);
  };

  return (
    <div class="space-y-4">
      <div class="card">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div class="flex flex-col sm:flex-row flex-wrap gap-3 flex-1">
            <input
              type="text"
              placeholder="搜索单号、镜架编号、镜架名称..."
              value={store.repairSearchKeyword}
              onInput$={(e) => {
                store.repairSearchKeyword = (e.target as HTMLInputElement).value;
              }}
              class="input sm:max-w-xs"
            />
            <input
              type="date"
              placeholder="开始日期"
              value={store.repairFilterDateFrom}
              onInput$={(e) => {
                store.repairFilterDateFrom = (e.target as HTMLInputElement).value;
              }}
              class="input sm:max-w-xs"
            />
            <input
              type="date"
              placeholder="结束日期"
              value={store.repairFilterDateTo}
              onInput$={(e) => {
                store.repairFilterDateTo = (e.target as HTMLInputElement).value;
              }}
              class="input sm:max-w-xs"
            />
            <input
              type="text"
              placeholder="镜架编号..."
              value={store.repairFilterFrameNo}
              onInput$={(e) => {
                store.repairFilterFrameNo = (e.target as HTMLInputElement).value;
              }}
              class="input sm:max-w-xs"
            />
            <input
              type="text"
              placeholder="经办人..."
              value={store.repairFilterHandler}
              onInput$={(e) => {
                store.repairFilterHandler = (e.target as HTMLInputElement).value;
              }}
              class="input sm:max-w-xs"
            />
            <select
              value={store.repairFilterStatus}
              onChange$={(e) => {
                store.repairFilterStatus = (e.target as HTMLSelectElement).value;
              }}
              class="select sm:max-w-xs"
            >
              <option value="">全部状态</option>
              {REPAIR_STATUS_LIST.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div class="flex gap-2">
            <button
              class="btn-secondary whitespace-nowrap"
              onClick$={() => {
                store.repairSearchKeyword = '';
                store.repairFilterDateFrom = '';
                store.repairFilterDateTo = '';
                store.repairFilterFrameNo = '';
                store.repairFilterStatus = '';
                store.repairFilterHandler = '';
              }}
            >
              重置筛选
            </button>
            <button
              class="btn-primary whitespace-nowrap"
              onClick$={() => {
                store.editingRepair = null;
                store.selectedFrameId = null;
                store.showRepairModal = true;
              }}
            >
              + 新增维修
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  维修单号
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  镜架编号
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  镜架名称
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  送修日期
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  预计完成
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  实际完成
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  维修类型
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  维修前状态
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  维修结果
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  经办人
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  备注
                </th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {sortedRepairs.length === 0 && (
                <tr>
                  <td colSpan={13} class="px-4 py-8 text-center text-gray-500">
                    暂无维修记录
                  </td>
                </tr>
              )}
              {sortedRepairs.map((repair) => {
                const nextStatuses = getNextStatuses(repair.status);
                return (
                  <tr
                    key={repair.id}
                    class={
                      repair.status === '维修中'
                        ? 'bg-blue-50'
                        : repair.status === '待返库'
                        ? 'bg-purple-50'
                        : repair.status === '待送修'
                        ? 'bg-yellow-50'
                        : 'hover:bg-gray-50'
                    }
                  >
                    <td class="table-cell font-mono font-medium">{repair.repairNo}</td>
                    <td class="table-cell font-mono">{repair.frameNo}</td>
                    <td class="table-cell">{repair.frameName}</td>
                    <td class="table-cell">{repair.sendDate}</td>
                    <td class="table-cell">{repair.expectedDate || '-'}</td>
                    <td class="table-cell">{repair.actualDate || '-'}</td>
                    <td class="table-cell">
                      <span class={`badge ${REPAIR_TYPE_COLORS[repair.repairType]}`}>
                        {repair.repairType}
                      </span>
                    </td>
                    <td class="table-cell">
                      {repair.previousInventoryStatus ? (
                        <span
                          class={`badge ${
                            INVENTORY_STATUS_COLORS[repair.previousInventoryStatus] ||
                            'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {repair.previousInventoryStatus}
                        </span>
                      ) : (
                        <span class="text-gray-400">-</span>
                      )}
                    </td>
                    <td class="table-cell">
                      <span class={`badge ${REPAIR_STATUS_COLORS[repair.status]}`}>
                        {repair.status}
                      </span>
                    </td>
                    <td class="table-cell">
                      {repair.repairResult ? (
                        <span class={`badge ${REPAIR_RESULT_COLORS[repair.repairResult]}`}>
                          {repair.repairResult}
                        </span>
                      ) : (
                        <span class="text-gray-400">-</span>
                      )}
                    </td>
                    <td class="table-cell">{repair.handler}</td>
                    <td class="table-cell text-gray-500 max-w-xs truncate">
                      {repair.remark || '-'}
                    </td>
                    <td class="table-cell text-right whitespace-nowrap">
                      <div class="flex justify-end gap-2 flex-wrap">
                        {nextStatuses.map((ns) => (
                          <button
                            key={ns}
                            class="btn-primary text-xs py-1 px-3"
                            onClick$={() => {
                              updateRepairStatus(store, repair.id, ns as any);
                            }}
                          >
                            {ns === '维修中' ? '送修' : ns === '待返库' ? '待返库' : ns}
                          </button>
                        ))}
                        {canComplete(repair.status) && (
                          <>
                            <button
                              class="btn-success text-xs py-1 px-3"
                              onClick$={() => {
                                updateRepairStatus(store, repair.id, '已完成', '已修好');
                              }}
                            >
                              完成(已修好)
                            </button>
                            <button
                              class="btn-danger text-xs py-1 px-3"
                              onClick$={() => {
                                updateRepairStatus(store, repair.id, '已完成', '未修好');
                              }}
                            >
                              完成(未修好)
                            </button>
                          </>
                        )}
                        {repair.status !== '已完成' && (
                          <button
                            class="btn-warning text-xs py-1 px-3"
                            onClick$={() => {
                              store.editingRepair = repair;
                              store.selectedFrameId = null;
                              store.showRepairModal = true;
                            }}
                          >
                            编辑
                          </button>
                        )}
                        <button
                          class="btn-danger text-xs py-1 px-3"
                          onClick$={() => deleteRepairRecord(store, repair.id)}
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});
