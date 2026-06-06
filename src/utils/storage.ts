import type { GlassesFrame, TryOnRecord } from '~/types';

const FRAMES_KEY = 'glasses_frames';
const RECORDS_KEY = 'try_on_records';

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

export function loadFrames(): GlassesFrame[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(FRAMES_KEY);
    return data ? JSON.parse(data) : getDefaultFrames();
  } catch {
    return getDefaultFrames();
  }
}

export function saveFrames(frames: GlassesFrame[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(FRAMES_KEY, JSON.stringify(frames));
}

export function loadRecords(): TryOnRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(RECORDS_KEY);
    return data ? JSON.parse(data) : getDefaultRecords();
  } catch {
    return getDefaultRecords();
  }
}

export function saveRecords(records: TryOnRecord[]): void {
  if (typeof window === 'undefined') return;
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
