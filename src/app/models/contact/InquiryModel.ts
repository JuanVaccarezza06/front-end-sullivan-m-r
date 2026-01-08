import User from "../actors/User";
import Property from "../property/Property";

export interface InquiryModel {
  date: string; 
  description: string;
  state: {
    stateName: string
  };
  user: User;
  propertyDTO: Property;
}