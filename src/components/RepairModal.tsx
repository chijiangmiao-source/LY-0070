import { component$, $, useSignal, useTask$, useComputed$ } from '@builder.io/qwik';
import { useForm, zodForm$, useFormContext } from '@modular-forms/qwik';
import { z } from 'zod';
import type { AppState } from '~/store/appStore';
import { addRepairRecord, updateRepairRecord, updateRepairStatus } from '~/store/appStore';
import { REPAIR_STATUS_LIST, REPAIR_TYPE_LIST, REPAIR_RESULT_LIST } from '~/types';
import { getToday } from '~/utils/storage';

interface RepairModalProps {
  store: AppState;
}

const repairSchema = z
  .object({
    frameId: z.string().min(1, '请选择镜架'),
    sendDate: z.string().min(1, '送修日期不能为空'),
    expectedDate: z.string().optional(),
    actualDate: z.string().optional(),
    repairType: z.string().min(1, '维修类型不能为空'),
    status: z.string().min(1, '处理状态不能为空'),
    handler: z
      .string()
      .min(1, '经办人不能为空')
      .refine((val) => val.trim().length > 0, '经办人不能为空'),
    remark: z.string().optional(),
    repairResult: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.expectedDate || !data.sendDate) return true;
      return data.expectedDate >= data.sendDate;
    },
    {
      message: '预计完成日期不能早于送修日期',
      path: ['expectedDate'],
    }
  )
  .refine(
    (data) => {
      if (data.status === '已完成' && !data.repairResult) return false;
      return true;
    },
    {
      message: '状态为已完成时必须选择维修结果',
      path: ['repairResult'],
    }
  );

type RepairFormValues = z.infer<typeof repairSchema>;

export default component$<RepairModalProps>(({ store }) => {
  const errorMsg = useSignal('');
  const editing = store.editingRepair;
  const preselectedFrameId = store.selectedFrameId;

  const availableFrames = store.frames.filter(
    (f) =>
      f.inventoryStatus === '在库' ||
      f.inventoryStatus === '待上架' ||
      f.inventoryStatus === '停用' ||
      f.inventoryStatus === '已预约' ||
      f.inventoryStatus === '试戴中'
  );

  const defaultFrameId = editing
    ? editing.frameId
    : preselectedFrameId
    ? preselectedFrameId
    : availableFrames[0]?.id || '';

  const [, { Form, Field }] = useForm<RepairFormValues>({
    loader: {
      value: editing
        ? {
            frameId: editing.frameId,
            sendDate: editing.sendDate,
            expectedDate: editing.expectedDate || '',
            actualDate: editing.actualDate || '',
            repairType: editing.repairType,
            status: editing.status,
            handler: editing.handler,
            remark: editing.remark || '',
            repairResult: editing.repairResult || '',
          }
        : {
            frameId: defaultFrameId,
            sendDate: getToday(),
            expectedDate: '',
            actualDate: '',
            repairType: REPAIR_TYPE_LIST[0],
            status: REPAIR_STATUS_LIST[0],
            handler: '',
            remark: '',
            repairResult: '',
          },
    },
    validate: zodForm$(repairSchema),
    validateOn: 'submit',
    revalidateOn: 'input',
  });

  const formStore = useFormContext<RepairFormValues>();
  const currentStatus = useComputed$(() => {
    return formStore?.value?.status || editing?.status || '';
  });

  useTask$(({ track }) => {
    track(() => store.showRepairModal);
    errorMsg.value = '';
  });

  const handleSubmit = $((values: RepairFormValues) => {
    const frame = store.frames.find((f) => f.id === values.frameId);
    if (!frame) {
      errorMsg.value = '未找到镜架信息';
      return;
    }

    const payload = {
      frameId: values.frameId,
      frameNo: frame.frameNo,
      frameName: frame.frameName,
      sendDate: values.sendDate,
      expectedDate: values.expectedDate?.trim() || undefined,
      actualDate: values.actualDate?.trim() || undefined,
      repairType: values.repairType as '送修' | '保养' | '返库',
      status: values.status as '待送修' | '维修中' | '待返库' | '已完成',
      handler: values.handler.trim(),
      remark: values.remark?.trim() || undefined,
      repairResult: (values.repairResult as '已修好' | '未修好') || undefined,
    };

    let result;
    if (editing) {
      const wasNotCompleted = editing.status !== '已完成';
      const nowCompleted = values.status === '已完成';

      result = updateRepairRecord(store, editing.id, payload);

      if (result.success && wasNotCompleted && nowCompleted && payload.repairResult) {
        updateRepairStatus(store, editing.id, '已完成', payload.repairResult);
      }
    } else {
      result = addRepairRecord(store, payload);
      if (result.success && payload.status === '已完成' && payload.repairResult) {
        const newRecord = store.repairs[store.repairs.length - 1];
        if (newRecord) {
          updateRepairStatus(store, newRecord.id, '已完成', payload.repairResult);
        }
      }
    }

    if (!result.success) {
      errorMsg.value = result.error || '操作失败';
      return;
    }

    store.showRepairModal = false;
    store.editingRepair = null;
    store.selectedFrameId = null;
  });

  return (
    <div
      class="modal-overlay"
      onClick$={(e) => {
        if (e.target === e.currentTarget) {
          store.showRepairModal = false;
          store.editingRepair = null;
          store.selectedFrameId = null;
        }
      }}
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">
            {editing ? '编辑维修记录' : '新增维修记录'}
          </h3>
          <button
            class="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            onClick$={() => {
              store.showRepairModal = false;
              store.editingRepair = null;
              store.selectedFrameId = null;
            }}
          >
            ×
          </button>
        </div>

        <Form onSubmit$={handleSubmit} class="px-6 py-4 space-y-4">
          {errorMsg.value && (
            <div class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errorMsg.value}
            </div>
          )}

          {editing && (
            <div>
              <label class="label">维修单号</label>
              <div class="px-3 py-2 bg-gray-100 rounded-lg font-mono text-gray-700">
                {editing.repairNo}
              </div>
            </div>
          )}

          <Field name="frameId">
            {(field, props) => (
              <div>
                <label class="label">选择镜架 *</label>
                <select {...props} value={field.value} class="input">
                  <option value="">请选择镜架</option>
                  {availableFrames.map((frame) => (
                    <option key={frame.id} value={frame.id}>
                      {frame.frameNo} - {frame.frameName}（{frame.inventoryStatus}）
                    </option>
                  ))}
                </select>
                {field.error && <p class="mt-1 text-sm text-red-600">{field.error}</p>}
              </div>
            )}
          </Field>

          <div class="grid grid-cols-2 gap-4">
            <Field name="sendDate">
              {(field, props) => (
                <div>
                  <label class="label">送修日期 *</label>
                  <input {...props} type="date" value={field.value} class="input" />
                  {field.error && <p class="mt-1 text-sm text-red-600">{field.error}</p>}
                </div>
              )}
            </Field>

            <Field name="expectedDate">
              {(field, props) => (
                <div>
                  <label class="label">预计完成日期</label>
                  <input {...props} type="date" value={field.value} class="input" />
                  {field.error && <p class="mt-1 text-sm text-red-600">{field.error}</p>}
                </div>
              )}
            </Field>
          </div>

          <Field name="actualDate">
            {(field, props) => (
              <div>
                <label class="label">实际完成日期</label>
                <input {...props} type="date" value={field.value} class="input" />
                {field.error && <p class="mt-1 text-sm text-red-600">{field.error}</p>}
              </div>
            )}
          </Field>

          <div class="grid grid-cols-2 gap-4">
            <Field name="repairType">
              {(field, props) => (
                <div>
                  <label class="label">维修类型 *</label>
                  <select {...props} value={field.value} class="input">
                    <option value="">请选择类型</option>
                    {REPAIR_TYPE_LIST.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  {field.error && <p class="mt-1 text-sm text-red-600">{field.error}</p>}
                </div>
              )}
            </Field>

            <Field name="status">
              {(field, props) => (
                <div>
                  <label class="label">处理状态 *</label>
                  <select {...props} value={field.value} class="input">
                    <option value="">请选择状态</option>
                    {REPAIR_STATUS_LIST.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {field.error && <p class="mt-1 text-sm text-red-600">{field.error}</p>}
                </div>
              )}
            </Field>
          </div>

          {currentStatus.value === '已完成' && (
            <Field name="repairResult">
              {(field, props) => (
                <div>
                  <label class="label">维修结果 *</label>
                  <select {...props} value={field.value} class="input">
                    <option value="">请选择维修结果</option>
                    {REPAIR_RESULT_LIST.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  {field.error && <p class="mt-1 text-sm text-red-600">{field.error}</p>}
                </div>
              )}
            </Field>
          )}

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
                {field.error && <p class="mt-1 text-sm text-red-600">{field.error}</p>}
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
                store.showRepairModal = false;
                store.editingRepair = null;
                store.selectedFrameId = null;
              }}
            >
              取消
            </button>
            <button type="submit" class="btn-success">
              {editing ? '保存修改' : '确认提交'}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
});
