import multer, { diskStorage } from "multer";
import { Request } from "express";
const storage = diskStorage({
  destination: function (req: Request, file: Express.Multer.File, cb: any) {
    const allowedFileType = ["image/png", "image/jpeg", "imgae/jpg"];
    if (!allowedFileType.includes(file.mimetype)) {
      cb(new Error("File type not supported!"));
      return;
    }
    cb(null, "./src/uploads");
  },

  filename: function (req: Request, file: Express.Multer.File, cb: any) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export { storage, multer };
