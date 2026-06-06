import { component$, $, useSignal, useTask$ } from '@builder.io/qwik';
import { useForm, zodForm$ } from '@modular-forms/qwik';
import { z } from 'zod';
import type { AppState } from '~/store/appStore';
import { returnFrame } from '~/store/appStore';
import { getToday } from '~/utils/storage';

interface ReturnModalProps {
  store: AppState;
}

const returnSchema = z.object({
  returnDate: z.string().min(1, '归还日期不能为空'),
  remark: z.string().optional(),
});

type ReturnFormValues = z.infer<typeof returnSchema>;

export default component$<ReturnModalProps>(({ store }) => {
  const record = store.records.find((r) => r.id === store.selectedRecordId);
  const errorMsg = useSignal('');

  const [, { Form, Field }] = useForm<ReturnFormValues>({
    loader: {
      value: {
        returnDate: getToday(),
        remark: record?.remark || '',
      },
    },
    validate: zodForm$(returnSchema),
    validateOn: 'submit',
    revalidateOn: 'input',
  });

  useTask$(({ track }) => {
    track(() => store.selectedRecordId);
    errorMsg.value = '';
  });

  const handleSubmit = $((values: ReturnFormValues) => {
    if (!record) {
      errorMsg.value = '未找到试戴记录';
      return;
    }

    if (values.returnDate < record.tryOnDate) {
      errorMsg.value = '归还日期不能早于试戴日期';
      return;
    }

    const today = getToday();
    if (values.returnDate > today) {
      errorMsg.value = '归还日期不能晚于当前日期';
      return;
    }

    returnFrame(
      store,
      record.id,
      values.returnDate,
      values.remark?.trim() || undefined
    );

    store.showReturnModal = false;
    store.selectedRecordId = null;
  });

  if (!record) {
    return null;
  }

  return (
    <div
      class="modal-overlay"
      onClick$={(e) => {
        if (e.target === e.currentTarget) {
          store.showReturnModal = false;
          store.selectedRecordId = null;
        }
      }}
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">归还处理</h3>
          <button
            class="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            onClick$={() => {
              store.showReturnModal = false;
              store.selectedRecordId = null;
            }}
          >
            ×
          </button>
        </div>

        <div class="px-6 py-4 bg-yellow-50 border-b border-yellow-100">
          <p class="text-sm text-gray-600">
            客户姓名：<span class="font-medium">{record.customerName}</span>
          </p>
          <p class="text-sm text-gray-600 mt-1">
            镜架：<span class="font-mono">{record.frameNo}</span> - {record.frameName}
          </p>
          <p class="text-sm text-gray-600 mt-1">
            试戴日期：<span class="font-medium">{record.tryOnDate}</span>
          </p>
          <p class="text-sm text-gray-600 mt-1">
            经办人：<span class="font-medium">{record.handler}</span>
          </p>
        </div>

        <Form onSubmit$={handleSubmit} class="px-6 py-4 space-y-4">
          {errorMsg.value && (
            <div class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errorMsg.value}
            </div>
          )}

          <Field name="returnDate">
            {(field, props) => (
              <div>
                <label class="label">归还日期 *</label>
                <input
                  {...props}
                  type="date"
                  value={field.value}
                  min={record.tryOnDate}
                  max={getToday()}
                  class="input"
                />
                {field.error && (
                  <p class="mt-1 text-sm text-red-600">{field.error}</p>
                )}
              </div>
            )}
          </Field>

          <Field name="remark">
            {(field, props) => (
              <div>
                <label class="label">备注</label>
                <textarea
                  {...props}
                  value={field.value}
                  class="input min-h-[80px] resize-y"
                  placeholder="可选，输入归还备注信息"
                />
              </div>
            )}
          </Field>

          <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              class="btn-secondary"
              onClick$={() => {
                store.showReturnModal = false;
                store.selectedRecordId = null;
              }}
            >
              取消
            </button>
            <button type="submit" class="btn-warning">
              确认归还
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
});
