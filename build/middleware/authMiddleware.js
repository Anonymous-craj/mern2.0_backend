"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Role = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("../database/models/userModel"));
var Role;
(function (Role) {
    Role["Admin"] = "admin";
    Role["Customer"] = "customer";
})(Role || (exports.Role = Role = {}));
class authMiddleware {
    isAuthenticated(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            //get token from user
            const token = req.headers.authorization;
            if (!token || token === undefined) {
                res.status(403).json({
                    message: "Token not provided",
                });
                return;
            }
            //verify if the token is legit or not
            jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY, (err, decoded) => __awaiter(this, void 0, void 0, function* () {
                if (err) {
                    res.status(400).json({
                        message: "Invalid token!",
                    });
                }
                else {
                    //Check whether the decoded object id user exist in our table
                    try {
                        const userData = yield userModel_1.default.findByPk(decoded.id);
                        if (!userData) {
                            res.status(403).json({
                                message: "No user with that token",
                            });
                            return;
                        }
                        req.user = userData;
                        next();
                    }
                    catch (error) {
                        res.status(500).json({
                            message: "Somehing went wrong!",
                        });
                    }
                }
            }));
        });
    }
    restrictTo(...roles) {
        return (req, res, next) => {
            var _a;
            let userRole = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
            if (!roles.includes(userRole)) {
                res.status(403).json({
                    message: "You don't have permission!",
                });
            }
            else {
                next();
            }
        };
    }
}
exports.default = new authMiddleware();
