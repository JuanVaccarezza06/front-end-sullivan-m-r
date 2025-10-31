import Owner from "../actors/Owner";
import Address from "./Address";
import Amenity from "./Amenity";
import Image from "./Image";
import OperationType from "./OperationType";
import PropertyType from "./PropertyType";
import Zone from "./Zone";

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
  zoneDTO: Zone;
  addressDTO: Address;
  imageDTOList: Image[];

  rooms: number;
  bathrooms: number;
  bedrooms: number;

  mainImage?: string;

  ownerDTO: Owner;
}