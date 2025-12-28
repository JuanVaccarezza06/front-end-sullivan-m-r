import ZoneDTO from "../geography/Zone";
import Amenity from "./Amenity";
import { ConfigurationType } from "./ConfigurationType";

export interface GenericItem {
    itemName: string;
    isFeatured: boolean;
    type: ConfigurationType;
    originalData: Amenity | ZoneDTO;
}
