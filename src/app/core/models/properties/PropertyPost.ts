import Owner from "../actors/Owner"
import Amenity from "../Amenity"
import Address from "../geography/Address"
import ZoneDTO from "../geography/Zone"
import Image from "../Image"
import OperationType from "../OperationType"
import PropertyType from "../PropertyType"

export default interface PropertyPost {

    id : number | null
    title: string
    description: string
    price: number
    publicationDate: string
    yearConstruction: number
    areaStructure: number
    totalArea: number
    rooms: number
    bathrooms: number
    bedrooms: number

    propertyTypeDTO: PropertyType
    operationTypeDTO: OperationType

    zoneDTO: ZoneDTO

    addressDTO: Address

    ownerDTO: Owner

    amenitiesList: Amenity[]
    imageDTOList: Image[]
}
