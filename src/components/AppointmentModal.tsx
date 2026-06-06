import { component$, $, useSignal, useTask$ } from '@builder.io/qwik';
import { useForm, zodForm$ } from '@modular-forms/qwik';
import { z } from 'zod';
import type { AppState } from '~/store/appStore';
import { addAppointment, updateAppointment } from '~/store/appStore';
import { getToday } from '~/utils/storage';

interface AppointmentModalProps {
  store: AppState;
}

const appointmentSchema = z.object({
  frameId: z.string().min(1, '请选择镜架'),
  customerName: z
    .string()
    .min(1, '客户姓名不能为空')
    .refine((val) => val.trim().length > 0, '客户姓名不能为空'),
  phone: z
    .string()
    .min(1, '联系电话不能为空')
    .refine((val) => /^1[3-9]\d{9}$/.test(val.trim()), '请输入正确的手机号'),
  appointmentDate: z.string().min(1, '预约日期不能为空'),
  appointmentTime: z.string().min(1, '预约时间不能为空'),
  handler: z
    .string()
    .min(1, '经办人不能为空')
    .refine((val) => val.trim().length > 0, '经办人不能为空'),
  remark: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:30', '14:00', '14:30', '15:00', '15:30', '16:00',
  '16:30', '17:00', '17:30', '18:00',
];

export default component$<AppointmentModalProps>(({ store }) => {
  const errorMsg = useSignal('');
  const editing = store.editingAppointment;
  const preselectedFrameId = store.selectedFrameId;

  const availableFrames = store.frames.filter(
    (f) => f.inventoryStatus === '在库' || f.inventoryStatus === '待上架'
  );

  const defaultFrameId = editing
    ? editing.frameId
    : preselectedFrameId
    ? preselectedFrameId
    : availableFrames[0]?.id || '';

  const [, { Form, Field }] = useForm<AppointmentFormValues>({
    loader: {
      value: editing
        ? {
            frameId: editing.frameId,
            customerName: editing.customerName,
            phone: editing.phone,
            appointmentDate: editing.appointmentDate,
            appointmentTime: editing.appointmentTime,
            handler: editing.handler,
            remark: editing.remark || '',
          }
        : {
            frameId: defaultFrameId,
            customerName: '',
            phone: '',
            appointmentDate: getToday(),
            appointmentTime: TIME_SLOTS[0],
            handler: '',
            remark: '',
          },
    },
    validate: zodForm$(appointmentSchema),
    validateOn: 'submit',
    revalidateOn: 'input',
  });

  useTask$(({ track }) => {
    track(() => store.showAppointmentModal);
    errorMsg.value = '';
  });

  const handleSubmit = $((values: AppointmentFormValues) => {
    const frame = store.frames.find((f) => f.id === values.frameId);
    if (!frame) {
      errorMsg.value = '未找到镜架信息';
      return;
    }

    const payload = {
      frameId: values.frameId,
      frameNo: frame.frameNo,
      frameName: frame.frameName,
      customerName: values.customerName.trim(),
      phone: values.phone.trim(),
      appointmentDate: values.appointmentDate,
      appointmentTime: values.appointmentTime,
      handler: values.handler.trim(),
      remark: values.remark?.trim() || undefined,
    };

    let result;
    if (editing) {
      result = updateAppointment(store, editing.id, payload);
    } else {
      result = addAppointment(store, payload);
    }

    if (!result.success) {
      errorMsg.value = result.error || '操作失败';
      return;
    }

    store.showAppointmentModal = false;
    store.editingAppointment = null;
    store.selectedFrameId = null;
  });

  return (
    <div
      class="modal-overlay"
      onClick$={(e) => {
        if (e.target === e.currentTarget) {
          store.showAppointmentModal = false;
          store.editingAppointment = null;
          store.selectedFrameId = null;
        }
      }}
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">
            {editing ? '编辑预约' : '新增预约'}
          </h3>
          <button
            class="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            onClick$={() => {
              store.showAppointmentModal = false;
              store.editingAppointment = null;
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

          <Field name="frameId">
            {(field, props) => (
              <div>
                <label class="label">选择镜架 *</label>
                <select {...props} value={field.value} class="input">
                  <option value="">请选择镜架</option>
                  {availableFrames.map((frame) => (
                    <option key={frame.id} value={frame.id}>
                      {frame.frameNo} - {frame.frameName}
                    </option>
                  ))}
                </select>
                {field.error && <p class="mt-1 text-sm text-red-600">{field.error}</p>}
              </div>
            )}
          </Field>

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
                {field.error && <p class="mt-1 text-sm text-red-600">{field.error}</p>}
              </div>
            )}
          </Field>

          <Field name="phone">
            {(field, props) => (
              <div>
                <label class="label">联系电话 *</label>
                <input
                  {...props}
                  type="tel"
                  value={field.value}
                  class="input"
                  placeholder="请输入手机号"
                />
                {field.error && <p class="mt-1 text-sm text-red-600">{field.error}</p>}
              </div>
            )}
          </Field>

          <div class="grid grid-cols-2 gap-4">
            <Field name="appointmentDate">
              {(field, props) => (
                <div>
                  <label class="label">预约日期 *</label>
                  <input
                    {...props}
                    type="date"
                    value={field.value}
                    min={getToday()}
                    class="input"
                  />
                  {field.error && <p class="mt-1 text-sm text-red-600">{field.error}</p>}
                </div>
              )}
            </Field>

            <Field name="appointmentTime">
              {(field, props) => (
                <div>
                  <label class="label">预约时间 *</label>
                  <select {...props} value={field.value} class="input">
                    <option value="">请选择时间</option>
                    {TIME_SLOTS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  {field.error && <p class="mt-1 text-sm text-red-600">{field.error}</p>}
                </div>
              )}
            </Field>
          </div>

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
                store.showAppointmentModal = false;
                store.editingAppointment = null;
                store.selectedFrameId = null;
              }}
            >
              取消
            </button>
            <button type="submit" class="btn-success">
              {editing ? '保存修改' : '确认预约'}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
});
