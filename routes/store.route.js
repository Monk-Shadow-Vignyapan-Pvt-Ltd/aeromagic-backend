import express from "express";
import { addStore, getStores, getStoreById,getStoreByUrl, deleteStore,
     updateStore,getStoresFrontend,
    getStoreImageUrl,} from "../controllers/store.controller.js";
import isAuthenticated from "../auth/isAuthenticated.js";
import { singleUpload } from "../middleware/multer.js";

const router = express.Router();

router.route("/addStore").post( addStore);
router.route("/getStores").get( getStores);
router.route("/getStoreById/:id").put( getStoreById);
router.route("/getStoreByUrl/:id").put( getStoreByUrl);
router.route("/updateStore/:id").post( updateStore);
router.route("/deleteStore/:id").delete(deleteStore);
router.route("/getStoresFrontend").get( getStoresFrontend);
router.route("/getStoreImageUrl/:id").get( getStoreImageUrl);

export default router;