import User from "./actors/User";
import MotiveDTO from "./MotiveDTO";
import State from "./State";

export default interface GeneralInquiry {
    id: number
    description : string,
    stateDTO : State,
    userDTO : User,
    motiveDTO : MotiveDTO
    createAt: string
}

