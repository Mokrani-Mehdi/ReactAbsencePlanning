import React, { useState,useEffect,useRef,useMemo } from "react";
import Header from "./Header";
import PlanningGrid from "./PlanningGrid";
import SubHeader from "./SubHeader";
import { getDatesInRange } from "../Helpers/AppHelper";
import { Absences, Payload, Workforce } from "../Models/Model";
import "../Css/planning.css";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
const Planning: React.FC<Payload> = ({ Data,containerWidth,  AvailabilityPayload,OnChange
}) => {

  const [localData, setLocalData] = useState(Data);
  const [FirstData, setFirstLocalData] = useState(Data);
  const [workforceData, setWorkforceData] = useState(
    Data?.Workforces?.sort((a, b) => {
      const aIsR = a.Name.startsWith("R - ");
      const bIsR = b.Name.startsWith("R - ");

      if (aIsR !== bIsR) {
        return aIsR ? 1 : -1; // R names come last
      }

      if (a.IsManager !== b.IsManager) {
        return a.IsManager ? -1 : 1;
      }

      return a.Name.localeCompare(b.Name);
    })
  );
  const [isSelectMode, setIsSelectMode] = useState<boolean>(false);
  const [selectedAbsences, setSelectedAbsences] = useState<Set<string>>(
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
  const [selectedWorkforces, setSelectedWorkforces] = useState<string[]>([]);
  const [selectedManagers, setSelectedManagers] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [cellWidth, setCellWidth] = useState(35);
  const [cellHeight, setcellHeight] = useState(35);
  const isPayloadChange = useRef(false);

  useEffect(() => {
    const currentDataStr = JSON.stringify(FirstData);
    const newDataStr = JSON.stringify(Data);

    if (currentDataStr !== newDataStr) {
      isPayloadChange.current = true;
      setLocalData(Data);
      setFirstLocalData(Data);
      setDepartementData(Data?.DepartmentSkillsLists);

      if (Data?.Workforces) {
        setWorkforceData(
          [...Data.Workforces].sort((a, b) => {
            const aIsR = a.Name.startsWith("R - ");
            const bIsR = b.Name.startsWith("R - ");

            if (aIsR !== bIsR) {
              return aIsR ? 1 : -1;
            }
            if (a.IsManager !== b.IsManager) {
              return a.IsManager ? -1 : 1;
            }
            return a.Name.localeCompare(b.Name);
          })
        );
        setManagerData(
          Data.Workforces.filter((w) => w.IsManager == true).sort((a, b) =>
            a.Name.localeCompare(b.Name)
          )
        );
        setRoleData([
          ...new Set(
            Data?.Workforces.filter(
              (workforce) => workforce.RoleDescription
            ).map((workforce) => workforce.RoleDescription)
          ),
        ]);
      }
      
    }

    console.log(workforceData);
  }, [Data]);


  const isValidData = React.useMemo(() => {
    return (
      localData?.Workforces?.length > 0 &&
      localData?.DepartmentSkillsLists?.length > 0
    );
  }, [localData]);
  const datesInRange = getDatesInRange("2025-05-26", "2025-07-06");
  const handleOnGetAvailability = () => {
    //onSave?.("GetAvailability");
  };


  const filteredWorkforces = useMemo(() => {
    if (!workforceData) return null;
    if (!isValidData) return null;

    return workforceData.filter((workforce) => {
      // const nameMatches = workforce.Name.toLowerCase().includes(
      //   searchQuery.toLowerCase()
      // );

      const departmentMatches =
        selectedDepartments.length === 0 ||
        (
          workforce.Departments?.some((dept) =>
            selectedDepartments.includes(dept.Id) ?? false
          ));

      const workforceMatch = selectedWorkforces.length === 0 || selectedWorkforces.includes(workforce.Id);

      const ManagerMatches =
        selectedManagers.length === 0 ||
        (workforce.ManagerId != null &&
          selectedManagers.includes(workforce.ManagerId)) ||
        selectedManagers.includes(workforce.Id);

      const roleMatches =
        selectedRoles.length === 0 ||
        (workforce.RoleDescription != null &&
          selectedRoles.includes(workforce.RoleDescription));

      return (
        workforceMatch && departmentMatches && ManagerMatches && roleMatches
      );
    });
  }, [
    workforceData,
    localData,
    isValidData,
    selectedDepartments,
    selectedWorkforces,
    selectedManagers,
    selectedRoles,
  ]);
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

  const toggleAbsenceSelection = (absenceId: string) => {
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
    const newSelectedAbsences = new Set<string>();

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
    <div className="planning" >
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
          OnChange = {OnChange}
        />

        <PlanningGrid
          workforces={filteredWorkforces ?? []}
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
          storeInfo = {Data.StoreInfo}
          OnChange = {OnChange}

        />
      </div>
    </div>
  );
};

export default Planning;
