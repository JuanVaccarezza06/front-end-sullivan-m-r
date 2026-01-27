import User from "./actors/User";
import Property from "./properties/Property";

export interface InquiryModel {
  description: string;
  state: {
    stateName: string
  };
  user: User;
  propertyDTO: Property;
}