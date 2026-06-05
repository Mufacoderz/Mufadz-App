import { useContext } from "react";
import { UserContext } from "../context/UserContext";


export const useUser = () => useContext(UserContext);