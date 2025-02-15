const { OAuth2Client } = require('google-auth-library');


const { User } = require ("../models")
const { checkPassword } = require ("../helpers/bcrypt")
const { getToken } = require ("../helpers/jwt")


class UserController {

    static register (req, res, next) {

        const { email, password } = req.body

        User.create ({ email, password })
        .then (result => {
            const output = {
                id: result.id,
                email: result.email
            }
            return res.status (201).json (output)
        })
        .catch (err => {
            next (err)
        })
    }

    static login (req, res, next) {

        const { email, password } = req.body

        User.findOne ({
            where: {
                email
            }
        })
        .then (result => {
            if (!result) {
                next ({ name: "Unauthorized", message: "Invalid Email / Password" })
            }

            const isMatch = checkPassword (password, result.password)

            if (isMatch) {
                const payload = {
                    id : result.id,
                    email : result.email
                }

                const access_token = getToken (payload)
                
                return res.status (200).json ({
                    access_token
                })

            } else {
                next ({ name: "Unauthorized", message: "Invalid Email / Password" })
            }
            
        })
        .catch (err => {
            next (err)
        })
        
    }

    static loginGoogle (req, res, next) {
        // console.log(req.body.id_token)
        const { id_token } = req.body
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        let email = ""

        client.verifyIdToken({
            idToken: id_token,
            audience: process.env.GOOGLE_CLIENT_ID
        })
        .then (ticket => {
            const payload = ticket.getPayload();
            // console.log(payload)
            email = payload.email

            //setelah dapat email, kita cocokkan apakah di database User email telah terdaftar
            //jika belum, maka diregistrasikan lalu generate JWT
            //jika sudah, generate JWT
            //setelahnya baru kita kembalikan via res.status

            return User.findOne({
                where: {
                    email
                }
            })     
        })
        .then (result => {
            // console.log(result)
            if (!result) {
                return User.create ({
                    email,
                    password: Math.floor(Math.random()*1000) + "Pass"
                })
            } else {
                return result
            }
        })
        .then (result => {
            
            const payload = {
                id : result.id,
                email : result.email
            }

            const access_token = getToken (payload)
            
            return res.status (200).json ({
                access_token
            })

        })
        .catch (err => {
            console.log(err)
            next(err)
        })
    }
}

module.exports = UserController