import OperationType from "./OperationType"
import PropertyType from "./PropertyType"
import Zone from "./Zone"

export default interface HomeFilter{
    operationType : OperationType
    propertyType : PropertyType
    zone : Zone
}