import express from "express";
import {shiprocketWebhook, addOrder, getOrders,getOrdersExcel, getOrderById,getOrderByShiprocketId,
    getOrdersByCustomerId,getLatestOrderByCustomerId, deleteOrder,cancelOrder, 
    cancelShipment,trackShipment,updateOrder,getOrderStatuses,getReturnOrders,updateOrderShippingAddress} from "../controllers/order.controller.js";
import isAuthenticated from "../auth/isAuthenticated.js";
import { singleUpload } from "../middleware/multer.js";

const router = express.Router();

router.route("/webhook/shiprocket").post(shiprocketWebhook);
router.route("/addOrder").post( addOrder);
router.route("/getOrders").get( getOrders);
router.route("/getOrdersExcel").get( getOrdersExcel);
router.route("/getOrderById/:id").put( getOrderById);
router.route("/getOrderByShiprocketId/:id").put( getOrderByShiprocketId);
router.route("/getOrdersByCustomerId/:id").put( getOrdersByCustomerId);
router.route("/getLatestOrderByCustomerId/:id").put( getLatestOrderByCustomerId);
router.route("/updateOrder/:id").post( updateOrder);
router.route("/deleteOrder/:id").delete(deleteOrder);
router.route("/cancelOrder/:id").post(cancelOrder);
router.route("/cancelShipment").post(cancelShipment);
router.route("/trackShipment").post(trackShipment);
router.route("/getOrderStatuses").get( getOrderStatuses);
router.route("/getReturnOrders").get( getReturnOrders);
router.route("/updateOrderShippingAddress/:id").post( updateOrderShippingAddress);

export default router;