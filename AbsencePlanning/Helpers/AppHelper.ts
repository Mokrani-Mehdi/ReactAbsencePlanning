import { AbsenceCategory, Absences, Workforce } from "../Models/Model";
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
  
  
  export const calculateAbsenceCounts = (
    persons: Workforce[],
    category: AbsenceCategory,
    datesInRange: Date[]
): number[] => {
    const counts = new Array(datesInRange.length).fill(0);

    datesInRange.forEach((date, index) => {
        persons.forEach((person) => {
            person.Absences?.forEach((absence) => {
                if (
                    absence.StartDate &&
                    absence.EndDate &&
                    new Date(absence.StartDate) <= date &&
                    new Date(absence.EndDate) >= date &&
                    getAbsenceCategory(absence) === category
                ) {
                    counts[index]++;
                }
            });
        });
    });

    return counts;
};

  export const getWorkForceName = (id: string | null | undefined, workforceData : Workforce[]) => {
    if (!id || !workforceData) return "";
    const workforce = workforceData.filter((e) => e.Id === id)[0];
    return workforce?.Name || "";
  };


  export const getDayName = (date: Date): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };
  
export const getAbsenceCategory = (absence: Absences): AbsenceCategory => {
  if (absence.Shared && !absence.Paid) return AbsenceCategory.UNPAID_SHARED;
  if (absence.Shared && absence.Paid) return AbsenceCategory.PAID_SHARED;
  if (!absence.Shared && !absence.Paid) return AbsenceCategory.UNPAID_UNSHARED;
  return AbsenceCategory.PAID_UNSHARED;
};
export const groupWorkforcesByAbsenceCategory = (
  workforces: Workforce[]
): Record<AbsenceCategory, Workforce[]> => {
  const groups: Record<AbsenceCategory, Workforce[]> = {
      [AbsenceCategory.UNPAID_SHARED]: [],
      [AbsenceCategory.PAID_SHARED]: [],
      [AbsenceCategory.UNPAID_UNSHARED]: [],
      [AbsenceCategory.PAID_UNSHARED]: []
  };

  // First, identify all workers with absences by category
  workforces.forEach(person => {
      if (!person.Absences || person.Absences.length === 0) return;

      // Group by absence categories
      const categoriesForPerson = new Set<AbsenceCategory>();
      
      person.Absences.forEach(absence => {
          const category = getAbsenceCategory(absence);
          categoriesForPerson.add(category);
      });

      // Add person to each category they have absences in
      categoriesForPerson.forEach(category => {
          if (!groups[category].some(p => p.Id === person.Id)) {
              groups[category].push(person);
          }
      });
  });

  return groups;
};