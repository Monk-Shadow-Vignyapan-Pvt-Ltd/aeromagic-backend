import { User } from '../models/user.model.js';
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import sharp from 'sharp';
import axios from 'axios';
import dotenv from "dotenv";

dotenv.config();

// Signup Controller
export const addUser = async (req, res) => {
  try {
    const { email, password, username, avatar ,isAdmin,roles} = req.body;
    if (!email || !password || !username ) {
      return res.status(400).json({ msg: "Please enter all the fields" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ msg: "Password should be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ msg: "User with the same email already exists" });
    }

    const hashedPassword = await bcryptjs.hash(password, 8);

    if (avatar && !avatar.startsWith('data:image')) {
        return res.status(400).json({ message: 'Invalid image data', success: false });
      }
      let compressedBase64 = "";
    if(avatar){
      const base64Data = avatar.split(';base64,').pop();
      const buffer = Buffer.from(base64Data, 'base64');

      // Resize and compress the image using sharp
      const compressedBuffer = await sharp(buffer)
          .resize(800, 600, { fit: 'inside' }) // Resize to 800x600 max, maintaining aspect ratio
          .jpeg({ quality: 80 }) // Convert to JPEG with 80% quality
          .toBuffer();

      // Convert back to Base64 for storage (optional)
       compressedBase64 = `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;
    }
      
    const newUser = new User({ email, password: hashedPassword, username, avatar:avatar ? compressedBase64 : avatar,isAdmin,roles });

    const savedUser = await newUser.save();
    res.json(savedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login Controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ msg: "Please enter all the fields" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .send({ msg: "User with this email does not exist" });
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({ msg: "Incorrect password." });
    }

    const token = jwt.sign({ id: user._id }, "passwordKey");
    res.json({ token, user: { id: user._id, username: user.username } });
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

    const user = await User.findById(verified.id);
    if (!user) return res.json(false);

    return res.json(true);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get User Info Controller
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user);
    const users = await User.find();
    const filteredUsers = users.map(({ _id, email, username, avatar}) => ({
      _id,
      email,
      username,
      avatar
  }));
   
    res.json({
      username: user.username,
      id: user._id,
      avatar: user.avatar,
      roles:user.roles,
      users:filteredUsers
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        if (!users) return res.status(404).json({ message: "Users not found", success: false });
        return res.status(200).json({ users });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to fetch users', success: false });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, password, username, avatar ,isAdmin,roles} = req.body;

        // Validate base64 image data if provided
        if (!email || !password || !username ) {
            return res.status(400).json({ msg: "Please enter all the fields" });
          }
          if (password.length < 6) {
            return res
              .status(400)
              .json({ msg: "Password should be at least 6 characters" });
          }
    
      
          const hashedPassword = await bcryptjs.hash(password, 8);
      
          if (avatar && !avatar.startsWith('data:image')) {
              return res.status(400).json({ message: 'Invalid image data', success: false });
            }
            let compressedBase64 = "";
            if(avatar){
              const base64Data = avatar.split(';base64,').pop();
              const buffer = Buffer.from(base64Data, 'base64');
        
              // Resize and compress the image using sharp
              const compressedBuffer = await sharp(buffer)
                  .resize(800, 600, { fit: 'inside' }) // Resize to 800x600 max, maintaining aspect ratio
                  .jpeg({ quality: 80 }) // Convert to JPEG with 80% quality
                  .toBuffer();
        
              // Convert back to Base64 for storage (optional)
               compressedBase64 = `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;
            }

        const updatedData = { email, password: hashedPassword, username, avatar:avatar ? compressedBase64 :avatar,isAdmin,roles };

        const user = await User.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });
        if (!user) return res.status(404).json({ message: "User not found!", success: false });
        return res.status(200).json({ user, success: true });
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message, success: false });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        if (!user) return res.status(404).json({ message: "User not found!", success: false });
        return res.status(200).json({ user, success: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to delete user', success: false });
    }
};

export const sendOtp = async (req, res) => {
  const { phoneNumber } = req.body;

  // Generate random 6-digit OTP
  //const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

  const mobile = `91${phoneNumber}`;
  const templateId = '687e343ad6fc05768c3a5402'; // replace with your actual template ID

  const url = `https://control.msg91.com/api/v5/otp?mobile=${mobile}&authkey=${process.env.MSG91_AUTH_KEY}&otp_expiry=5&otp_length=6&template_id=${templateId}&realTimeResponse=1`;

  const body = {
    Param1: "var1",
    // Add Param2, Param3 if your template requires them
  };

  try {
    const response = await axios.post(url, body, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Optionally store OTP in DB or cache for verification
    res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    console.error('MSG91 error:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
};

export const verifyOtp = async (req, res) => {
  const { otp, mobile } = req.body;

  try {
    const response = await axios({
      method: 'GET',
      url: 'https://control.msg91.com/api/v5/otp/verify',
      params: {
        otp,
        mobile: `91${mobile}`,
      },
      headers: {
        authkey: process.env.MSG91_AUTH_KEY,
      },
    });

    const msg91Response = response.data;

    // handle success or failure from MSG91
    if (msg91Response.type === 'success') {
      return res.status(200).json({ success: true, data: msg91Response });
    } else {
      return res.status(400).json({ success: false, message: msg91Response.message });
    }
  } catch (error) {
    console.error('OTP verify error:', error.response?.data || error.message);
    return res.status(500).json({ success: false, message: 'OTP verification failed' });
  }
}

export const resendOtp = async (req, res) => {
  const { phoneNumber, retryType = 'text' } = req.body;
  const mobile = `91${phoneNumber}`;
  const authkey = process.env.MSG91_AUTH_KEY;

  const url = `https://control.msg91.com/api/v5/otp/retry?authkey=${authkey}&retrytype=${retryType}&mobile=${mobile}`;

  try {
    const response = await axios.get(url);

    res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    console.error('MSG91 Resend OTP error:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Failed to resend OTP' });
  }
};

