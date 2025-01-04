import express from "express";
import { addService, getServices, getServiceById, deleteService, updateService,getServicesFrontend,getServicesBeforeAfter,cloneService,addServiceRanking,getServiceRanking} from "../controllers/service.controller.js";
import isAuthenticated from "../auth/isAuthenticated.js";
import { singleUpload } from "../middleware/multer.js";

const router = express.Router();

router.route("/addService").post( addService);
router.route("/getServices").get( getServices);
router.route("/getServiceById/:id").put( getServiceById);
router.route("/updateService/:id").post( updateService);
router.route("/cloneService/:id").post( cloneService);
router.route("/deleteService/:id").delete(deleteService);
router.route("/getServicesFrontend").get(getServicesFrontend);
router.route("/getServicesBeforeAfter").get(getServicesBeforeAfter);
router.route("/addServiceRanking").post( addServiceRanking);
router.route("/getServiceRanking").get(getServiceRanking);


export default router;