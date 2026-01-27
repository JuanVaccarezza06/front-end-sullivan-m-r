import User from "./actors/User";
import MotiveDTO from "./MotiveDTO";

export default interface GeneralInquiry {
    description : string,
    stateDTO : string,
    userDTO : User,
    motiveDTO : MotiveDTO
}

