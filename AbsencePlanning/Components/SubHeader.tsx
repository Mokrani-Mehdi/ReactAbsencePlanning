import React from "react";
import { Workforce } from "../Models/Model";
import '../Css/subheader.css'
import {
  Staff2Icon,
  StoreIcon,
} from "../Assets/Icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight, faCircleChevronRight } from "@fortawesome/free-solid-svg-icons";
interface SubHeaderPops {
  toggleMode: () => void;
  isSelectMode: boolean;
  selectedAbsences: Set<string>;

  Workforces: Workforce[];
}

const SubHeader: React.FC<SubHeaderPops> = ({
  toggleMode,
  isSelectMode,
  selectedAbsences,
  Workforces,
}) => {
  return (
    <div className="subheader">
       <div className="Info-container">
        <div className="dateRange">
          <span content="<"/>
           <FontAwesomeIcon className="lefticone"
                      icon={faChevronLeft} 
                      size="sm"
                      
                    />
          Juin - 2025
          <FontAwesomeIcon className="righticone"
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
          <StoreIcon className="image" />Bordeaux
        </div>

      
      </div>
        {/* {isSelectMode && (
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 p-2 rounded">
              <span className="font-bold">
                Selected: {selectedAbsences.size}
              </span>
            </div>
            <label className="flex items-center">
              <span>Select All Absences</span>
            </label>
          </div>
        )} */}

        <button
          onClick={toggleMode}
          className="select-button"
        >
          {!isSelectMode ? "Select" : "Cancel"}
        </button>
     
    </div>
  );
};

export default SubHeader;
