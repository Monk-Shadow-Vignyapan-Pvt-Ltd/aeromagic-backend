import express from "express";
import {
    checkPincode,
    createShipment,
    trackShipment,
    cancelShipment
} from "../controllers/delhivery.controller.js";

const router = express.Router();

router.route("/checkPincode/:pincode").get(checkPincode);
router.route("/createShipment").post(createShipment);
router.route("/trackShipment/:trackingId").get(trackShipment);
router.route("/cancelShipment/:trackingId").post(cancelShipment);

export default router;
