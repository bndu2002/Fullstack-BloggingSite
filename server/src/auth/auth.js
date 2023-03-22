const jwt = require('jsonwebtoken')


const authenticate = async function (req, res, next) {
    try {

        let token = req.cookies.jwtoken


        // if (!token) return res.status(400).send({ status: false, msg: "token must be present in the request header" })

        jwt.verify(token, "thou-hath-the-poer", function (err, decode) {
            if (err) {
                return res.status(401).send({ status: false, msg: err.message })
            }
            req.token = token
            req.decodedToken = decode

            next()
        })

    } catch (error) {
        return res.status(500).send({ msg: error.message })
    }
}

module.exports = { authenticate }