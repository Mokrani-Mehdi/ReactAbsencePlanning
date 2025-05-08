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
  selectedAbsences: Set<string>;
  Workforces: Workforce[];
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
  OnChange,
}) => {
  return (
    <div className="subheader">
      <div className="Info-container">
        <div className="dateRange">
          <FontAwesomeIcon
            className="lefticone"
            icon={faChevronLeft}
            size="sm"
            //onClick={()=> onchange}
          />
          Juin - 2025
          <FontAwesomeIcon
            className="righticone"
            icon={faChevronRight}
            size="sm"
          />
        </div>
        <div className="staff">
          <Staff2Icon className="image" />
          {Workforces.length} effectifs
        </div>
        <div className="store">
          {" "}
          <StoreIcon className="image" />
          Bordeaux
        </div>
      </div>
  
      <div className="leftSide">
        <FontAwesomeIcon
          className="eventIcon"
          icon={faPaperPlane}
          onClick={() => OnChange([], "Share", null, null)}
        />

        <FontAwesomeIcon
          className="eventIcon"
          icon={faTrash}
          onClick={() => OnChange([], "Delete", null, null)}
        />
        <button onClick={toggleMode} className="select-button">
          {!isSelectMode ? "Select" : "Cancel"}
        </button>
      </div>
    </div>
  );
};

export default SubHeader;
