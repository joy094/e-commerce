export const verifyOtpAndPlaceOrderController = async (req, res) => {
  try {
    const { phone, otp, orderData } = req.body;

    if (!phone || !otp) {
      return res
        .status(400)
        .send({ success: false, message: "Phone and OTP are required" });
    }

    // ১. ডাটাবেসে OTP টি খোঁজা
    const validOtp = await OtpModel.findOne({ phone, otp });

    if (!validOtp) {
      return res.status(400).send({
        success: false,
        message: "Invalid or Expired OTP!",
      });
    }

    // ২. OTP সঠিক হলে সেটি সাথে সাথে ডিলিট করে দেওয়া (যাতে দ্বিতীয়বার ব্যবহার না হয়)
    await OtpModel.deleteOne({ _id: validOtp._id });

    // ৩. 🔴 এখানে আপনার মূল Order সেভ করার লজিক লিখবেন
    // const newOrder = await new OrderModel(orderData).save();

    res.status(200).send({
      success: true,
      message: "OTP Verified and Order placed successfully!",
      // order: newOrder
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in verifying OTP",
      error,
    });
  }
};
