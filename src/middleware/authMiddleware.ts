import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../database/models/userModel";

export interface AuthRequest extends Request {
  user?: {
    username: string;
    email: string;
    password: string;
    role: string;
    id: string;
  };
}

export enum Role {
  Admin = "admin",
  Customer = "customer",
}

class authMiddleware {
  async isAuthenticated(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    //get token from user
    const token = req.headers.authorization;
    if (!token || token === undefined) {
      res.status(403).json({
        message: "Token not provided",
      });
      return;
    }

    //verify if the token is legit or not
    jwt.verify(
      token,
      process.env.SECRET_KEY as string,
      async (err, decoded: any) => {
        if (err) {
          res.status(400).json({
            message: "Invalid token!",
          });
        } else {
          //Check whether the decoded object id user exist in our table
          try {
            const userData = await User.findByPk(decoded.id);
            if (!userData) {
              res.status(403).json({
                message: "No user with that token",
              });
              return;
            }
            req.user = userData;
            next();
          } catch (error) {
            res.status(500).json({
              message: "Somehing went wrong!",
            });
          }
        }
      }
    );
  }

  restrictTo(...roles: Role[]) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
      let userRole = req.user?.role as Role;
      if (!roles.includes(userRole)) {
        res.status(403).json({
          message: "You don't have permission!",
        });
      } else {
        next();
      }
    };
  }
}

export default new authMiddleware();
