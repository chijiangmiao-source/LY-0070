import { component$, $, useSignal, useTask$ } from '@builder.io/qwik';
import { useForm, zodForm$ } from '@modular-forms/qwik';
import { z } from 'zod';
import type { AppState } from '~/store/appStore';
import { addFollowUpRecord, updateFollowUpRecord } from '~/store/appStore';
import {
  FOLLOW_UP_METHOD_LIST,
  FOLLOW_UP_SOURCE_TYPE_LIST,
  INTENTION_LEVEL_LIST,
} from '~/types';
import { getToday } from '~/utils/storage';

interface FollowUpModalProps {
  store: AppState;
}

const followUpSchema = z
  .object({
    customerName: z
      .string()
      .min(1, '客户姓名不能为空')
      .refine((val) => val.trim().length > 0, '客户姓名不能为空'),
    sourceType: z.enum(['试戴记录', '预约记录']),
    followUpDate: z.string().min(1, '回访日期不能为空'),
    followUpMethod: z.enum(['电话', '微信', '到店', '短信']),
    feedback: z.string().optional(),
    intentionLevel: z.enum(['高意向', '中意向', '低意向', '无意向']),
    isDealt: z.boolean(),
    dealAmount: z.number().optional(),
    noDealReason: z.string().optional(),
    nextFollowUpDate: z.string().optional(),
    handler: z
      .string()
      .min(1, '经办人不能为空')
      .refine((val) => val.trim().length > 0, '经办人不能为空'),
  })
  .superRefine((val, ctx) => {
    if (val.isDealt) {
      if (val.dealAmount === undefined || val.dealAmount <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: '成交时请填写成交金额',
          path: ['dealAmount'],
        });
      }
    }
  });

type FollowUpFormValues = z.infer<typeof followUpSchema>;

export default component$<FollowUpModalProps>(({ store }) => {
  const errorMsg = useSignal('');
  const editing = store.editingFollowUp;
  const sourceType = store.followUpSourceType || '试戴记录';
  const sourceId = store.followUpSourceId || '';
  const sourceCustomerName = store.followUpSourceCustomerName || '';

  const [, { Form, Field }] = useForm<FollowUpFormValues>({
    loader: {
      value: editing
        ? {
            customerName: editing.customerName,
            sourceType: editing.sourceType,
            followUpDate: editing.followUpDate,
            followUpMethod: editing.followUpMethod,
            feedback: editing.feedback || '',
            intentionLevel: editing.intentionLevel,
            isDealt: editing.isDealt,
            dealAmount: editing.dealAmount,
            noDealReason: editing.noDealReason || '',
            nextFollowUpDate: editing.nextFollowUpDate || '',
            handler: editing.handler,
          }
        : {
            customerName: sourceCustomerName,
            sourceType,
            followUpDate: getToday(),
            followUpMethod: FOLLOW_UP_METHOD_LIST[0],
            feedback: '',
            intentionLevel: INTENTION_LEVEL_LIST[1],
            isDealt: false,
            dealAmount: undefined,
            noDealReason: '',
            nextFollowUpDate: '',
            handler: '',
          },
    },
    validate: zodForm$(followUpSchema),
    validateOn: 'submit',
    revalidateOn: 'input',
  });

  useTask$(({ track }) => {
    track(() => store.showFollowUpModal);
    errorMsg.value = '';
  });

  const handleSubmit = $((values: FollowUpFormValues) => {
    const payload = {
      customerName: values.customerName.trim(),
      sourceType: values.sourceType,
      sourceId: editing ? editing.sourceId : sourceId,
      followUpDate: values.followUpDate,
      followUpMethod: values.followUpMethod,
      feedback: values.feedback?.trim() || '',
      intentionLevel: values.intentionLevel,
      isDealt: values.isDealt,
      dealAmount: values.isDealt ? values.dealAmount : undefined,
      noDealReason: !values.isDealt ? values.noDealReason?.trim() || undefined : undefined,
      nextFollowUpDate: values.nextFollowUpDate || undefined,
      handler: values.handler.trim(),
    };

    let result;
    if (editing) {
      result = updateFollowUpRecord(store, editing.id, payload);
    } else {
      result = addFollowUpRecord(store, payload);
    }

    if (!result.success) {
      errorMsg.value = result.error || '操作失败';
      return;
    }

    store.showFollowUpModal = false;
    store.editingFollowUp = null;
    store.followUpSourceType = null;
    store.followUpSourceId = null;
    store.followUpSourceCustomerName = null;
  });

  return (
    <div
      class="modal-overlay"
      onClick$={(e) => {
        if (e.target === e.currentTarget) {
          store.showFollowUpModal = false;
          store.editingFollowUp = null;
          store.followUpSourceType = null;
          store.followUpSourceId = null;
          store.followUpSourceCustomerName = null;
        }
      }}
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">
            {editing ? '编辑回访记录' : '登记回访记录'}
          </h3>
          <button
            class="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            onClick$={() => {
              store.showFollowUpModal = false;
              store.editingFollowUp = null;
              store.followUpSourceType = null;
              store.followUpSourceId = null;
              store.followUpSourceCustomerName = null;
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

          <div class="grid grid-cols-2 gap-4">
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

            <Field name="sourceType">
              {(field, props) => (
                <div>
                  <label class="label">来源类型</label>
                  <select {...props} value={field.value} class="input" disabled={!!editing}>
                    {FOLLOW_UP_SOURCE_TYPE_LIST.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </Field>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <Field name="followUpDate">
              {(field, props) => (
                <div>
                  <label class="label">回访日期 *</label>
                  <input {...props} type="date" value={field.value} class="input" />
                  {field.error && <p class="mt-1 text-sm text-red-600">{field.error}</p>}
                </div>
              )}
            </Field>

            <Field name="followUpMethod">
              {(field, props) => (
                <div>
                  <label class="label">回访方式 *</label>
                  <select {...props} value={field.value} class="input">
                    {FOLLOW_UP_METHOD_LIST.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </Field>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <Field name="intentionLevel">
              {(field, props) => (
                <div>
                  <label class="label">意向等级 *</label>
                  <select {...props} value={field.value} class="input">
                    {INTENTION_LEVEL_LIST.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
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
                  {field.error && <p class="mt-1 text-sm text-red-600">{field.error}</p>}
                </div>
              )}
            </Field>
          </div>

          <Field name="feedback">
            {(field, props) => (
              <div>
                <label class="label">客户反馈</label>
                <textarea
                  {...props}
                  value={field.value}
                  class="input min-h-[80px] resize-y"
                  placeholder="请输入客户反馈内容"
                />
              </div>
            )}
          </Field>

          <Field name="isDealt" type="boolean">
            {(field, props) => (
              <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <input
                  {...props}
                  type="checkbox"
                  id="isDealt"
                  checked={field.value}
                  class="w-4 h-4 text-primary rounded"
                />
                <label for="isDealt" class="label mb-0 font-medium text-gray-800">
                  是否已成交
                </label>
              </div>
            )}
          </Field>

          <Field name="isDealt">
            {(field) => (
              <>
                {field.value ? (
                  <Field name="dealAmount" type="number">
                    {(amountField, props) => (
                      <div>
                        <label class="label">成交金额（元） *</label>
                        <input
                          {...props}
                          type="number"
                          min="0"
                          step="0.01"
                          value={amountField.value ?? ''}
                          onInput$={(e) => {
                            const val = (e.target as HTMLInputElement).value;
                            (amountField as any).value = val ? Number(val) : undefined;
                          }}
                          class="input"
                          placeholder="请输入成交金额"
                        />
                        {amountField.error && (
                          <p class="mt-1 text-sm text-red-600">{amountField.error}</p>
                        )}
                      </div>
                    )}
                  </Field>
                ) : (
                  <div class="grid grid-cols-2 gap-4">
                    <Field name="nextFollowUpDate">
                      {(dateField, props) => (
                        <div>
                          <label class="label">下次跟进日期</label>
                          <input {...props} type="date" value={dateField.value} class="input" />
                        </div>
                      )}
                    </Field>

                    <Field name="noDealReason">
                      {(reasonField, props) => (
                        <div>
                          <label class="label">未成交原因</label>
                          <input
                            {...props}
                            type="text"
                            value={reasonField.value}
                            class="input"
                            placeholder="未成交的原因说明"
                          />
                        </div>
                      )}
                    </Field>
                  </div>
                )}
              </>
            )}
          </Field>

          <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              class="btn-secondary"
              onClick$={() => {
                store.showFollowUpModal = false;
                store.editingFollowUp = null;
                store.followUpSourceType = null;
                store.followUpSourceId = null;
                store.followUpSourceCustomerName = null;
              }}
            >
              取消
            </button>
            <button type="submit" class="btn-success">
              {editing ? '保存修改' : '确认登记'}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
});
