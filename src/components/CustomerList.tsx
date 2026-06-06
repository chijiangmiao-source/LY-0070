import { component$, $, useSignal } from '@builder.io/qwik';
import type { AppState, CustomerSummary } from '~/store/appStore';
import {
  deleteFollowUpRecord,
  getFilteredCustomers,
} from '~/store/appStore';
import {
  FOLLOW_UP_METHOD_COLORS,
  FOLLOW_UP_STATUS_COLORS,
  INTENTION_LEVEL_COLORS,
  APPOINTMENT_STATUS_COLORS,
  REPAIR_STATUS_COLORS,
} from '~/types';

interface CustomerListProps {
  store: AppState;
}

export default component$<CustomerListProps>(({ store }) => {
  const expandedCustomer = useSignal<string | null>(null);
  const activeDetailTab = useSignal<'tryOn' | 'appointment' | 'repair' | 'followUp'>('tryOn');

  const filteredCustomers = getFilteredCustomers(store);



  return (
    <div class="space-y-4">
      <div class="card">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div class="flex flex-col sm:flex-row flex-wrap gap-3 flex-1">
            <input
              type="text"
              placeholder="搜索客户姓名..."
              value={store.customerSearchKeyword}
              onInput$={(e) => {
                store.customerSearchKeyword = (e.target as HTMLInputElement).value;
              }}
              class="input sm:max-w-xs"
            />
            <select
              value={store.customerFilterStatus}
              onChange$={(e) => {
                store.customerFilterStatus = (e.target as HTMLSelectElement).value;
              }}
              class="select sm:max-w-xs"
            >
              <option value="">全部跟进状态</option>
              {['待回访', '跟进中', '已成交', '已流失'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              value={store.customerFilterIntention}
              onChange$={(e) => {
                store.customerFilterIntention = (e.target as HTMLSelectElement).value;
              }}
              class="select sm:max-w-xs"
            >
              <option value="">全部意向等级</option>
              {['高意向', '中意向', '低意向', '无意向'].map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            <div class="flex items-center gap-2">
              <input
                type="date"
                placeholder="开始日期"
                value={store.customerFilterDateFrom}
                onInput$={(e) => {
                  store.customerFilterDateFrom = (e.target as HTMLInputElement).value;
                }}
                class="input sm:max-w-[140px]"
              />
              <span class="text-gray-400">至</span>
              <input
                type="date"
                placeholder="结束日期"
                value={store.customerFilterDateTo}
                onInput$={(e) => {
                  store.customerFilterDateTo = (e.target as HTMLInputElement).value;
                }}
                class="input sm:max-w-[140px]"
              />
            </div>
          </div>
          <div class="flex gap-2">
            <button
              class="btn-secondary whitespace-nowrap"
              onClick$={() => {
                store.customerSearchKeyword = '';
                store.customerFilterIntention = '';
                store.customerFilterStatus = '';
                store.customerFilterDateFrom = '';
                store.customerFilterDateTo = '';
              }}
            >
              重置筛选
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  客户姓名
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  跟进状态
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  意向等级
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  最近回访
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  下次跟进
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  关联记录数
                </th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={7} class="px-4 py-8 text-center text-gray-500">
                    暂无客户数据
                  </td>
                </tr>
              )}
              {filteredCustomers.map((customer) => (
                <div key={customer.customerName} style={{ display: 'contents' }}>
                  <tr
                    class="hover:bg-gray-50 cursor-pointer"
                    onClick$={() => {
                      expandedCustomer.value =
                        expandedCustomer.value === customer.customerName ? null : customer.customerName;
                    }}
                  >
                    <td class="table-cell font-medium">
                      <div class="flex items-center gap-2">
                        <span class="text-lg">
                          {expandedCustomer.value === customer.customerName ? '▼' : '▶'}
                        </span>
                        {customer.customerName}
                      </div>
                    </td>
                    <td class="table-cell">
                      <span class={`badge ${FOLLOW_UP_STATUS_COLORS[customer.followUpStatus]}`}>
                        {customer.followUpStatus}
                      </span>
                    </td>
                    <td class="table-cell">
                      {customer.intentionLevel ? (
                        <span class={`badge ${INTENTION_LEVEL_COLORS[customer.intentionLevel]}`}>
                          {customer.intentionLevel}
                        </span>
                      ) : (
                        <span class="text-gray-400">-</span>
                      )}
                    </td>
                    <td class="table-cell">{customer.lastFollowUpDate || '-'}</td>
                    <td class="table-cell">{customer.nextFollowUpDate || '-'}</td>
                    <td class="table-cell">
                      <div class="flex gap-2 flex-wrap text-xs">
                        <span class="badge bg-blue-50 text-blue-700">
                          试戴 {customer.tryOnRecords.length}
                        </span>
                        <span class="badge bg-orange-50 text-orange-700">
                          预约 {customer.appointments.length}
                        </span>
                        <span class="badge bg-purple-50 text-purple-700">
                          维修 {customer.repairs.length}
                        </span>
                        <span class="badge bg-green-50 text-green-700">
                          回访 {customer.followUpRecords.length}
                        </span>
                      </div>
                    </td>
                    <td
                      class="table-cell text-right whitespace-nowrap"
                      onClick$={(e) => {
                        (e as MouseEvent).stopPropagation();
                      }}
                    >
                      <div class="flex justify-end gap-2">
                        <button
                          class="btn-primary text-xs py-1 px-3"
                          onClick$={() => {
                            store.editingFollowUp = null;
                            store.followUpSourceCustomerName = customer.customerName;
                            if (customer.followUpRecords.length > 0) {
                              store.followUpSourceType = customer.followUpRecords[0].sourceType;
                              store.followUpSourceId = customer.followUpRecords[0].sourceId;
                            } else if (customer.tryOnRecords.length > 0) {
                              store.followUpSourceType = '试戴记录';
                              store.followUpSourceId = customer.tryOnRecords[0].id;
                            } else if (customer.appointments.length > 0) {
                              store.followUpSourceType = '预约记录';
                              store.followUpSourceId = customer.appointments[0].id;
                            } else {
                              store.followUpSourceType = '试戴记录';
                              store.followUpSourceId = '';
                            }
                            store.showFollowUpModal = true;
                          }}
                        >
                          + 登记回访
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedCustomer.value === customer.customerName && (
                    <tr key={`${customer.customerName}-detail`} class="bg-gray-50">
                      <td colSpan={7} class="px-4 py-4">
                        <div class="space-y-3">
                          <div class="flex gap-2 border-b border-gray-200 pb-2">
                            {(['tryOn', 'appointment', 'repair', 'followUp'] as const).map(
                              (tab) => {
                                const labelMap = {
                                  tryOn: '试戴记录',
                                  appointment: '预约记录',
                                  repair: '维修记录',
                                  followUp: '回访记录',
                                };
                                const countMap = {
                                  tryOn: customer.tryOnRecords.length,
                                  appointment: customer.appointments.length,
                                  repair: customer.repairs.length,
                                  followUp: customer.followUpRecords.length,
                                };
                                return (
                                  <button
                                    key={tab}
                                    class={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                                      activeDetailTab.value === tab
                                        ? 'bg-white text-primary border-t-2 border-x border-primary -mb-px'
                                        : 'text-gray-600 hover:text-gray-800'
                                    }`}
                                    onClick$={() => {
                                      activeDetailTab.value = tab;
                                    }}
                                  >
                                    {labelMap[tab]} ({countMap[tab]})
                                  </button>
                                );
                              }
                            )}
                          </div>

                          {activeDetailTab.value === 'tryOn' && (
                            <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                              {customer.tryOnRecords.length === 0 ? (
                                <div class="p-6 text-center text-gray-500">暂无试戴记录</div>
                              ) : (
                                <table class="min-w-full divide-y divide-gray-200">
                                  <thead class="bg-gray-100">
                                    <tr>
                                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        镜架编号
                                      </th>
                                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        镜架名称
                                      </th>
                                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        试戴日期
                                      </th>
                                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        归还日期
                                      </th>
                                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        经办人
                                      </th>
                                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        状态
                                      </th>
                                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        备注
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody class="divide-y divide-gray-100">
                                    {customer.tryOnRecords.map((r) => (
                                      <tr key={r.id} class="hover:bg-gray-50">
                                        <td class="px-4 py-2 text-sm font-mono">{r.frameNo}</td>
                                        <td class="px-4 py-2 text-sm">{r.frameName}</td>
                                        <td class="px-4 py-2 text-sm">{r.tryOnDate}</td>
                                        <td class="px-4 py-2 text-sm">{r.returnDate || '-'}</td>
                                        <td class="px-4 py-2 text-sm">{r.handler}</td>
                                        <td class="px-4 py-2 text-sm">
                                          <span
                                            class={`badge ${
                                              r.status === '进行中'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-green-100 text-green-800'
                                            }`}
                                          >
                                            {r.status}
                                          </span>
                                        </td>
                                        <td class="px-4 py-2 text-sm text-gray-500">
                                          {r.remark || '-'}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          )}

                          {activeDetailTab.value === 'appointment' && (
                            <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                              {customer.appointments.length === 0 ? (
                                <div class="p-6 text-center text-gray-500">暂无预约记录</div>
                              ) : (
                                <table class="min-w-full divide-y divide-gray-200">
                                  <thead class="bg-gray-100">
                                    <tr>
                                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        预约日期
                                      </th>
                                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        时间
                                      </th>
                                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        镜架编号
                                      </th>
                                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        镜架名称
                                      </th>
                                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        联系电话
                                      </th>
                                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        经办人
                                      </th>
                                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        状态
                                      </th>
                                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        备注
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody class="divide-y divide-gray-100">
                                    {customer.appointments.map((a) => (
                                      <tr key={a.id} class="hover:bg-gray-50">
                                        <td class="px-4 py-2 text-sm">{a.appointmentDate}</td>
                                        <td class="px-4 py-2 text-sm font-medium">
                                          {a.appointmentTime}
                                        </td>
                                        <td class="px-4 py-2 text-sm font-mono">{a.frameNo}</td>
                                        <td class="px-4 py-2 text-sm">{a.frameName}</td>
                                        <td class="px-4 py-2 text-sm font-mono">{a.phone}</td>
                                        <td class="px-4 py-2 text-sm">{a.handler}</td>
                                        <td class="px-4 py-2 text-sm">
                                          <span class={`badge ${APPOINTMENT_STATUS_COLORS[a.status]}`}>
                                            {a.status}
                                          </span>
                                        </td>
                                        <td class="px-4 py-2 text-sm text-gray-500">
                                          {a.remark || '-'}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          )}

                          {activeDetailTab.value === 'repair' && (
                            <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                              {customer.repairs.length === 0 ? (
                                <div class="p-6 text-center text-gray-500">暂无维修记录</div>
                              ) : (
                                <table class="min-w-full divide-y divide-gray-200">
                                  <thead class="bg-gray-100">
                                    <tr>
                                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        维修单号
                                      </th>
                                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        镜架编号
                                      </th>
                                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        镜架名称
                                      </th>
                                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        送修日期
                                      </th>
                                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        维修类型
                                      </th>
                                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        经办人
                                      </th>
                                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        状态
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody class="divide-y divide-gray-100">
                                    {customer.repairs.map((r) => (
                                      <tr key={r.id} class="hover:bg-gray-50">
                                        <td class="px-4 py-2 text-sm font-mono">{r.repairNo}</td>
                                        <td class="px-4 py-2 text-sm font-mono">{r.frameNo}</td>
                                        <td class="px-4 py-2 text-sm">{r.frameName}</td>
                                        <td class="px-4 py-2 text-sm">{r.sendDate}</td>
                                        <td class="px-4 py-2 text-sm">{r.repairType}</td>
                                        <td class="px-4 py-2 text-sm">{r.handler}</td>
                                        <td class="px-4 py-2 text-sm">
                                          <span class={`badge ${REPAIR_STATUS_COLORS[r.status]}`}>
                                            {r.status}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          )}

                          {activeDetailTab.value === 'followUp' && (
                            <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                              {customer.followUpRecords.length === 0 ? (
                                <div class="p-6 text-center text-gray-500">
                                  暂无回访记录，点击右上角"登记回访"添加
                                </div>
                              ) : (
                                <table class="min-w-full divide-y divide-gray-200">
                                  <thead class="bg-gray-100">
                                    <tr>
                                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        回访日期
                                      </th>
                                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        回访方式
                                      </th>
                                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        来源类型
                                      </th>
                                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        意向等级
                                      </th>
                                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        客户反馈
                                      </th>
                                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        成交
                                      </th>
                                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        下次跟进
                                      </th>
                                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        经办人
                                      </th>
                                      <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                        操作
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody class="divide-y divide-gray-100">
                                    {customer.followUpRecords.map((f) => (
                                      <tr key={f.id} class="hover:bg-gray-50">
                                        <td class="px-4 py-2 text-sm">{f.followUpDate}</td>
                                        <td class="px-4 py-2 text-sm">
                                          <span
                                            class={`badge ${FOLLOW_UP_METHOD_COLORS[f.followUpMethod]}`}
                                          >
                                            {f.followUpMethod}
                                          </span>
                                        </td>
                                        <td class="px-4 py-2 text-sm">{f.sourceType}</td>
                                        <td class="px-4 py-2 text-sm">
                                          <span
                                            class={`badge ${INTENTION_LEVEL_COLORS[f.intentionLevel]}`}
                                          >
                                            {f.intentionLevel}
                                          </span>
                                        </td>
                                        <td class="px-4 py-2 text-sm text-gray-600 max-w-xs truncate">
                                          {f.feedback || '-'}
                                        </td>
                                        <td class="px-4 py-2 text-sm">
                                          {f.isDealt ? (
                                            <span class="badge bg-green-100 text-green-800">
                                              成交 ¥{f.dealAmount}
                                            </span>
                                          ) : (
                                            <span class="text-gray-400">
                                              {f.noDealReason || '未成交'}
                                            </span>
                                          )}
                                        </td>
                                        <td class="px-4 py-2 text-sm">{f.nextFollowUpDate || '-'}</td>
                                        <td class="px-4 py-2 text-sm">{f.handler}</td>
                                        <td class="px-4 py-2 text-right whitespace-nowrap">
                                          <div class="flex justify-end gap-2">
                                            <button
                                              class="btn-secondary text-xs py-1 px-2"
                                              onClick$={() => {
                                                store.editingFollowUp = f;
                                                store.followUpSourceType = null;
                                                store.followUpSourceId = null;
                                                store.followUpSourceCustomerName = null;
                                                store.showFollowUpModal = true;
                                              }}
                                            >
                                              编辑
                                            </button>
                                            <button
                                              class="btn-danger text-xs py-1 px-2"
                                              onClick$={() => {
                                                if (confirm('确定要删除这条回访记录吗？')) {
                                                  deleteFollowUpRecord(store, f.id);
                                                }
                                              }}
                                            >
                                              删除
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </div>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});
