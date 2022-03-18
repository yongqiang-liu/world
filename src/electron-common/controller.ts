import { EVENTS } from "./eventConst";

export const CONTROLLER_EVENT = "CONTROLLER_EVENT";

export interface ControllerPayload {
  event: EVENTS;
  payload: any;
}
