import React from 'react'
import Select from "react-select";
import "../../Css/header.css";
import { Workforce } from '../../Models/Model';

/* eslint-disable */
interface HeaderProps {
  workforces : Workforce[];
  selectedWorkforces: string[];
  setSelectedWorkforces: (query: string[]) => void;
  managerData: any[];
  departmentData: any[];
  roleData: any[]
  selectedManagers: string[];
  setSelectedManagers: (managers: string[]) => void;
  selectedDepartments: string[];
  setSelectedDepartments: (departments: string[]) => void;
  selectedRoles: string[];
  setSelectedRoles: (roles: string[]) => void;
}
const Header: React.FC<HeaderProps> = ({
 
  workforces,  
  selectedWorkforces,
  setSelectedWorkforces,
  managerData,
  departmentData,
  roleData,
  selectedManagers,
  setSelectedManagers,
  selectedDepartments,
  setSelectedDepartments,
  selectedRoles,
  setSelectedRoles,
}) => {

  const CustomMultiValue = (props: any) => {
    const { selectProps, index } = props;
    
    if (index === 0) {
      const selectedCount = selectProps.value.length;
      const firstLabel = selectProps.value[0].label;
      
      return (
        <div className="custom-tooltip-container" style={{ display: 'flex', alignItems: 'center' }}>
          <div className="selected-label" style={{
            fontSize: '12px',
            maxWidth: '120px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            marginRight: '4px'
          }}>
            {firstLabel}
          </div>
          {selectedCount > 1 && (
            <>
              <div className="selected-count" style={{
                fontSize: '12px',
                background: '#e0e0e0',
                borderRadius: '10px',
                padding: '2px 6px',
                minWidth: '20px',
                textAlign: 'center'
              }}>
                +{selectedCount - 1}
              </div>
              <div className="tooltip-text" style={{
                fontSize: '12px',
                maxWidth: '200px',
                wordWrap: 'break-word'
              }}>
                {selectProps.value.map((val: { label: any; }) => val.label).join(', ')}
              </div>
            </>
          )}
        </div>
      );
    }
    
    return null;
  };
  return (
    <div className="header-container">
      <div className="intro-container">
        
          Planning Absences
      
      </div>

      <div className="DropDown-containers">
      <div className="DropDown-Role-container">
          <Select
            className="material-dropdown"
            isMulti
            options={roleData.map((role) => ({
              value: role,
              label: role,
            }))}
            placeholder="Role"
            value={roleData
              .filter((role) => selectedRoles.includes(role))
              .map((role) => ({
                value: role,
                label: role,
              }))}
            onChange={(selectedOptions) => {
              setSelectedRoles(
                selectedOptions.map((option) => option.value)
              );
            }}
            closeMenuOnSelect = {false}
            hideSelectedOptions = {false}
            controlShouldRenderValue
            components={{
              MultiValue: CustomMultiValue
            }}
          />
        </div>
        <div className="DropDown-manager-container">
          <Select
            className="material-dropdown"
            options={managerData.map((manager) => ({
              value: manager.Id,
              label: manager.Name,
            }))}
            isMulti
            placeholder="Manager"
            value={managerData
              .filter((manager) => selectedManagers.includes(manager.Id))
              .map((manager) => ({
                value: manager.Id,
                label: manager.Name,
              }))}
            onChange={(selectedOptions) => {
              setSelectedManagers(
                selectedOptions.map((option) => option.value)
              );
            }}
            closeMenuOnSelect = {false}
            hideSelectedOptions = {false}
            controlShouldRenderValue
            components={{
              
              MultiValue: CustomMultiValue
            }}
            
          />
        </div>
        <div className="DropDown-Department-container">
          <Select
            className="material-dropdown"
           
            isMulti
            options={departmentData.map((dept) => ({
              value: dept.DepartmentId,
              label: dept.DepartmentName,
            }))}
            
            placeholder="Department"
            value={departmentData
              .filter((dept) => selectedDepartments.includes(dept.DepartmentId))
              .map((dept) => ({
                value: dept.DepartmentId,
                label: dept.DepartmentName,
              }))}
            onChange={(selectedOptions) => {
              setSelectedDepartments(
                selectedOptions.map((option) => option.value)
              );
             
            }}
            // closeMenuOnSelect = {false}
          
            hideSelectedOptions = {false}
            controlShouldRenderValue
            components={{
              
              MultiValue: CustomMultiValue
            }}
          />
        </div>
        <div className="DropDown-Department-container">
          <Select
            className="material-dropdown"
           
            isMulti
            options={workforces.map((workforce) => ({
              value: workforce.Id,
              label: workforce.Name,
            }))}
            
            placeholder="Workforce"
            value={workforces
              .filter((workforce) => selectedWorkforces.includes(workforce.Id))
              .map((workforce) => ({
                value: workforce.Id,
                label: workforce.Name,
              }))}
            onChange={(selectedOptions) => {
              setSelectedWorkforces(
                selectedOptions.map((option) => option.value)
              );
             
            }}
            // closeMenuOnSelect = {false}
          
            hideSelectedOptions = {false}
            controlShouldRenderValue
            components={{
              
              MultiValue: CustomMultiValue
            }}
          />
        </div>
        
      </div>
    </div>
  );
};

export default Header;
/* eslint-enable  */