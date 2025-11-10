import Amenity from "../complements/Amenity"
import ZoneDTO from "../geography/Zone"
import OperationType from "../types/OperationType"
import PropertyType from "../types/PropertyType"


export default interface PropertiesFilter {
    operationTypeDTO: OperationType
    propertyTypeDTO: PropertyType
    amenityDTOList: Amenity[]
    zoneDTO: ZoneDTO
    minPrice: number
    maxPrice: number
    rooms: number
}