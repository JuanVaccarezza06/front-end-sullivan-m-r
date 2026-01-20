import CityDTO from "./geography/City";

export default interface ZoneDTO {
    zoneName: string;
    cityDTO : CityDTO
    isFeatured : Boolean
}