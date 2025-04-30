import express from "express";
import { upsertCta,  getCta} from "../controllers/cta.controller.js";
import isAuthenticated from "../auth/isAuthenticated.js";
import { singleUpload } from "../middleware/multer.js";

const router = express.Router();

router.route("/upsertCta").post( upsertCta);
router.route("/getCta").get( getCta);

export default router;