export interface Workforce {
  Name: string;
  Id: string;
  Absences: Absences[];
  RoleDescription?: string;
  IsManager?: boolean;
  ManagerId?: string;
  FixedDayOff?: string[];
  FavoriteDayOff?: string[];
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
  OnChange : (selectedAbsences : string[], actionType: string | null,nextDate : string | null,selectedWorforceDate :  AbsencePlanningCellData|null ) =>  void;
}
export interface StoreInfo {
  ClosingDays: string[];
  Name: string;
  Holidays: string[];
  FirstDayOfMonth : string;
  StartPlanning: string;
  EndPlanning: string;
}

export interface AbsencePlanningCellData
{
    Workforce : Workforce;
    Absence: Absences| null;
    Date:string;
}
export enum AbsenceCategory {
  UNPAID_SHARED = "Unpaid Shared",
  PAID_SHARED = "Paid Shared",
  UNPAID_UNSHARED = "Unpaid Unshared",
  PAID_UNSHARED = "Paid Unshared",
  REPOS_OFF = "Repos Off",
  OUT_OF_CONTRACT = "Out of Contract",
  CLOSING_DAYS="Closing Days"
}

export const ABSENCE_CATEGORY_COLORS = {
  [AbsenceCategory.UNPAID_SHARED]: "#228B22",
  [AbsenceCategory.PAID_SHARED]: "#4682B4",
  [AbsenceCategory.UNPAID_UNSHARED]: "#90EE90",
  [AbsenceCategory.PAID_UNSHARED]: "#87CEFA",
  [AbsenceCategory.REPOS_OFF]: "#D3D3D3",
  [AbsenceCategory.OUT_OF_CONTRACT]: "#808080",
  [AbsenceCategory.CLOSING_DAYS]: "#808080"

};


export interface IState {
    selectedAbsences: string[];
    actionType : string | null;
    nextDate : string | null;
    selectedWorforceDate : AbsencePlanningCellData|null;
}
