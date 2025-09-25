export class Login {
  user: string;
  password: string;
  
  constructor(user = "", password = "") {
    this.user = user;

    this.password = password;
  }
}