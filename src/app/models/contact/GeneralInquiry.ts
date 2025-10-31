import MotiveDTO from "../contact/MotiveDTO";
import User from "../actors/User";

export default interface GeneralInquiry {
    date : string,
    description : string,
    state : string,
    userDTO : User,
    motiveDTO : MotiveDTO
}

