import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { Workforce } from "../../Models/Model";
import "../../Css/row.css";

interface ManagerRowProps {
  expandedSections: any;
  toggleSection: (section: "manager") => void;
  managerGroups: Record<string, Workforce[]>;
  datesInRange: Date[];
  cellWidth: number;
  totalAssignedCounts: number[];
}

interface AdaptiveTooltipProps {
  count: number;
  date: Date;
  staffList: string[];
  manager?: string | null;
  className?: string;
}

const ManagerRow: React.FC<ManagerRowProps> = ({
  expandedSections,
  toggleSection,
  managerGroups,
  datesInRange,
  cellWidth,
  totalAssignedCounts,
}) => {
  const getAssignedStaff = (
    date: Date,
    managerName?: string | null
  ): string[] => {
    let staffList: string[] = [];

    if (managerName) {
      const personList = managerGroups[managerName];
      personList.forEach((person) => {
        const isAssigned = person.Absences?.some((s) => {
          const d = new Date(date);
          d.setHours(0, 0, 0, 0);
          const start = new Date(s.StartDate);
          const end = new Date(s.EndDate);
          start.setHours(0, 0, 0, 0);
          end.setHours(0, 0, 0, 0);
          return d >= start && d <= end;
        });

        if (isAssigned) staffList.push(person.Name);
      });
    } else {
      Object.values(managerGroups).forEach((group) => {
        group.forEach((person) => {
          const isAssigned = person.Absences?.some((s) => {
            const d = new Date(date);
            d.setHours(0, 0, 0, 0);
            const start = new Date(s.StartDate);
            const end = new Date(s.EndDate);
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);
            return d >= start && d <= end;
          });

          if (isAssigned && !staffList.includes(person.Name)) {
            staffList.push(person.Name);
          }
        });
      });
    }

    return staffList;
  };

  const AdaptiveTooltip: React.FC<AdaptiveTooltipProps> = ({
    count,
    date,
    staffList,
    manager = null,
    className = "",
  }) => {
    const [tooltipPosition, setTooltipPosition] = useState<
      "PA-above" | "PA-below"
    >("PA-above");
    const cellRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const checkPosition = () => {
        if (!cellRef.current) return;
        const rect = cellRef.current.getBoundingClientRect();
        const topSpace = rect.top;
        const bottomSpace = window.innerHeight - rect.bottom;
        setTooltipPosition(bottomSpace > topSpace ? "PA-below" : "PA-above");
      };

      checkPosition();
      window.addEventListener("resize", checkPosition);
      window.addEventListener("scroll", checkPosition);
      return () => {
        window.removeEventListener("resize", checkPosition);
        window.removeEventListener("scroll", checkPosition);
      };
    }, []);

    return (
      <div
        ref={cellRef}
        className={`PA-dataCellHeader PA-adaptive-tooltip ${className} ${
          date.toLocaleDateString("en-US", { weekday: "long" }) === "Sunday"
            ? "PA-divider-header"
            : ""
        }`}
        style={{ width: `${cellWidth}px`, position: "relative" }}
      >
        {count}
        {count > 0 && (
          <div className={`PA-tooltip-content ${tooltipPosition}`}>
            <strong>
              {manager ? `${manager} on ` : "Staff assigned on "}
              {date.toLocaleDateString("fr-FR")}
            </strong>
            <br />
            {staffList.length > 0 ? (
              staffList.map((staff, i) => (
                <span key={i} className="staff-item">
                  {staff}
                  <br />
                </span>
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
          compareDate.setHours(0, 0, 0, 0);
          const compareStart = new Date(s.StartDate);
          const compareEnd = new Date(s.EndDate);
          compareStart.setHours(0, 0, 0, 0);
          compareEnd.setHours(0, 0, 0, 0);
          return compareDate >= compareStart && compareDate <= compareEnd;
        });
        if (absence) counts[index] += 1;
      });
    });

    return counts;
  };

  return (
    <>
      <div
        className="PA-gridRow PA-AssignedRow"
        style={{ backgroundColor: "#99D4A9" }}
      >
        <div
          className="PA-firstColumnHeader"
          style={{ fontWeight: "bold", cursor: "pointer" }}
          onClick={() => toggleSection("manager")}
        >
          Total absences by manager{" "}
          <FontAwesomeIcon
            className="PA-icone"
            icon={expandedSections.manager ? faChevronUp : faChevronDown}
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

      {expandedSections.manager &&
        Object.entries(managerGroups).map(([manager, persons]) => {
          const managerCounts = calculateAssignedCounts(persons);
          return (
            <div
              key={`manager-${manager}`}
              className="PA-gridRow PA-SubRow"
              style={{ backgroundColor: "#f2fcf3" }}
            >
              <div
                className="PA-firstColumnHeader"
                style={{ paddingLeft: "20px" }}
              >
                {manager}
              </div>
              {datesInRange.map((date, index) => {
                const staffList = getAssignedStaff(date, manager);
                return (
                  <AdaptiveTooltip
                    key={index}
                    count={managerCounts[index]}
                    date={date}
                    staffList={staffList}
                    manager={manager}
                  />
                );
              })}
            </div>
          );
        })}
    </>
  );
};

export default ManagerRow;
