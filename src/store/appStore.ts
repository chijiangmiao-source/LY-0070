import {
  createContextId,
  useContext,
  useContextProvider,
  useStore,
  useVisibleTask$,
} from '@builder.io/qwik';
import type {
  Appointment,
  CustomerSummary,
  FollowUpRecord,
  FollowUpSourceType,
  FollowUpStatus,
  GlassesFrame,
  IntentionLevel,
  RepairRecord,
  RepairResult,
  RepairStatus,
  TryOnRecord,
} from '~/types';
import {
  generateId,
  generateRepairNo,
  getNow,
  getToday,
  loadAppointments,
  loadFollowUps,
  loadFrames,
  loadRecords,
  loadRepairs,
  saveAppointments,
  saveFollowUps,
  saveFrames,
  saveRecords,
  saveRepairs,
} from '~/utils/storage';

export interface AppState {
  frames: GlassesFrame[];
  records: TryOnRecord[];
  appointments: Appointment[];
  repairs: RepairRecord[];
  followUps: FollowUpRecord[];
  searchKeyword: string;
  filterType: string;
  filterInventory: string;
  activeTab: 'frames' | 'records' | 'stats' | 'appointments' | 'repairs' | 'customers';
  editingFrame: GlassesFrame | null;
  showFrameModal: boolean;
  showTryOnModal: boolean;
  showReturnModal: boolean;
  showAppointmentModal: boolean;
  showRepairModal: boolean;
  showFollowUpModal: boolean;
  selectedFrameId: string | null;
  selectedRecordId: string | null;
  selectedAppointmentId: string | null;
  selectedRepairId: string | null;
  selectedFollowUpId: string | null;
  pendingTryOnAfterEdit: boolean;
  editingAppointment: Appointment | null;
  editingRepair: RepairRecord | null;
  editingFollowUp: FollowUpRecord | null;
  followUpSourceType: FollowUpSourceType | null;
  followUpSourceId: string | null;
  followUpSourceCustomerName: string | null;
  appointmentSearchKeyword: string;
  appointmentFilterDate: string;
  appointmentFilterFrameNo: string;
  appointmentFilterStatus: string;
  repairSearchKeyword: string;
  repairFilterDateFrom: string;
  repairFilterDateTo: string;
  repairFilterFrameNo: string;
  repairFilterStatus: string;
  repairFilterHandler: string;
  customerSearchKeyword: string;
  customerFilterIntention: string;
  customerFilterStatus: string;
  customerFilterDateFrom: string;
  customerFilterDateTo: string;
}

export const AppContext = createContextId<AppState>('app-context');

export function useAppStore(): AppState {
  return useContext(AppContext);
}

export function createAppStore(): AppState {
  const store = useStore<AppState>({
    frames: [],
    records: [],
    appointments: [],
    repairs: [],
    followUps: [],
    searchKeyword: '',
    filterType: '',
    filterInventory: '',
    activeTab: 'frames',
    editingFrame: null,
    showFrameModal: false,
    showTryOnModal: false,
    showReturnModal: false,
    showAppointmentModal: false,
    showRepairModal: false,
    showFollowUpModal: false,
    selectedFrameId: null,
    selectedRecordId: null,
    selectedAppointmentId: null,
    selectedRepairId: null,
    selectedFollowUpId: null,
    pendingTryOnAfterEdit: false,
    editingAppointment: null,
    editingRepair: null,
    editingFollowUp: null,
    followUpSourceType: null,
    followUpSourceId: null,
    followUpSourceCustomerName: null,
    appointmentSearchKeyword: '',
    appointmentFilterDate: '',
    appointmentFilterFrameNo: '',
    appointmentFilterStatus: '',
    repairSearchKeyword: '',
    repairFilterDateFrom: '',
    repairFilterDateTo: '',
    repairFilterFrameNo: '',
    repairFilterStatus: '',
    repairFilterHandler: '',
    customerSearchKeyword: '',
    customerFilterIntention: '',
    customerFilterStatus: '',
    customerFilterDateFrom: '',
    customerFilterDateTo: '',
  });

  useVisibleTask$(() => {
    store.frames = loadFrames();
    store.records = loadRecords();
    store.appointments = loadAppointments();
    store.repairs = loadRepairs();
    store.followUps = loadFollowUps();
    syncAppointmentFrameIds(store);
    syncFramesAppointmentStatus(store);
    syncFramesRepairStatus(store);
    syncRepairFrameIds(store);
  });

  useVisibleTask$(({ track }) => {
    track(() => store.frames);
    saveFrames(store.frames);
  });

  useVisibleTask$(({ track }) => {
    track(() => store.records);
    saveRecords(store.records);
  });

  useVisibleTask$(({ track }) => {
    track(() => store.appointments);
    saveAppointments(store.appointments);
    syncFramesAppointmentStatus(store);
  });

  useVisibleTask$(({ track }) => {
    track(() => store.repairs);
    saveRepairs(store.repairs);
    syncFramesRepairStatus(store);
  });

  useVisibleTask$(({ track }) => {
    track(() => store.followUps);
    saveFollowUps(store.followUps);
  });

  useContextProvider(AppContext, store);
  return store;
}

export function addFrame(store: AppState, frame: Omit<GlassesFrame, 'id' | 'createdAt' | 'updatedAt'>): void {
  const now = getNow();
  store.frames.push({
    ...frame,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  });
}

export function updateFrame(store: AppState, id: string, updates: Partial<GlassesFrame>): void {
  const index = store.frames.findIndex((f) => f.id === id);
  if (index !== -1) {
    store.frames[index] = {
      ...store.frames[index],
      ...updates,
      updatedAt: getNow(),
    };
  }
}

export function deleteFrame(store: AppState, id: string): void {
  store.frames = store.frames.filter((f) => f.id !== id);
}

export function addTryOnRecord(store: AppState, record: Omit<TryOnRecord, 'id' | 'createdAt' | 'status'>): void {
  const frame = store.frames.find((f) => f.id === record.frameId);
  if (frame) {
    frame.tryOnStatus = '试戴中';
    frame.inventoryStatus = '试戴中';
    frame.updatedAt = getNow();
  }
  store.records.push({
    ...record,
    id: generateId(),
    status: '进行中',
    createdAt: getNow(),
  });
}

export function returnFrame(store: AppState, recordId: string, returnDate: string, remark?: string): void {
  const record = store.records.find((r) => r.id === recordId);
  if (record) {
    record.returnDate = returnDate;
    record.status = '已归还';
    if (remark) record.remark = remark;

    const frame = store.frames.find((f) => f.id === record.frameId);
    if (frame) {
      frame.tryOnStatus = '空闲';
      if (frame.inventoryStatus === '试戴中') {
        frame.inventoryStatus = '在库';
      }
      frame.updatedAt = getNow();
    }
  }
}

export function isFrameNoDuplicate(store: AppState, frameNo: string, excludeId?: string): boolean {
  return store.frames.some((f) => f.frameNo === frameNo && f.id !== excludeId);
}

export function getFilteredFrames(store: AppState): GlassesFrame[] {
  return store.frames.filter((frame) => {
    const matchKeyword =
      !store.searchKeyword ||
      frame.frameNo.toLowerCase().includes(store.searchKeyword.toLowerCase()) ||
      frame.frameName.toLowerCase().includes(store.searchKeyword.toLowerCase()) ||
      frame.brandSeries.toLowerCase().includes(store.searchKeyword.toLowerCase());
    const matchType = !store.filterType || frame.frameType === store.filterType;
    const matchInventory = !store.filterInventory || frame.inventoryStatus === store.filterInventory;
    return matchKeyword && matchType && matchInventory;
  });
}

export function handleInventoryStatusChange(
  store: AppState,
  frameId: string,
  oldStatus: string,
  newStatus: string
): { needTryOnRecord: boolean } {
  const needTryOnRecord = oldStatus !== '试戴中' && newStatus === '试戴中';
  const wasTryOn = oldStatus === '试戴中' && newStatus !== '试戴中';
  const wasAppointment = oldStatus === '已预约' && newStatus !== '已预约';

  if (wasTryOn) {
    const activeRecords = store.records.filter(
      (r) => r.frameId === frameId && r.status === '进行中'
    );
    const today = getToday();
    activeRecords.forEach((record) => {
      record.returnDate = today;
      record.status = '已归还';
    });
  }

  if (wasAppointment) {
    const activeAppointments = store.appointments.filter(
      (a) => a.frameId === frameId && a.status === '预约中'
    );
    activeAppointments.forEach((apt) => {
      apt.status = '已取消';
      apt.updatedAt = getNow();
    });
    const frame = store.frames.find((f) => f.id === frameId);
    if (frame) {
      frame.appointmentInfo = undefined;
    }
  }

  return { needTryOnRecord };
}

function determineCustomerFollowUpStatus(
  customerFollowUps: FollowUpRecord[],
  nextDate?: string
): FollowUpStatus {
  if (customerFollowUps.some((f) => f.isDealt)) {
    return '已成交';
  }
  const today = getToday();
  if (nextDate && nextDate < today) {
    return '已流失';
  }
  if (customerFollowUps.length === 0) {
    return '待回访';
  }
  const lastFollowUp = [...customerFollowUps].sort(
    (a, b) => new Date(b.followUpDate).getTime() - new Date(a.followUpDate).getTime()
  )[0];
  if (!lastFollowUp.isDealt && lastFollowUp.feedback && lastFollowUp.nextFollowUpDate) {
    return '跟进中';
  }
  if (!lastFollowUp.feedback) {
    return '待回访';
  }
  return '跟进中';
}

function getLatestIntentionLevel(customerFollowUps: FollowUpRecord[]): IntentionLevel | undefined {
  if (customerFollowUps.length === 0) return undefined;
  const sorted = [...customerFollowUps].sort(
    (a, b) => new Date(b.followUpDate).getTime() - new Date(a.followUpDate).getTime()
  );
  return sorted[0].intentionLevel;
}

export function getCustomerSummaries(store: AppState): CustomerSummary[] {
  const customerMap = new Map<string, CustomerSummary>();
  const allCustomerNames = new Set<string>();

  store.records.forEach((r) => allCustomerNames.add(r.customerName));
  store.appointments.forEach((a) => allCustomerNames.add(a.customerName));
  store.repairs.forEach((r) => {
    const customerApts = store.appointments.filter((a) => a.frameId === r.frameId);
    const customerRecords = store.records.filter((rec) => rec.frameId === r.frameId);
    customerApts.forEach((a) => allCustomerNames.add(a.customerName));
    customerRecords.forEach((rec) => allCustomerNames.add(rec.customerName));
  });
  store.followUps.forEach((f) => allCustomerNames.add(f.customerName));

  allCustomerNames.forEach((name) => {
    const customerFollowUps = store.followUps.filter((f) => f.customerName === name);
    const sortedFollowUps = [...customerFollowUps].sort(
      (a, b) => new Date(b.followUpDate).getTime() - new Date(a.followUpDate).getTime()
    );
    const lastFollowUp = sortedFollowUps[0];
    const nextFollowUpDate = lastFollowUp?.nextFollowUpDate;
    const lastFollowUpDate = lastFollowUp?.followUpDate;

    customerMap.set(name, {
      customerName: name,
      followUpStatus: determineCustomerFollowUpStatus(customerFollowUps, nextFollowUpDate),
      intentionLevel: getLatestIntentionLevel(customerFollowUps),
      lastFollowUpDate,
      nextFollowUpDate,
      tryOnRecords: store.records.filter((r) => r.customerName === name),
      appointments: store.appointments.filter((a) => a.customerName === name),
      repairs: store.repairs.filter((r) => {
        const frameCustomerNames = new Set<string>();
        store.appointments
          .filter((a) => a.frameId === r.frameId)
          .forEach((a) => frameCustomerNames.add(a.customerName));
        store.records
          .filter((rec) => rec.frameId === r.frameId)
          .forEach((rec) => frameCustomerNames.add(rec.customerName));
        return frameCustomerNames.has(name);
      }),
      followUpRecords: sortedFollowUps,
    });
  });

  return Array.from(customerMap.values()).sort((a, b) => {
    const statusOrder: Record<FollowUpStatus, number> = {
      待回访: 0,
      跟进中: 1,
      已成交: 2,
      已流失: 3,
    };
    return statusOrder[a.followUpStatus] - statusOrder[b.followUpStatus];
  });
}

export function getStats(store: AppState) {
  const total = store.frames.length;
  const inStock = store.frames.filter((f) => f.inventoryStatus === '在库').length;
  const inTryOn = store.frames.filter((f) => f.inventoryStatus === '试戴中').length;
  const pending = store.frames.filter((f) => f.inventoryStatus === '待上架').length;
  const disabled = store.frames.filter((f) => f.inventoryStatus === '停用').length;
  const totalRecords = store.records.length;
  const activeRecords = store.records.filter((r) => r.status === '进行中').length;
  const today = getToday();
  const todayAppointments = store.appointments.filter((a) => a.appointmentDate === today);
  const todayAppointmentCount = todayAppointments.length;
  const pendingArrival = todayAppointments.filter((a) => a.status === '预约中').length;
  const totalAppointments = store.appointments.length;
  const activeAppointments = store.appointments.filter((a) => a.status === '预约中').length;
  const inRepair = store.repairs.filter((r) => r.status === '维修中').length;
  const pendingReturn = store.repairs.filter((r) => r.status === '待返库').length;
  const thisMonth = new Date().toISOString().slice(0, 7);
  const thisMonthRepairs = store.repairs.filter((r) => r.sendDate.startsWith(thisMonth)).length;

  const customers = getCustomerSummaries(store);
  const pendingFollowUpCount = customers.filter((c) => c.followUpStatus === '待回访').length;
  const dealtCount = customers.filter((c) => c.followUpStatus === '已成交').length;
  const dealtCustomers = store.followUps.filter((f) => f.isDealt);
  const totalDealAmount = dealtCustomers.reduce((sum, f) => sum + (f.dealAmount || 0), 0);
  const thisMonthFollowUps = store.followUps.filter((f) => f.followUpDate.startsWith(thisMonth));
  const thisMonthTotal = new Set(thisMonthFollowUps.map((f) => f.customerName)).size;
  const thisMonthDealt = new Set(
    thisMonthFollowUps.filter((f) => f.isDealt).map((f) => f.customerName)
  ).size;
  const thisMonthConversionRate = thisMonthTotal > 0 ? (thisMonthDealt / thisMonthTotal) * 100 : 0;

  return {
    total,
    inStock,
    inTryOn,
    pending,
    disabled,
    totalRecords,
    activeRecords,
    todayAppointmentCount,
    pendingArrival,
    totalAppointments,
    activeAppointments,
    inRepair,
    pendingReturn,
    thisMonthRepairs,
    pendingFollowUpCount,
    dealtCount,
    totalDealAmount,
    thisMonthConversionRate,
    thisMonthTotal,
    thisMonthDealt,
  };
}

export function addAppointment(
  store: AppState,
  appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'status'>
): { success: boolean; error?: string } {
  const conflict = store.appointments.some(
    (a) =>
      a.status === '预约中' &&
      a.frameId === appointment.frameId &&
      a.appointmentDate === appointment.appointmentDate &&
      a.appointmentTime === appointment.appointmentTime
  );
  if (conflict) {
    return { success: false, error: '该镜架在此时间段已有预约' };
  }
  const now = getNow();
  store.appointments.push({
    ...appointment,
    id: generateId(),
    status: '预约中',
    createdAt: now,
    updatedAt: now,
  });
  return { success: true };
}

export function updateAppointment(
  store: AppState,
  id: string,
  updates: Partial<Omit<Appointment, 'id' | 'createdAt'>>
): { success: boolean; error?: string } {
  const index = store.appointments.findIndex((a) => a.id === id);
  if (index === -1) return { success: false, error: '预约不存在' };
  const current = store.appointments[index];
  const newFrameId = updates.frameId ?? current.frameId;
  const newDate = updates.appointmentDate ?? current.appointmentDate;
  const newTime = updates.appointmentTime ?? current.appointmentTime;
  const conflict = store.appointments.some(
    (a) =>
      a.id !== id &&
      a.status === '预约中' &&
      a.frameId === newFrameId &&
      a.appointmentDate === newDate &&
      a.appointmentTime === newTime
  );
  if (conflict) {
    return { success: false, error: '该镜架在此时间段已有预约' };
  }
  store.appointments[index] = {
    ...current,
    ...updates,
    updatedAt: getNow(),
  };
  return { success: true };
}

export function cancelAppointment(store: AppState, id: string): void {
  const appointment = store.appointments.find((a) => a.id === id);
  if (appointment) {
    appointment.status = '已取消';
    appointment.updatedAt = getNow();
  }
}

export function markAppointmentArrived(store: AppState, id: string): void {
  const appointment = store.appointments.find((a) => a.id === id);
  if (appointment) {
    appointment.status = '已到店';
    appointment.updatedAt = getNow();
  }
}

export function deleteAppointment(store: AppState, id: string): void {
  store.appointments = store.appointments.filter((a) => a.id !== id);
}

export function getFilteredAppointments(store: AppState): Appointment[] {
  return store.appointments.filter((a) => {
    const matchKeyword =
      !store.appointmentSearchKeyword ||
      a.customerName.toLowerCase().includes(store.appointmentSearchKeyword.toLowerCase());
    const matchDate = !store.appointmentFilterDate || a.appointmentDate === store.appointmentFilterDate;
    const matchFrameNo =
      !store.appointmentFilterFrameNo ||
      a.frameNo.toLowerCase().includes(store.appointmentFilterFrameNo.toLowerCase());
    const matchStatus = !store.appointmentFilterStatus || a.status === store.appointmentFilterStatus;
    return matchKeyword && matchDate && matchFrameNo && matchStatus;
  });
}

export function isFrameBooked(store: AppState, frameId: string): Appointment | undefined {
  return store.appointments.find(
    (a) => a.frameId === frameId && a.status === '预约中'
  );
}

export function syncFramesAppointmentStatus(store: AppState): void {
  const today = getToday();
  store.frames.forEach((frame) => {
    const activeApt = store.appointments.find(
      (a) => a.frameId === frame.id && a.status === '预约中'
    );
    if (activeApt) {
      if (frame.inventoryStatus !== '试戴中' && frame.inventoryStatus !== '停用') {
        frame.inventoryStatus = '已预约';
      }
      frame.appointmentInfo = {
        date: activeApt.appointmentDate,
        time: activeApt.appointmentTime,
        customerName: activeApt.customerName,
      };
    } else {
      if (frame.inventoryStatus === '已预约') {
        frame.inventoryStatus = '在库';
      }
      frame.appointmentInfo = undefined;
    }
  });
}

export interface FrameAppointmentDisplay {
  status: '无预约' | '已预约' | '今日待到店';
  label: string;
  date?: string;
  time?: string;
  customerName?: string;
}

export function getFrameAppointmentDisplay(frame: GlassesFrame): FrameAppointmentDisplay {
  if (!frame.appointmentInfo) {
    return { status: '无预约', label: '无预约' };
  }
  const today = getToday();
  const isToday = frame.appointmentInfo.date === today;
  if (isToday) {
    return {
      status: '今日待到店',
      label: `今日待到店（${frame.appointmentInfo.time}）`,
      ...frame.appointmentInfo,
    };
  }
  return {
    status: '已预约',
    label: `已预约（${frame.appointmentInfo.date} ${frame.appointmentInfo.time}）`,
    ...frame.appointmentInfo,
  };
}

export function syncAppointmentFrameIds(store: AppState): void {
  store.appointments.forEach((apt) => {
    if (!apt.frameId) {
      const matched = store.frames.find((f) => f.frameNo === apt.frameNo);
      if (matched) {
        apt.frameId = matched.id;
      }
    } else {
      const matched = store.frames.find((f) => f.id === apt.frameId);
      if (!matched) {
        const byNo = store.frames.find((f) => f.frameNo === apt.frameNo);
        if (byNo) {
          apt.frameId = byNo.id;
        }
      }
    }
  });
}

export interface FrameRepairDisplay {
  status: '无维修' | '维修中';
  label: string;
  repairNo?: string;
  repairStatus?: RepairStatus;
  expectedDate?: string;
}

export function getFrameRepairDisplay(store: AppState, frameId: string): FrameRepairDisplay {
  const activeRepair = store.repairs.find(
    (r) => r.frameId === frameId && r.status !== '已完成'
  );
  if (!activeRepair) {
    return { status: '无维修', label: '无维修' };
  }
  return {
    status: '维修中',
    label: `${activeRepair.status}（单号：${activeRepair.repairNo}）`,
    repairNo: activeRepair.repairNo,
    repairStatus: activeRepair.status,
    expectedDate: activeRepair.expectedDate,
  };
}

export function isFrameInRepair(store: AppState, frameId: string): boolean {
  return store.repairs.some((r) => r.frameId === frameId && r.status !== '已完成');
}

export function addRepairRecord(
  store: AppState,
  data: Omit<RepairRecord, 'id' | 'repairNo' | 'createdAt' | 'updatedAt' | 'status' | 'previousInventoryStatus'> & {
    status?: RepairStatus;
  }
): { success: boolean; error?: string } {
  const frame = store.frames.find((f) => f.id === data.frameId);
  if (!frame) {
    return { success: false, error: '未找到镜架信息' };
  }
  const now = getNow();
  store.repairs.push({
    ...data,
    id: generateId(),
    repairNo: generateRepairNo(),
    frameNo: frame.frameNo,
    frameName: frame.frameName,
    status: data.status || '待送修',
    previousInventoryStatus: frame.inventoryStatus,
    createdAt: now,
    updatedAt: now,
  });
  return { success: true };
}

export function updateRepairRecord(
  store: AppState,
  id: string,
  updates: Partial<Omit<RepairRecord, 'id' | 'createdAt'>>
): { success: boolean; error?: string } {
  const index = store.repairs.findIndex((r) => r.id === id);
  if (index === -1) return { success: false, error: '维修记录不存在' };
  store.repairs[index] = {
    ...store.repairs[index],
    ...updates,
    updatedAt: getNow(),
  };
  return { success: true };
}

export function updateRepairStatus(
  store: AppState,
  id: string,
  newStatus: RepairStatus,
  repairResult?: RepairResult
): { success: boolean; error?: string } {
  const repair = store.repairs.find((r) => r.id === id);
  if (!repair) return { success: false, error: '维修记录不存在' };
  repair.status = newStatus;
  repair.updatedAt = getNow();
  if (newStatus === '已完成') {
    repair.actualDate = getToday();
    if (repairResult) {
      repair.repairResult = repairResult;
      const frame = store.frames.find((f) => f.id === repair.frameId);
      if (frame) {
        if (repairResult === '已修好') {
          if (repair.previousInventoryStatus) {
            frame.inventoryStatus = repair.previousInventoryStatus;
          } else {
            frame.inventoryStatus = '在库';
          }
        } else if (repairResult === '未修好') {
          frame.inventoryStatus = '停用';
        }
      }
    }
  }
  return { success: true };
}

export function deleteRepairRecord(store: AppState, id: string): void {
  store.repairs = store.repairs.filter((r) => r.id !== id);
}

export function getFilteredRepairs(store: AppState): RepairRecord[] {
  return store.repairs.filter((r) => {
    const matchKeyword =
      !store.repairSearchKeyword ||
      r.repairNo.toLowerCase().includes(store.repairSearchKeyword.toLowerCase()) ||
      r.frameNo.toLowerCase().includes(store.repairSearchKeyword.toLowerCase()) ||
      r.frameName.toLowerCase().includes(store.repairSearchKeyword.toLowerCase());
    const matchDateFrom =
      !store.repairFilterDateFrom || r.sendDate >= store.repairFilterDateFrom;
    const matchDateTo = !store.repairFilterDateTo || r.sendDate <= store.repairFilterDateTo;
    const matchFrameNo =
      !store.repairFilterFrameNo ||
      r.frameNo.toLowerCase().includes(store.repairFilterFrameNo.toLowerCase());
    const matchStatus = !store.repairFilterStatus || r.status === store.repairFilterStatus;
    const matchHandler =
      !store.repairFilterHandler ||
      r.handler.toLowerCase().includes(store.repairFilterHandler.toLowerCase());
    return (
      matchKeyword &&
      matchDateFrom &&
      matchDateTo &&
      matchFrameNo &&
      matchStatus &&
      matchHandler
    );
  });
}

export function syncFramesRepairStatus(_store: AppState): void {
}

export function syncRepairFrameIds(store: AppState): void {
  store.repairs.forEach((repair) => {
    if (!repair.frameId) {
      const matched = store.frames.find((f) => f.frameNo === repair.frameNo);
      if (matched) {
        repair.frameId = matched.id;
      }
    } else {
      const matched = store.frames.find((f) => f.id === repair.frameId);
      if (!matched) {
        const byNo = store.frames.find((f) => f.frameNo === repair.frameNo);
        if (byNo) {
          repair.frameId = byNo.id;
        }
      }
    }
  });
}

export function addFollowUpRecord(
  store: AppState,
  data: Omit<FollowUpRecord, 'id' | 'createdAt' | 'updatedAt'>
): { success: boolean; error?: string } {
  const now = getNow();
  store.followUps.push({
    ...data,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  });
  return { success: true };
}

export function updateFollowUpRecord(
  store: AppState,
  id: string,
  updates: Partial<Omit<FollowUpRecord, 'id' | 'createdAt'>>
): { success: boolean; error?: string } {
  const index = store.followUps.findIndex((f) => f.id === id);
  if (index === -1) return { success: false, error: '回访记录不存在' };
  store.followUps[index] = {
    ...store.followUps[index],
    ...updates,
    updatedAt: getNow(),
  };
  return { success: true };
}

export function deleteFollowUpRecord(store: AppState, id: string): void {
  store.followUps = store.followUps.filter((f) => f.id !== id);
}

export function getFollowUpsBySource(
  store: AppState,
  sourceType: FollowUpSourceType,
  sourceId: string
): FollowUpRecord[] {
  return store.followUps
    .filter((f) => f.sourceType === sourceType && f.sourceId === sourceId)
    .sort((a, b) => new Date(b.followUpDate).getTime() - new Date(a.followUpDate).getTime());
}

export function getFilteredCustomers(store: AppState): CustomerSummary[] {
  const summaries = getCustomerSummaries(store);
  return summaries.filter((c) => {
    const matchKeyword =
      !store.customerSearchKeyword ||
      c.customerName.toLowerCase().includes(store.customerSearchKeyword.toLowerCase());
    const matchIntention =
      !store.customerFilterIntention || c.intentionLevel === store.customerFilterIntention;
    const matchStatus = !store.customerFilterStatus || c.followUpStatus === store.customerFilterStatus;
    const matchDateFrom =
      !store.customerFilterDateFrom ||
      (c.lastFollowUpDate && c.lastFollowUpDate >= store.customerFilterDateFrom);
    const matchDateTo =
      !store.customerFilterDateTo ||
      (c.lastFollowUpDate && c.lastFollowUpDate <= store.customerFilterDateTo);
    return matchKeyword && matchIntention && matchStatus && matchDateFrom && matchDateTo;
  });
}
