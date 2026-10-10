import OtpModel from "../model/otpModel.js";
import axios from "axios";

export const sendOrderOtpController = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res
        .status(400)
        .send({ success: false, message: "Phone number is required" });
    }

    // ১. একটি ৬-ডিজিটের র‍্যান্ডম OTP জেনারেট করা
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // ২. একই নম্বরে আগের কোনো OTP থাকলে সেটি ডিলিট করে দেওয়া
    await OtpModel.deleteMany({ phone });

    // ৩. নতুন OTP ডাটাবেসে সেভ করা (TTL ইনডেক্সের কারণে ৫ মিনিট পর অটো ডিলিট হবে)
    await new OtpModel({ phone, otp }).save();

    // ৪. API Credentials (এগুলো .env ফাইলে রাখাই সবচেয়ে নিরাপদ)
    // .env এ না রাখলে সরাসরি স্ট্রিং হিসেবে 'yRFU9d2jENZHIZzBWE2z' ব্যবহার করতে পারেন
    const apiKey = process.env.BULK_SMS_API_KEY || "yRFU9d2jENZHIZzBWE2z";
    const senderId = process.env.BULK_SMS_SENDER_ID || ""; // আপনার অ্যাপ্রুভড Sender ID এখানে দিন

    // ৫. Bulk SMS BD এর নির্দেশিত সঠিক OTP ফরম্যাট
    const message = `RupomiqBd OTP is ${otp}`;

    // মেসেজ টেক্সটকে URL এনকোড করা (ড্যাশবোর্ডের নির্দেশনা অনুযায়ী স্পেশাল ক্যারেক্টারের জন্য)
    const encodedMessage = encodeURIComponent(message);

    // ৬. API URL তৈরি করা
    const smsApiUrl = `http://bulksmsbd.net/api/smsapi?api_key=${apiKey}&type=text&number=${phone}&senderid=${senderId}&message=${encodedMessage}`;

    // ৭. Axios দিয়ে GET রিকোয়েস্ট পাঠানো
    const response = await axios.get(smsApiUrl);

    // API থেকে রেসপন্স সফল হলে ফ্রন্টএন্ডে সাকসেস মেসেজ পাঠানো
    if (response.status === 200) {
      res.status(200).send({
        success: true,
        message: "OTP sent successfully via Bulk SMS BD",
      });
    } else {
      throw new Error("Failed to send SMS through API");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in sending OTP",
      error: error.message,
    });
  }
};
