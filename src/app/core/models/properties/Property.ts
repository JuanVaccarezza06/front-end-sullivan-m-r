import Owner from "../actors/Owner";
import Address from "../geography/Address";
import OperationType from "../OperationType";
import PropertyType from "../PropertyType";
import ZoneDTO from "../geography/Zone";
import Amenity from "../Amenity";
import { ImageItem } from "../ImageItem";

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
  imageDTOList: ImageItem[];

  rooms: number;
  bathrooms: number;
  bedrooms: number;

  latitude: number;
  longitude: number;

  mainImageUrl: string;

  ownerDTO: Owner;
}