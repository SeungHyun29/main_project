export interface IUser {
  user: {
    email: string;
    id: string;
  };
}

export interface IContext {
  req?: Request & IUser;
  res?: Response;
}

export interface IOAuthUser {
  user: {
    email: string;
    hashedPassword: string;
    name: string;
    phonenumber: string;
  };
}
