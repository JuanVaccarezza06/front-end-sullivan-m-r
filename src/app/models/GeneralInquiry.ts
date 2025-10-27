import MotiveDTO from "./MotiveDTO";
import User from "./User";

export default interface GeneralInquiry {
    date : string,
    description : string,
    state : string,
    userDTO : User,
    motiveDTO : MotiveDTO
}

