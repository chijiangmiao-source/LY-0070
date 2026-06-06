import { component$, $ } from '@builder.io/qwik';
import { useForm, zodForm$ } from '@modular-forms/qwik';
import { z } from 'zod';
import type { AppState } from '~/store/appStore';
import {
  addFrame,
  handleInventoryStatusChange,
  isFrameNoDuplicate,
  updateFrame,
} from '~/store/appStore';
import { FRAME_TYPES, INVENTORY_STATUS_LIST } from '~/types';

interface FrameFormModalProps {
  store: AppState;
}

const frameSchema = z.object({
  frameNo: z
    .string()
    .min(1, '镜架编号不能为空')
    .refine((val) => val.trim().length > 0, '镜架编号不能为空'),
  frameName: z
    .string()
    .min(1, '镜架名称不能为空')
    .refine((val) => val.trim().length > 0, '镜架名称不能为空'),
  frameType: z.string().min(1, '请选择镜架类型'),
  brandSeries: z.string().min(1, '品牌系列不能为空'),
  location: z.string().min(1, '存放位置不能为空'),
  inventoryStatus: z.enum(['在库', '试戴中', '待上架', '停用']),
});

type FrameFormValues = z.infer<typeof frameSchema>;

export default component$<FrameFormModalProps>(({ store }) => {
  const isEdit = !!store.editingFrame;
  const editingFrame = store.editingFrame;

  const [, { Form, Field }] = useForm<FrameFormValues>({
    loader: {
      value: {
        frameNo: editingFrame?.frameNo || '',
        frameName: editingFrame?.frameName || '',
        frameType: editingFrame?.frameType || '',
        brandSeries: editingFrame?.brandSeries || '',
        location: editingFrame?.location || '',
        inventoryStatus: editingFrame?.inventoryStatus || '在库',
      },
    },
    validate: zodForm$(frameSchema),
    validateOn: 'submit',
    revalidateOn: 'input',
  });

  const handleSubmit = $((values: FrameFormValues, _event: SubmitEvent) => {
    if (isFrameNoDuplicate(store, values.frameNo.trim(), editingFrame?.id)) {
      alert('镜架编号已存在，请使用其他编号');
      return;
    }

    const tryOnStatus =
      values.inventoryStatus === '试戴中' ? '试戴中' : ('空闲' as const);

    let needTryOnRecord = false;
    let targetFrameId: string | null = null;

    if (isEdit && editingFrame) {
      const oldStatus = editingFrame.inventoryStatus;
      const newStatus = values.inventoryStatus;

      const result = handleInventoryStatusChange(
        store,
        editingFrame.id,
        oldStatus,
        newStatus
      );
      needTryOnRecord = result.needTryOnRecord;
      targetFrameId = editingFrame.id;

      updateFrame(store, editingFrame.id, {
        ...values,
        frameNo: values.frameNo.trim(),
        frameName: values.frameName.trim(),
        tryOnStatus,
      });
    } else {
      const newFrame = {
        ...values,
        frameNo: values.frameNo.trim(),
        frameName: values.frameName.trim(),
        tryOnStatus,
      };
      addFrame(store, newFrame);
      needTryOnRecord = values.inventoryStatus === '试戴中';
      const addedFrame = store.frames[store.frames.length - 1];
      targetFrameId = addedFrame?.id || null;
    }

    store.showFrameModal = false;
    store.editingFrame = null;

    if (needTryOnRecord && targetFrameId) {
      store.selectedFrameId = targetFrameId;
      store.showTryOnModal = true;
    }
  });

  return (
    <div
      class="modal-overlay"
      onClick$={(e) => {
        if (e.target === e.currentTarget) {
          store.showFrameModal = false;
          store.editingFrame = null;
        }
      }}
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">
            {isEdit ? '编辑镜架' : '新增镜架'}
          </h3>
          <button
            class="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            onClick$={() => {
              store.showFrameModal = false;
              store.editingFrame = null;
            }}
          >
            ×
          </button>
        </div>
        <Form onSubmit$={handleSubmit} class="px-6 py-4 space-y-4">
          <Field name="frameNo">
            {(field, props) => (
              <div>
                <label class="label">镜架编号 *</label>
                <input
                  {...props}
                  type="text"
                  value={field.value}
                  class="input"
                  placeholder="例如：F001"
                />
                {field.error && (
                  <p class="mt-1 text-sm text-red-600">{field.error}</p>
                )}
              </div>
            )}
          </Field>

          <Field name="frameName">
            {(field, props) => (
              <div>
                <label class="label">镜架名称 *</label>
                <input
                  {...props}
                  type="text"
                  value={field.value}
                  class="input"
                  placeholder="例如：经典商务全框镜架"
                />
                {field.error && (
                  <p class="mt-1 text-sm text-red-600">{field.error}</p>
                )}
              </div>
            )}
          </Field>

          <Field name="frameType">
            {(field, props) => (
              <div>
                <label class="label">镜架类型 *</label>
                <select {...props} value={field.value} class="select">
                  <option value="">请选择类型</option>
                  {FRAME_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {field.error && (
                  <p class="mt-1 text-sm text-red-600">{field.error}</p>
                )}
              </div>
            )}
          </Field>

          <Field name="brandSeries">
            {(field, props) => (
              <div>
                <label class="label">品牌系列 *</label>
                <input
                  {...props}
                  type="text"
                  value={field.value}
                  class="input"
                  placeholder="例如：雷朋 RB系列"
                />
                {field.error && (
                  <p class="mt-1 text-sm text-red-600">{field.error}</p>
                )}
              </div>
            )}
          </Field>

          <Field name="location">
            {(field, props) => (
              <div>
                <label class="label">存放位置 *</label>
                <input
                  {...props}
                  type="text"
                  value={field.value}
                  class="input"
                  placeholder="例如：A区-01-01"
                />
                {field.error && (
                  <p class="mt-1 text-sm text-red-600">{field.error}</p>
                )}
              </div>
            )}
          </Field>

          <Field name="inventoryStatus">
            {(field, props) => (
              <div>
                <label class="label">库存状态 *</label>
                <select {...props} value={field.value} class="select">
                  {INVENTORY_STATUS_LIST.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                {field.error && (
                  <p class="mt-1 text-sm text-red-600">{field.error}</p>
                )}
              </div>
            )}
          </Field>

          <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              class="btn-secondary"
              onClick$={() => {
                store.showFrameModal = false;
                store.editingFrame = null;
              }}
            >
              取消
            </button>
            <button type="submit" class="btn-primary">
              {isEdit ? '保存修改' : '确认新增'}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
});
