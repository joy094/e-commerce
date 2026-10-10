//auth controller

import { comparePassword, hashPassword } from "../helpers/auth_helper.js";
import user_model from "../model/user_model.js";
import orderModel from "../model/orderModel.js"; // নতুন অর্ডার মডেল ইমপোর্ট
import userModel from "../model/user_model.js"; // নতুন ইউজার মডেল ইমপোর্ট
import JWT from "jsonwebtoken";


//REGISTE ROUTE LOGIC POST

export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone, address, answer } = req.body;
    //validation
    if (!name) {
      return res.send({ message: "name is required" });
    }
    if (!email) {
      return res.send({ message: "email is required" });
    }
    if (!password) {
      return res.send({ message: "password is required" });
    }
    if (!phone) {
      return res.send({ message: "phone is required" });
    }
    if (!address) {
      return res.send({ message: "address is required" });
    }
    if (!answer) {
      return res.send({ message: "answer is required" });
    }
    //check user database
    const existingUser = await user_model.findOne({ email });
    //existing user database
    if (existingUser) {
      return res
        .status(200)
        .send({ success: false, message: "Already register please login" });
    }

    //

    //register user hash password
    const hashedPassword = await hashPassword(password);

    // save

    const user = await new user_model({
      name,
      email,
      phone,
      address,
      password: hashedPassword,
      answer,
    }).save();
    res
      .status(201)
      .send({ success: true, message: "User Register Successfully", user });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error is registetion",
    });
  }
};

//LOGIN ROUTE LOGIC POST
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    //validation
    if (!email || !password) {
      return res
        .status(404)
        .send({ status: false, message: "invalid email or password" });
    }

    //check user
    const checkUser = await user_model.findOne({ email });
    if (!checkUser) {
      return res
        .status(404)
        .send({ success: false, message: "email is not registerd" });
    }

    //match user

    const match = await comparePassword(password, checkUser.password);
    if (!match) {
      return res
        .status(200)
        .send({ success: false, message: "invalid pasword" });
    }

    //token
    const token = await JWT.sign(
      { _id: checkUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    res.status(200).send({
      success: true,
      message: "login succesfully",
      user: {
        name: checkUser.name,
        email: checkUser.email,
        phone: checkUser.phone,
        addres: checkUser.address,
        role: checkUser.role,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error in login  ",
      error,
    });
  }
};

//forget password controller
export const forgotPasswordController = async (req, res) => {
  try {
    const { email, answer, newPassword } = req.body;
    //validation
    if (!email) {
      return res.send({ message: "email is required" });
    }
    if (!answer) {
      return res.send({ message: "answer is required" });
    }
    if (!newPassword) {
      return res.send({ message: "new password is required" });
    }
    //check user validation
    const user = await user_model.findOne({ email, answer });
    if (!user) {
      return res.status(200).send({
        success: false,
        message: "wrong email or answer",
      });
    }
    //hash password
    const hashedPassword = await hashPassword(newPassword);
    //update password
    await user_model.findByIdAndUpdate(user._id, {
      password: hashedPassword,
    });
    res.status(200).send({
      success: true,
      message: "password reset successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error in forgot password",
      error,
    });
  }
};

//test controller
export const testController = (req, res) => {
  res.send("router protected");
};
// update profile controller
export const updateProfileController = async (req, res) => {
  try {
    const { name, email, password, address, phone } = req.body;

    // রিকোয়েস্ট থেকে ইউজার খুঁজে বের করা (যা requireSignIn মিডলওয়্যার থেকে আসছে)
    const user = await user_model.findById(req.user._id);

    // পাসওয়ার্ড আপডেট করতে চাইলে তার ভ্যালিডেশন
    if (password && password.length < 6) {
      return res.json({
        error: "Password is required and should be at least 6 characters long",
      });
    }

    // পাসওয়ার্ড থাকলে হ্যাশ করা, না থাকলে পুরোটাই রাখা
    const hashedPassword = password ? await hashPassword(password) : undefined;

    const updatedUser = await user_model.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        password: hashedPassword || user.password,
        phone: phone || user.phone,
        address: address || user.address,
      },
      { new: true }, // এটি আপডেট হওয়া নতুন ডাটা রিটার্ন করবে
    );

    res.status(200).send({
      success: true,
      message: "Profile Updated Successfully",
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error While Updating Profile",
      error,
    });
  }
};

// Admin এর জন্য সব অর্ডার দেখার কন্ট্রোলার

export const getAllOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate("products", "-photo") // প্রোডাক্ট পপুলেট
      .populate("buyer", "name phone") // এই লাইনটিই মিসিং ছিল, বায়ারের নাম ও ফোন নিয়ে আসবে
      .sort({ createdAt: -1 });

    res.status(200).send(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error While Getting Orders",
      error,
    });
  }
};

// Admin এর জন্য অর্ডার স্ট্যাটাস আপডেট করার কন্ট্রোলার
export const updateOrderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const order = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true },
    );
    res.json({ success: true, message: "Order status updated", order });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ success: false, message: "Error while updating order status" });
  }
};

// Admin এর জন্য সব ইউজার দেখার কন্ট্রোলার

export const getAllUsersController = async (req, res) => {
  try {
    const users = await userModel.find({}).sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      users,
    });
  } catch (error) {
    res
      .status(500)
      .send({ success: false, message: "Error in fetching users" });
  }
};

// ইউজারের নিজস্ব অর্ডার দেখার কন্ট্রোলার
export const getOrdersController = async (req, res) => {
  try {
    // req.user._id আসছে requireSignIn মিডলওয়্যার থেকে
    const orders = await orderModel
      .find({ buyer: req.user._id })
      .populate("products", "-photo") // প্রোডাক্টের ডিটেইলস (ছবি ছাড়া)
      .populate("buyer", "name") // বায়ারের নাম
      .sort({ createdAt: -1 }); // নতুন অর্ডার আগে দেখাবে

    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error While Getting Orders",
      error,
    });
  }
};
