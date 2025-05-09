import React, { memo, useCallback } from "react";
import "../../Css/LegendPopUp.css";
import { AbsenceCategory, ABSENCE_CATEGORY_COLORS } from "../../Models/Model";

interface LegendPopUpProps {
  onClose: () => void;
}

const AbsenceCategorySection = memo(() => (
  <>
    <div className="section-title">Absence Category</div>
    <div className="departments-grid">
      {Object.values(AbsenceCategory).map((category) => (
        <div className="department-item" key={category}>
          <span
            className="circle"
            style={{ backgroundColor: ABSENCE_CATEGORY_COLORS[category] }}
          ></span>
          <span className="category-label">{category}</span>
        </div>
      ))}
    </div>
  </>
));


const LegendPopUp: React.FC<LegendPopUpProps> = memo(
  ({onClose}) => {
    // Memoize the event handler
    const handleContainerClick = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
    }, []);

    return (
      <div className="popup-overlay" onClick={onClose}>
        <div className="popup-container" onClick={handleContainerClick}>
          <div className="popup-header">
            <h3>Time Off Information</h3>
            <button className="close-button" onClick={onClose}>
              &times;
            </button>
          </div>
          <div className="popup-content">
            <AbsenceCategorySection  />
            
          </div>
        </div>
      </div>
    );
  }
);

export default LegendPopUp;
