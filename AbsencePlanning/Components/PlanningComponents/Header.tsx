import React from 'react'
import Select from "react-select";
import "../../Css/header.css";
import { Workforce } from '../../Models/Model';
import { PlanningAbsenceIcon } from '../../Assets/Icons';

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
        <div className="PA-custom-tooltip-container" style={{ display: 'flex', alignItems: 'center' }}>
          <div className="PA-selected-label" style={{
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
              <div className="PA-selected-count" style={{
                fontSize: '12px',
                background: '#e0e0e0',
                borderRadius: '10px',
                padding: '2px 6px',
                minWidth: '20px',
                textAlign: 'center'
              }}>
                +{selectedCount - 1}
              </div>
              <div className="PA-tooltip-text" style={{
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
    <div className="PA-header-container">
      <div className="PA-intro-container">
        
        <PlanningAbsenceIcon  className="PA-imagePlanning" />  Absences planning
      
      </div>

      <div className="PA-DropDown-containers">
      <div className="PA-DropDown-Role-container">
          <Select
            className="PA-material-dropdown"
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
        <div className="PA-DropDown-manager-container">
          <Select
            className="PA-material-dropdown"
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
        <div className="PA-DropDown-Department-container">
          <Select
            className="PA-material-dropdown"
           
            isMulti
            options={departmentData.map((dept) => ({
              value: dept.DepartmentId,
              label: dept.DepartmentName,
            }))}
            
            placeholder="Division"
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
        <div className="PA-DropDown-Department-container">
          <Select
            className="PA-material-dropdown"
           
            isMulti
            options={workforces.map((workforce) => ({
              value: workforce.Id,
              label: workforce.Name,
            }))}
            
            placeholder="Staff members"
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