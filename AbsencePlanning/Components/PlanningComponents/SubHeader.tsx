import React from "react";
import { AbsencePlanningCellData, Absences, Workforce } from "../../Models/Model";
import "../../Css/subheader.css";
import { Staff2Icon, StoreIcon } from "../../Assets/Icons";
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
  currentDate: string;
  storeName: string;
  OnChange: (
    selectedAbsences: string[],
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
  const HandleDateChange = (isNextMonth: boolean): void => {
    const currentdate = new Date(currentDate);
    const nextdate = new Date(
      currentdate.setMonth(currentdate.getMonth() + (isNextMonth ? 1 : -1))
    );

    OnChange([], null, nextdate.toISOString().split("T")[0], null);
  };

  const handleShareClick = (): void => {
    if (selectedAbsences.length === 0) {
      alert("Please select at least one absence to share");
      return;
    }
    OnChange(selectedAbsences.filter(absence => !absence.Shared).map(absence=> absence.Id), "Share", null, null);
  };

  // Handler for delete button click
  const handleDeleteClick = (): void => {
    if (selectedAbsences.length === 0) {
      alert("Please select at least one absence to delete");
      return;
    }

    // Optional: Add confirmation dialog
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedAbsences.length} selected absence(s)?`
      )
    ) {
      OnChange(selectedAbsences.map(absence=> absence.Id), "Delete", null, null);
    }
  };
  return (
    <div className="PA-subheader">
      <div className="PA-Info-container">
        <div className="PA-dateRange">
          <div   className="PA-lefticone" onClick={() => HandleDateChange(false)}>
          <FontAwesomeIcon
            className="PA-lefticone"
            icon={faChevronLeft}
            size="sm"
           
          />
          </div>
          {new Date(currentDate).toLocaleDateString("en-US", { month: "long" })}{" "}
          {new Date(currentDate).toLocaleDateString("en-US", {
            year: "numeric",
          })}<div  className="PA-righticone" onClick={() => HandleDateChange(true)}>
          <FontAwesomeIcon
            className="PA-righticone"
            icon={faChevronRight}
            size="sm"           
          />
          </div>
        </div>
        <div className="PA-store">
          {" "}
          <StoreIcon className="PA-image" />
          {storeName}
        </div>
        <div className="PA-staff">
          <Staff2Icon className="PA-image" />
          {Workforces.length} Staff Members
        </div>
        
        {!isSelectMode ? "" : <div className="PA-store">
          {" "}
         
          Absences Selected : {selectedAbsences.length}
        </div>}
        
      </div>

      <div className="PA-leftSide">
        <div onClick={handleShareClick}>
          <FontAwesomeIcon
            className="PA-eventIcon"
            icon={faPaperPlane}
            style={{
              color: selectedAbsences.filter( absence => !absence.Shared ).length > 0 ? "#FF710C" : "#ccc",
              cursor: selectedAbsences.filter( absence => !absence.Shared ).length > 0 ? "pointer" : "not-allowed",
            }}
            // onClick={handleShareClick}
            title={`Share ${selectedAbsences.filter( absence => !absence.Shared ).length} absence(s)`}
          />
        </div>

        <div onClick={handleDeleteClick}>
          <FontAwesomeIcon
            className="PA-eventIcon"
            icon={faTrash}
            style={{
              color: selectedAbsences.length > 0 ? "#FF710C" : "#ccc",
              cursor: selectedAbsences.length > 0 ? "pointer" : "not-allowed",
            }}
            //onClick={handleDeleteClick}
            title={`Delete ${selectedAbsences.length} absence(s)`}
          />
        </div>
        <button onClick={toggleMode} className={!isSelectMode ? "PA-select-button" : "PA-cancel-button "}> 
          {!isSelectMode ? "Select" : "Cancel "}
        </button>
      </div>
    </div>
  );
};

export default SubHeader;
