import { Router } from "express";
import { ContactController } from "../controllers/contact.controller";
import validateRequest from "../middlewares/validateRequest";
import { ContactValidation } from "../validation/contact.validation";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const contactController = new ContactController();

router.get("/", authMiddleware(), contactController.getAllContacts);

router.post(
  "/",
  validateRequest(ContactValidation.createContactSchema),
  contactController.createContact,
);

router.patch(
  "/:id",
  validateRequest(ContactValidation.updateContactSchema),
  authMiddleware(),
  contactController.updateContact,
);

router.delete("/:id", authMiddleware(), contactController.deleteContact);

router.post(
  "/bulk-delete",
  authMiddleware(),
  contactController.deleteMultipleContacts,
);

export default router;
