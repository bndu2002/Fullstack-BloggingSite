const userModel = require('../models/userModel')
const bcrypt = require("bcrypt")
const nodemailer = require('nodemailer')
const { isValidMail, isValid, isValidName, isValidRequestBody, isValidPassword } = require("../validator/validator");
const jwt = require('jsonwebtoken')
//const index = require('../view/index.ejs')



const regsiterUser = async function (req, res) {
    try {

        let { fname, lname, title, email, password } = req.body;

        // validation for empty for body.
        //if (!isValidRequestBody(req.body)) return res.status(400).send({ status: false, msg: "Plz enter some data." });

        // validation for empty string.
        if (!isValid(fname)) return res.status(400).send({ status: false, msg: "fname is  requred" });

        //.test() method tests for a match in a string ,if finds returns true else false (ES1)
        //checking for valid regex of fname
        if (!isValidName.test(fname)) return res.status(400).send({ status: false, msg: "Enter a valid first name" });

        //validation for valid string.
        if (!isValid(lname)) return res.status(400).send({ status: false, msg: "lname is requred" });

        //checking for valid regex of lname
        if (!isValidName.test(lname)) return res.status(400).send({ status: false, msg: "Enter a valid last name" });

        //.includes() method return true if a string contains specified string else false , it is case sensitive
        // validation for title
        if (!isValid(title)) return res.status(400).send({ status: false, msg: "Title is required" });

        if (!(["Mr", "Mrs", "Miss"]).includes(title)) return res.status(400).send({ status: false, msg: "Enter a valid title " });
        // validation for email id
        if (!isValid(email)) return res.status(400).send({ status: false, msg: "mail id is required" });

        // validation for unique id.
        let uniqueEmail = await userModel.findOne({ email: email });
        if (uniqueEmail) { return res.status(400).send({ status: false, msg: "Email Already Exists." }); }

        // validation for valid regex of email id
        if (!isValidMail.test(email)) return res.status(400).send({ status: false, msg: "Invalid email id" });



        // validation for password (presend & valid through regex)
        if (!isValid(password)) return res.status(400).send({ status: false, msg: "password is required" });

        if (!isValidPassword.test(password)) return res.status(400).send({ status: false, msg: "enter a valid password" })

        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(password, salt)

        let userData = {
            fname: fname,
            lname: lname,
            email: email,
            title: title,
            password: hashedPassword,
        }

        console.log(userData)

        let savedData = await userModel.create(userData);

        return res.status(201).send({ status: true, message: "User profile is created successfully.", data: savedData, });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

const LoginUser = async function (req, res) {
    try {

        let { email, password } = req.body

        if (!isValidRequestBody(req.body)) return res.status(400).send({ status: false, msg: "request body can't be empty enter some data.", });

        if (!isValid(email)) return res.status(400).send({ status: false, msg: "email required" });

        if (!isValid(password)) return res.status(400).send({ status: false, msg: "password is required" });

        let verifyUser = await userModel.findOne({ email: email });

        if (!verifyUser) { return res.status(400).send({ status: false, msg: "user not found" }); }

        let checkPassword = await bcrypt.compare(password, verifyUser.password)

        if (!checkPassword) return res.status(400).send({ status: false, msg: "Incorrect Password" })

        let token = jwt.sign(
            {
                userId: verifyUser._id.toString(),
                project: 1,
                group: 56,
                batch: "Plutonium",
            },
            "thou-hath-the-poer"
        );

        res.cookie("jwtoken", token, {
            expires: new Date(Date.now() + 25892000000),
            httpOnly: true
        })
        
        res.setHeader("x-api-key", token);

        return res.status(200).send({ status: true, msg: "logged in successfully", token: token });
    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}

const forgotPassword = async function (req, res) {
    try {

        let findUser = await userModel.findOne({ email: req.body.email })

        console.log(findUser)

        if (!findUser) return res.status(404).send({ status: false, msg: "user not found" })

        let secret = "thou-hath-the-poer"

        let token = jwt.sign({ email: findUser.email, id: findUser._id.toString() }, secret, { expiresIn: "5m" })

        let link = `http://localhost:3001/reset-password/${findUser._id}/${token}`

        console.log(link)
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: "localhostport3001@gmail.com",
                pass: "tuurburhcdcqswuc"
            }
        });

        var mailOptions = {
            from: 'localhostport3001@gmail.com',
            to: req.body.email,
            subject: 'Sending Email using Node.js',
            text: link
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        console.log(link)
        return res.status(200).send({ status: true, msg: "success" })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

const resetPassword = async (req, res) => {
    try {
        let { id, token } = req.params

        let findUser = await userModel.findById(id)

        if (!findUser) return res.status(404).send({ status: false, msg: "user not found" })

        let verify = jwt.verify(token, "thou-hath-the-poer",)

        res.render("index", { email: verify.email, status: "not verified" });

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

const newPassword = async (req, res) => {
    try {
        let { id, token } = req.params

        let { password, confirmPassword } = req.body

        let findUser = await userModel.findById(id)

        if (!findUser) return res.status(404).send({ status: false, msg: "user not found" })

        let verify = jwt.verify(token, "thou-hath-the-poer",)

        if (!isValidPassword.test(password)) return res.status(400).send({ status: false, msg: "enter a valid password" })

        if (password !== confirmPassword) return res.status(400).send({ status: false, msg: "incorrect password" })

        const salt = await bcrypt.genSalt(10);

        let encryptPassword = await bcrypt.hash(password, salt);

        await userModel.findByIdAndUpdate(
            { _id: id },
            { $set: { password: encryptPassword } },
            { new: true }
        )

        res.render("index", { email: verify.email, status: "verified" });
        //res.status(200).send({status :true,msg:"password updated"})


    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

module.exports = { regsiterUser, LoginUser, forgotPassword, resetPassword, newPassword }

