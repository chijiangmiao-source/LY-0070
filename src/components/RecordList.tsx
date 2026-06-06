import { component$ } from '@builder.io/qwik';
import type { AppState } from '~/store/appStore';

interface RecordListProps {
  store: AppState;
}

export default component$<RecordListProps>(({ store }) => {
  const sortedRecords = [...store.records].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div class="card">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">试戴记录</h2>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                客户姓名
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                镜架编号
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                镜架名称
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                试戴日期
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                归还日期
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                经办人
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                备注
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {sortedRecords.length === 0 && (
              <tr>
                <td colSpan={8} class="px-4 py-8 text-center text-gray-500">
                  暂无试戴记录
                </td>
              </tr>
            )}
            {sortedRecords.map((record) => (
              <tr key={record.id} class="hover:bg-gray-50">
                <td class="table-cell font-medium">{record.customerName}</td>
                <td class="table-cell font-mono">{record.frameNo}</td>
                <td class="table-cell">{record.frameName}</td>
                <td class="table-cell">{record.tryOnDate}</td>
                <td class="table-cell">{record.returnDate || '-'}</td>
                <td class="table-cell">{record.handler}</td>
                <td class="table-cell">
                  <span
                    class={`badge ${
                      record.status === '进行中'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {record.status}
                  </span>
                </td>
                <td class="table-cell text-gray-500 max-w-xs truncate">
                  {record.remark || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
