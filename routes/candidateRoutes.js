const express = require("express");
const User = require("../models/user");
const Candidate = require("../models/candidate");
const router = express.Router();
const { generateToken, jwtMiddleware } = require("../jwt");

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

///Chcking if role is admin or not bcoz admin can only update the candidate
const checkAdminRole = async (userID) => {
  try {
    const user = await User.findById(userID);
    if (user.role === "admin") {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};
//Creating a candidate only admin has acess for this
router.post("/", jwtMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id)))
      return res
        .status(403)
        .json({ msg: "Only Admin has access to this page" });

    const body = req.body;

    const newcandidate = new Candidate(body);
    const result = await newcandidate.save();

    res.status(200).json({ result: result });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error!!" });
  }
});

///Updating the candidate
router.put("/:candidateId", jwtMiddleware, async (req, res) => {
  try {
    if (!checkAdminRole(req.user.id))
      return res
        .status(404)
        .json({ error: "Only Admin has access to this page" });
    const id = req.params.candidateId;
    const body = req.body;
    const updatededCandidate = await Candidate.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!updatededCandidate) {
      return res.status(403).json("candidate not found");
    }
    res.status(200).json({
      msg: "Candidate Updated Successfully!!",
      UpdatedCandidate: updatededCandidate,
    });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error!" });
  }
});

//Deleting a candidate
router.delete("/:candidateId", jwtMiddleware, async (req, res) => {
  try {
    if (!checkAdminRole(req.user.id))
      return res
        .status(404)
        .json({ error: "Only Admin has access to this page" });
    const id = req.params.candidateId;
    const deleteUser = await Candidate.findByIdAndDelete(id);
    if (!deleteUser) {
      return res.status(403).json({ msg: "candidate not found!" });
    }
    res.status(200).json({ msg: "Candidate Deleted Successfully!!" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error!!" });
  }
});

///Adding votes route so user can be added

router.post("/vote/:candidateId", jwtMiddleware, async (req, res) => {
  const candidateID = req.params.candidateId;
  const userId = req.user.id;
  try {
    const candidate = await Candidate.findById(candidateID);
    if (!candidate) {
      return res.status(404).json({ msg: "candidate not found" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (user.isVoted) {
      return res.status(400).json({ msg: "YOU HAVE ALREADY VOTED!!" });
    }

    if (user.role == 'admin') {
      return res.status(403).json({ msg: "ADMIN CANNOT VOTE" });
    }
    //updating the candidate document to record the vote
    candidate.votes.push({ user: userId });
    candidate.voteCount++;
    await candidate.save();

    //update the user document
    user.isVoted = true;
    await user.save();

    res.status(200).json({ msg: "YOU HAVE VOTED SUCCESSFULLY ✅" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

//Vote count

router.get("/vote/count", async(req, res) => {
  try {
    const candidates = await Candidate.find().sort({ voteCount: "desc" });
    const voteRecord = candidates.map((data) => {
      return {
        party: data.party,
        voteCount: data.voteCount,
      };
    });
    return res.status(200).json(voteRecord);
  } catch (error) {
    console.log(error);

    res.status(500).json({ error: "Internal server error" });
  }
});

//Getting a list of candidates

router.get("/",async(req,res)=>{
  try {
    const candidate= await Candidate.find({}, {name:1,party:1,_id:0})
  if(!candidate){
    return res.status(404).json({message:"List of candidates are not available!"})
  }
  return res.status(200).json({candidated:candidate})
  } catch (error) {
    
  }
  
})

module.exports = router;
