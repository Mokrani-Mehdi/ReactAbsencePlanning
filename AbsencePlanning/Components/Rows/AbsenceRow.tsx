import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { calculateAbsenceCounts, getCategoryDisplayName,getDayName,groupWorkforcesByAbsenceCategory,getAbsenceCategory,isDayOff,isOutOfContract } from "../../Helpers/AppHelper";
import '../../Css/row.css';
import { 
  Workforce, 
  AbsenceCategory, 
  ABSENCE_CATEGORY_COLORS,
  StoreInfo
  
} from "../../Models/Model";
/* eslint-disable */

interface AbsenceRowProps {
  expandedSections: any;
  toggleSection: (section: "absence") => void;
  AbsenceGroup: Record<string, Workforce[]>;
  datesInRange: Date[];
  cellWidth: number;
  workforces: Workforce[];
  storeInfo: StoreInfo;
}

// Define interface for the AdaptiveTooltip component props
interface AdaptiveTooltipProps {
  count: number;
  date: Date;
  category?: AbsenceCategory | null;
  className?: string;
  backgroundColor?: string;
  storeInfo: StoreInfo;
}

const AbsenceRow: React.FC<AbsenceRowProps> = ({
  expandedSections,
  toggleSection,
  AbsenceGroup,
  datesInRange,
  cellWidth,
  workforces,
  storeInfo
}) => {
  // Group workforces by absence category for the view
  const absenceCategoryGroups = React.useMemo(() => 
    groupWorkforcesByAbsenceCategory(workforces),
    [workforces]
  );

  // Function to get all staff with absences on a specific date and category
  const getStaffWithAbsences = (date: Date, category?: AbsenceCategory | null): string[] => {
    let staffList: string[] = [];
    
    if (category) {
      // For a specific absence category
      const personList = absenceCategoryGroups[category];
      
      if (category !== AbsenceCategory.REPOS_OFF && category !== AbsenceCategory.OUT_OF_CONTRACT) {
        // Standard absence handling
        personList.forEach(person => {
          const hasAbsenceOnDate = person.Absences?.some(
            s => 
              new Date(s.StartDate || "") <= date && 
              new Date(s.EndDate || "") >= date &&
              getAbsenceCategory(s) === category
          );

          if (hasAbsenceOnDate) {
            staffList.push(person.Name);
          }
        });
      } 
      // Handle REPOS_OFF category
      else if (category === AbsenceCategory.REPOS_OFF) {
        personList.forEach(person => {
          if (isDayOff(person, date, storeInfo) && !isOutOfContract(person, date)) {
            const reason = [];
            
            // Add reasons why person is off
            if (person.FixedDayOff?.includes(getDayName(date))) reason.push("Jour fixe");
            if (person.FavoriteDayOff?.includes(getDayName(date))) reason.push("Jour préféré");
            if (storeInfo.ClosingDays?.includes(getDayName(date))) reason.push("Fermeture");
            if (storeInfo.Holidays?.includes(date.toISOString().split("T")[0])) reason.push("Jour férié");
            
            staffList.push(`${person.Name} (${reason.join(", ")})`);
          }
        });
      } 
      // Handle OUT_OF_CONTRACT category
      else if (category === AbsenceCategory.OUT_OF_CONTRACT) {
        personList.forEach(person => {
          if (isOutOfContract(person, date)) {
            const reason = [];
            
            if (person.StartContract && new Date(date) < new Date(person.StartContract)) {
              reason.push("Avant contrat");
            }
            
            if (person.EndContract && new Date(date) > new Date(person.EndContract)) {
              reason.push("Après contrat");
            }
            
            staffList.push(`${person.Name} (${reason.join(", ")})`);
          }
        });
      }
    } else {
      // For total absences (all categories)
      Object.values(AbsenceCategory).forEach(cat => {
        const personList = absenceCategoryGroups[cat];
        
        if (cat !== AbsenceCategory.REPOS_OFF && cat !== AbsenceCategory.OUT_OF_CONTRACT) {
          // Standard absence categories
          personList.forEach(person => {
            const hasAbsenceOnDate = person.Absences?.some(
              s => 
                new Date(s.StartDate || "") <= date && 
                new Date(s.EndDate || "") >= date &&
                getAbsenceCategory(s) === cat
            );

            if (hasAbsenceOnDate && !staffList.includes(person.Name)) {
              staffList.push(`${person.Name} (${getCategoryDisplayName(cat)})`);
            }
          });
        } 
        // REPOS_OFF category
        else if (cat === AbsenceCategory.REPOS_OFF) {
          personList.forEach(person => {
            if (isDayOff(person, date, storeInfo) && !isOutOfContract(person, date) && !staffList.includes(person.Name)) {
              staffList.push(`${person.Name} (${getCategoryDisplayName(cat)})`);
            }
          });
        } 
        // OUT_OF_CONTRACT category
        else if (cat === AbsenceCategory.OUT_OF_CONTRACT) {
          personList.forEach(person => {
            if (isOutOfContract(person, date) && !staffList.includes(person.Name)) {
              staffList.push(`${person.Name} (${getCategoryDisplayName(cat)})`);
            }
          });
        }
      });
    }
    
    return staffList;
  };

  // Helper function to get display name for absence category



  // Component for the adaptive tooltip
  const AdaptiveTooltip: React.FC<AdaptiveTooltipProps> = ({ 
    count, 
    date, 
    category = null, 
    className = "",
    backgroundColor,
    storeInfo
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
    
    // Get staff list for tooltip
    const staffWithAbsences = category 
      ? getStaffWithAbsences(date, category)
      : getStaffWithAbsences(date);
    
    return (
      <div
        ref={cellRef}
        className={`PA-dataCellHeader PA-adaptive-tooltip ${className} ${
          date.toLocaleDateString("en-US", { weekday: "long" }) === "Sunday"
            ? "PA-divider-header"
            : ""
        }`}
        style={{ 
          width: `${cellWidth}px`, 
          position: "relative",
          // backgroundColor: backgroundColor || ""
        }}
      >
        {count}
        {count > 0 && (
          <div className={`PA-tooltip-content ${tooltipPosition}`}>
            <strong>
              {category ? `${getCategoryDisplayName(category)} le ` : "Absences le "}
              {date.toLocaleDateString("fr-FR")}
            </strong>
            <br />
            {staffWithAbsences.length > 0 ? (
              staffWithAbsences.map((staff, i) => (
                <span key={i} className="PA-staff-item">{staff}<br /></span>
              ))
            ) : (
              <span>Aucun personnel</span>
            )}
          </div>
        )}
      </div>
    );
  };

  // Function to calculate total absences for a date
  const calculateTotalAbsencesForDate = (date: Date): number => {
    let totalAbsences = 0;
    const absenceCounted = new Set<string>(); // To avoid counting the same workforce multiple times
    
    Object.values(AbsenceCategory).forEach((category) => {
      const personList = absenceCategoryGroups[category];
      
      if (category !== AbsenceCategory.REPOS_OFF && category !== AbsenceCategory.OUT_OF_CONTRACT) {
        // Standard absence categories
        personList.forEach((person) => {
          const hasAbsenceOnDate = person.Absences?.some(
            (absence) =>
              new Date(absence.StartDate || "") <= date && 
              new Date(absence.EndDate || "") >= date &&
              getAbsenceCategory(absence) === category
          );

          if (hasAbsenceOnDate && !absenceCounted.has(person.Id)) {
            totalAbsences += 1;
            absenceCounted.add(person.Id);
          }
        });
      } 
      // REPOS_OFF category
      else if (category === AbsenceCategory.REPOS_OFF) {
        personList.forEach((person) => {
          if (isDayOff(person, date, storeInfo) && 
              !isOutOfContract(person, date) && 
              !absenceCounted.has(person.Id)) {
            totalAbsences += 1;
            absenceCounted.add(person.Id);
          }
        });
      } 
      // OUT_OF_CONTRACT category
      else if (category === AbsenceCategory.OUT_OF_CONTRACT) {
        personList.forEach((person) => {
          if (isOutOfContract(person, date) && !absenceCounted.has(person.Id)) {
            totalAbsences += 1;
            absenceCounted.add(person.Id);
          }
        });
      }
    });
    
    return totalAbsences;
  };
  

  return (
    <>
      <div className="PA-gridRow PA-absence-detail PA-AssignedRow">
        <div
          className="PA-firstColumnHeader"
          style={{ fontWeight: "bold", cursor: "pointer" }}
          onClick={() => toggleSection("absence")}
        >
          Total absences par catégorie {' '}
          <FontAwesomeIcon className="PA-icone"
            icon={expandedSections.absence ? faChevronUp : faChevronDown} 
            size="sm"
          />
        </div>
        {datesInRange.map((date, index) => {
          const totalAbsences = calculateTotalAbsencesForDate(date);

          return (
            <AdaptiveTooltip 
              key={index}
              count={totalAbsences}
              date={date}
              className="PA-total-absence"
              storeInfo={storeInfo}
            />
          );
        })}
      </div>

      {expandedSections.absence &&
        (Object.values(AbsenceCategory) as Array<AbsenceCategory>).map((category) => {
          const absenceCounts = calculateAbsenceCounts(
            absenceCategoryGroups[category], 
            category, 
            datesInRange,
            storeInfo
          );
          
          const backgroundColor = ABSENCE_CATEGORY_COLORS[category];
          
          return (
            <div
              key={`absence-${category}`}
              className="PA-gridRow PA-SubRow PA-absence-detail"
            >
              <div 
                className="PA-firstColumnHeader" 
                style={{ 
                  paddingLeft: "20px",
                  // backgroundColor: backgroundColor,
                  // color: category === AbsenceCategory.UNPAID_SHARED || 
                  //        category === AbsenceCategory.PAID_SHARED ? "white" : "black"
                }}
              >
                {getCategoryDisplayName(category)}
              </div>
              {absenceCounts.map((count, index) => (
                <AdaptiveTooltip 
                  key={index}
                  count={count}
                  date={datesInRange[index]}
                  category={category}
                  // backgroundColor={backgroundColor}
                  className={`PA-category-${category}`}
                  storeInfo={storeInfo}
                />
              ))}
            </div>
          );
        })}
    </>
  );
};


export default AbsenceRow;