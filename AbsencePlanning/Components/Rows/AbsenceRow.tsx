import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { calculateAbsenceCounts, groupWorkforcesByAbsenceCategory,getAbsenceCategory } from "../../Helpers/AppHelper";
import '../../Css/row.css';
import { 
  Workforce, 
  //AbsenceCategory, 
  ABSENCE_CATEGORY_COLORS
  
} from "../../Models/Model";
/* eslint-disable */
export enum AbsenceCategory {
  UNPAID_SHARED = "UNPAID_SHARED",
  PAID_SHARED = "PAID_SHARED",
  UNPAID_UNSHARED = "UNPAID_UNSHARED",
  PAID_UNSHARED = "PAID_UNSHARED"
}
interface AbsenceRowProps {
  expandedSections: any;
  toggleSection: (section: "absence") => void;
  AbsenceGroup: Record<string, Workforce[]>;
  datesInRange: Date[];
  cellWidth: number;
  workforces: Workforce[];
}

// Define interface for the AdaptiveTooltip component props
interface AdaptiveTooltipProps {
  count: number;
  date: Date;
  category?: AbsenceCategory | null;
  className?: string;
  backgroundColor?: string;
}

const AbsenceRow: React.FC<AbsenceRowProps> = ({
  expandedSections,
  toggleSection,
  AbsenceGroup,
  datesInRange,
  cellWidth,
  workforces
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
    } else {
      // For total absences (all categories)
      Object.values(AbsenceCategory).forEach(category => {
        const personList = absenceCategoryGroups[category];
        personList.forEach(person => {
          const hasAbsenceOnDate = person.Absences?.some(
            s => 
              new Date(s.StartDate || "") <= date && 
              new Date(s.EndDate || "") >= date &&
              getAbsenceCategory(s) === category
          );

          if (hasAbsenceOnDate && !staffList.includes(person.Name)) {
            staffList.push(`${person.Name} (${getCategoryDisplayName(category)})`);
          }
        });
      });
    }
    
    return staffList;
  };

  // Helper function to get display name for absence category
  const getCategoryDisplayName = (category: AbsenceCategory): string => {
    switch (category) {
      case AbsenceCategory.UNPAID_SHARED:
        return "Unpaid Shared";
      case AbsenceCategory.PAID_SHARED:
        return "Paid Shared";
      case AbsenceCategory.UNPAID_UNSHARED:
        return "Unpaid Unshared";
      case AbsenceCategory.PAID_UNSHARED:
        return "Paid Unshared";
    }
  };

  // Component for the adaptive tooltip
  const AdaptiveTooltip: React.FC<AdaptiveTooltipProps> = ({ 
    count, 
    date, 
    category = null, 
    className = "",
    backgroundColor
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
    const staffWithAbsences = category 
      ? getStaffWithAbsences(date, category)
      : getStaffWithAbsences(date);
    
    return (
      <div
        ref={cellRef}
        className={`dataCellHeader adaptive-tooltip ${className} ${
          date.toLocaleDateString("en-US", { weekday: "long" }) === "Sunday"
            ? "divider-header"
            : ""
        }`}
        style={{ 
          width: `${cellWidth}px`, 
          position: "relative",
          //backgroundColor: backgroundColor || ""
        }}
      >
        {count}
        {count > 0 && (
          <div className={`tooltip-content ${tooltipPosition}`}>
            <strong>
              {category ? `${getCategoryDisplayName(category)} le ` : "Absences le "}
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

  // Function to calculate total absences for a date
  const calculateTotalAbsencesForDate = (date: Date): number => {
    let totalAbsences = 0;
    Object.values(AbsenceCategory).forEach((category) => {
      const personList = absenceCategoryGroups[category];
      personList.forEach((person) => {
        const hasAbsenceOnDate = person.Absences?.some(
          (absence) =>
            new Date(absence.StartDate || "") <= date && 
            new Date(absence.EndDate || "") >= date &&
            getAbsenceCategory(absence) === category
        );

        if (hasAbsenceOnDate) {
          totalAbsences += 1;
        }
      });
    });
    return totalAbsences;
  };
  console.log('AbsenceCategory values:', Object.values(AbsenceCategory));

  return (
    <>
      <div className="gridRow absence-summary AssignedRow">
        <div
          className="firstColumnHeader"
          style={{ fontWeight: "bold", cursor: "pointer" }}
          onClick={() => toggleSection("absence")}
        >
          Total absences par catégorie {' '}
          <FontAwesomeIcon className="icone"
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
              className="total-absence"
            />
          );
        })}
      </div>

      {expandedSections.absence &&
        (Object.values(AbsenceCategory) as Array<AbsenceCategory>).map((category) => {
          const absenceCounts = calculateAbsenceCounts(
            absenceCategoryGroups[category], 
            category, 
            datesInRange
          );
          console.log("Category",category);
          const backgroundColor = ABSENCE_CATEGORY_COLORS[category];
          
          return (
            <div
              key={`absence-${category}`}
              className="gridRow SubRow absence-detail"
            >
              <div 
                className="firstColumnHeader" 
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
                  backgroundColor={backgroundColor}
                  className={`category-${category}`}
                />
              ))}
            </div>
          );
        })}
    </>
  );
};

export default AbsenceRow;