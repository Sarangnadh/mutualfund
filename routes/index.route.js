
let express = require('express')
let router = express.Router();

let authRouter = require('./authRoutes');
let PortfolioRouter = require('./portfolioRoutes')
let fundRouter =require('./fundRoutes')
let navRouter =require('./navRoutes')
let adminRouter =require('./adminRoutes')

router.use('/auth', authRouter)
router.use('/portfolio', PortfolioRouter)
router.use('/funds',fundRouter)
router.use('/nav',navRouter)
router.use('/admin',adminRouter)


router.get('/', function (req, res, next) {
    res.json("App ready");
});
module.exports = router