import {
  createContextId,
  useContext,
  useContextProvider,
  useStore,
  useVisibleTask$,
} from '@builder.io/qwik';
import type { Appointment, GlassesFrame, TryOnRecord } from '~/types';
import {
  generateId,
  getNow,
  getToday,
  loadAppointments,
  loadFrames,
  loadRecords,
  saveAppointments,
  saveFrames,
  saveRecords,
} from '~/utils/storage';

export interface AppState {
  frames: GlassesFrame[];
  records: TryOnRecord[];
  appointments: Appointment[];
  searchKeyword: string;
  filterType: string;
  filterInventory: string;
  activeTab: 'frames' | 'records' | 'stats' | 'appointments';
  editingFrame: GlassesFrame | null;
  showFrameModal: boolean;
  showTryOnModal: boolean;
  showReturnModal: boolean;
  showAppointmentModal: boolean;
  selectedFrameId: string | null;
  selectedRecordId: string | null;
  selectedAppointmentId: string | null;
  pendingTryOnAfterEdit: boolean;
  editingAppointment: Appointment | null;
  appointmentSearchKeyword: string;
  appointmentFilterDate: string;
  appointmentFilterFrameNo: string;
  appointmentFilterStatus: string;
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
    searchKeyword: '',
    filterType: '',
    filterInventory: '',
    activeTab: 'frames',
    editingFrame: null,
    showFrameModal: false,
    showTryOnModal: false,
    showReturnModal: false,
    showAppointmentModal: false,
    selectedFrameId: null,
    selectedRecordId: null,
    selectedAppointmentId: null,
    pendingTryOnAfterEdit: false,
    editingAppointment: null,
    appointmentSearchKeyword: '',
    appointmentFilterDate: '',
    appointmentFilterFrameNo: '',
    appointmentFilterStatus: '',
  });

  useVisibleTask$(() => {
    store.frames = loadFrames();
    store.records = loadRecords();
    store.appointments = loadAppointments();
    syncAppointmentFrameIds(store);
    syncFramesAppointmentStatus(store);
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
