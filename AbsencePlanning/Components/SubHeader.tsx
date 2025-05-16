import React from "react";
import { AbsencePlanningCellData, Absences, Workforce } from "../Models/Model";
import "../Css/subheader.css";
import { Staff2Icon, StoreIcon } from "../Assets/Icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faCircleChevronRight,
  faPaperPlane,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
interface SubHeaderPops {
  toggleMode: () => void;
  isSelectMode: boolean;
  selectedAbsences: Absences[];
  Workforces: Workforce[];
  currentDate : string;
  storeName : string;
  OnChange: (
    selectedAbsences: Absences[],
    actionType: string | null,
    nextDate: string | null,
    selectedWorforceDate: AbsencePlanningCellData | null
  ) => void;
}

const SubHeader: React.FC<SubHeaderPops> = ({
  toggleMode,
  isSelectMode,
  selectedAbsences,
  Workforces,
  currentDate,
  storeName,
  OnChange,
}) => {
 
  const HandleDateChange = (isNextMonth : boolean) : void=>{

    const currentdate = new Date(currentDate);
    const nextdate = new Date(currentdate.setMonth(currentdate.getMonth() + (isNextMonth ? 1 : -1)));

    OnChange([],null,nextdate.toISOString().split('T')[0],null)
  }

    const handleShareClick = (): void => {
    if (selectedAbsences.length === 0) {
      alert("Please select at least one absence to share");
      return;
    }
    OnChange(selectedAbsences, "Share", null, null);
  };

  // Handler for delete button click
  const handleDeleteClick = (): void => {
    if (selectedAbsences.length === 0) {
      alert("Please select at least one absence to delete");
      return;
    }
    
    // Optional: Add confirmation dialog
    if (window.confirm(`Are you sure you want to delete ${selectedAbsences.length} selected absence(s)?`)) {
      OnChange(selectedAbsences, "Delete", null, null);
    }
  };
  return (
    <div className="subheader">
      <div className="Info-container">
        <div className="dateRange">
          <FontAwesomeIcon
            className="lefticone"
            icon={faChevronLeft}
            size="sm"
            onClick={()=> HandleDateChange(false)}
          />
          {new Date(currentDate).toLocaleDateString("fr-FR", { month: "long" })} {new Date(currentDate).toLocaleDateString("fr-FR", { year: "numeric" })} 
          <FontAwesomeIcon
            className="righticone"
            icon={faChevronRight}
            size="sm"
            onClick={()=> HandleDateChange(true)}
          />
        </div>
        <div className="staff">
          <Staff2Icon className="image" />
          {Workforces.length} effectifs
        </div>
        <div className="store">
          {" "}
          <StoreIcon className="image" />
          {storeName}
        </div>
      </div>
  
      <div className="leftSide">
        <FontAwesomeIcon
          className="eventIcon"
          icon={faPaperPlane}
          style={{
            color: selectedAbsences.length > 0 ? "#74C0FC" : "#ccc", 
            cursor: selectedAbsences.length > 0 ? "pointer" : "not-allowed"
          }}
          onClick={handleShareClick}
          title={`Share ${selectedAbsences.length} absence(s)`}
        />

        <FontAwesomeIcon
          className="eventIcon"
          icon={faTrash}
          style={{
            color: selectedAbsences.length > 0 ? "#74C0FC" : "#ccc",
            cursor: selectedAbsences.length > 0 ? "pointer" : "not-allowed"
          }}
          onClick={handleDeleteClick}
          title={`Delete ${selectedAbsences.length} absence(s)`}
        />
        <button onClick={toggleMode} className="select-button">
          {!isSelectMode ? "Select" : "Cancel " + selectedAbsences.length}
        </button>
      </div>
    </div>
  );
};

export default SubHeader;
