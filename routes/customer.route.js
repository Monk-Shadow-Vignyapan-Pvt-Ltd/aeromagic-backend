import express from "express";
import {auth} from "../middleware/auth.js"
import { register, login, tokenIsValid, getCustomer,getCustomers,
    deleteCustomer,updateWishList,getProductsByWishList,updateAddressList,
    deleteAddress,updatePhoneNo,updatePassword,forgotPassword,resetPassword,
    googleAuth,createCashfreeOrder,verifyCashfree} from "../controllers/customer.controller.js";

const router = express.Router();

router.route("/register").post( register);
router.route("/login").post( login);
router.route("/tokenIsValid").post( tokenIsValid);
router.route("/getCustomer").get(auth, getCustomer);
router.route("/getCustomers").get( getCustomers);
router.route("/deleteCustomer/:id").delete( deleteCustomer);
router.route("/updateWishList/:id").post( updateWishList);
router.route("/getProductsByWishList/:id").get( getProductsByWishList);
router.route("/updateAddressList/:id").post( updateAddressList);
router.route("/deleteAddress/:id").post( deleteAddress);
router.route("/updatePhoneNo/:id").post( updatePhoneNo);
router.route("/updatePassword/:id").post( updatePassword);
router.route("/forgotPassword").post( forgotPassword);
router.route("/resetPassword/:token").post( resetPassword);
router.route("/googleAuth").get(googleAuth);
router.route("/createCashfreeOrder").post( createCashfreeOrder);
router.route("/verifyCashfree").post( verifyCashfree);

export default router;
