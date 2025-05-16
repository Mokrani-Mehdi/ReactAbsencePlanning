import React, { useState, useEffect, useRef, useMemo } from "react";
import Header from "./PlanningComponents/Header";
import PlanningGrid from "./PlanningComponents/PlanningGrid";
import SubHeader from "./SubHeader";
import { getDatesInRange } from "../Helpers/AppHelper";
import { Absences, Payload, Workforce } from "../Models/Model";
import "../Css/planning.css";


const LazyPopup = React.lazy(() => import("./PlanningComponents/LegendPopUp"));

const Planning: React.FC<Payload> = ({
  Data,
  containerWidth,
  containerHeight,
  AvailabilityPayload,
  OnChange,
}) => {
  // Set default values for empty Data
  const safeData = useMemo(() => {
    return {
      Workforces: Data?.Workforces || [],
      DepartmentSkillsLists: Data?.DepartmentSkillsLists || [],
      StoreInfo: Data?.StoreInfo || { FirstDayOfMonth: new Date().toISOString() }
    };
  }, [Data]);

  const [localData, setLocalData] = useState(safeData);
  const [FirstData, setFirstLocalData] = useState(safeData);
  
  // Initialize with empty arrays if Data is empty
  const [workforceData, setWorkforceData] = useState(
    safeData.Workforces?.sort((a, b) => {
      const aIsR = a.Name?.startsWith("R - ");
      const bIsR = b.Name?.startsWith("R - ");

      if (aIsR !== bIsR) {
        return aIsR ? 1 : -1; // R names come last
      }

      if (a.IsManager !== b.IsManager) {
        return a.IsManager ? -1 : 1;
      }

      return a.Name?.localeCompare(b.Name || "") || 0;
    }) || []
  );
  
  const [isSelectMode, setIsSelectMode] = useState<boolean>(false);
  const [selectedAbsences, setSelectedAbsences] = useState<Absences[]>(
    []
  );
  
  // Initialize with empty arrays for roles
  const [roleData, setRoleData] = useState(() => {
    if (!safeData.Workforces || safeData.Workforces.length === 0) return [];
    
    return [...new Set(
      safeData.Workforces
        .filter((workforce) => workforce.RoleDescription)
        .map((workforce) => workforce.RoleDescription)
    )];
  });
  
  // Initialize with empty arrays for managers
  const [managerData, setManagerData] = useState(() => {
    if (!safeData.Workforces || safeData.Workforces.length === 0) return [];
    
    return safeData.Workforces
      .filter((w) => w.IsManager === true)
      .sort((a, b) => a.Name?.localeCompare(b.Name || "") || 0);
  });
  
  const [DepartementData, setDepartementData] = useState(safeData.DepartmentSkillsLists || []);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedWorkforces, setSelectedWorkforces] = useState<string[]>([]);
  const [selectedManagers, setSelectedManagers] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [cellWidth, setCellWidth] = useState(35);
  const [cellHeight, setcellHeight] = useState(35);
  const isPayloadChange = useRef(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const currentDataStr = JSON.stringify(FirstData);
    const newDataStr = JSON.stringify(Data);

    if (currentDataStr !== newDataStr) {
      isPayloadChange.current = true;
      
      // Create a safe version of Data with fallbacks
      const safeData = {
        Workforces: Data?.Workforces || [],
        DepartmentSkillsLists: Data?.DepartmentSkillsLists || [],
        StoreInfo: Data?.StoreInfo || { FirstDayOfMonth: new Date().toISOString() }
      };
      
      setLocalData(safeData);
      setFirstLocalData(safeData);
      setDepartementData(safeData.DepartmentSkillsLists);

      if (safeData.Workforces && safeData.Workforces.length > 0) {
        setWorkforceData(
          [...safeData.Workforces].sort((a, b) => {
            const aIsR = a.Name?.startsWith("R - ");
            const bIsR = b.Name?.startsWith("R - ");

            if (aIsR !== bIsR) {
              return aIsR ? 1 : -1;
            }
            if (a.IsManager !== b.IsManager) {
              return a.IsManager ? -1 : 1;
            }
            return a.Name?.localeCompare(b.Name || "") || 0;
          })
        );
        
        setManagerData(
          safeData.Workforces
            .filter((w) => w.IsManager === true)
            .sort((a, b) => a.Name?.localeCompare(b.Name || "") || 0)
        );
        
        setRoleData([
          ...new Set(
            safeData.Workforces
              .filter((workforce) => workforce.RoleDescription)
              .map((workforce) => workforce.RoleDescription)
          ),
        ]);
      } else {
        // Set empty arrays when no data is available
        setWorkforceData([]);
        setManagerData([]);
        setRoleData([]);
      }
    }

    console.log(workforceData);
  }, [Data]);

  const isValidData = React.useMemo(() => {
    return (
      (localData?.Workforces?.length > 0 &&
      localData?.DepartmentSkillsLists?.length > 0)
    );
  }, [localData]);
  
  // Use a stable date range even when data is missing
  const datesInRange = getDatesInRange("2025-05-26", "2025-07-06");
  
  const handleOnGetAvailability = () => {
    //onSave?.("GetAvailability");
  };
  
  const handleSetPopUpLegend = () => {
    setShowModal(true);
  };

  const filteredWorkforces = useMemo(() => {
    if (!workforceData) return [];
    if (!isValidData) return [];

    return workforceData.filter((workforce) => {
      const departmentMatches =
        selectedDepartments.length === 0 ||
        workforce.Departments?.some(
          (dept) => selectedDepartments.includes(dept.Id) ?? false
        );

      const workforceMatch =
        selectedWorkforces.length === 0 ||
        selectedWorkforces.includes(workforce.Id);

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
    setSelectedAbsences([]);
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

  const toggleAbsenceSelection = (absenceToToggle: Absences) => {
    setSelectedAbsences((prevSelected) => {
      // Check if the absence is already selected by comparing IDs
      const isAlreadySelected = prevSelected.some(
        (absence) => absence.Id === absenceToToggle.Id
      );
      
      if (isAlreadySelected) {
        // Remove the absence if already selected
        return prevSelected.filter((absence) => absence.Id !== absenceToToggle.Id);
      } else {
        // Add the absence if not already selected
        return [...prevSelected, absenceToToggle];
      }
    });
  };

   const selectAllAbsencesForWorkforce = (
    workforce: Workforce,
    selected: boolean
  ) => {
    if (selected) {
      // Add all absences from this workforce that aren't already selected
      setSelectedAbsences((prevSelected) => {
        const currentSelectedIds = new Set(prevSelected.map(a => a.Id));
        const newAbsences = workforce.Absences?.filter(
          (absence) => !currentSelectedIds.has(absence.Id)
        ) || [];
        
        return [...prevSelected, ...newAbsences];
      });
    } else {
      // Remove all absences from this workforce
      setSelectedAbsences((prevSelected) => {
        const workforceAbsenceIds = new Set(
          workforce.Absences?.map((absence) => absence.Id) || []
        );
        
        return prevSelected.filter(
          (absence) => !workforceAbsenceIds.has(absence.Id)
        );
      });
    }
  };

  const selectAllAbsences = (selected: boolean) => {
    if (selected && safeData.Workforces) {
      // Collect all unique absences across all workforces
      const allAbsences: Absences[] = [];
      const addedIds = new Set<string>();
      
      safeData.Workforces.forEach((workforce) => {
        workforce.Absences?.forEach((absence) => {
          if (!addedIds.has(absence.Id)) {
            allAbsences.push(absence);
            addedIds.add(absence.Id);
          }
        });
      });
      
      setSelectedAbsences(allAbsences);
    } else {
      // Clear all selections
      setSelectedAbsences([]);
    }
  };
  // Ensure we always pass arrays even when data is empty
  const safeWorkforces = safeData.Workforces || [];
  const safeDepartmentData = safeData.DepartmentSkillsLists || [];
  const safeRoleData = roleData || [];
  const safeManagerData = managerData || [];
  
  return (
    <div className="planning" style={{
      width: containerWidth,
      overflowX: cellWidth > 25 ? "hidden" : "auto",
      maxHeight: containerHeight - 10,
    }}>
      {showModal && (
        <React.Suspense fallback={<div>Loading...</div>}>
          <LazyPopup
            onClose={() => setShowModal(false)}
           
          />
        </React.Suspense>
      )}
      <Header
        workforces={safeWorkforces}
        selectedWorkforces={selectedWorkforces}
        setSelectedWorkforces={setSelectedWorkforces}
        managerData={safeManagerData}
        departmentData={safeDepartmentData}
        roleData={safeRoleData}
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
          Workforces={safeWorkforces}
          currentDate={safeData.StoreInfo?.FirstDayOfMonth || new Date().toISOString()}
          storeName={safeData.StoreInfo?.Name || ""}
          OnChange={OnChange}
        />

        {isValidData ? (
          <PlanningGrid
            workforces={filteredWorkforces}
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
            storeInfo={safeData.StoreInfo || { FirstDayOfMonth: new Date().toISOString() }}
            OnChange={OnChange}
            SetLegendPopUp={handleSetPopUpLegend}
          />
        ) : (
          <div className="empty-planning-message">
            No planning data available. Please add workforces and departments.
          </div>
        )}
      </div>
    </div>
  );
};

export default Planning;