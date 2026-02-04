import User from "./actors/User";
import Property from "./properties/Property";
import State from "./State";

export interface InquiryModel {
  id: number;
  description: string;
  state: State;
  createAt: string
  user: User;
  propertyDTO: Property;
}