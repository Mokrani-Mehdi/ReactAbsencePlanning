import React, { useState,useEffect } from "react";
import Header from "./Header";
import PlanningGrid from "./PlanningGrid";
import SubHeader from "./SubHeader";
import { getDatesInRange } from "../Helpers/AppHelper";
import { Absences, Payload, Workforce } from "../Models/Model";
import "../Css/planning.css";

const Planning: React.FC<Payload> = ({ Data,containerWidth,  AvailabilityPayload,
}) => {
  const [isSelectMode, setIsSelectMode] = useState<boolean>(true);
  const [selectedAbsences, setSelectedAbsences] = useState<Set<number>>(
    new Set()
  );
  const [roleData, setRoleData] = useState([
    ...new Set(
      Data?.Workforces?.filter((workforce) => workforce.RoleDescription).map(
        (workforce) => workforce.RoleDescription
      )
    ),
  ]);
  const [managerData, setManagerData] = useState(
    Data?.Workforces?.filter((w) => w.IsManager == true).sort((a, b) =>
      a.Name.localeCompare(b.Name)
    )
  );
  const [DepartementData, setDepartementData] = useState(
    Data?.DepartmentSkillsLists
  );
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedWorkforces, setSelectedWorkforces] = useState<number[]>([]);
  const [selectedManagers, setSelectedManagers] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [cellWidth, setCellWidth] = useState(35);
  const [cellHeight, setcellHeight] = useState(35);
  const datesInRange = getDatesInRange("2025-05-26", "2025-07-06");
  const handleOnGetAvailability = () => {
    //onSave?.("GetAvailability");
  };
  useEffect(() => {
    const calculateCellWidth = () => {
      const screenWidth = containerWidth;
      const firstColumnWidth = 350;
      const gapSize = 2;
      const padding = 16;
      const scrollbarWidth = 16;

      const availableWidth =
        screenWidth -
        firstColumnWidth -
        padding -
        scrollbarWidth -
        datesInRange.length * gapSize;

      const width = Math.max(25, availableWidth / datesInRange.length);
      const height = width > 45 ? 45 : width;
      setCellWidth(width);
      setcellHeight(height);
    };

    calculateCellWidth();
    window.addEventListener("resize", calculateCellWidth);
    return () => window.removeEventListener("resize", calculateCellWidth);
  }, [containerWidth, datesInRange.length]);
  const toggleMode = () => {
    setIsSelectMode(!isSelectMode);
    // Clear selections when changing modes
    setSelectedAbsences(new Set());
  };

  const handleCellClick = (
    absence: Absences | undefined,
    date: Date,
    workforce: Workforce
  ) => {
    if (!isSelectMode && absence) {
      // In view mode, emit the event with details
      console.log({
        absence,
        date: date.toISOString().split("T")[0],
        workforce,
      });
      alert(
        `Clicked on absence: ${absence.Name} for ${
          workforce.Name
        } on ${date.toLocaleDateString()}`
      );
    }
  };

  const toggleAbsenceSelection = (absenceId: number) => {
    const newSelectedAbsences = new Set(selectedAbsences);

    if (newSelectedAbsences.has(absenceId)) {
      newSelectedAbsences.delete(absenceId);
    } else {
      newSelectedAbsences.add(absenceId);
    }

    setSelectedAbsences(newSelectedAbsences);
  };

  const selectAllAbsencesForWorkforce = (
    workforce: Workforce,
    selected: boolean
  ) => {
    const newSelectedAbsences = new Set(selectedAbsences);

    workforce.Absences?.forEach((absence) => {
      if (selected) {
        newSelectedAbsences.add(absence.Id);
      } else {
        newSelectedAbsences.delete(absence.Id);
      }
    });

    setSelectedAbsences(newSelectedAbsences);
  };

  const selectAllAbsences = (selected: boolean) => {
    const newSelectedAbsences = new Set<number>();

    if (selected) {
      Data.Workforces.forEach((workforce) => {
        workforce.Absences?.forEach((absence) => {
          newSelectedAbsences.add(absence.Id);
        });
      });
    }

    setSelectedAbsences(newSelectedAbsences);
  };

  return (
    <div className="planning" style={{ backgroundColor: "#F5F5F5" }}>
      <Header
        workforces={Data.Workforces}
        selectedWorkforces={selectedWorkforces}
        setSelectedWorkforces={setSelectedWorkforces}
        managerData={managerData}
        departmentData={DepartementData}
        roleData={roleData}
        selectedManagers={selectedManagers}
        setSelectedManagers={setSelectedManagers}
        selectedDepartments={selectedDepartments}
        setSelectedDepartments={setSelectedDepartments}
        selectedRoles={selectedRoles}
        setSelectedRoles={setSelectedRoles}
      />

      <div className="PlanningGridcontainer">
        <SubHeader
          toggleMode={toggleMode}
          isSelectMode={isSelectMode}
          selectedAbsences={selectedAbsences}
          
          Workforces={Data?.Workforces}
        />

        <PlanningGrid
          workforces={Data.Workforces}
          datesInRange={datesInRange}
          cellWidth={cellWidth}
          isSelectMode={isSelectMode}
          selectedAbsences={selectedAbsences}
          onCellClick={handleCellClick}
          onAbsenceSelect={toggleAbsenceSelection}
          onWorkforceSelect={selectAllAbsencesForWorkforce}
          selectAllAbsences={selectAllAbsences}
          AvailabitlityPayload={AvailabilityPayload ?? []}
          onGetavailabilityCall={handleOnGetAvailability}

        />
      </div>
    </div>
  );
};

export default Planning;
