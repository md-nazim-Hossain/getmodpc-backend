import { Router } from "express";
import { AppController } from "../controllers/app.controller";

const router = Router();
const appController = new AppController();

router.post("/", appController.getAppDataByUrl);

export default router;
