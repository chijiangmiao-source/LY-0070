export type InventoryStatus = '在库' | '试戴中' | '待上架' | '停用' | '已预约';

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
  appointmentInfo?: {
    date: string;
    time: string;
    customerName: string;
  };
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
  '已预约',
];

export const TRY_ON_STATUS_LIST: TryOnStatus[] = ['空闲', '试戴中'];

export const INVENTORY_STATUS_COLORS: Record<InventoryStatus, string> = {
  在库: 'bg-green-100 text-green-800',
  试戴中: 'bg-blue-100 text-blue-800',
  待上架: 'bg-yellow-100 text-yellow-800',
  停用: 'bg-gray-100 text-gray-800',
  已预约: 'bg-orange-100 text-orange-800',
};

export const TRY_ON_STATUS_COLORS: Record<TryOnStatus, string> = {
  空闲: 'bg-green-100 text-green-800',
  试戴中: 'bg-blue-100 text-blue-800',
};

export type AppointmentStatus = '预约中' | '已到店' | '已取消';

export interface Appointment {
  id: string;
  frameId: string;
  frameNo: string;
  frameName: string;
  customerName: string;
  phone: string;
  appointmentDate: string;
  appointmentTime: string;
  handler: string;
  remark?: string;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
}

export const APPOINTMENT_STATUS_LIST: AppointmentStatus[] = ['预约中', '已到店', '已取消'];

export const APPOINTMENT_STATUS_COLORS: Record<AppointmentStatus, string> = {
  预约中: 'bg-orange-100 text-orange-800',
  已到店: 'bg-green-100 text-green-800',
  已取消: 'bg-gray-100 text-gray-800',
};
