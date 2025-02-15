const router = require ("express").Router ()
const todoRoutes = require ("./todo")
const userRoutes = require ("./user")
const { cekLogin } = require ("../middlewares/auth")
const QuotesController = require("../controllers/quotesController")




router.get ("/", (req, res) => {
    res.send ( "Welcome" )
})

router.use ("/users", userRoutes)

router.use (cekLogin)

router.use ("/todos", todoRoutes)

router.get ("/RandomQuote", QuotesController.getQuotes)


module.exports = router