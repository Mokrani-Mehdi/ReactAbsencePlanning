// First, install the necessary dnd-kit packages:
// npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

// Modified WorkForceRow.tsx with dnd-kit integration
import React from "react";
import Cell from "../Cell";
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
  selectedAbsences: Set<string>;
  onCellClick: (
    absence: Absences | undefined,
    date: Date,
    workforce: Workforce
  ) => void;
  onAbsenceSelect: (absenceId: string) => void;
  onWorkforceSelect: (workforce: Workforce, selected: boolean) => void;
  storeInfo: StoreInfo;
  OnChange: (
    selectedAbsences: Absences[],
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
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  const isAllSelected =
    (workforce?.Absences?.length > 0 &&
      workforce.Absences?.every((a) => selectedAbsences.has(a.Id))) ??
    false;
  const isSomeSelected =
    (workforce?.Absences?.length > 0 &&
      workforce.Absences?.some((a) => selectedAbsences.has(a.Id))) ??
    false;

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

  const isHoliday = (date: Date): boolean => {
    if (!storeInfo?.Holidays || !Array.isArray(storeInfo.Holidays)) {
      return false;
    }

    const formattedDate = date.toISOString().split("T")[0];
    return storeInfo.Holidays.includes(formattedDate);
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

  return (
    <div 
      className="gridRow" 
      ref={setNodeRef} 
      style={style}
      {...attributes}
    >
      <div 
        key={workforce.Id} 
        className="firstColumn"
        {...listeners} // Add listeners to make this element the drag handle
      >
        {isSelectMode && (
          <input
            type="checkbox"
            className="checkboxAbsence"
            checked={isAllSelected}
            ref={(el) => {
              if (el) {
                el.indeterminate = isSomeSelected && !isAllSelected;
              }
            }}
            onChange={(e) => onWorkforceSelect(workforce, e.target.checked)}
          />
        )}
        <span style={{ cursor: 'grab' }}>{workforce.Name}</span>
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
        const isHolidayDate = isHoliday(date);
        const isContractActive = isWithinContractPeriod(date);

        const hasMultipleAbsences = applicableAbsences.length > 1;
        const hasAbsenceWithFixedOff =
          applicableAbsences.length > 0 && isFixedOff;
        const hasAbsenceWithFavoriteOff =
          applicableAbsences.length > 0 && isFavoriteOff;
        const hasAbsenceOnClosingDay =
          applicableAbsences.length > 0 && isClosingDay;
        const hasAbsenceOnHoliday =
          applicableAbsences.length > 0 && isHolidayDate;

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
                primaryAbsence ? selectedAbsences.has(primaryAbsence.Id) : false
              }
              onSelect={
                primaryAbsence
                  ? () => onAbsenceSelect(primaryAbsence.Id)
                  : undefined
              }
              isFixedDayOff={isFixedOff}
              isFavoriteDayOff={isFavoriteOff}
              isStoreClosingDay={isClosingDay}
              isHoliday={isHolidayDate}
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