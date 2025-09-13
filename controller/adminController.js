
const User = require("../model/User");
const Portfolio = require("../model/Portfolio");
const Fund = require("../model/Fund");

// GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/portfolios
exports.getAllPortfolios = async (req, res) => {
  try {
    const portfolios = await Portfolio.find().populate("userId", "username email");
    res.json({ success: true, data: portfolios });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/popular-funds

// exports.getPopularFunds = async (req, res) => {
//   try {
//     const popular = await Portfolio.aggregate([
//       { $group: { _id: "$schemeCode", totalUnits: { $sum: "$units" }, count: { $sum: 1 } } },
//       { $sort: { totalUnits: -1 } },
//       { $limit: 10 },
//       {
//         $lookup: {
//           from: "funds",
//           localField: "_id",
//           foreignField: "schemeCode",
//           as: "fundDetails"
//         }
//       },
//       { $unwind: "$fundDetails" },
//       {
//         $project: {
//           schemeCode: "$_id",
//           schemeName: "$fundDetails.schemeName",
//           totalUnits: 1,
//           count: 1
//         }
//       }
//     ]);
//     res.json({ success: true, data: popular });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// GET /api/admin/stats
exports.getSystemStats = async (req, res) => {
  try {
    const [totalUsers, totalPortfolios, totalFunds] = await Promise.all([
      User.countDocuments(),
      Portfolio.countDocuments(),
      Fund.countDocuments(),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalPortfolios,
        totalFunds,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
