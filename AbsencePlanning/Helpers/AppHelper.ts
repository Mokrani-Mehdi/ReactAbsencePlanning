import {
  AbsenceCategory,
  Absences,
  StoreInfo,
  Workforce,
} from "../Models/Model";
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

// Helper function to get day name

export const getWorkForceName = (
  id: string | null | undefined,
  workforceData: Workforce[]
) => {
  if (!id || !workforceData) return "";
  const workforce = workforceData.filter((e) => e.Id === id)[0];
  return workforce?.Name || "";
};

export const getDayName = (date: Date): string => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
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
    [AbsenceCategory.PAID_UNSHARED]: [],
    [AbsenceCategory.REPOS_OFF]: [],
    [AbsenceCategory.OUT_OF_CONTRACT]: [],
    [AbsenceCategory.CLOSING_DAYS]: [],
  };

  // First, add each workforce to all categories they might belong to
  workforces.forEach((workforce) => {
    // For the standard absence categories, we need to check absences
    const absenceCategories = new Set<AbsenceCategory>();
    workforce.Absences?.forEach((absence) => {
      absenceCategories.add(getAbsenceCategory(absence));
    });

    // Add workforce to each absence category it belongs to
    absenceCategories.forEach((category) => {
      groups[category].push(workforce);
    });

    // For REPOS_OFF and OUT_OF_CONTRACT, we'll add everyone as potential candidates
    // The actual filtering by date will happen when calculating counts
    groups[AbsenceCategory.REPOS_OFF].push(workforce);
    groups[AbsenceCategory.OUT_OF_CONTRACT].push(workforce);
    groups[AbsenceCategory.CLOSING_DAYS].push(workforce);

  });

  return groups;
};

// Helper function to determine if a date is outside the contract period
export const isOutOfContract = (workforce: Workforce, date: Date): boolean => {
  if (!workforce.StartContract && !workforce.EndContract) {
    return false; // Always in contract if no dates specified
  }

  const currentDate = new Date(date);
  currentDate.setHours(0, 0, 0, 0);

  if (workforce.StartContract) {
    const startContract = new Date(workforce.StartContract);
    startContract.setHours(0, 0, 0, 0);

    if (currentDate < startContract) {
      return true; // Date is before contract starts
    }
  }

  if (workforce.EndContract) {
    const endContract = new Date(workforce.EndContract);
    endContract.setHours(0, 0, 0, 0);

    if (currentDate > endContract) {
      return true; // Date is after contract ends
    }
  }

  return false;
};
export const isDayOff = (
  workforce: Workforce,
  date: Date,
  storeInfo: StoreInfo
): boolean => {
  const getDayName = (date: Date): string => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[date.getDay()];
  };

  const dayName = getDayName(date);

  // Check if it's a fixed day off for the workforce
  if (
    workforce.FixedDayOff &&
    Array.isArray(workforce.FixedDayOff) &&
    workforce.FixedDayOff.includes(dayName)
  ) {
    return true;
  }

  // Check if it's a favorite day off for the workforce
  if (workforce.FavoriteDayOff && workforce.FavoriteDayOff.includes(dayName)) {
    return true;
  }

  // Check if it's a store closing day
  if (
    storeInfo?.ClosingDays &&
    Array.isArray(storeInfo.ClosingDays) &&
    storeInfo.ClosingDays.includes(dayName)
  ) {
    return true;
  }

  // Check if it's a holiday
  if (storeInfo?.Holidays && Array.isArray(storeInfo.Holidays)) {
    const formattedDate = date.toISOString().split("T")[0];
    if (storeInfo.Holidays.includes(formattedDate)) {
      return true;
    }
  }

  return false;
};

export const isClosingDays = (storeInfo: StoreInfo, date: Date): boolean => {
  const dayName = getDayName(date);

  // Check if it's a store closing day
  if (
    storeInfo?.ClosingDays &&
    Array.isArray(storeInfo.ClosingDays) &&
    storeInfo.ClosingDays.includes(dayName)
  ) {
    return true;
  }

  // Check if it's a holiday
  if (storeInfo?.Holidays && Array.isArray(storeInfo.Holidays)) {
    const formattedDate = date.toISOString().split("T")[0];
    if (storeInfo.Holidays.includes(formattedDate)) {
      return true;
    }
  }

  return false;
};
export const calculateAbsenceCounts = (
  personList: Workforce[],
  category: AbsenceCategory,
  datesInRange: Date[],
  storeInfo?: StoreInfo
): number[] => {
  const counts = new Array(datesInRange.length).fill(0);

  if (!personList) return counts;

  datesInRange.forEach((date, index) => {
    personList.forEach((person) => {
      // Handle standard absence categories
      if (
        category !== AbsenceCategory.REPOS_OFF &&
        category !== AbsenceCategory.OUT_OF_CONTRACT &&
        category !== AbsenceCategory.CLOSING_DAYS
      ) {
        const hasAbsenceOfCategory = person.Absences?.some(
          (absence) =>
            new Date(absence.StartDate || "") <= date &&
            new Date(absence.EndDate || "") >= date &&
            getAbsenceCategory(absence) === category
        );

        if (hasAbsenceOfCategory) {
          counts[index]++;
        }
      }
      // Handle REPOS_OFF category
      else if (category === AbsenceCategory.REPOS_OFF && storeInfo) {
        if (
          isDayOff(person, date, storeInfo) &&
          !isOutOfContract(person, date)
        ) {
          counts[index]++;
        }
      }
      // Handle OUT_OF_CONTRACT category
      else if (category === AbsenceCategory.OUT_OF_CONTRACT) {
        if (isOutOfContract(person, date)) {
          counts[index]++;
        }
      } else if (category === AbsenceCategory.CLOSING_DAYS && storeInfo) {
        if (isClosingDays(storeInfo, date) && !isOutOfContract(person, date)) {
          counts[index]++;
        }
      }
    });
  });

  return counts;
};

export const getCategoryDisplayName = (category: AbsenceCategory): string => {
  switch (category) {
    case AbsenceCategory.UNPAID_SHARED:
      return "Unpaid shared leave";
    case AbsenceCategory.PAID_SHARED:
      return "Paid shared leave";
    case AbsenceCategory.UNPAID_UNSHARED:
      return "Unpaid unshared leave";
    case AbsenceCategory.PAID_UNSHARED:
      return "Paid unshared leave";
    case AbsenceCategory.REPOS_OFF:
      return "Rest/Day off";
    case AbsenceCategory.OUT_OF_CONTRACT:
      return "Out of contract";
    case AbsenceCategory.CLOSING_DAYS:
      return "Closing Shop Day";
  }
};
export const isAbsenceInDateRange = (
  absence: Absences,
  datesInRange: Date[]
): boolean => {
  if (!absence.StartDate || !absence.EndDate || datesInRange.length === 0) {
    return false;
  }

  const absenceStart = new Date(absence.StartDate);
  const absenceEnd = new Date(absence.EndDate);
  const rangeStart = new Date(datesInRange[0]);
  const rangeEnd = new Date(datesInRange[datesInRange.length - 1]);

  // Set time to start of day for accurate date comparison
  absenceStart.setHours(0, 0, 0, 0);
  absenceEnd.setHours(0, 0, 0, 0);
  rangeStart.setHours(0, 0, 0, 0);
  rangeEnd.setHours(0, 0, 0, 0);

  // Check if absence start date OR end date is within the date range
  const startDateInRange =
    absenceStart >= rangeStart && absenceStart <= rangeEnd;
  const endDateInRange = absenceEnd >= rangeStart && absenceEnd <= rangeEnd;

  return startDateInRange || endDateInRange;
};
