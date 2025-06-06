import React, { useState, useMemo } from "react";
import "../../Css/planningGrid.css";
import WorkForceRow from "../Rows/WorkForceRow";
import {
  AbsencePlanningCellData,
  Absences,
  AvailabilityItem,
  StoreInfo,
  Workforce,
} from "../../Models/Model";
import ManagerRow from "../Rows/ManagerRow";
import { getWorkForceName } from "../../Helpers/AppHelper";
import AbsenceRow from "../Rows/AbsenceRow";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateRight, faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import DepartmentRow from "../Rows/DepartmentRow";
import SpacerRow from "../Rows/SpacerRow";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
/* eslint-disable */

interface PlanningGridProps {
  workforces: Workforce[];
  datesInRange: Date[];
  cellWidth: number;
  firstColumnWidth: number;
  isSelectMode: boolean;
  selectedAbsences: Absences[];
  AvailabitlityPayload: AvailabilityItem[];
  storeInfo: StoreInfo;
  onCellClick: (
    absence: Absences | undefined,
    date: Date,
    workforce: Workforce
  ) => void;
  onAbsenceSelect: (absence: Absences) => void; // Changed to accept Absences
  onWorkforceSelect: (workforce: Workforce, selected: boolean) => void;
  selectAllAbsences: (selected: boolean) => void;
  onGetavailabilityCall?: () => void;
  OnChange: (
    selectedAbsences: string[],
    actionType: string | null,
    nextDate: string | null,
    selectedWorforceDate: AbsencePlanningCellData | null
  ) => void;
  SetLegendPopUp: () => void;
}

const PlanningGrid: React.FC<PlanningGridProps> = ({
  workforces,
  datesInRange,
  cellWidth,
  isSelectMode,
  firstColumnWidth,
  selectedAbsences,
  AvailabitlityPayload,
  storeInfo,
  onCellClick,
  onAbsenceSelect,
  onWorkforceSelect,
  selectAllAbsences,
  onGetavailabilityCall,
  OnChange,
  SetLegendPopUp,
}) => {
  const gridTemplateColumns = `${firstColumnWidth}px repeat(${datesInRange.length}, ${cellWidth}px)`;

  // State for workforces to enable reordering
  const [localWorkforces, setLocalWorkforces] =
    useState<Workforce[]>(workforces);

  // Update local state when workforces prop changes
  React.useEffect(() => {
    setLocalWorkforces(workforces);
  }, [workforces]);

  const [expandedSections, setExpandedSections] = useState({
    role: false,
    manager: false,
    department: false,
    absence: false,
    keyHolder: false,
  });
  const HandleSetPopUp = () => {
    SetLegendPopUp();
  };
  // Set up sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Activate on move instead of press to avoid conflict with click events
      activationConstraint: {
        distance: 5, // Minimum distance in pixels before activating
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const handleGetAvailability = (): void => {
    
    OnChange([], "GetAvailability", null, null);
  };
  // Handle drag end event for workforce reordering
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLocalWorkforces((workforces) => {
        const oldIndex = workforces.findIndex((w) => w.Id === active.id);
        const newIndex = workforces.findIndex((w) => w.Id === over.id);

        return arrayMove(workforces, oldIndex, newIndex);
      });

      // Here you could trigger a save to backend if needed
      // For example: OnChange([], "reorder", null, null);
    }
  };

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

    localWorkforces.forEach((person) => {
      person.Absences?.forEach((absence) => {
        if (absence.Name) allAbsenceReasons.add(absence.Name);
      });
    });

    allAbsenceReasons.forEach((reason) => {
      groups[reason] = [];
    });
    if (allAbsenceReasons.size > 0) groups["No Absence"] = [];

    localWorkforces.forEach((person) => {
      person.Absences?.forEach((absence) => {
        if (absence.Name && absence.StartDate && absence.EndDate) {
          if (!groups[absence.Name].some((p) => p.Id === person.Id)) {
            groups[absence.Name].push(person);
          }
        }
      });
    });

    return groups;
  }, [localWorkforces]);

  const managerGroups = useMemo(() => {
    if (!localWorkforces) return {};

    const groups: Record<string, Workforce[]> = {};
    const managers = localWorkforces.filter((person) => person.IsManager);
    managers.forEach((manager) => {
      groups[manager.Name] = [];
    });
    groups["Unassigned"] = [];

    localWorkforces.forEach((person) => {
      let assignToManager = "Unassigned";
      if (person.IsManager) {
        assignToManager = person.Name;
      } else if (person.ManagerId) {
        const managerName = getWorkForceName(person.ManagerId, localWorkforces);
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
  }, [localWorkforces]);

  const totalAssignedCounts = useMemo(
    () => calculateAssignedCounts(localWorkforces),
    [localWorkforces, datesInRange]
  );

  const departmentGroups = useMemo(() => {
    const groups: Record<string, Workforce[]> = {};
    localWorkforces.forEach((person) => {
      const department = person.Departments?.[0]?.Name || "Unassigned";
      if (!groups[department]) groups[department] = [];
      groups[department].push(person);
    });
    return groups;
  }, [localWorkforces]);

    const calculateTotalAvailability = useMemo(() => {
    const counts = new Array(datesInRange.length).fill(0);
    if (!AvailabitlityPayload) return counts;

    datesInRange.forEach((date, index) => {
      const shiftDate = date.toISOString().split("T")[0];
      const availItem = AvailabitlityPayload.find(
        (item) => item.date.toString() === shiftDate
      );
      if (availItem) counts[index] = availItem.count;
    });

    return counts;
  }, [AvailabitlityPayload, datesInRange]);

  const AvailabilityRow = () => (
    <div
      className="PA-gridRow PA-AssignedRow"
      style={{ backgroundColor: "#FF9C55" }}
    >
      <div
        className="PA-firstColumnHeader"
        style={{ fontWeight: "bold", cursor: "pointer", color: "white" }}
        onClick={handleGetAvailability}
      >
        Disponibilité
        <FontAwesomeIcon className="PA-icone" icon={faRotateRight} size="sm" />
      </div>
      {calculateTotalAvailability.map((count, index) => (
        <div
          key={index}
          className={`PA-dataCellHeader ${
            datesInRange[index].toLocaleDateString("en-US", {
              weekday: "long",
            }) === "Sunday"
              ? "PA-divider-header"
              : ""
          }`}
          style={{ width: `${cellWidth}px`, color: "white" }}
        >
          {count}
        </div>
      ))}
    </div>
  );
  const getAbsencesInDateRange = (
    workforces: Workforce[],
    datesInRange: Date[]
  ) => {
    if (!workforces || workforces.length === 0 || datesInRange.length === 0) {
      return [];
    }

    const rangeStart = new Date(datesInRange[0]);
    const rangeEnd = new Date(datesInRange[datesInRange.length - 1]);

    // Set time to start of day for accurate comparison
    rangeStart.setHours(0, 0, 0, 0);
    rangeEnd.setHours(0, 0, 0, 0);

    return workforces
      .flatMap((w) => w.Absences || [])
      .filter((absence) => {
        if (!absence.StartDate || !absence.EndDate) return false;

        const absenceStart = new Date(absence.StartDate);
        const absenceEnd = new Date(absence.EndDate);
        absenceStart.setHours(0, 0, 0, 0);
        absenceEnd.setHours(0, 0, 0, 0);

        // Check if absence start date OR end date is within the date range
        const startDateInRange =
          absenceStart >= rangeStart && absenceStart <= rangeEnd;
        const endDateInRange =
          absenceEnd >= rangeStart && absenceEnd <= rangeEnd;

        return startDateInRange || endDateInRange;
      });
  };
  const absencesInRange = useMemo(
    () => getAbsencesInDateRange(localWorkforces, datesInRange),
    [localWorkforces, datesInRange]
  );

  return (
    <div className="PA-planningGrid" style={{ gridTemplateColumns }}>
      <div className="PA-headerInfo">
        <div className="PA-headerCellInfo">
          {isSelectMode && (
            <input
              type="checkbox"
              className="PA-checkboxAbsence"
              checked={
                absencesInRange.length > 0 &&
                absencesInRange.every((absence) =>
                  selectedAbsences.some(
                    (selected) => selected.Id === absence.Id
                  )
                )
              }
              onChange={(e) => selectAllAbsences(e.target.checked)}
            />
          )}
          <div className="PA-infoPA" onClick={HandleSetPopUp}>
            {" "}
            <FontAwesomeIcon icon={faCircleInfo} style={{ color: "#ff8000" }} />
          </div>
        </div>

        {datesInRange.map((date, index) => (
          <div key={index} className="PA-headerCell">
            <div className="PA-headerName">
              {date
                .toLocaleDateString("fr-FR", { weekday: "long" })
                .substring(0, 3)}
            </div>
            <div className="PA-headerDate">{date.getDate()}</div>
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
        workforces={localWorkforces}
        storeInfo={storeInfo}
      />
      <ManagerRow
        expandedSections={expandedSections}
        toggleSection={toggleSection}
        managerGroups={managerGroups}
        datesInRange={datesInRange}
        cellWidth={cellWidth}
        totalAssignedCounts={totalAssignedCounts}
      />
      <DepartmentRow
        expandedSections={expandedSections}
        toggleSection={toggleSection}
        departmentGroups={departmentGroups}
        datesInRange={datesInRange}
        cellWidth={cellWidth}
        totalAssignedCounts={totalAssignedCounts}
      />

      <SpacerRow cellWidth={cellWidth} datesInRange={datesInRange} />

      {/* Wrap the sortable content with DndContext and SortableContext */}
      <DndContext
        //sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={localWorkforces.map((workforce) => workforce.Id)}
          strategy={verticalListSortingStrategy}
        >
          {localWorkforces?.map((workforce) => (
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
              OnChange={OnChange}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default PlanningGrid;
