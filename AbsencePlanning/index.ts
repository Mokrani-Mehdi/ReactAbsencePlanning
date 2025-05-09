import Planning from "./Components/Planning";
import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import _ from "lodash";

import {
  AbsencePlanningCellData,
  Absences,
  IState,
  Payload,
} from "./Models/Model";
/* eslint-disable */

export class AbsencePlanning
  implements ComponentFramework.ReactControl<IInputs, IOutputs>
{
  private notifyOutputChanged: () => void;
  private state: IState;
  private memoizedData: any = null;

  /**
   * Empty constructor.
   */
  constructor() {
    // Empty
    this.state = {
      selectedAbsences: [],
      actionType: null,
      nextDate: null,
      selectedWorforceDate: null,
    };
  }

  /**
   * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
   * Data-set values are not initialized here, use updateView.
   * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
   * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
   * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
   */
  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    state: ComponentFramework.Dictionary
  ): void {
    this.notifyOutputChanged = notifyOutputChanged;
    context.mode.trackContainerResize(true);
  }
  private HandleGetEvent = (
    selectedAbsences: Absences[],
    actionType: string | null,
    nextDate: string | null,
    selectedWorforceDate: AbsencePlanningCellData | null
  ): void => {
    this.setState(
      {
        selectedAbsences: selectedAbsences,
        actionType: actionType,
        nextDate: nextDate,
        selectedWorforceDate: selectedWorforceDate,
      },
      true
    ); //
  };
  private setState = (newState: Partial<IState>, notify = false): void => {
    this.state = {
      ...this.state,
      ...newState,
    };
    if (notify) {
      this.notifyOutputChanged();
    }
  };

  /**
   * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
   * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
   * @returns ReactElement root react element for the control
   */
  public updateView(
    context: ComponentFramework.Context<IInputs>
  ): React.ReactElement {
    let Data;
    const containerWidth = context.mode.allocatedWidth || 1500; // Default to 1500 if not available
    const containerHeight = context.mode.allocatedHeight || 800;
    let dataChanged = false;
    try {
      if (
        context.parameters.Payload.raw &&
        typeof context.parameters.Payload.raw === "string"
      ) {
        const parsedData = JSON.parse(context.parameters.Payload.raw);

        if (!this.memoizedData || !_.isEqual(this.memoizedData, parsedData)) {
          this.memoizedData = parsedData;
          Data = parsedData;
          dataChanged = true;
        } else {
          Data = this.memoizedData;
        }
      } else {
        Data = {};
      }
    } catch (error) {
      console.error("Error parsing JSON:", error);
      Data = {};
    }

    const props: Payload = {
      Data,
      containerWidth,
      containerHeight,
      OnChange: this.HandleGetEvent,
    };
    return React.createElement(Planning, props);
  }

  /**
   * It is called by the framework prior to a control receiving new data.
   * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as "bound" or "output"
   */
  public getOutputs(): IOutputs {
    // const response = {
    //       data: this.state.selectedAbsences,
    //       actionType: this.state.actionType,

    //     };
    //alert(JSON.stringify(this.state));
    return {
      Response: this.state ? JSON.stringify(this.state) : "",
    };
  }

  /**
   * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
   * i.e. cancelling any pending remote calls, removing listeners, etc.
   */
  public destroy(): void {
    // Add code to cleanup control if necessary
  }
}
