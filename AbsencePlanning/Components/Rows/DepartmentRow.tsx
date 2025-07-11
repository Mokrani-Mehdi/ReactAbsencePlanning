import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";

import '../../Css/row.css'
import { Workforce } from "../../Models/Model";
/* eslint-disable */

interface DepartmentRowProps {
  expandedSections: any;
  toggleSection: (section: "department") => void;
  departmentGroups: Record<string, Workforce[]>;
  datesInRange: Date[];
  cellWidth: number;
  totalAssignedCounts: number[];
}

// Define interface for the AdaptiveTooltip component props
interface AdaptiveTooltipProps {
  count: number;
  date: Date;
  staffList: string[];
  department?: string | null;
  className?: string;
}

const DepartmentRow: React.FC<DepartmentRowProps> = ({
  expandedSections,
  toggleSection,
  departmentGroups,
  datesInRange,
  cellWidth,
  totalAssignedCounts
}) => {
  // Function to get all assigned staff on a specific date
  const getAssignedStaff = (date: Date, departmentName?: string | null): string[] => {
    let staffList: string[] = [];
    
    if (departmentName) {
      // For a specific department
      const personList = departmentGroups[departmentName];
      personList.forEach(person => {
        const isAssignedOnDate = person.Absences?.some(
          s => {const compareDate = new Date(date);
            compareDate.setHours(0,0,0,0);
            
            const compareStart = new Date(s.StartDate);
            compareStart.setHours(0,0,0,0);
            
            const compareEnd = new Date(s.EndDate);
            compareEnd.setHours(0,0,0,0);
            
            return compareDate >= compareStart && compareDate <= compareEnd;}
            
        );

        if (isAssignedOnDate) {
          staffList.push(person.Name);
        }
      });
    } else {
      // For total assigned (all departments)
      Object.entries(departmentGroups).forEach(([dept, personList]) => {
        personList.forEach(person => {
          const isAssignedOnDate = person.Absences?.some(
            s => 
            {const compareDate = new Date(date);
                compareDate.setHours(0,0,0,0);
                
                const compareStart = new Date(s.StartDate);
                compareStart.setHours(0,0,0,0);
                
                const compareEnd = new Date(s.EndDate);
                compareEnd.setHours(0,0,0,0);
                
                return compareDate >= compareStart && compareDate <= compareEnd;}
          );

          if (isAssignedOnDate && !staffList.includes(person.Name)) {
            staffList.push(person.Name);
          }
        });
      });
    }
    
    return staffList;
  };

  // Component for the adaptive tooltip
  const AdaptiveTooltip: React.FC<AdaptiveTooltipProps> = ({ 
    count, 
    date, 
    staffList,
    department = null, 
    className = "" 
  }) => {
    const [tooltipPosition, setTooltipPosition] = useState<"PA-above" | "PA-below">("PA-above");
    const cellRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
      const checkPosition = () => {
        if (!cellRef.current) return;
        
        const rect = cellRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const topSpace = rect.top;
        const bottomSpace = viewportHeight - rect.bottom;
        
        // If there's more space at the bottom than at the top, position tooltip below
        // Otherwise, position it above (default)
        setTooltipPosition(bottomSpace > topSpace ? "PA-below" : "PA-above");
      };
      
      checkPosition();
      
      // Recalculate on resize
      window.addEventListener('resize', checkPosition);
      window.addEventListener('scroll', checkPosition);
      
      return () => {
        window.removeEventListener('resize', checkPosition);
        window.removeEventListener('scroll', checkPosition);
      };
    }, []);
    
    return (
      <div
        ref={cellRef}
        className={`PA-dataCellHeader PA-adaptive-tooltip ${className} ${
          date.toLocaleDateString("en-US", { weekday: "long" }) === "Sunday"
            ? "divider-header"
            : ""
        }`}
        style={{ width: `${cellWidth}px`, position: "relative" }}
      >
        {count}
        {count > 0 && (
          <div className={`PA-tooltip-content ${tooltipPosition}`}>
            <strong>
              {department ? `${department} on ` : "Staff assigned on "}
              {date.toLocaleDateString("fr-FR")}
            </strong>
            <br />
            {staffList.length > 0 ? (
              staffList.map((staff, i) => (
                <span key={i} className="staff-item">{staff}<br /></span>
              ))
            ) : (
              <span>No staff</span>
            )}
          </div>
        )}
      </div>
    );
  };

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
      <div className="PA-gridRow PA-AssignedRow" style={{ backgroundColor: "#CCE9D4" }}>
        <div
          className="PA-firstColumnHeader"
          style={{ fontWeight: "bold", cursor: "pointer" }}
          onClick={() => toggleSection("department")}
        >
          Total assigned by Division	 {' '}
          <FontAwesomeIcon className="PA-icone"
            icon={expandedSections.department ? faChevronUp : faChevronDown} 
            size="sm"
          />
        </div>
        {datesInRange.map((date, index) => {
          const staffList = getAssignedStaff(date);
          return (
            <AdaptiveTooltip
              key={index}
              count={totalAssignedCounts[index]}
              date={date}
              staffList={staffList}
              className="PA-total-assigned"
            />
          );
        })}
      </div>

      {expandedSections.department &&
        Object.entries(departmentGroups).map(([department, persons]) => {
          const departmentCounts = calculateAssignedCounts(persons);
          return (
            <div
              key={`department-${department}`}
              className="PA-gridRow SubRow"
              style={{ backgroundColor: "#f2fcf3" }}
            >
              <div className="PA-firstColumnHeader" style={{ paddingLeft: "20px" }}>
                {department}
              </div>
              {datesInRange.map((date, index) => {
                const staffList = getAssignedStaff(date, department);
                return (
                  <AdaptiveTooltip
                    key={index}
                    count={departmentCounts[index]}
                    date={date}
                    staffList={staffList}
                    department={department}
                  />
                );
              })}
            </div>
          );
        })}
    </>
  );
};

export default DepartmentRow;