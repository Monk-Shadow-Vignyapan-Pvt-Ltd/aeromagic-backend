import { Customer } from '../models/customer.model.js';
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import sharp from 'sharp';
import { oauth2Client } from '../utils/googleClient.js';


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
    res.json({ token, customer: { id: customer._id, fullname: customer.fullname,email:customer.email,phoneNumber:customer.phoneNumber } });
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
        fullname: customer.fullname,email:customer.email,phoneNumber:customer.phoneNumber,id: customer._id,wishList:customer.wishList,otherAddress:customer.otherAddress
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCustomers = async (req, res) => {
    try {
        const customers = await Customer.find();
        if (!customers) return res.status(404).json({ message: "customers not found", success: false });
        return res.status(200).json({ customers });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to fetch customers', success: false });
    }
};


export const resetPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { email,password,existPassword, fullname, phoneNumber} = req.body;
  
        // Validate base64 image data if provided
        if (!email || !existPassword  || !fullname ) {
            return res.status(400).json({ msg: "Please enter all the fields" });
          }
  
          const userMatch = await Customer.findOne({ email });
          if (!userMatch) {
            return res
              .status(400)
              .send({ msg: "Customer with this email does not exist" });
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
      
         
  
        const updatedData = { email,password: hashedPassword, fullname, phoneNumber};
  
        const customer = await Customer.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });
        if (!customer) return res.status(404).json({ message: "customer not found!", success: false });
        return res.status(200).json({ customer, success: true });
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message, success: false });
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
      const { address } = req.body; // Address is an object

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

       // If the new address is marked as default, remove default from others
       if (address.defaultAddress) {
        customer.otherAddress = customer.otherAddress.map(addr => ({
            ...addr,
            defaultAddress: false
        }));
    }

      // Check if the address already exists in the array
      const isDuplicate = customer.otherAddress.some(
          (addr) => JSON.stringify(addr) === JSON.stringify(address)
      );

      if (!isDuplicate) {
          // Add the new address if it's not a duplicate
          customer.otherAddress.push(address);
          await Customer.updateOne({ _id: id }, { $set: { otherAddress: customer.otherAddress } });
      }

      return res.status(200).json({ 
          customer: { ...customer.toObject(), otherAddress: customer.otherAddress },
          success: true 
      });
  } catch (error) {
      console.error("Error updating address list:", error);
      res.status(500).json({ message: "Failed to update address list", success: false });
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
      }

      const { _id } = customer;
      const token = jwt.sign({ _id, email }, process.env.SECRET_KEY, {
          expiresIn: process.env.JWT_TIMEOUT,
      });

      res.status(200).json({ message: 'success', token, customer });

  } catch (err) {
      console.error("Google Auth Error:", err);
      res.status(500).json({
          message: "Internal Server Error",
          error: err.toString()
      });
  }
};









