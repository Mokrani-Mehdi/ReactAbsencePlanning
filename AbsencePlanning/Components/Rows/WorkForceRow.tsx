import React from "react";
import Cell from "../PlanningComponents/Cell";
import "../../Css/row.css";
import {
  Absences,
  Workforce,
  StoreInfo,
  AbsencePlanningCellData,
} from "../../Models/Model";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface WorkforceRowProps {
  workforce: Workforce;
  dates: Date[];
  isSelectMode: boolean;
  selectedAbsences: Absences[];
  onCellClick: (
    absence: Absences | undefined,
    date: Date,
    workforce: Workforce
  ) => void;
  onAbsenceSelect: (absence: Absences) => void; // Changed to accept Absences
  onWorkforceSelect: (workforce: Workforce, selected: boolean) => void;
  storeInfo: StoreInfo;
  OnChange: (
    selectedAbsences: string[],
    actionType: string | null,
    nextDate: string | null,
    selectedWorforceDate: AbsencePlanningCellData | null
  ) => void;
}

const WorkForceRow: React.FC<WorkforceRowProps> = ({
  workforce,
  dates,
  isSelectMode,
  selectedAbsences,
  onCellClick,
  onAbsenceSelect,
  onWorkforceSelect,
  storeInfo,
  OnChange,
}) => {
  // Add useSortable hook for drag and drop functionality
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: workforce.Id });
  const absenceOverlapsPeriod = (absenceStart: Date, absenceEnd: Date, periodStart: Date, periodEnd: Date): boolean => {
  return absenceStart <= periodEnd && absenceEnd >= periodStart;
};

const getAbsencesInDisplayedPeriod = (): Absences[] => {
  const periodStart = new Date(dates[0]);
  const periodEnd = new Date(dates[dates.length - 1]);
  periodStart.setHours(0, 0, 0, 0);
  periodEnd.setHours(0, 0, 0, 0);

  return (workforce.Absences || []).filter((absence) => {
    const start = new Date(absence.StartDate || "");
    const end = new Date(absence.EndDate || "");
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    return absenceOverlapsPeriod(start, end, periodStart, periodEnd);
  });
};
const absencesInPeriod = getAbsencesInDisplayedPeriod();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };

 
    
 const isAllSelected =
  absencesInPeriod.length > 0 &&
  absencesInPeriod.every((a) =>
    selectedAbsences.some((selected) => selected.Id === a.Id)
  );

const isSomeSelected =
  absencesInPeriod.length > 0 &&
  absencesInPeriod.some((a) =>
    selectedAbsences.some((selected) => selected.Id === a.Id)
  );


 const HandleOnChange = (absence: Absences | null, date: Date) => {
    if (!isSelectMode) {
      const selectedWorforceDate: AbsencePlanningCellData = {
        Absence: absence,
        Workforce: workforce,
        Date: date.toISOString().split("T")[0],
      };
      OnChange([], null, null, selectedWorforceDate);
    }
  };
  
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

  const isFixedDayOff = (date: Date): boolean => {
    if (!workforce.FixedDayOff || !Array.isArray(workforce.FixedDayOff)) {
      return false;
    }
    const dayName = getDayName(date);
    return workforce.FixedDayOff.includes(dayName);
  };

  const isFavoriteDayOff = (date: Date): boolean => {
    if (!workforce.FavoriteDayOff) {
      return false;
    }
    const dayName = getDayName(date);
    return workforce.FavoriteDayOff.includes(dayName);
  };

  const isStoreClosingDay = (date: Date): boolean => {
    if (!storeInfo?.ClosingDays || !Array.isArray(storeInfo.ClosingDays)) {
      return false;
    }
    const dayName = getDayName(date);
    return storeInfo.ClosingDays.includes(dayName);
  };

   const getHolidayInfo = (date: Date): { isHoliday: boolean; holidayName?: string } => {
    if (!storeInfo?.Holidays || !Array.isArray(storeInfo.Holidays)) {
      return { isHoliday: false };
    }

    const formattedDate = date.toISOString().split("T")[0];
    
    // Check if holidays are objects with Date and Name properties
    const holiday = storeInfo.Holidays.find((holiday: any) => {
      if (typeof holiday === 'object' && holiday.Date) {
        return holiday.Date === formattedDate;
      }
      // Fallback for old string format
      return holiday === formattedDate;
    });

    if (holiday) {
      return {
        isHoliday: true,
        holidayName: typeof holiday === 'object' ? holiday.Name : "Exceptional Day Off"
      };
    }

    return { isHoliday: false };
  };
  const isHoliday = (date: Date): boolean => {
    if (!storeInfo?.Holidays || !Array.isArray(storeInfo.Holidays)) {
      return false;
    }

    const formattedDate = date.toISOString().split("T")[0];
    return storeInfo.Holidays.map(e => e.Date).includes(formattedDate);
  };

  const isWithinContractPeriod = (date: Date): boolean => {
    if (!workforce.StartContract && !workforce.EndContract) {
      return true;
    }

    const currentDate = new Date(date);
    currentDate.setHours(0, 0, 0, 0);

    if (workforce.StartContract) {
      const startContract = new Date(workforce.StartContract);
      startContract.setHours(0, 0, 0, 0);

      if (currentDate < startContract) {
        return false;
      }
    }

    if (workforce.EndContract) {
      const endContract = new Date(workforce.EndContract);
      endContract.setHours(0, 0, 0, 0);

      if (currentDate > endContract) {
        return false;
      }
    }

    return true;
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    // Stop propagation to prevent drag listeners from interfering
    e.stopPropagation();
  };

  return (
    <div 
      className="PA-gridRow" 
      ref={setNodeRef} 
      style={style}
      {...attributes}
    >
      <div key={workforce.Id} className="PA-firstColumn">
        {isSelectMode && (
          <span onClick={handleCheckboxClick}>
            <input
              type="checkbox"
              className="PA-checkboxAbsence"
              checked={isAllSelected}
              ref={(el) => {
                if (el) {
                  el.indeterminate = isSomeSelected && !isAllSelected;
                }
              }}
              onChange={(e) => onWorkforceSelect(workforce, e.target.checked)}
            />
          </span>
        )}
        <span {...listeners} style={{ cursor: 'grab', marginLeft: '5px', fontWeight: workforce?.IsManager ? "bold" : "normal", }}>
          {workforce.Name}
        </span>
      </div>

      {dates.map((date, index) => {
        const currentDate = new Date(date);
        currentDate.setHours(0, 0, 0, 0);

        const applicableAbsences =
          workforce?.Absences?.filter((absence) => {
            const startDate = new Date(absence.StartDate || "");
            const endDate = new Date(absence.EndDate || "");

            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(0, 0, 0, 0);

            return currentDate >= startDate && currentDate <= endDate;
          }) || [];

        const primaryAbsence =
          applicableAbsences.length > 0 ? applicableAbsences[0] : null;

        const isFixedOff = isFixedDayOff(date);
        const isFavoriteOff = isFavoriteDayOff(date);
        const isClosingDay = isStoreClosingDay(date);
        const HolidayInfo = getHolidayInfo(date);
        const isContractActive = isWithinContractPeriod(date);

        const hasMultipleAbsences = applicableAbsences.length > 1;
        const hasAbsenceWithFixedOff =
          applicableAbsences.length > 0 && isFixedOff;
        const hasAbsenceWithFavoriteOff =
          applicableAbsences.length > 0 && isFavoriteOff;
        const hasAbsenceOnClosingDay =
          applicableAbsences.length > 0 && isClosingDay;
        const hasAbsenceOnHoliday =
          applicableAbsences.length > 0 && HolidayInfo.isHoliday;

        const hasOverlap =
          hasMultipleAbsences ||
          hasAbsenceWithFixedOff ||
          hasAbsenceWithFavoriteOff ||
          hasAbsenceOnClosingDay ||
          hasAbsenceOnHoliday;

        return (
          <span
            key={index}
            onClick={() => HandleOnChange(primaryAbsence, date)}
          >
            <Cell
              workforceName={workforce.Name}
              absence={primaryAbsence}
              absences={
                applicableAbsences.length > 0 ? applicableAbsences : undefined
              }
              isSelectMode={isSelectMode}
              isSelected={
                primaryAbsence ? 
                  selectedAbsences.some(a => a.Id === primaryAbsence.Id) : 
                  false
              }
               onSelect={
                primaryAbsence
                  ? () => onAbsenceSelect(primaryAbsence)
                  : undefined
              }
              isFixedDayOff={isFixedOff}
              isFavoriteDayOff={isFavoriteOff}
              isStoreClosingDay={isClosingDay}
              HolidayInfo={HolidayInfo}
              isWithinContractPeriod={isContractActive}
              hasOverlap={hasOverlap}
            />
          </span>
        );
      })}
    </div>
  );
};

export default WorkForceRow;