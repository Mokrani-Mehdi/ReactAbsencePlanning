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
  OnChange : (selectedAbsences : Absences[], actionType: string | null,nextDate : string | null,selectedWorforceDate :  AbsencePlanningCellData|null ) =>  void;
}
export interface StoreInfo {
  ClosingDays: string[];
  Name: string;
  Holidays: string[];
  FirstDayOfMonth : string;
}

export interface AbsencePlanningCellData
{
    Workforce : Workforce;
    Absence: Absences| null;
    Date:string;
}
export enum AbsenceCategory {
  UNPAID_SHARED = "UNPAID_SHARED",
  PAID_SHARED = "PAID_SHARED",
  UNPAID_UNSHARED = "UNPAID_UNSHARED",
  PAID_UNSHARED = "PAID_UNSHARED",
  REPOS_OFF = "REPOS_OFF",
  OUT_OF_CONTRACT = "OUT_OF_CONTRACT"
}

export const ABSENCE_CATEGORY_COLORS = {
  [AbsenceCategory.UNPAID_SHARED]: "#8884d8",
  [AbsenceCategory.PAID_SHARED]: "#82ca9d",
  [AbsenceCategory.UNPAID_UNSHARED]: "#ffc658",
  [AbsenceCategory.PAID_UNSHARED]: "#ff8042",
  [AbsenceCategory.REPOS_OFF]: "#b3b3cc",
  [AbsenceCategory.OUT_OF_CONTRACT]: "#cccccc"
};


export interface IState {
    selectedAbsences: Absences[];
    actionType : string | null;
    nextDate : string | null;
    selectedWorforceDate : AbsencePlanningCellData|null;
}
