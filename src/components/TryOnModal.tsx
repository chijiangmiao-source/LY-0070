import { component$, $, useSignal, useTask$ } from '@builder.io/qwik';
import { useForm, zodForm$ } from '@modular-forms/qwik';
import { z } from 'zod';
import type { AppState } from '~/store/appStore';
import { addTryOnRecord } from '~/store/appStore';
import { getToday } from '~/utils/storage';

interface TryOnModalProps {
  store: AppState;
}

const tryOnSchema = z.object({
  customerName: z
    .string()
    .min(1, '客户姓名不能为空')
    .refine((val) => val.trim().length > 0, '客户姓名不能为空'),
  tryOnDate: z.string().min(1, '试戴日期不能为空'),
  handler: z
    .string()
    .min(1, '经办人不能为空')
    .refine((val) => val.trim().length > 0, '经办人不能为空'),
  remark: z.string().optional(),
});

type TryOnFormValues = z.infer<typeof tryOnSchema>;

export default component$<TryOnModalProps>(({ store }) => {
  const frame = store.frames.find((f) => f.id === store.selectedFrameId);
  const errorMsg = useSignal('');

  const [, { Form, Field }] = useForm<TryOnFormValues>({
    loader: {
      value: {
        customerName: '',
        tryOnDate: getToday(),
        handler: '',
        remark: '',
      },
    },
    validate: zodForm$(tryOnSchema),
    validateOn: 'submit',
    revalidateOn: 'input',
  });

  useTask$(({ track }) => {
    track(() => store.selectedFrameId);
    errorMsg.value = '';
  });

  const handleSubmit = $((values: TryOnFormValues) => {
    const today = getToday();
    if (values.tryOnDate > today) {
      errorMsg.value = '试戴日期不能晚于当前日期';
      return;
    }

    if (!frame) {
      errorMsg.value = '未找到镜架信息';
      return;
    }

    addTryOnRecord(store, {
      frameId: frame.id,
      frameNo: frame.frameNo,
      frameName: frame.frameName,
      customerName: values.customerName.trim(),
      tryOnDate: values.tryOnDate,
      handler: values.handler.trim(),
      remark: values.remark?.trim() || undefined,
    });

    store.showTryOnModal = false;
    store.selectedFrameId = null;
  });

  if (!frame) {
    return null;
  }

  return (
    <div
      class="modal-overlay"
      onClick$={(e) => {
        if (e.target === e.currentTarget) {
          store.showTryOnModal = false;
          store.selectedFrameId = null;
        }
      }}
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">试戴登记</h3>
          <button
            class="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            onClick$={() => {
              store.showTryOnModal = false;
              store.selectedFrameId = null;
            }}
          >
            ×
          </button>
        </div>

        <div class="px-6 py-4 bg-blue-50 border-b border-blue-100">
          <p class="text-sm text-gray-600">镜架编号：<span class="font-mono font-medium">{frame.frameNo}</span></p>
          <p class="text-sm text-gray-600 mt-1">镜架名称：<span class="font-medium">{frame.frameName}</span></p>
        </div>

        <Form onSubmit$={handleSubmit} class="px-6 py-4 space-y-4">
          {errorMsg.value && (
            <div class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errorMsg.value}
            </div>
          )}

          <Field name="customerName">
            {(field, props) => (
              <div>
                <label class="label">客户姓名 *</label>
                <input
                  {...props}
                  type="text"
                  value={field.value}
                  class="input"
                  placeholder="请输入客户姓名"
                />
                {field.error && (
                  <p class="mt-1 text-sm text-red-600">{field.error}</p>
                )}
              </div>
            )}
          </Field>

          <Field name="tryOnDate">
            {(field, props) => (
              <div>
                <label class="label">试戴日期 *</label>
                <input
                  {...props}
                  type="date"
                  value={field.value}
                  max={getToday()}
                  class="input"
                />
                {field.error && (
                  <p class="mt-1 text-sm text-red-600">{field.error}</p>
                )}
              </div>
            )}
          </Field>

          <Field name="handler">
            {(field, props) => (
              <div>
                <label class="label">经办人 *</label>
                <input
                  {...props}
                  type="text"
                  value={field.value}
                  class="input"
                  placeholder="请输入经办人姓名"
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
                  placeholder="可选，输入备注信息"
                />
              </div>
            )}
          </Field>

          <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              class="btn-secondary"
              onClick$={() => {
                store.showTryOnModal = false;
                store.selectedFrameId = null;
              }}
            >
              取消
            </button>
            <button type="submit" class="btn-success">
              确认登记
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
});
