import React from 'react';
interface SpacerRowProps {
    
    cellWidth :number;
    datesInRange : Date[];
}

 const SpacerRow: React.FC<SpacerRowProps> = ({ cellWidth , datesInRange }) => (
    <div className="gridRow spacer-row" style={{ height: "3px" }}>
      <div className="firstColumnHeader"></div>
      {datesInRange.map((date, index) => (
        <div
          key={index}
          className={`dataCellHeader ${
            date.toLocaleDateString("en-US", { weekday: "long" }) === "Sunday"
              ? "divider-header"
              : ""
          }`}
          style={{ width: `${cellWidth}px` }}
        ></div>
      ))}
    </div>
  );

  export default SpacerRow;