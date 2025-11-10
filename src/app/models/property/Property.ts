import Owner from "../actors/Owner";
import Address from "./geography/Address";
import Amenity from "./complements/Amenity";
import Image from "./complements/Image";
import OperationType from "./types/OperationType";
import PropertyType from "./types/PropertyType";
import ZoneDTO from "./geography/Zone";

export default interface Property{
  id: number;
  title: string;
  description: string;
  price: number;
  publicationDate: string; // formato ISO (yyyy-MM-dd)
  yearConstruction: number;
  areaStructure: number;
  totalArea: number;

  propertyTypeDTO: PropertyType;
  operationTypeDTO: OperationType;

  amenitiesList: Amenity[];
  zoneDTO: ZoneDTO;
  addressDTO: Address;
  imageDTOList: Image[];

  rooms: number;
  bathrooms: number;
  bedrooms: number;

  mainImage?: string;

  ownerDTO: Owner;
}