let express = require('express')
let router = express.Router()
let { regsiterUser, LoginUser, forgotPassword, resetPassword, newPassword } = require('../controller/userController')
let { authenticate } = require('../auth/auth')
let { createBlog, getTheUserBlogs, getblog ,getBlogByFilter, updateBlog,deleteBlog} = require('../controller/blogController')
const { get } = require('mongoose')

router.get("/test-me", function (req, res) {
    res.status(200).send({ msg: "All ok" })
})

router.post('/register', regsiterUser)

router.post('/login', LoginUser)

router.post('/forgot-password', forgotPassword)

router.get('/reset-password/:id/:token', resetPassword)

router.post('/reset-password/:id/:token', newPassword)

router.post('/create-blog', authenticate, createBlog)

router.get('/getTheUserBlogs', authenticate, getTheUserBlogs)

router.get('/getBlogByFilter',authenticate,getBlogByFilter)

router.put("/updateBlog/:blogId",authenticate,updateBlog)

router.delete("/deleteBlog/:blogId",authenticate,deleteBlog)

module.exports = router;