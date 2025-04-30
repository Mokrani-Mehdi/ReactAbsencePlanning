import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { calculateAbsenceCounts } from "../../Helpers/AppHelper";
import '../../Css/row.css'
import { Workforce } from "../../Models/Model";
/* eslint-disable */

interface AbsenceRowProps {
  expandedSections: any;
  toggleSection: (section: "absence") => void;
  AbsenceGroup: Record<string, Workforce[]>;
  datesInRange: Date[];
  cellWidth: number;
}

// Define interface for the AdaptiveTooltip component props
interface AdaptiveTooltipProps {
  count: number;
  date: Date;
  reason?: string | null;
  className?: string;
}

const AbsenceRow: React.FC<AbsenceRowProps> = ({
  expandedSections,
  toggleSection,
  AbsenceGroup,
  datesInRange,
  cellWidth
  
}) => {
  // Function to get all staff with absences on a specific date and reason
  const getStaffWithAbsences = (date: Date, reason?: string | null): string[] => {
    let staffList: string[] = [];
    
    if (reason) {
      // For a specific absence reason
      const personList = AbsenceGroup[reason];
      personList.forEach(person => {
        const hasAbsenceOnDate = person.Absences?.some(
          s => 
            new Date(s.StartDate || "") >= date && new Date(s.EndDate || "") <= date  &&
            s.Name === reason
        );

        if (hasAbsenceOnDate) {
          staffList.push(person.Name);
        }
      });
    } else {
      // For total absences (all reasons)
      Object.keys(AbsenceGroup).forEach(reason => {
        if (reason !== "No Absence") {
          const personList = AbsenceGroup[reason];
          personList.forEach(person => {
            const hasAbsenceOnDate = person.Absences?.some(
              s => 
                new Date(s.StartDate || "") >= date && new Date(s.EndDate || "") <= date  &&
                s.Name === reason
            );

            if (hasAbsenceOnDate && !staffList.includes(person.Name)) {
              staffList.push(`${person.Name}`);
            }
          });
        }
      });
    }
    
    return staffList;
  };

  // Component for the adaptive tooltip
  const AdaptiveTooltip: React.FC<AdaptiveTooltipProps> = ({ 
    count, 
    date, 
    reason = null, 
    className = "" 
  }) => {
    const [tooltipPosition, setTooltipPosition] = useState<"above" | "below">("above");
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
        setTooltipPosition(bottomSpace > topSpace ? "below" : "above");
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
    
    // Get staff list for tooltip
    const staffWithAbsences = reason 
      ? getStaffWithAbsences(date, reason)
      : getStaffWithAbsences(date);
    
    return (
      <div
        ref={cellRef}
        className={`dataCellHeader adaptive-tooltip ${className} ${
          date.toLocaleDateString("en-US", { weekday: "long" }) === "Sunday"
            ? "divider-header"
            : ""
        }`}
        style={{ width: `${cellWidth}px`, position: "relative" }}
      >
        {count}
        {count > 0 && (
          <div className={`tooltip-content ${tooltipPosition}`}>
            <strong>
              {reason ? `${reason} le ` : "Absences le "}
              {date.toLocaleDateString("fr-FR")}
            </strong>
            <br />
            {staffWithAbsences.length > 0 ? (
              staffWithAbsences.map((staff, i) => (
                <span key={i} className="staff-item">{staff}<br /></span>
              ))
            ) : (
              <span>Aucun personnel</span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="gridRow absence-summary AssignedRow">
        <div
          className="firstColumnHeader"
          style={{ fontWeight: "bold", cursor: "pointer" }}
          onClick={() => toggleSection("absence")}
        >
          Total absences par motif {' '}
          <FontAwesomeIcon className="icone"
            icon={expandedSections.absence ? faChevronUp : faChevronDown} 
            size="sm"
          />
        </div>
        {datesInRange.map((date, index) => {
          let totalAbsences = 0;
          Object.keys(AbsenceGroup).forEach((reason) => {
            if (reason !== "No Absence") {
              const personList = AbsenceGroup[reason];
              personList.forEach((person) => {
                const hasAbsenceOnDate = person.Absences?.some(
                  (s) =>
                    new Date(s.StartDate || "") >= date && new Date(s.EndDate || "") <= date &&
                    s.Name === reason
                );

                if (hasAbsenceOnDate) {
                  totalAbsences += 1;
                }
              });
            }
          });

          return (
            <AdaptiveTooltip 
              key={index}
              count={totalAbsences}
              date={date}
              className="total-absence"
            />
          );
        })}
      </div>

      {expandedSections.absence &&
        Object.entries(AbsenceGroup).map(([reason, persons]) => {
          if (reason === "No Absence") return null;

          const absenceCounts = calculateAbsenceCounts(persons, reason, datesInRange);
          return (
            <div
              key={`absence-${reason}`}
              className="gridRow absence-detail"
            >
              <div className="firstColumnHeader" style={{ paddingLeft: "20px" }}>
                {reason}
              </div>
              {absenceCounts.map((count, index) => (
                <AdaptiveTooltip 
                  key={index}
                  count={count}
                  date={datesInRange[index]}
                  reason={reason}
                />
              ))}
            </div>
          );
        })}
    </>
  );
};

export default AbsenceRow;