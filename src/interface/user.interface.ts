import { Types } from "mongoose";
import { Socket } from 'socket.io';

export interface IUser {
    loggedInId?: Types.ObjectId;
    authId: Types.ObjectId;
    role: string;
    access?: string[];
}

export interface ISocket extends Socket {
    user?: IUser;
}