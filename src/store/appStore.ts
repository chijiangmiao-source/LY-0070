import {
  createContextId,
  useContext,
  useContextProvider,
  useStore,
  useVisibleTask$,
} from '@builder.io/qwik';
import type { GlassesFrame, TryOnRecord } from '~/types';
import {
  generateId,
  getNow,
  loadFrames,
  loadRecords,
  saveFrames,
  saveRecords,
} from '~/utils/storage';

export interface AppState {
  frames: GlassesFrame[];
  records: TryOnRecord[];
  searchKeyword: string;
  filterType: string;
  filterInventory: string;
  activeTab: 'frames' | 'records' | 'stats';
  editingFrame: GlassesFrame | null;
  showFrameModal: boolean;
  showTryOnModal: boolean;
  showReturnModal: boolean;
  selectedFrameId: string | null;
  selectedRecordId: string | null;
}

export const AppContext = createContextId<AppState>('app-context');

export function useAppStore(): AppState {
  return useContext(AppContext);
}

export function createAppStore(): AppState {
  const store = useStore<AppState>({
    frames: [],
    records: [],
    searchKeyword: '',
    filterType: '',
    filterInventory: '',
    activeTab: 'frames',
    editingFrame: null,
    showFrameModal: false,
    showTryOnModal: false,
    showReturnModal: false,
    selectedFrameId: null,
    selectedRecordId: null,
  });

  useVisibleTask$(() => {
    store.frames = loadFrames();
    store.records = loadRecords();
  });

  useVisibleTask$(({ track }) => {
    track(() => store.frames);
    if (store.frames.length > 0) {
      saveFrames(store.frames);
    }
  });

  useVisibleTask$(({ track }) => {
    track(() => store.records);
    if (store.records.length > 0) {
      saveRecords(store.records);
    }
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

export function getStats(store: AppState) {
  const total = store.frames.length;
  const inStock = store.frames.filter((f) => f.inventoryStatus === '在库').length;
  const inTryOn = store.frames.filter((f) => f.inventoryStatus === '试戴中').length;
  const pending = store.frames.filter((f) => f.inventoryStatus === '待上架').length;
  const disabled = store.frames.filter((f) => f.inventoryStatus === '停用').length;
  const totalRecords = store.records.length;
  const activeRecords = store.records.filter((r) => r.status === '进行中').length;
  return {
    total,
    inStock,
    inTryOn,
    pending,
    disabled,
    totalRecords,
    activeRecords,
  };
}
