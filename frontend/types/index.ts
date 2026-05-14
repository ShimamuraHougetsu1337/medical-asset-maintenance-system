export interface Asset {
  id: string | number;
  code: string;
  name: string;
  status: 'AVAILABLE' | 'BROKEN' | 'UNDER_MAINTENANCE';
  nextMaintenanceDate?: string;
}


export interface FailureReportRequest {
  description: string;
}

export interface User {
  id?: number;
  username: string;
  role: 'ADMIN' | 'DOCTOR' | 'NURSE' | 'ENGINEER' | 'MANAGER';
}

export interface AuthResponse {
  token: string;
  username: string;
  role: 'ADMIN' | 'DOCTOR' | 'NURSE' | 'ENGINEER' | 'MANAGER';
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface ServiceLogPart {
  partName: string;
  quantity: number;
}

export interface ServiceLog {
  id: number;
  engineerUsername: string;
  resolutionDetails: string;
  usedParts: ServiceLogPart[];
  additionalLogData?: string;
  createdAt: string;
}

export interface ServiceRequest {
  id: string | number;
  asset: Asset;
  reportedBy: User;
  description: string;
  status: 'PENDING' | 'ASSIGNED' | 'COMPLETED';
  createdAt: string;
  completedAt?: string;
  logs?: ServiceLog[];
}

export interface InventoryItem {
  id: number;
  partName: string;
  quantity: number;
  minQuantity?: number;
  unitPrice?: number;
}

// Phase 5 - Dashboard types
export interface AssetStatistics {
  available: number;
  broken: number;
  underMaintenance: number;
  total: number;
}

export interface LowStockAlert {
  id: number;
  partName: string;
  quantity: number;
  threshold: number;
}

export interface DashboardStats {
  assetStats: AssetStatistics;
  lowStockAlerts: LowStockAlert[];
}
