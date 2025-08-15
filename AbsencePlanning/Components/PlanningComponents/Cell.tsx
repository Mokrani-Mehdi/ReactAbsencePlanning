import React from "react";
import "../../Css/cell.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWarning } from "@fortawesome/free-solid-svg-icons";
import { Absences, AbsenceCategory, ABSENCE_CATEGORY_COLORS, Workforce } from "../../Models/Model";
import { getAbsenceCategory, getCategoryDisplayName } from "../../Helpers/AppHelper";

interface HolidayProps{
isHoliday : boolean;
holidayName? : string;
}
interface CellProps {
  workforceName: string;
  absence?: Absences| null;
  absences?: Absences[];
  isSelectMode: boolean;
  isSelected: boolean;
  onSelect?: () => void;
  isFixedDayOff?: boolean;
  isFavoriteDayOff?: boolean;
  isStoreClosingDay?: boolean;
  HolidayInfo?: HolidayProps;
  isWithinContractPeriod?: boolean;
  hasOverlap?: boolean;
}

const Cell: React.FC<CellProps> = ({
  workforceName,
  absence,
  absences = [],
  isSelectMode,
  isSelected,
  onSelect,
  isFixedDayOff,
  isFavoriteDayOff,
  isStoreClosingDay,
  HolidayInfo,
  isWithinContractPeriod = true,
  hasOverlap,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (isSelectMode && onSelect) {
      e.stopPropagation();
      onSelect();
    }
  };

  // Get color for absence based on category
  const getAbsenceColorStyle = (absence: Absences) => {
    const category = getAbsenceCategory(absence);
    // Return background color without changing it for selection
    return { backgroundColor: ABSENCE_CATEGORY_COLORS[category] };
  };

  const getCellContent = () => {
    let buttonStyle: React.CSSProperties = {};
    // Add border for selected cells instead of changing background
    const buttonClass = `PA-shift-button ${isSelected ? "PA-selected-shift" : ""}`;

    if (HolidayInfo?.isHoliday) {
      buttonStyle = { backgroundColor: "#B0B0B0" };
    } else if (isStoreClosingDay) {
      buttonStyle = { backgroundColor: "#A0A0A0" };
    } else if (!isWithinContractPeriod) {
      buttonStyle = { backgroundColor: "#808080" };
    } else if (absences && absences.length > 0) {
      buttonStyle = getAbsenceColorStyle(absences[0]);
    } else if (absence) {
      buttonStyle = getAbsenceColorStyle(absence);
    } else if (isFixedDayOff) {
      buttonStyle = { backgroundColor: "#D3D3D3" };
    } else if (isFavoriteDayOff) {
      buttonStyle = { backgroundColor: "#D3D3D3" };
    }
    
    // Add the selection border if selected
    if (isSelected) {
      buttonStyle.border = "2px solid black";
    }

    if (Object.keys(buttonStyle).length === 0) {
      return (
        <div className="PA-empty-shift">
          <span className="PA-add-shift-icon" title="Add Shift"></span>
        </div>
      );
    }

    return (
      <div className="PA-tooltip PA-shift-container">
        <button className={buttonClass} style={buttonStyle}></button>
        <span
          className="PA-tooltiptext"
          style={{ width: "200px", whiteSpace: "normal" }}
        >
          {!isWithinContractPeriod && <div>Out of Contract Period</div>}
          {HolidayInfo?.isHoliday && <div>{HolidayInfo?.holidayName}</div>}
          {isStoreClosingDay && <div>Store Closed</div>}

          {absences && absences.length > 0 && (
            <>
              {absences.map((abs, index) => {
                const category = getAbsenceCategory(abs);
                return (
                  <div key={abs.Id}>
                    {abs.Name} 
                    {/* - {getCategoryDisplayName(category)} */}
                  </div>
                );
              })}
            </>
          )}

          {absence && !absences && (
            <div>
              {absence.Name} - {getCategoryDisplayName(getAbsenceCategory(absence))}
            </div>
          )}
          
          {isFixedDayOff && <div>Fixed Day Off</div>}
          {isFavoriteDayOff && <div>Preferred Day Off</div>}
        </span>
      </div>
    );
  };

  return (
    <div
      className={`PA-cell ${isSelected ? "PA-selected" : ""}`}
      onClick={handleClick}
    >
      <div className="PA-cell-container">
        {getCellContent()}
        {hasOverlap && (
          <FontAwesomeIcon
            className="PA-warning-icon"
            icon={faWarning}
            size="sm"
          />
        )}
      </div>
    </div>
  );
};

export default Cell;