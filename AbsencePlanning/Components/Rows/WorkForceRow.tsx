import React from "react";
import Cell from "../Cell";
import '../../Css/row.css'
import { Absences, Workforce, StoreInfo } from "../../Models/Model";
/* eslint-disable */

interface WorkforceRowProps {
  workforce: Workforce;
  dates: Date[];
  isSelectMode: boolean;
  selectedAbsences: Set<string>;
  onCellClick: (absence: Absences | undefined, date: Date, workforce: Workforce) => void;
  onAbsenceSelect: (absenceId: string) => void;
  onWorkforceSelect: (workforce: Workforce, selected: boolean) => void;
  storeInfo: StoreInfo;
}

const WorkForceRow: React.FC<WorkforceRowProps> = ({ 
  workforce, 
  dates,
  isSelectMode,
  selectedAbsences,
  onCellClick,
  onAbsenceSelect,
  onWorkforceSelect,
  storeInfo
}) => {
  const isAllSelected = (workforce?.Absences?.length >0  && workforce.Absences?.every(a => selectedAbsences.has(a.Id))) ?? false;
  const isSomeSelected = (workforce?.Absences?.length >0 && workforce.Absences?.some(a => selectedAbsences.has(a.Id))) ?? false;
  
  const getDayName = (date: Date): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
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
    
    const formattedDate = date.toISOString().split('T')[0];
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
    <div className="gridRow">
      <div key={workforce.Id} className="firstColumn">
        {isSelectMode && (
          <input 
            type="checkbox" 
            className="checkboxAbsence"
            checked={isAllSelected}
            ref={el => {
              if (el) {
                el.indeterminate = isSomeSelected && !isAllSelected;
              }
            }}
            onChange={(e) => onWorkforceSelect(workforce, e.target.checked)}
          />
        )}
        {workforce.Name}
      </div>

      {dates.map((date, index) => {
        const currentDate = new Date(date);
        currentDate.setHours(0, 0, 0, 0);
        
        const applicableAbsences = workforce?.Absences?.filter((absence) => {
          const startDate = new Date(absence.StartDate || "");
          const endDate = new Date(absence.EndDate || "");
          
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(0, 0, 0, 0);
          
          return currentDate >= startDate && currentDate <= endDate;
        }) || [];
        
        const primaryAbsence = applicableAbsences.length > 0 ? applicableAbsences[0] : undefined;
        
        const isFixedOff = isFixedDayOff(date);
        const isFavoriteOff = isFavoriteDayOff(date);
        const isClosingDay = isStoreClosingDay(date);
        const isHolidayDate = isHoliday(date);
        const isContractActive = isWithinContractPeriod(date);

     
        
        const hasMultipleAbsences = applicableAbsences.length > 1;
        const hasAbsenceWithFixedOff = applicableAbsences.length > 0 && isFixedOff;
        const hasAbsenceWithFavoriteOff = applicableAbsences.length > 0 && isFavoriteOff;
        const hasAbsenceOnClosingDay = applicableAbsences.length > 0 && isClosingDay;
        const hasAbsenceOnHoliday = applicableAbsences.length > 0 && isHolidayDate;
        
        const hasOverlap = hasMultipleAbsences || hasAbsenceWithFixedOff || 
                           hasAbsenceWithFavoriteOff || hasAbsenceOnClosingDay || 
                           hasAbsenceOnHoliday;

        return (
          <span key={index} onClick={() => onCellClick(primaryAbsence, date, workforce)}>
            <Cell 
              workforceName={workforce.Name}
              absence={primaryAbsence}
              absences={applicableAbsences.length > 0 ? applicableAbsences : undefined}
              isSelectMode={isSelectMode}
              isSelected={primaryAbsence ? selectedAbsences.has(primaryAbsence.Id) : false}
              onSelect={primaryAbsence ? () => onAbsenceSelect(primaryAbsence.Id) : undefined}
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

/* eslint-enabled */
