import React from 'react';
interface SpacerRowProps {
    
    cellWidth :number;
    datesInRange : Date[];
}

 const SpacerRow: React.FC<SpacerRowProps> = ({ cellWidth , datesInRange }) => (
    <div className="PA-gridRow spacer-row" style={{ height: "3px" }}>
      <div className="PA-firstColumnHeader"></div>
      {datesInRange.map((date, index) => (
        <div
          key={index}
          className={`PA-dataCellHeader ${
            date.toLocaleDateString("en-US", { weekday: "long" }) === "Sunday"
              ? "PA-divider-header"
              : ""
          }`}
          style={{ width: `${cellWidth}px` }}
        ></div>
      ))}
    </div>
  );

  export default SpacerRow;