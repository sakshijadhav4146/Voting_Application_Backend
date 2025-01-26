const express = require("express");
const User = require("../models/user");
const router = express.Router();
const { generateToken, jwtMiddleware } = require("../jwt");

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

router.post("/signup", async (req, res) => {
  try {
    const body = req.body;
    ///check if there already admin present bcoz admin will be only one
    const checkAdmin = await User.findOne({role:"admin"})
    if(body.role=="admin" && checkAdmin){
      return res.status(400).json({error:"Admin already exists"})
    }
    const user = new User(body);
    const savedUser = await user.save();
    const payload = {
      id: savedUser.id,
    };
    
    const token = generateToken(payload);
    res
      .status(200)
      .json({ msg: "User Created", token: token, user: savedUser });
  } catch (err) {
    console.log(err);
    
    res.status(500).json({ msg: "Internal server error!"});
  }
});

router.post("/login", async (req, res) => {
  try {
    const { aadharCardNumber, password } = req.body;
    const user = await User.findOne({ aadharCardNumber: aadharCardNumber });
    if (!(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    const payload = {
      id: user.id,
    };
    const token = generateToken(payload);
    res.json({ token });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error!" });
  }
});

router.get("/profile", jwtMiddleware, async (req, res) => {
  try {
    const userData = req.user;
    const userId = userData.id;
    const user = await User.findOne(userId);
    res.status.json({ user });
  } catch (error) {
    res.status(500).json("Internal server error!!");
  }
});

router.put("/profile/password", jwtMiddleware, async (req, res) => {
  try {
    const userId = req.user;
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(userId);
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ error: "Invalid password" });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ msg: "Password Updated Successfully!!" });
  } catch (error) {
    res.status(500).json("Internal server error!!");
  }
});

module.exports = router;
