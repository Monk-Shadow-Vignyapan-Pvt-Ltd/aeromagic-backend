import express from "express";
import { addOrder, getOrders, getOrderById,getOrdersByCustomerId, deleteOrder,cancelOrder, 
    updateOrder,getOrderStatuses,getReturnOrders} from "../controllers/order.controller.js";
import isAuthenticated from "../auth/isAuthenticated.js";
import { singleUpload } from "../middleware/multer.js";

const router = express.Router();

router.route("/addOrder").post( addOrder);
router.route("/getOrders").get( getOrders);
router.route("/getOrderById/:id").put( getOrderById);
router.route("/getOrdersByCustomerId/:id").put( getOrdersByCustomerId);
router.route("/updateOrder/:id").post( updateOrder);
router.route("/deleteOrder/:id").delete(deleteOrder);
router.route("/cancelOrder/:id").post(cancelOrder);
router.route("/getOrderStatuses").get( getOrderStatuses);
router.route("/getReturnOrders").get( getReturnOrders);

export default router;