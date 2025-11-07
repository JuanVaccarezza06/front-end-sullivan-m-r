import Amenity from "./Amenity"
import OperationType from "./OperationType"
import PropertyType from "./PropertyType"
import Zone from "./Zone"

export default interface PropertiesFilter {
    operationTypeDTOList: OperationType[]
    propertyTypeDTOList: PropertyType[]
    amenityDTOList: Amenity[]
    zoneDTOList: Zone[]
    minPrice: number
    maxPrice: number
    rooms: number


}