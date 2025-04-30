export interface Workforce 
{

    Name : string;
    Id: number;
    Absences: Absences[];
    RoleDescription?: string;
    IsManager?: boolean
    ManagerId? : number;
    FixedDayOff? : string[];
    FavoriteDayOff? : string[];

}
export interface AvailabilityItem {
    date: Date;
    count: number;
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
export interface Absences 
{
    Id: number;
    Name: string;
    Shared : boolean;
    Type : string;
    StartDate: string;
    EndDate: string;
    Paid:boolean;
}
export interface Payload
{
    Data : {
        Workforces : Workforce[]
        DepartmentSkillsLists: Department[];
    },
    containerWidth: number;
    containerHeight: number;
    AvailabilityPayload?: AvailabilityItem[];
}
export interface Site 
{
    Id:number;
    Name:string;
    Holidays: Date[];
    ClosingDays: Date[];
    
}