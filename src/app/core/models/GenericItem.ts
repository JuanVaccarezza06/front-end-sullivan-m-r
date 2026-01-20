import Amenity from "./Amenity";
import { ConfigurationType } from "./ConfigurationType";
import ZoneDTO from "./Zone";

export interface GenericItem {
    itemName: string;
    isFeatured: boolean;
    type: ConfigurationType;
    originalData: Amenity | ZoneDTO;
}
