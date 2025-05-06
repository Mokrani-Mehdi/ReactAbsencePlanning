import React, { useState, useMemo } from "react";
import "../Css/planningGrid.css";
import WorkForceRow from "./Rows/WorkForceRow";
import {
  Absences,
  AvailabilityItem,
  StoreInfo,
  Workforce,
} from "../Models/Model";
import ManagerRow from "./Rows/ManagerRow";
import { getWorkForceName } from "../Helpers/AppHelper";
import AbsenceRow from "./Rows/AbsenceRow";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateRight } from "@fortawesome/free-solid-svg-icons";
import DepartmentRow from "./Rows/DepartmentRow";
import SpacerRow from "./Rows/SpacerRow";

interface PlanningGridProps {
  workforces: Workforce[];
  datesInRange: Date[];
  cellWidth: number;
  isSelectMode: boolean;
  selectedAbsences: Set<string>;
  AvailabitlityPayload: AvailabilityItem[];
  storeInfo: StoreInfo;
  onCellClick: (
    absence: Absences | undefined,
    date: Date,
    workforce: Workforce
  ) => void;
  onAbsenceSelect: (absenceId: string) => void;
  onWorkforceSelect: (workforce: Workforce, selected: boolean) => void;
  selectAllAbsences: (selected: boolean) => void;
  onGetavailabilityCall?: () => void;
}
/* eslint-disable */

const PlanningGrid: React.FC<PlanningGridProps> = ({
  workforces,
  datesInRange,
  cellWidth,
  isSelectMode,
  selectedAbsences,
  AvailabitlityPayload,
  storeInfo,
  onCellClick,
  onAbsenceSelect,
  onWorkforceSelect,
  selectAllAbsences,
  onGetavailabilityCall,
}) => {
  const gridTemplateColumns = `350px repeat(${datesInRange.length}, ${cellWidth}px)`;

  const [expandedSections, setExpandedSections] = useState({
    role: false,
    manager: false,
    department: false,
    absence: false,
    keyHolder: false,
  });
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };
  const calculateAssignedCounts = (personList: Workforce[] | null) => {
    if (!personList) return new Array(datesInRange.length).fill(0);

    const counts = new Array(datesInRange.length).fill(0);
    personList.forEach((person) => {
      datesInRange.forEach((date, index) => {
        const hasAbsence = person.Absences?.some(
          (absence) =>
            new Date(absence.StartDate || "") <= date &&
            new Date(absence.EndDate || "") >= date
        );
        if (hasAbsence) counts[index]++;
      });
    });
    return counts;
  };

  const absenceGroups = useMemo(() => {
    const groups: Record<string, Workforce[]> = {};
    const allAbsenceReasons = new Set<string>();

    workforces.forEach((person) => {
      person.Absences?.forEach((absence) => {
        if (absence.Name) allAbsenceReasons.add(absence.Name);
      });
    });

    allAbsenceReasons.forEach((reason) => {
      groups[reason] = [];
    });
    if (allAbsenceReasons.size > 0) groups["No Absence"] = [];

    workforces.forEach((person) => {
      person.Absences?.forEach((absence) => {
        if (absence.Name && absence.StartDate && absence.EndDate) {
          if (!groups[absence.Name].some((p) => p.Id === person.Id)) {
            groups[absence.Name].push(person);
          }
        }
      });
    });

    return groups;
  }, [workforces]);

  const managerGroups = useMemo(() => {
    if (!workforces) return {};

    const groups: Record<string, Workforce[]> = {};
    const managers = workforces.filter((person) => person.IsManager);
    managers.forEach((manager) => {
      groups[manager.Name] = [];
    });
    groups["Unassigned"] = [];

    workforces.forEach((person) => {
      let assignToManager = "Unassigned";
      if (person.IsManager) {
        assignToManager = person.Name;
      } else if (person.ManagerId) {
        const managerName = getWorkForceName(person.ManagerId, workforces);
        if (managerName) assignToManager = managerName;
      }

      if (!groups[assignToManager]) groups[assignToManager] = [];
      groups[assignToManager].push(person);
    });

    // Remove empty groups
    Object.keys(groups).forEach((key) => {
      if (groups[key].length === 0) delete groups[key];
    });

    return groups;
  }, [workforces]);

  const totalAssignedCounts = useMemo(
    () => calculateAssignedCounts(workforces),
    [workforces, datesInRange]
  );

  const departmentGroups = useMemo(() => {
    const groups: Record<string, Workforce[]> = {};
    workforces.forEach((person) => {
      const department = person.Departments?.[0]?.Name || "Unassigned";
      if (!groups[department]) groups[department] = [];
      groups[department].push(person);
    });
    return groups;
  }, [workforces]);

  const calculateTotalAvailability = useMemo(() => {
    const counts = new Array(datesInRange.length).fill(0);
    if (!AvailabitlityPayload) return counts;

    datesInRange.forEach((date, index) => {
      const shiftDate = date.toISOString().split("T")[0];
      const availItem = AvailabitlityPayload.find((item) => {
        return item.date.toISOString().split("T")[0] === shiftDate;
      });
      if (availItem) counts[index] = availItem.count;
    });

    return counts;
  }, [AvailabitlityPayload, datesInRange]);

  const AvailabilityRow = () => (
    <div className="gridRow AssignedRow" style={{ backgroundColor: "#FF9C55" }}>
      <div
        className="firstColumnHeader"
        style={{ fontWeight: "bold", cursor: "pointer", color: "white" }}
        onClick={onGetavailabilityCall}
      >
        Disponibilité
        <FontAwesomeIcon className="icone" icon={faRotateRight} size="sm" />
      </div>
      {calculateTotalAvailability.map((count, index) => (
        <div
          key={index}
          className={`dataCellHeader ${
            datesInRange[index].toLocaleDateString("en-US", {
              weekday: "long",
            }) === "Sunday"
              ? "divider-header"
              : ""
          }`}
          style={{ width: `${cellWidth}px`, color: "white" }}
        >
          {count}
        </div>
      ))}
    </div>
  );

  return (
    <div className="planningGrid" style={{ gridTemplateColumns }}>
      <div className="headerInfo">
        <div className="headerCellInfo">
          {isSelectMode && (
            <input
              type="checkbox"
              className="checkboxAbsence"
              checked={
                workforces
                  .flatMap((w) => w.Absences || [])
                  .every((a) => selectedAbsences.has(a.Id)) &&
                selectedAbsences.size > 0
              }
              onChange={(e) => selectAllAbsences(e.target.checked)}
            />
          )}
          <span>Info</span>
        </div>

        {datesInRange.map((date, index) => (
          <div key={index} className="headerCell">
            <div className="headerName">
              {date
                .toLocaleDateString("fr-FR", { weekday: "long" })
                .substring(0, 3)}
            </div>
            <div className="headerDate">{date.getDate()}</div>
          </div>
        ))}
      </div>

      <AvailabilityRow />
      <AbsenceRow
        expandedSections={expandedSections}
        toggleSection={toggleSection}
        AbsenceGroup={absenceGroups}
        datesInRange={datesInRange}
        cellWidth={cellWidth}
        workforces={workforces}
      />
      <DepartmentRow
        expandedSections={expandedSections}
        toggleSection={toggleSection}
        departmentGroups={departmentGroups}
        datesInRange={datesInRange}
        cellWidth={cellWidth}
        totalAssignedCounts={totalAssignedCounts}
      />
      <ManagerRow
        expandedSections={expandedSections}
        toggleSection={toggleSection}
        managerGroups={managerGroups}
        datesInRange={datesInRange}
        cellWidth={cellWidth}
        totalAssignedCounts={totalAssignedCounts}
      />

      <SpacerRow cellWidth={cellWidth} datesInRange={datesInRange} />

      {workforces?.map((workforce) => (
        <WorkForceRow
          key={workforce.Id}
          workforce={workforce}
          dates={datesInRange}
          isSelectMode={isSelectMode}
          selectedAbsences={selectedAbsences}
          onCellClick={onCellClick}
          onAbsenceSelect={onAbsenceSelect}
          onWorkforceSelect={onWorkforceSelect}
          storeInfo={storeInfo}
        />
      ))}
    </div>
  );
};

export default PlanningGrid;
