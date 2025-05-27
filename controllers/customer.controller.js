import { Customer } from '../models/customer.model.js';
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import sharp from 'sharp';
import { oauth2Client } from '../utils/googleClient.js';
import axios from "axios";
import nodemailer from 'nodemailer';
import dotenv from "dotenv";
import {Coupon} from '../models/coupon.model.js';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: 'mail.aromagicperfume.com', // Or your SMTP provider
    port: 587,
    secure: false, // true if you use port 465
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
    },
});

const sendOrderConfirmationEmail = async (to, fullname ) => {
     const signupCoupon = await Coupon.findOne({ isActive: true, showOnSignUp: true })
        .populate('categoryIds', 'categoryName') // direct array of ObjectIds
        .populate('productIds.productId', 'productName') // array of subdocs
        .populate('buy.products.productId', 'productName')
        .populate('get.products.productId', 'productName')
        .lean();

  let couponDetails = "";
  if (signupCoupon) {
    if (signupCoupon.type === "fixed" || signupCoupon.type === "percent") {
      couponDetails = `
        <span style="margin-top: 4px; line-height: 1.5; font-weight: 700;">
          ${signupCoupon.value}${signupCoupon.type === "percent" ? "%" : " INR"} Flat Discount On Minimum Purchase Of 1 Product
        </span>
      `;
    } else if (signupCoupon.type === "buy_x_get_y") {
      const buyList = signupCoupon.buy.products
        .map(item => {
          const name = item?.productId?.productName || "Unknown";
          const variation = item.variationPrice?.value ? ` - ${item.variationPrice.value}` : "";
          return `<li>${name} - ${variation} x ${item.quantity}</li>`;
        })
        .join("");

      const getList = signupCoupon.get.products
        .map(item => {
          const name = item?.productId?.productName || "Unknown";
          const variation = item.variationPrice?.value ? ` - ${item.variationPrice.value}` : "";
          return `<li>${name} - ${variation} x ${item.quantity} @ ${item.discountPercent}% off</li>`;
        })
        .join("");

      couponDetails = `
        <div style="margin-top: 8px">
          <strong>Buy:</strong>
          <ul style="list-style-type: disc; padding-left: 20px">${buyList}</ul>
        </div>
        <div style="margin-top: 8px">
          <strong>Get:</strong>
          <ul style="list-style-type: disc; padding-left: 20px">${getList}</ul>
        </div>
      `;
    }
  }

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb;">
  <div style="background-color: #ffffff; color: #1f2937; font-family: Arial, sans-serif; padding: 24px; max-width: 600px; margin: 0 auto; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb;">
    <div style="text-align: center; margin-bottom: 32px;">
      <a href="https://aromagicperfume.com/" style="text-decoration: none; margin-left: auto; margin-right: auto;"><img src="https://aromagicperfume.com/AroMagicLogo.png" alt="AroMagic Logo" style="width: 150px; height: auto;"></a>
    </div>
    <p style="font-size: 18px; line-height: 1.5;">Hi <strong>${fullname}</strong>,</p>
    <p style="margin-top: 8px; line-height: 1.5;">Welcome to the world of <strong>AroMagic Perfume</strong> ✨</p>
    <p style="margin-top: 8px; line-height: 1.5;">Your account has been successfully created and you're now a part of a fragrance-loving community that believes every scent tells a story.</p>

    <div style="margin-top: 24px;">
      <h2 style="font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 8px;">What Awaits You:</h2>
      <ul style="list-style-type: disc; padding-left: 24px; color: #374151; line-height: 1.5;">
        <li>✨ Exclusive launches &amp; limited editions</li>
        <li>🕯️ Personalized perfume recommendations</li>
        <li>🎁 Members-only offers &amp; early-bird deals</li>
        <li>📦 A seamless shopping experience</li>
      </ul>
    </div>

    <div style="margin-top: 24px; background-color: #fdf2f8; border: 1px solid #fbcfe8; padding: 16px; border-radius: 8px;">
      <h3 style="color: #be185d; font-weight: 600;">A Gift for You 🎁</h3>
      <div style="margin-top: 8px;">
        <span style="color: #9d174d; font-weight: 700;">${signupCoupon?.code || ''}</span>
        ${couponDetails}
      </div>
      <a href="https://aromagicperfume.com/" style="display: inline-block; margin-top: 16px; padding: 8px 20px; background-color: #db2777; color: #ffffff; border-radius: 8px; font-weight: 500; text-decoration: none;">Shop Now</a>
    </div>

    <div style="margin-top: 32px; font-style: italic; border-left: 4px solid #f472b6; padding-left: 16px; color: #374151; line-height: 1.5;">
      <p>"At AroMagic, we believe fragrance is more than a scent — it's a feeling, a memory, a way to express who you are. Each perfume in our collection is crafted to elevate your mood and make every moment magical. Thank you for joining us on this scented journey — we're excited to share the magic with you."</p>
      <p style="margin-top: 16px; font-style: normal; font-weight: 600;">— Team AroMagic</p>
    </div>

    <div style="margin-top: 40px; text-align: center; font-size: 14px; color: #6b7280;">
      <p>Follow us: <a href="https://www.instagram.com/aromagicliveperfume/">Instagram</a> | <a href="https://www.facebook.com/people/Aromagic-Live-Perfume/61550288920678/#">Facebook</a></p>
      <p style="margin-top: 8px;">Need help? <a href="mailto:support@aromagicperfume.com" style="color: #db2777; text-decoration: underline;">support@aromagicperfume.com</a></p>
      <p style="margin-top: 16px;">© 2025 AroMagic Perfume</p>
      <div style="margin-top: 4px;">
        <a href="#" style="text-decoration: underline; margin-right: 8px;">Privacy Policy</a> |
        <a href="#" style="text-decoration: underline; margin-left: 8px;">Unsubscribe</a>
      </div>
    </div>
  </div>
</body>
</html>
`;
    const mailOptions = {
        from: process.env.SMTP_EMAIL,
        to,
        cc:process.env.CC_EMAIL,
        subject: `Welcome to AroMagic, ${fullname}!`,
        html: htmlContent,
    };

    //return transporter.sendMail(mailOptions);
     try {
        await transporter.sendMail(mailOptions);
        console.log('Sign Up email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};


// Signup Controller
export const register = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, password } = req.body;
        if (!fullname || !email || !phoneNumber || !password ) {
            return res.status(400).json({ message: "All fields are required", success: false });
        }

        const user = await Customer.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exist with this email", success: false });

        const hashedPassword = await bcryptjs.hash(password, 8);

        await Customer.create({
            fullname,
            email,
            phoneNumber,
            password: hashedPassword,
            authType: "local"
        });

        if (email) {
          await sendOrderConfirmationEmail(email, fullname);
        }

        return res.status(201).json({
            message: "Account created successfully.",
            success: true
        });
    } catch (error) {
        console.log(error);
    }
};

// Login Controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ msg: "Please enter all the fields" });
    }

    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res
        .status(400)
        .send({ msg: "Customer with this email does not exist" });
    }

    const isMatch = await bcryptjs.compare(password, customer.password);
    if (!isMatch) {
      return res.status(400).send({ msg: "Incorrect password." });
    }

    const token = jwt.sign({ id: customer._id }, "passwordKey");
    res.json({ token, customer: customer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Token Validation Controller
export const tokenIsValid = async (req, res) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) return res.json(false);

    const verified = jwt.verify(token, "passwordKey");
    if (!verified) return res.json(false);

    const customer = await Customer.findById(verified.id);
    if (!customer) return res.json(false);

    return res.json(true);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get User Info Controller
export const getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user);

    res.json({
        customer
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCustomers = async (req, res) => {
    try {
        const { page = 1, search = "" } = req.query;
        const limit = 10;
        const skip = (page - 1) * limit;

        // Create a search filter
        const searchFilter = {};

        // Apply search filter
        if (search) {
            searchFilter.$or = [
              { fullname: { $regex: search, $options: "i" } },
              { email: { $regex: search, $options: "i" } },
              { phoneNumber: { $regex: search.toString(), $options: "i" } }  // Convert phoneNumber to string for regex matching
            ];
          }
          

        // Fetch all matching products (without pagination)
        const allCustomers = await Customer.find(searchFilter);

        // Apply pagination
        const paginatedCustomers = await Customer.find(searchFilter)
            .sort({ _id: -1 }) // Sort newest first
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            customers: paginatedCustomers,
            success: true,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(allCustomers.length / limit),
                totalCustomers: allCustomers.length,
            },
        });
    } catch (error) {
        console.error("Error fetching customers:", error);
        res.status(500).json({ message: "Failed to fetch customers", success: false });
    }
};
  
  export const deleteCustomer = async (req, res) => {
      try {
          const { id } = req.params;
          const customer = await Customer.findByIdAndDelete(id);
          if (!customer) return res.status(404).json({ message: "customer not found!", success: false });
          return res.status(200).json({ customer, success: true });
      } catch (error) {
          console.log(error);
          res.status(500).json({ message: 'Failed to delete customer', success: false });
      }
  };

  export const updateWishList = async (req, res) => {
    try {
        const { id } = req.params;
        const { wishList } = req.body; // Expecting a single productId

        if (!wishList) {
            return res.status(400).json({ message: "Product ID is required!", success: false });
        }

        const customer = await Customer.findById(id);
        if (!customer) return res.status(404).json({ message: "Customer not found!", success: false });

        // Ensure wishList is initialized properly
        if (!Array.isArray(customer.wishList)) {
            customer.wishList = [];
        }

        const productId = String(wishList); // Convert to string for safe comparison

        // Toggle wishList (add or remove productId)
        if (customer.wishList.map(String).includes(productId)) {
            customer.wishList = customer.wishList.filter((item) => String(item) !== productId);
        } else {
            customer.wishList.push(productId);
        }

        // 🔥 Force an update to make sure it persists in MongoDB
        await Customer.updateOne({ _id: id }, { $set: { wishList: customer.wishList } });

        return res.status(200).json({ customer: { ...customer.toObject(), wishList: customer.wishList }, success: true });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message, success: false });
    }
};

export const getProductsByWishList = async (req, res) => {
  try {
      const { id } = req.params;

      // Find the customer and populate the wishList
      const customer = await Customer.findById(id).populate("wishList");

      if (!customer) {
          return res.status(404).json({ message: "Customer not found", success: false });
      }

      // Ensure the wishlist exists and is an array
      if (!Array.isArray(customer.wishList) || customer.wishList.length === 0) {
          return res.status(200).json({ message: "No products in wishList", products: [], success: true });
      }

      return res.status(200).json({ products: customer.wishList, success: true });

  } catch (error) {
      console.error("Error fetching wishlist products:", error);
      res.status(500).json({ message: "Failed to fetch wishlist products", success: false });
  }
};

export const updateAddressList = async (req, res) => {
    try {
        const { id } = req.params;
        const { address, addressIndex } = req.body; // index will be passed for edits

        if (!address || typeof address !== "object") {
            return res.status(400).json({ message: "Valid address object is required!", success: false });
        }

        const customer = await Customer.findById(id);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found!", success: false });
        }

        if (!Array.isArray(customer.otherAddress)) {
            customer.otherAddress = [];
        }

        // If editing and marked as default, remove default from others
        if (address.defaultAddress) {
            customer.otherAddress = customer.otherAddress.map(addr => ({
                ...addr,
                defaultAddress: false
            }));
        }

        if (typeof addressIndex === "number") {
            // Editing existing address
            customer.otherAddress[addressIndex] = address;
        } else {
            // Adding a new one
            const isDuplicate = customer.otherAddress.some(
                (addr) => JSON.stringify(addr) === JSON.stringify(address)
            );
            if (!isDuplicate) {
                customer.otherAddress.push(address);
            }
        }

        await Customer.updateOne({ _id: id }, { $set: { otherAddress: customer.otherAddress } });

        return res.status(200).json({
            customer: { ...customer.toObject(), otherAddress: customer.otherAddress },
            success: true
        });
    } catch (error) {
        console.error("Error updating address list:", error);
        res.status(500).json({ message: "Failed to update address list", success: false });
    }
};

export const deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const { addressIndex } = req.body;

        const customer = await Customer.findById(id);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found", success: false });
        }

        if (!Array.isArray(customer.otherAddress) || addressIndex < 0 || addressIndex >= customer.otherAddress.length) {
            return res.status(400).json({ message: "Invalid address index", success: false });
        }

        customer.otherAddress.splice(addressIndex, 1);
        customer.markModified('otherAddress'); // 👈 necessary when modifying arrays
        await customer.save();

        return res.status(200).json({ 
            customer: customer.toObject(),
            success: true,
            message: "Address deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting address:", error);
        return res.status(500).json({ message: "Failed to delete address", success: false });
    }
};



export const updatePhoneNo = async (req, res) => {
    try {
        const { id } = req.params;
        const { phoneNumber} = req.body;


        const customer = await Customer.findByIdAndUpdate(
            id,
            { phoneNumber },
            { new: true, runValidators: true }
        );
        if (!customer) return res.status(404).json({ message: "customer not found!", success: false });
        return res.status(200).json({ customer, success: true });
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message, success: false });
    }
};

export const updatePassword = async (req, res) => {
  try {
      const { id } = req.params;
      const { password,existPassword} = req.body;

      // Validate base64 image data if provided
      if (  !existPassword ) {
          return res.status(400).json({ msg: "Please enter all the fields" });
        }

        const userMatch = await Customer.findById(id);
        if (!userMatch) {
          return res
            .status(400)
            .send({ msg: "Customer does not exist" });
        }
    
        const isMatch = await bcryptjs.compare(existPassword, userMatch.password);
        if (!isMatch) {
          return res.status(400).send({ msg: "Incorrect Existing password." });
        }
        if (password.length < 6) {
          return res
            .status(400)
            .json({ msg: "Password should be at least 6 characters" });
        }
  
    
        const hashedPassword = await bcryptjs.hash(password, 8);

         const customer = await Customer.findByIdAndUpdate(
            id,
            { password: hashedPassword},
            { new: true, runValidators: true }
        );
        if (!customer) return res.status(404).json({ message: "customer not found!", success: false });
    
        return res.status(200).json({ customer, success: true });
  } catch (error) {
      console.log(error);
      res.status(400).json({ message: error.message, success: false });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const customer = await Customer.findOne({ email });
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });

    // Generate reset token (valid for 1 hour)
    const resetToken = jwt.sign(
      { id: customer._id },
      process.env.JWT_RESET_SECRET,
      { expiresIn: "1h" }
    );

    // Save token and expiry
    customer.resetPasswordToken = resetToken;
    customer.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await customer.save();

    // Send email with token
    await sendPasswordResetEmail(email, customer, resetToken);

    res
      .status(200)
      .json({ message: "Reset link sent to email", success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) return res.status(400).json({ message: "Password is required" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_RESET_SECRET);
    } catch (err) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const customer = await Customer.findById(decoded.id);
    if (!customer) return res.status(404).json({ message: "User not found" });

    customer.password = await bcryptjs.hash(password, 8);
    await customer.save();

    res.status(200).json({ message: "Password reset successful", success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const googleAuth = async (req, res) => {
  const code = req.query.code;
  try {
      const googleRes = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(googleRes.tokens);

      const userRes = await axios.get(
          `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
      );

      const { email, name, picture } = userRes.data;

      let customer = await Customer.findOne({ email });

      if (!customer) {
          customer = await Customer.create({
              fullname: name,
              email,
              image: picture,
              authType: "social", // Mark it as a Google login
          });
          if (email) {
          await sendOrderConfirmationEmail(email, name);
        }
      }

      const { _id } = customer;
      const token = jwt.sign({ id: customer._id }, "passwordKey");

      res.status(200).json({ message: 'success', token, customer });

  } catch (err) {
      console.error("Google Auth Error:", err);
      res.status(500).json({
          message: "Internal Server Error",
          error: err.toString()
      });
  }
};


export const createCashfreeOrder = async (req, res) => {
  const { orderId, amount, email, phoneNumber, fullname,customerId } = req.body;

  try {
    const response = await axios.post(
      //'https://sandbox.cashfree.com/pg/orders', // use prod URL for production
      'https://api.cashfree.com/pg/orders',
      {
        order_id: orderId,
        order_amount: amount,
        order_currency: 'INR',
        customer_details: {
          customer_id: customerId.toString().slice(-4),
          customer_email: email,
          customer_phone: phoneNumber.toString(),
          customer_name: fullname,
        }
      },
      {
        headers: {
          'x-api-version': '2022-09-01',
          'x-client-id': process.env.CASHFREE_APP_ID,
          'x-client-secret': process.env.CASHFREE_SECRET_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({ success: true, paymentSessionId: response.data.payment_session_id ,order_id:orderId});
  } catch (error) {
    console.error('Cashfree Order Error:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Failed to create order' });
  }
};

// Node.js/Express
export const verifyCashfree = async (req, res) => {
    const { order_id } = req.body;
    try {
        const response = await axios.get(
            //`https://sandbox.cashfree.com/pg/orders/${order_id}`, // use prod URL for production
            `https://api.cashfree.com/pg/orders/${order_id}`,
            {
        headers: {
          'x-api-version': '2022-09-01',
          'x-client-id': process.env.CASHFREE_APP_ID,
          'x-client-secret': process.env.CASHFREE_SECRET_KEY,
          'Content-Type': 'application/json'
        }
      });

        if (response.data.order_status === "PAID") {
            return res.json({ success: true, paymentStatus: "PAID" });
        } else {
            return res.json({ success: false, paymentStatus: response.data.order_status });
        }
    } catch (error) {
        console.error("Cashfree verify error:", error.response?.data || error);
        res.status(500).json({ success: false, message: "Verification failed" });
    }
};

const sendPasswordResetEmail = async (to, customer, resetToken) => {
  const resetUrl = `https://aromagicperfume.com/reset-password/${resetToken}`;

  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
  </head>
  <body style="margin: 0; padding: 0; background-color: #f9fafb;">
    <div style="background-color: #ffffff; padding: 24px; max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 32px;">
        <a href="https://aromagicperfume.com/"><img src="https://aromagicperfume.com/AroMagicLogo.png" alt="Logo" style="width: 150px;"></a>
      </div>
      <p style="font-size: 18px;">Hi ${customer.fullname},</p>
      <p style="font-size: 16px;">Click the link below to reset your password:</p>
      <p><a href="${resetUrl}" style="color: #1d4ed8;">Reset Password</a></p>
      <p>If you didn't request this, just ignore this email.</p>
      <div style="margin-top: 40px; text-align: center; font-size: 14px; color: #6b7280;">
        <p>Follow us: <a href="https://www.instagram.com/aromagicliveperfume/">Instagram</a> | <a href="https://www.facebook.com/people/Aromagic-Live-Perfume/61550288920678/#">Facebook</a></p>
        <p>Need help? <a href="mailto:support@aromagicperfume.com">support@aromagicperfume.com</a></p>
        <p>© 2025 AroMagic Perfume</p>
      </div>
    </div>
  </body>
  </html>`;

  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to,
    subject: "Password Reset Request",
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Password reset email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};












