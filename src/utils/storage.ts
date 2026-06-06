import type {
  Appointment,
  FollowUpRecord,
  GlassesFrame,
  RepairRecord,
  TryOnRecord,
} from '~/types';

const FRAMES_KEY = 'glasses_frames';
const RECORDS_KEY = 'try_on_records';
const APPOINTMENTS_KEY = 'appointments';
const REPAIRS_KEY = 'repair_records';
const FOLLOW_UPS_KEY = 'follow_up_records';
const INITIALIZED_KEY = 'storage_initialized';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function getToday(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

export function getNow(): string {
  return new Date().toISOString();
}

function isFirstLoad(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(INITIALIZED_KEY) !== '1';
}

function markInitialized(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(INITIALIZED_KEY, '1');
}

export function loadFrames(): GlassesFrame[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(FRAMES_KEY);
    if (data) return JSON.parse(data);
    if (isFirstLoad()) return getDefaultFrames();
    return [];
  } catch {
    return isFirstLoad() ? getDefaultFrames() : [];
  }
}

export function saveFrames(frames: GlassesFrame[]): void {
  if (typeof window === 'undefined') return;
  markInitialized();
  localStorage.setItem(FRAMES_KEY, JSON.stringify(frames));
}

export function loadRecords(): TryOnRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(RECORDS_KEY);
    if (data) return JSON.parse(data);
    if (isFirstLoad()) return getDefaultRecords();
    return [];
  } catch {
    return isFirstLoad() ? getDefaultRecords() : [];
  }
}

export function saveRecords(records: TryOnRecord[]): void {
  if (typeof window === 'undefined') return;
  markInitialized();
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
}

function getDefaultFrames(): GlassesFrame[] {
  const now = getNow();
  const today = getToday();
  return [
    {
      id: generateId(),
      frameNo: 'F001',
      frameName: '经典商务全框镜架',
      frameType: '全框',
      brandSeries: '雷朋 RB系列',
      location: 'A区-01-01',
      tryOnStatus: '空闲',
      inventoryStatus: '在库',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      frameNo: 'F002',
      frameName: '时尚半框钛架',
      frameType: '半框',
      brandSeries: '精工 T系列',
      location: 'A区-02-03',
      tryOnStatus: '空闲',
      inventoryStatus: '待上架',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      frameNo: 'F003',
      frameName: '轻量无框近视镜',
      frameType: '无框',
      brandSeries: '诗乐 SP系列',
      location: 'B区-01-05',
      tryOnStatus: '试戴中',
      inventoryStatus: '试戴中',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      frameNo: 'F004',
      frameName: '复古圆框眼镜',
      frameType: '全框',
      brandSeries: 'Oliver Peoples',
      location: 'C区-03-02',
      tryOnStatus: '空闲',
      inventoryStatus: '在库',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      frameNo: 'F005',
      frameName: '儿童防蓝光镜架',
      frameType: '儿童款',
      brandSeries: 'Luki 系列',
      location: 'D区-01-01',
      tryOnStatus: '空闲',
      inventoryStatus: '停用',
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function getDefaultRecords(): TryOnRecord[] {
  const today = getToday();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  return [
    {
      id: generateId(),
      frameId: '',
      frameNo: 'F003',
      frameName: '轻量无框近视镜',
      customerName: '张三',
      tryOnDate: today,
      handler: '李经理',
      remark: '首次试戴，反馈良好',
      status: '进行中',
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      frameId: '',
      frameNo: 'F001',
      frameName: '经典商务全框镜架',
      customerName: '李四',
      tryOnDate: yesterday,
      returnDate: today,
      handler: '王顾问',
      remark: '已决定购买同款',
      status: '已归还',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];
}

export function loadAppointments(): Appointment[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(APPOINTMENTS_KEY);
    if (data) return JSON.parse(data);
    if (isFirstLoad()) return getDefaultAppointments();
    return [];
  } catch {
    return isFirstLoad() ? getDefaultAppointments() : [];
  }
}

export function saveAppointments(appointments: Appointment[]): void {
  if (typeof window === 'undefined') return;
  markInitialized();
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
}

function getDefaultAppointments(): Appointment[] {
  const frames = getDefaultFrames();
  const f001 = frames.find((f) => f.frameNo === 'F001');
  const f004 = frames.find((f) => f.frameNo === 'F004');
  const now = getNow();
  const today = getToday();
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  return [
    {
      id: generateId(),
      frameId: f001?.id || '',
      frameNo: 'F001',
      frameName: '经典商务全框镜架',
      customerName: '王五',
      phone: '13800138001',
      appointmentDate: today,
      appointmentTime: '14:30',
      handler: '李经理',
      remark: '老客户，上次试戴后想再来看看',
      status: '预约中',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      frameId: f004?.id || '',
      frameNo: 'F004',
      frameName: '复古圆框眼镜',
      customerName: '赵六',
      phone: '13900139002',
      appointmentDate: tomorrow,
      appointmentTime: '10:00',
      handler: '王顾问',
      remark: '',
      status: '预约中',
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export function loadRepairs(): RepairRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(REPAIRS_KEY);
    if (data) return JSON.parse(data);
    if (isFirstLoad()) return getDefaultRepairs();
    return [];
  } catch {
    return isFirstLoad() ? getDefaultRepairs() : [];
  }
}

export function saveRepairs(repairs: RepairRecord[]): void {
  if (typeof window === 'undefined') return;
  markInitialized();
  localStorage.setItem(REPAIRS_KEY, JSON.stringify(repairs));
}

export function generateRepairNo(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `WX${dateStr}${random}`;
}

function getDefaultRepairs(): RepairRecord[] {
  const frames = getDefaultFrames();
  const f002 = frames.find((f) => f.frameNo === 'F002');
  const f005 = frames.find((f) => f.frameNo === 'F005');
  const now = getNow();
  const today = getToday();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  return [
    {
      id: generateId(),
      repairNo: generateRepairNo(),
      frameId: f002?.id || '',
      frameNo: 'F002',
      frameName: '时尚半框钛架',
      sendDate: yesterday,
      expectedDate: nextWeek,
      repairType: '送修',
      status: '维修中',
      handler: '李经理',
      remark: '镜框断裂，需要焊接修复',
      previousInventoryStatus: '待上架',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      repairNo: generateRepairNo(),
      frameId: f005?.id || '',
      frameNo: 'F005',
      frameName: '儿童防蓝光镜架',
      sendDate: today,
      repairType: '保养',
      status: '待送修',
      handler: '王顾问',
      remark: '定期保养清洁，更换鼻托',
      previousInventoryStatus: '停用',
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export function loadFollowUps(): FollowUpRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(FOLLOW_UPS_KEY);
    if (data) return JSON.parse(data);
    if (isFirstLoad()) return getDefaultFollowUps();
    return [];
  } catch {
    return isFirstLoad() ? getDefaultFollowUps() : [];
  }
}

export function saveFollowUps(followUps: FollowUpRecord[]): void {
  if (typeof window === 'undefined') return;
  markInitialized();
  localStorage.setItem(FOLLOW_UPS_KEY, JSON.stringify(followUps));
}

function getDefaultFollowUps(): FollowUpRecord[] {
  const records = getDefaultRecords();
  const appointments = getDefaultAppointments();
  const now = getNow();
  const today = getToday();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const dayAfterTomorrow = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];

  return [
    {
      id: generateId(),
      customerName: '张三',
      sourceType: '试戴记录',
      sourceId: records[0]?.id || '',
      followUpDate: yesterday,
      followUpMethod: '电话',
      feedback: '客户对款式比较满意，但是价格偏高，需要和家人商量',
      intentionLevel: '中意向',
      isDealt: false,
      noDealReason: '',
      nextFollowUpDate: dayAfterTomorrow,
      handler: '李经理',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      customerName: '李四',
      sourceType: '试戴记录',
      sourceId: records[1]?.id || '',
      followUpDate: today,
      followUpMethod: '微信',
      feedback: '客户已确认购买同款，已经下单',
      intentionLevel: '高意向',
      isDealt: true,
      dealAmount: 1680,
      handler: '王顾问',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      customerName: '王五',
      sourceType: '预约记录',
      sourceId: appointments[0]?.id || '',
      followUpDate: today,
      followUpMethod: '到店',
      feedback: '',
      intentionLevel: '高意向',
      isDealt: false,
      nextFollowUpDate: dayAfterTomorrow,
      handler: '李经理',
      createdAt: now,
      updatedAt: now,
    },
  ];
}
