const asynchandler = require("express-async-handler")
const validator = require("validator")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { checkEmpty } = require("../utils/checkEmpty")
const Admin = require("../models/Admin")
const sendEmail = require("../utils/email")

exports.registerAdmin = asynchandler(async (req, res) => {
    const { name, email, password } = req.body
    const { isError, error } = checkEmpty({ name, email, password })
    if (isError) {

        res.status(400).json({ message: "All feilds Required", error })
    }
    if (!validator.isEmail(email)) {
        res.status(400).json({ message: "invalid Email" })
    }
    // if (!validator.isStrongPassword(password)) {
    //     res.status(400).json({ message: "provide strong password" })
    // }

    const isFound = await Admin.findOne({ email })
    if (isFound) {
        return res.status(400).json({ message: "email already registered with us" })

    }

    const hash = await bcrypt.hash(password, 10)
    await Admin.create({ name, email, password: hash })
    res.json({ message: "register success" })
})

exports.loginAdmin = asynchandler(async (req, res) => {
    const { email, password } = req.body
    const { isError, error } = checkEmpty({ email, password })
    if (isError) {
        return res.status(400).json({ message: "All Fields required", error })
    }
    if (!validator.isEmail(email)) {
        return res.status(400).json({ message: "Invalid Email" })
    }
    const result = await Admin.findOne({ email })
    if (!result) {
        return res.status(401).json({ message: "Email not found" })
    }
    const isVerify = await bcrypt.compare(password, result.password)

    if (!isVerify) {
        return res.status(401).json({
            message: process.env.NODE_ENV === "development" ?
                "Invalid password" : "Invalid credentials"
        })
    }

    //send otp logic

    const otp = Math.floor(10000 + Math.random() * 900000) //nanoid 

    await Admin.findByIdAndUpdate(result._id, { otp })

    await sendEmail({
        to: email, subjec: `Login Otp`, message: `
        <h1>Do not share your Account OTP</h1>
        <p>your login otp ${otp}</p>
        `})

    res.json({ message: "Credentials verify Success. OTP send to your registered email." })
})

exports.verifyotp = asynchandler(async (req, res) => {
    const { otp, email } = req.body
    const { isError, error } = checkEmpty({ otp, email })
    if (isError) {
        return res.status(400).json({ message: "All Fields required", error })
    }
    if (!validator.isEmail(email)) {
        return res.status(400).json({ message: "Invalid Email" })
    }

    const result = await Admin.findOne({ email })
    if (!result) {
        return res.status(401).json({ message: process.env.NODE_ENV === "decelopment" ? "INVALID PASSWORD" : "Invalid Credentials" })
    }

    if (otp !== result.otp) {
        return res.status(401).json({ message: "Invalid OTP" })
    }

    const token = jwt.sign({ userId: result._id }, process.env.JWT_KEY, { expiresIn: "1d" })

    res.cookie("admin", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 86400000
    })

    res.json({
        message: "OTP verify success", result: {
            _id: result._id,
            name: result.name,
            email: result.email
        }
    })

})

exports.logoutAdmin = asynchandler(async (req, res) => {
    res.clearCookie("admin")
    res.json({ message: "Admin Logout success" })
})
