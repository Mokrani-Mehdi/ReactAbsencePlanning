export interface Workforce {
  Name: string;
  Id: string;
  Absences: Absences[];
  RoleDescription?: string;
  IsManager?: boolean;
  ManagerId?: string;
  FixedDayOff?: string[];
  FavoriteDayOff?: string| null;
  StartContract?: string;
  EndContract?: string;
  StateCode?: number;
  IsKeyHolder?: boolean;
  IsInternalProfile?:boolean;
  Departments: DepartmentWorkforce[];
}
export interface AvailabilityItem {
  date: Date;
  count: number;
}
export interface DepartmentWorkforce {
    Name: string;
    Id: string;
   
  }
  
export interface Skill {
  Name: string;
  SkillId: string;
}
export interface Department {
  DepartmentName: string;
  DepartmentId: string;
  HexColor: string;
  Skills: Skill[];
}
export interface Absences {
  Id: string;
  Name: string;
  Shared: boolean;
  Type?: string;
  StartDate: string;
  EndDate: string;
  Paid: boolean;
}
export interface AbsenceReasons {
  AbsenceReasonName: string;
  AbsenceReasonId: string;
}
export interface Payload {
  Data: {
    Workforces: Workforce[];
    DepartmentSkillsLists: Department[];
    StoreInfo: StoreInfo;
    AbsenceReasons?: AbsenceReasons[];
  };
  containerWidth: number;
  containerHeight: number;
  AvailabilityPayload?: AvailabilityItem[];
}
export interface StoreInfo {
  ClosingDays: string[];
  Name: string;
  Holidays: string[];
}

export enum AbsenceCategory {
  UNPAID_SHARED = "UNPAID_SHARED",
  PAID_SHARED = "PAID_SHARED",
  UNPAID_UNSHARED = "UNPAID_UNSHARED",
  PAID_UNSHARED = "PAID_UNSHARED",
}

export const ABSENCE_CATEGORY_COLORS = {
  [AbsenceCategory.UNPAID_SHARED]: "#4CAF50", // Green
  [AbsenceCategory.PAID_SHARED]: "#2196F3", // Blue
  [AbsenceCategory.UNPAID_UNSHARED]: "#F44336", // Red
  [AbsenceCategory.PAID_UNSHARED]: "#FF9800", // Orange
};


export interface IState {
    selectedAbsence: Absences[];
    actionType : string | null;
    nextDate : string | null;
}
