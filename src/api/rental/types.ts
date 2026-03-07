export type SortBy = "popularity" | "name" | "createdAt";
export type SortOrder = "asc" | "desc";

// 카테고리 조회
export type Category = {
  id: number;
  name: string;
};

// 물품 목록 조회
export type Item = {
  id: number;
  category: { id: number; name: string };
  categoryId: number;

  name: string;
  description: string | null;

  itemCode: string;
  rentalCount: number;

  imageUrl: string | null;

  managementType: "INDIVIDUAL" | "BULK";
  totalQuantity: number;
  currentStock: number;

  createdAt: string;
};

// 물품 상세 조회
export type ItemDetail = Item;

// 물품 목록 쿼리
export type ItemsQuery = {
  search?: string;
  categoryIds?: string;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
};

// 캘린더 가능
export type Availability = {
  date: string;
  availableQuantity: number;
  totalQuantity: number;
};

// 대여 예약 생성
export type RentalCreateItem = {
  itemId: number;
  quantity: number;
  startDate: string;
  endDate: string;
};

export type RentalCreateRequest = {
  departmentType: string;
  departmentName: string;
  items: RentalCreateItem[];
};

export type RentalStatus = "RESERVED" | "RENTED" | "RETURNED" | "CANCELED";

export type RentalUser = {
  id: string;
  name: string;
  username: string;
  password: string;
  studentId: string;
  phoneNumber: string;
  departmentType: string;
  departmentName: string;
  role: string;
  loginAttempts: number;
  lockUntil: string | null;
  deletedAt: string | null;
  createdAt: string;
};

export type RentalItemDetail = {
  id: number;
  categoryId: number;
  name: string;
  itemCode: string;
  description: string;
  rentalCount: number;
  imageUrl: string | null;
  managementType: "INDIVIDUAL" | "BULK" | string;
  totalQuantity: number;
  deletedAt: string | null;
  createdAt: string;
};

export type RentalRentalItem = {
  id: number;
  rentalId: number;
  itemId: number;
  quantity: number;
  instanceId: number | null;
  item: RentalItemDetail;
};

export type Rental = {
  id: number;
  userId: string;
  startDate: string;
  endDate: string;
  status: RentalStatus;
  memo: string | null;
  deletedAt: string | null;
  createdAt: string;
  user: RentalUser;
  rentalItems: RentalRentalItem[];
};

export type RentalCreateResponse = {
  rentals: Rental[];
};

// 대여 예약 상세조회 (GET /api/rentals/{id})
export type RentalHistory = {
  id: number;
  rentalId: number;
  rentalItemId: number | null;
  changedBy: string;
  oldStatus: RentalStatus | null;
  newStatus: RentalStatus;
  memo: string | null;
  changedAt: string;
  user: { name: string };
};

export type RentalDetail = {
  id: number;
  userId: string;
  startDate: string;
  endDate: string;
  departmentType: string;
  departmentName: string | null;
  status: RentalStatus;
  memo: string | null;
  deletedAt: string | null;
  createdAt: string;
  user: RentalUser;
  rentalItems: RentalRentalItem[];
  rentalHistories: RentalHistory[];
};

// 대여 예약 수정 (PUT /api/rentals/{id})
export type RentalUpsertItem = {
  itemId: number;
  quantity: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
};

export type RentalUpsertRequest = {
  departmentType: string;
  departmentName: string | null;
  items: RentalUpsertItem[];
};

export type RentalUpsertResponse = {
  rentals: Rental[];
};
