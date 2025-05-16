import React, { memo, useCallback } from "react";
import "../../Css/LegendPopUp.css";
import { AbsenceCategory, ABSENCE_CATEGORY_COLORS } from "../../Models/Model";

interface LegendPopUpProps {
  onClose: () => void;
}

const AbsenceCategorySection = memo(() => (
  <>
    <div className="PA-section-title">Absence Category</div>
    <div className="PA-departments-grid">
      {Object.values(AbsenceCategory).map((category) => (
        <div className="PA-department-item" key={category}>
          <span
            className="PA-circle"
            style={{ backgroundColor: ABSENCE_CATEGORY_COLORS[category] }}
          ></span>
          <span className="PA-category-label">{category}</span>
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
      <div className="PA-popup-overlay" onClick={onClose}>
        <div className="PA-popup-container" onClick={handleContainerClick}>
          <div className="PA-popup-header">
            <h3>Time Off Information</h3>
            <button className="PA-close-button" onClick={onClose}>
              &times;
            </button>
          </div>
          <div className="PA-popup-content">
            <AbsenceCategorySection  />
            
          </div>
        </div>
      </div>
    );
  }
);

export default LegendPopUp;
