import React from "react";
import "../Css/cell.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWarning } from "@fortawesome/free-solid-svg-icons";
import { Absences } from "../Models/Model";

interface CellProps {
  workforceName: string;
  absence?: Absences;
  absences?: Absences[];
  isSelectMode: boolean;
  isSelected: boolean;
  onSelect?: () => void;
  isFixedDayOff?: boolean;
  isFavoriteDayOff?: boolean;
  isStoreClosingDay?: boolean;
  isHoliday?: boolean;
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
  isHoliday,
  isWithinContractPeriod = true,
  hasOverlap,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (isSelectMode && onSelect) {
      e.stopPropagation();
      onSelect();
    }
  };

  const getCellContent = () => {
 
    let buttonStyle = {};
    const buttonClass = `shift-button ${isSelected ? "selected-shift" : ""}`;
    
    if (isHoliday) {
      buttonStyle = { backgroundColor: isSelected ? "#3498db" : "#FF9999" };
    } else if (isStoreClosingDay) {
      buttonStyle = { backgroundColor: isSelected ? "#3498db" : "#FFD700" };
    } else if (!isWithinContractPeriod) {
      buttonStyle = { backgroundColor: isSelected ? "#3498db" : "#E0E0E0" };
    } else if (absences && absences.length > 0) {
      buttonStyle = { backgroundColor: isSelected ? "#3498db" : "#696969" };
    } else if (isFixedDayOff) {
      buttonStyle = { backgroundColor: isSelected ? "#3498db" : "#A9A9A9" };
    } else if (isFavoriteDayOff) {
      buttonStyle = { backgroundColor: isSelected ? "#3498db" : "#C0C0C0" };
    }

    if (Object.keys(buttonStyle).length === 0) {
      return (
        <div className="empty-shift">
          <span className="add-shift-icon" title="Add Shift"></span>
        </div>
      );
    }

    return (
      <div className="tooltip shift-container">
        <button className={buttonClass} style={buttonStyle}></button>
        <span className="tooltiptext" style={{ width: "200px", whiteSpace: "normal" }}>
          {!isWithinContractPeriod && <div>Out of Contract Period</div>}
          {isHoliday && <div>Holiday</div>}
          {isStoreClosingDay && <div>Store Closed</div>}
          
          {absences && absences.length > 0 && (
            <>
              {absences.map((abs, index) => (
                <div key={abs.Id}>
                  {abs.Name}
                </div>
              ))}
            </>
          )}
          
          {absence && !absences  && <div>{absence.Name}</div>}
          {isFixedDayOff && <div>Fixed Day Off</div>}
          {isFavoriteDayOff && <div>Preferred Day Off</div>}
        </span>
      </div>
    );
  };

  return (
    <div
      className={`cell ${isSelected ? "selected" : ""}`}
      onClick={handleClick}
    >
      <div className="cell-container">
        {getCellContent()}
        {hasOverlap && (
          <FontAwesomeIcon
            className="warning-icon"
            icon={faWarning}
            size="sm"
          />
        )}
      </div>
    </div>
  );
};

export default Cell;