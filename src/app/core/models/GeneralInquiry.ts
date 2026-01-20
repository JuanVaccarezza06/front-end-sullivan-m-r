import User from "./actors/User";
import MotiveDTO from "./MotiveDTO";

export default interface GeneralInquiry {
    date : string,
    description : string,
    stateDTO : string,
    userDTO : User,
    motiveDTO : MotiveDTO
}

