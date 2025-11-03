import Amenity from "./Amenity"
import OperationType from "./OperationType"

export default interface PropertiesFilter {
    operationType: OperationType
    minPrice: number
    maxPrice: number
    rooms: number
    amenities: Amenity[]
}