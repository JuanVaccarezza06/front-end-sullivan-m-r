import Owner from "../actors/Owner"
import Amenity from "./complements/Amenity"
import Image from "./complements/Image"
import Address from "./geography/Address"
import ZoneDTO from "./geography/Zone"
import OperationType from "./types/OperationType"
import PropertyType from "./types/PropertyType"

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
