export type InventoryStatus = '在库' | '试戴中' | '待上架' | '停用';

export type TryOnStatus = '空闲' | '试戴中';

export interface GlassesFrame {
  id: string;
  frameNo: string;
  frameName: string;
  frameType: string;
  brandSeries: string;
  location: string;
  tryOnStatus: TryOnStatus;
  inventoryStatus: InventoryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TryOnRecord {
  id: string;
  frameId: string;
  frameNo: string;
  frameName: string;
  customerName: string;
  tryOnDate: string;
  returnDate?: string;
  handler: string;
  remark?: string;
  status: '进行中' | '已归还';
  createdAt: string;
}

export const FRAME_TYPES = [
  '全框',
  '半框',
  '无框',
  '商务款',
  '时尚款',
  '运动款',
  '儿童款',
  '太阳镜',
];

export const INVENTORY_STATUS_LIST: InventoryStatus[] = [
  '在库',
  '试戴中',
  '待上架',
  '停用',
];

export const TRY_ON_STATUS_LIST: TryOnStatus[] = ['空闲', '试戴中'];

export const INVENTORY_STATUS_COLORS: Record<InventoryStatus, string> = {
  在库: 'bg-green-100 text-green-800',
  试戴中: 'bg-blue-100 text-blue-800',
  待上架: 'bg-yellow-100 text-yellow-800',
  停用: 'bg-gray-100 text-gray-800',
};

export const TRY_ON_STATUS_COLORS: Record<TryOnStatus, string> = {
  空闲: 'bg-green-100 text-green-800',
  试戴中: 'bg-blue-100 text-blue-800',
};
