const Router = require("express").Router();
const { login, user } = require("../config/index");
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const { generateOTP } = require("../utils/otp");
const { sendOTPEmail } = require("../utils/mailer");
const SECRET_KEY = process.env.JWT_SECRET;

Router.post("/check", async (req, res) => {
  const { email, password } = req.body;

  try {
    const loginUser = await login.findOne({
      where: { email, password },
      raw: true,
    });

    if (!loginUser) {
      return res.status(404).send("Invalid email or password");
    }

    const userData = await user.findOne({
      where: { id: loginUser.candidateId },
      attributes: ["firstname", "lastname"],
      raw: true,
    });

    const fullName = userData
      ? `${userData.firstname} ${userData.lastname}`
      : "";

    const token = jwt.sign(
      {
        userId: loginUser.id,
        email: loginUser.email,
        role: loginUser.role,
        username: loginUser.username,
        candidateId: loginUser.candidateId,
        cid: loginUser.cid,
        name: fullName,
      },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.send({ token });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});
Router.post("/admin/users", async (req, res) => {
  const { username, email, password, role, companyId } = req.body;
  try {
    const newUser = await login.create({
      username: username,
      email: email,
      password: password,
      role: role,
      cid: companyId,
    });
    res.status(201).send(newUser);
  } catch (error) {
    res.status(500).send("User creation failed", err);
  }
});
Router.post("/auth/send-otp", async (req, res) => {
  const { email } = req.body;
  const user = await login.findOne({ where: { email } });

  if (!user) return res.status(404).json({ error: "User not found" });

  const otp = generateOTP();
  const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry

  user.resetOtp = otp;
  user.otpExpiry = expiry;
  await user.save();

  await sendOTPEmail(email, otp);
  res.json({ message: "OTP sent to email" });
});
Router.post("/auth/verify-otp", async (req, res) => {
  const { email, otp, password } = req.body;
  const userData = await login.findOne({ where: { email } });

  if (!userData || userData.resetOtp !== otp || userData.otpExpiry < new Date()) {
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }
  userData.password = password;
  userData.resetOtp = null;
  userData.otpExpiry = null;
  await userData.save();
  // const data = await user.findOne({ where: { email }, raw:true });
  // console.log(data);
  
  // if (data.email === email) {
  //   data.password = password;
  //   await data.save();
  // }

  res.json({ message: "Password reset successfully" });
});
Router.get("/user", async (req, res) => {
  try {
    const data = await login.findAll();
    res.json(data); // sends data as JSON array to the frontend
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).send("Failed to fetch users");
  }
});
Router.get("/user/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const data = await login.findOne({ where: { id }, raw: true });
    if (data) {
      res.send(data);
    } else {
      res.send("User Not Found");
    }
  } catch (err) {
    res.send("Server Error");
  }
  // console.log(data);
});
Router.get("/admin/user/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const data = await login.findOne({ where: { id }, raw: true });
    if (data) {
      res.send(data);
    } else {
      res.send("User Not Found");
    }
  } catch (err) {
    res.send("Server Error");
  }
  // console.log(data);
});
Router.get("/all", async (req, res) => {
  try {
    const data = await login.findAll({
      where: {
        cid: {
          [Op.ne]: null,
        },
      },
    });
    res.send(data);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).send("Failed to fetch users");
  }
});
Router.get("/user/company/:companyId", async (req, res) => {
  const { companyId } = req.params;
  try {
    const users = await login.findAll({ where: { cid: companyId } }); // Adjust model if needed
    res.status(200).send(users);
  } catch (err) {
    console.error("Error fetching users for company:", err);
    res.status(500).send("Failed to fetch users", err);
  }
});
Router.delete("/user/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await login.destroy({ where: { id } });

    if (deleted) {
      res.send("User deleted successfully");
    } else {
      res.status(404).send("User not found");
    }
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).send("Failed to delete user");
  }
});
Router.put("/admin/user/:id", async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const update_user = await login.update(data, { where: { id }, raw: true });
    if (update_user) {
      res.send("User Updated");
    } else {
      res.status(404).send("User Not Found");
    }
  } catch (err) {
    res.status(500).send("Update Failed");
  }
});
Router.put("/updatePassword", async (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;
  if (!userId || !oldPassword || !newPassword) {
    return res.status(400).json({ message: "All fields are required." });
  }
  try {
    const user = await login.findOne({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.password !== oldPassword) {
      return res.status(401).json({ message: "Old password is incorrect." });
    }

    user.password = newPassword;
    await user.save();

    res.send("Password updated successfully.");
  } catch (err) {
    console.error("Error updating password:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = Router;
