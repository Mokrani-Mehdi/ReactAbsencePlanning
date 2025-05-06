import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { Workforce } from "../../Models/Model";
/* eslint-disable */
import '../../Css/row.css'

interface ManagerRowProps {
  expandedSections: any;
  toggleSection: (section: "manager") => void;
  managerGroups: Record<string, Workforce[]>;
  datesInRange: Date[];
  cellWidth: number;
  totalAssignedCounts: number[];
}
/* eslint-disable */

const ManagerRow: React.FC<ManagerRowProps> = ({
  expandedSections,
  toggleSection,
  managerGroups,
  datesInRange,
  cellWidth,
  totalAssignedCounts
}) => {
  const calculateAssignedCounts = (personList: Workforce[] | null) => {
    const counts = new Array(datesInRange.length).fill(0);
    if (!personList) return counts;

    personList.forEach((person) => {
      datesInRange.forEach((date, index) => {
        const absence = person.Absences?.find((s) => {
          
          const compareDate = new Date(date);
          compareDate.setHours(0,0,0,0);
          
          const compareStart = new Date(s.StartDate);
          compareStart.setHours(0,0,0,0);
          
          const compareEnd = new Date(s.EndDate);
          compareEnd.setHours(0,0,0,0);
          
          return compareDate >= compareStart && compareDate <= compareEnd;
        });
        if (absence ) {
          counts[index] += 1;
        }
      });
    });

    return counts;
  };

  return (
    <>
      <div className="gridRow AssignedRow" style={{ backgroundColor: "#99D4A9" }}>
        <div
          className="firstColumnHeader"
          style={{ fontWeight: "bold",  cursor: "pointer" }}
          onClick={() => toggleSection("manager")}
        >
          Total Absents par manager {' '}
          <FontAwesomeIcon className="icone"
            icon={expandedSections.manager ? faChevronUp : faChevronDown} 
            size="sm"
          />
        </div>
        {totalAssignedCounts.map((count, index) => (
          <div
            key={index}
            className={`dataCellHeader ${
              datesInRange[index].toLocaleDateString("en-US", { weekday: "long" }) === "Sunday"
                ? "divider-header"
                : ""
            }`}
            style={{ width: `${cellWidth}px` }}
          >
            {count}
          </div>
        ))}
      </div>

      {expandedSections.manager &&
        Object.entries(managerGroups).map(([manager, persons]) => {
          const managerCounts = calculateAssignedCounts(persons);
          return (
            <div
              key={`manager-${manager}`}
              className="gridRow SubRow"
              style={{ backgroundColor: "#f2fcf3" }}
            >
              <div className="firstColumnHeader" style={{ paddingLeft: "20px" }}>
                {manager}
              </div>
              {managerCounts.map((count, index) => (
                <div
                  key={index}
                  className={`dataCellHeader ${
                    datesInRange[index].toLocaleDateString("en-US", { weekday: "long" }) === "Sunday"
                      ? "divider-header"
                      : ""
                  }`}
                  style={{ width: `${cellWidth}px` }}
                >
                  {count}
                </div>
              ))}
            </div>
          );
        })}
    </>
  );
};

export default ManagerRow;