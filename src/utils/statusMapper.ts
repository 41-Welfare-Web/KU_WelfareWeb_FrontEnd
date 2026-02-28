// API 상태 타입
export type ApiRentalStatus = 'reserved' | 'rented' | 'returned' | 'overdue' | 'canceled' | 'defective';
export type ApiPlotterStatus = 'PENDING' | 'CONFIRMED' | 'PRINTING' | 'PRINTED' | 'COMPLETED' | 'REJECTED';

// UI 상태 타입
export type UiRentalStatus = 'reserved' | 'renting' | 'returned' | 'defective' | 'canceled';
export type UiPlotterStatus = 'waiting' | 'confirmed' | 'printing' | 'completed' | 'rejected';

/**
 * API의 대여 상태를 UI 상태로 매핑
 */
export function mapRentalStatus(apiStatus: string): UiRentalStatus {
  const statusMap: Record<string, UiRentalStatus> = {
    'reserved': 'reserved',
    'rented': 'renting',
    'returned': 'returned',
    'overdue': 'defective', // 연체를 불량 반납으로 매핑
    'defective': 'defective',
    'canceled': 'canceled',
  };
  return statusMap[apiStatus.toLowerCase()] || 'reserved';
}

/**
 * API의 플로터 상태를 UI 상태로 매핑
 */
export function mapPlotterStatus(apiStatus: string): UiPlotterStatus {
  const statusMap: Record<string, UiPlotterStatus> = {
    'PENDING': 'waiting',
    'CONFIRMED': 'confirmed',
    'PRINTING': 'printing',
    'PRINTED': 'printing',
    'COMPLETED': 'completed',
    'REJECTED': 'rejected',
  };
  return statusMap[apiStatus] || 'waiting';
}

/**
 * UI의 대여 상태를 API 상태로 역매핑
 */
export function mapUiToApiRentalStatus(uiStatus: UiRentalStatus): string {
  const statusMap: Record<UiRentalStatus, string> = {
    'reserved': 'RESERVED',
    'renting': 'RENTED',
    'returned': 'RETURNED',
    'defective': 'DEFECTIVE',
    'canceled': 'CANCELED',
  };
  return statusMap[uiStatus] || 'RESERVED';
}

/**
 * UI의 플로터 상태를 API 상태로 역매핑
 */
export function mapUiToApiPlotterStatus(uiStatus: UiPlotterStatus): string {
  const statusMap: Record<UiPlotterStatus, string> = {
    'waiting': 'PENDING',
    'confirmed': 'CONFIRMED',
    'printing': 'PRINTED',
    'completed': 'COMPLETED',
    'rejected': 'REJECTED',
  };
  return statusMap[uiStatus] || 'PENDING';
}
