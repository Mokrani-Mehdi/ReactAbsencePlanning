import React from "react";
import "../Css/cell.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWarning } from "@fortawesome/free-solid-svg-icons";
// Add this CSS to your cell.css file
/*
.warning-icon:hover .tooltiptext {
  visibility: visible;
  opacity: 1;
}

.cell-container {
  position: relative;
}
*/
import { Absences } from "../Models/Model";

interface CellProps {
  workforceName: string;
  absence?: Absences;
  absences?: Absences[]; // New prop for multiple absences
  isSelectMode: boolean;
  isSelected: boolean;
  onSelect?: () => void;
  isFixedDayOff?: boolean;
  isFavoriteDayOff?: boolean;
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
  hasOverlap,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (isSelectMode && onSelect) {
      e.stopPropagation();
      onSelect();
    }
  };

  // Determine what to display in the cell
  const getCellContent = () => {
    // If we have multiple absences
    if (absences && absences.length > 0) {
      return (
        <div className="tooltip shift-container">
          <button
            className={`shift-button ${isSelected ? "selected-shift" : ""}`}
            style={{
              backgroundColor: isSelected ? "#3498db" : "#696969",
              position: "relative",
            }}
          >
            {/* {absences.length > 1 ? `${absences.length}` : "A"} */}
          </button>
          <span
            className="tooltiptext"
            style={{ width: "200px", whiteSpace: "normal" }}
          >
            {absences.map((abs, index) => (
              <div key={abs.Id}>
                {index + 1}. {abs.Name} ({abs.Type})
              </div>
            ))}

            {isFixedDayOff ? (
              <div>
                Fixed Day Off
              </div>
            ) : (
              ""
            )}
            {isFavoriteDayOff ? (
              <div>
                Preferred Day Off
              </div>
            ) : (
              ""
            )}
          </span>
        </div>
      );
    } else if (absence) {
      return (
        <div className="tooltip shift-container">
          <button
            className={`shift-button ${isSelected ? "selected-shift" : ""}`}
            style={{
              backgroundColor: isSelected ? "#3498db" : "#696969",
            }}
          ></button>
          <span className="tooltiptext">{absence.Name}</span>
        </div>
      );
    } else if (isFixedDayOff) {
      return (
        <div className="tooltip shift-container">
          <button
            className="shift-button"
            style={{ backgroundColor: "#A9A9A9" }}
          ></button>
          <span className="tooltiptext">Fixed Day Off</span>
        </div>
      );
    } else if (isFavoriteDayOff) {
      return (
        <div className="tooltip shift-container">
          <button
            className="shift-button"
            style={{ backgroundColor: "#C0C0C0" }}
          ></button>
          <span className="tooltiptext">Preferred Day Off</span>
        </div>
      );
    } else {
      return (
        <div className="empty-shift">
          <span className="add-shift-icon" title="Add Shift"></span>
        </div>
      );
    }
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
