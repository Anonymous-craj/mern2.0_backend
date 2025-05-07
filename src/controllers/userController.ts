import { Request, Response } from "express";
import User from "../database/models/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

class AuthController {
  public static async registerUser(req: Request, res: Response): Promise<void> {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({
        message: "Please provide username, email and password",
      });
      return;
    }

    await User.create({
      username,
      email,
      password: bcrypt.hashSync(password, 8),
      role: role,
    });
    res.status(200).json({
      message: "User registered successfully!",
    });
  }

  public static async loginUser(req: Request, res: Response): Promise<void> {
    //user input
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({
        message: "Please enter your email and password!",
      });
      return;
    }
    //Check whether the above user exists in table or not
    const [data] = await User.findAll({
      where: {
        email: email,
      },
    });
    if (!data) {
      res.status(400).json({
        message: "The user with the above email doesn't exist!",
      });
      return;
    }
    //Check password
    const isMatched = bcrypt.compareSync(password, data.password);
    if (!isMatched) {
      res.status(403).json({
        message: "Invalid email or password",
      });
      return;
    }
    //generate token
    const token = jwt.sign({ id: data.id }, process.env.SECRET_KEY as string, {
      expiresIn: "20d",
    });

    res.status(200).json({
      message: "Logged in successfully!",
      data: token,
    });
  }
}

export default AuthController;
