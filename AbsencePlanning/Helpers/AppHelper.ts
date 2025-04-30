import { Workforce } from "../Models/Model";
/* eslint-disable */


export const getDatesInRange = (startDate: string, endDate: string): Date[] => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates: Date[] = [];
  
    const currentDate = new Date(start);
    while (currentDate <= end) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
  
    return dates;
  };
  
  
  export const calculateAbsenceCounts = (personList: Workforce[] | null, absenceReason: string, datesInRange : Date[]) => {
    const counts = new Array(datesInRange.length).fill(0);
    if (!personList) return counts;
  
    datesInRange.forEach((date, index) => {
      const dateString = date;
      
      personList.forEach(person => {
        const absenceOnDate = person.Absences?.find(
          s => 
            new Date(s.StartDate || "") >= date && new Date(s.EndDate || "") <= date &&
            s.Name === absenceReason
        );
        
        if (absenceOnDate) {
          counts[index] += 1;
        }
      });
    });
  
    return counts;
  };

  export const getWorkForceName = (id: number | null | undefined, workforceData : Workforce[]) => {
    if (!id || !workforceData) return "";
    const workforce = workforceData.filter((e) => e.Id === id)[0];
    return workforce?.Name || "";
  };


  export const getDayName = (date: Date): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };