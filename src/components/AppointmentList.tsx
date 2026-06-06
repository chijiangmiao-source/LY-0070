import { component$ } from '@builder.io/qwik';
import type { AppState } from '~/store/appStore';
import {
  getFilteredAppointments,
  cancelAppointment,
  markAppointmentArrived,
  deleteAppointment,
} from '~/store/appStore';
import { APPOINTMENT_STATUS_LIST, APPOINTMENT_STATUS_COLORS } from '~/types';
import { getToday } from '~/utils/storage';

interface AppointmentListProps {
  store: AppState;
}

export default component$<AppointmentListProps>(({ store }) => {
  const filteredAppointments = getFilteredAppointments(store);
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    const dateCompare = a.appointmentDate.localeCompare(b.appointmentDate);
    if (dateCompare !== 0) return dateCompare;
    return a.appointmentTime.localeCompare(b.appointmentTime);
  });

  const today = getToday();

  return (
    <div class="space-y-4">
      <div class="card">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div class="flex flex-col sm:flex-row flex-wrap gap-3 flex-1">
            <input
              type="text"
              placeholder="搜索客户姓名..."
              value={store.appointmentSearchKeyword}
              onInput$={(e) => {
                store.appointmentSearchKeyword = (e.target as HTMLInputElement).value;
              }}
              class="input sm:max-w-xs"
            />
            <input
              type="date"
              placeholder="按日期筛选"
              value={store.appointmentFilterDate}
              onInput$={(e) => {
                store.appointmentFilterDate = (e.target as HTMLInputElement).value;
              }}
              class="input sm:max-w-xs"
            />
            <input
              type="text"
              placeholder="搜索镜架编号..."
              value={store.appointmentFilterFrameNo}
              onInput$={(e) => {
                store.appointmentFilterFrameNo = (e.target as HTMLInputElement).value;
              }}
              class="input sm:max-w-xs"
            />
            <select
              value={store.appointmentFilterStatus}
              onChange$={(e) => {
                store.appointmentFilterStatus = (e.target as HTMLSelectElement).value;
              }}
              class="select sm:max-w-xs"
            >
              <option value="">全部状态</option>
              {APPOINTMENT_STATUS_LIST.map((s) => (
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
                store.appointmentSearchKeyword = '';
                store.appointmentFilterDate = '';
                store.appointmentFilterFrameNo = '';
                store.appointmentFilterStatus = '';
              }}
            >
              重置筛选
            </button>
            <button
              class="btn-primary whitespace-nowrap"
              onClick$={() => {
                store.editingAppointment = null;
                store.selectedFrameId = null;
                store.showAppointmentModal = true;
              }}
            >
              + 新增预约
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  预约日期
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  时间
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  客户姓名
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  联系电话
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  镜架编号
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  镜架名称
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  经办人
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {sortedAppointments.length === 0 && (
                <tr>
                  <td colSpan={9} class="px-4 py-8 text-center text-gray-500">
                    暂无预约数据
                  </td>
                </tr>
              )}
              {sortedAppointments.map((apt) => {
                const isToday = apt.appointmentDate === today;
                return (
                  <tr
                    key={apt.id}
                    class={isToday && apt.status === '预约中' ? 'bg-orange-50' : 'hover:bg-gray-50'}
                  >
                    <td class="table-cell">
                      <div class="flex items-center gap-2">
                        {isToday && apt.status === '预约中' && (
                          <span class="badge bg-orange-400 text-orange-900 animate-pulse">今日</span>
                        )}
                        {apt.appointmentDate}
                      </div>
                    </td>
                    <td class="table-cell font-medium">{apt.appointmentTime}</td>
                    <td class="table-cell font-medium">{apt.customerName}</td>
                    <td class="table-cell font-mono text-sm">{apt.phone}</td>
                    <td class="table-cell font-mono">{apt.frameNo}</td>
                    <td class="table-cell">{apt.frameName}</td>
                    <td class="table-cell">{apt.handler}</td>
                    <td class="table-cell">
                      <span class={`badge ${APPOINTMENT_STATUS_COLORS[apt.status]}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td class="table-cell text-right whitespace-nowrap">
                      <div class="flex justify-end gap-2">
                        {apt.status === '预约中' && (
                          <>
                            <button
                              class="btn-success text-xs py-1 px-3"
                              onClick$={() => markAppointmentArrived(store, apt.id)}
                            >
                              确认到店
                            </button>
                            <button
                              class="btn-warning text-xs py-1 px-3"
                              onClick$={() => {
                                store.editingAppointment = apt;
                                store.selectedFrameId = null;
                                store.showAppointmentModal = true;
                              }}
                            >
                              编辑
                            </button>
                            <button
                              class="btn-secondary text-xs py-1 px-3"
                              onClick$={() => cancelAppointment(store, apt.id)}
                            >
                              取消
                            </button>
                          </>
                        )}
                        <button
                          class="btn-danger text-xs py-1 px-3"
                          onClick$={() => deleteAppointment(store, apt.id)}
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
