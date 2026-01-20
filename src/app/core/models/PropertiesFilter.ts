import Amenity from "./Amenity"
import OperationType from "./OperationType"
import PropertyType from "./PropertyType"
import ZoneDTO from "./Zone"


export default interface PropertiesFilter {
    operationTypeDTO: OperationType
    propertyTypeDTO: PropertyType
    amenityDTOList: Amenity[]
    zoneDTO: ZoneDTO
    minPrice: number
    maxPrice: number
    rooms: number
}