import { configureStore } from "@reduxjs/toolkit";

interface IUser {
    userId: string;
    username: string;
    email: string;
    role:"admin" |"user"

};

const initialState: IUser = {
    userId: "",
    username: "",
    email: "",
    role:initialState.email === "nwiboazubuike@gmail.com" ? "admin" : "user"
}