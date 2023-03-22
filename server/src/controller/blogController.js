const blogModel = require("../models/blogModel");
const userModel = require('../models/userModel')

const mongoose = require("mongoose");
const { isValidRequestBody } = require("../validator/validator");

//----------------------------Handler create A blog--------------------------//

const createBlog = async function (req, res) {
  try {
    let { title, userId, body, category, subcategory, isDeleted, isPublished, tags } = req.body;

    if (!isValidRequestBody(req.body)) return res.status(400).send({ status: false, msg: "Body can't be empty it must contain some data.", });

    // if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ status: false, msg: "Type of Author Id is must be ObjectId " });

    if (!title) return res.status(400).send({ status: false, msg: "title is required" })

    let checkTitle = await blogModel.findOne({ title: title })

    if (checkTitle) return res.status(400).send({ status: false, msg: "Title already exists" })

    if (!body) return res.status(400).send({ status: false, msg: "body is required" })

    if (!userId) {
      req.body.userId = req.decodedToken.userId
    }

    if (!tags) return res.status(400).send({ status: false, msg: "tags are required" })

    if (!category) return res.status(400).send({ status: false, msg: "category is required" })

    if (!subcategory) return res.status(400).send({ status: false, msg: "subcategory is required" })

    // let checkAuthor = await userModel.findById(userId);

    //if (!checkAuthor) { res.status(401).send({ msg: "USER id is invalid" }); }

    if (isPublished == true) {
      //assigned a value (current date) to publishedAt 
      req.body["publishedAt"] = Date.now();
    }
    if (isDeleted == true) {
      //assigned a value (current date) to deleteddAt (default : false)
      //idolly the doc should not get deleted at the time of creation
      req.body["deletedAt"] = Date.now();
    }

    let createData = await blogModel.create(req.body);

    return res.status(201).send({ status: true, data: createData });
  } catch (error) {
    return res.status(500).send({ msg: error.message });
  }
};

const getTheUserBlogs = async function (req, res) {
  try {

    //let userId = req.params.userId

    let findBlog = await blogModel.find({ userId: req.decodedToken.userId, isDeleted: false })

    if (findBlog.length === 0) return res.status(404).send({ status: false, msg: "No Blog Exist" })

    console.log(findBlog)

    return res.status(200).send({ status: true, msg: "found", data: findBlog })


  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message })
  }
}

//----------------------------Handler for fetch a blog--------------------------//
const getblog = async function (req, res) {
  try {
    if (Object.keys(req.query).length === 0) {
      let totalBlogs = await blogModel.find({ isDeleted: false, isPublished: true, });

      if (totalBlogs.length === 0) return res.status(404).send({ status: false, msg: "Blogs don't exist" });

      return res.status(200).send({ status: true, data: totalBlogs });
    }

    let { userId, category, tags, subcategory } = req.query;

    let filterBlogs = await blogModel.find({ $or: [{ userId: userId }, { category: category }, { tags: tags }, { subcategory: subcategory }] })

    //let  filterBlogs = await blogModel.find(req.query)

    if (!filterBlogs.userId === req.decodedToken.userId) return res.status(403).send({ status: false, message: "Unauthorized User" })

    if (filterBlogs.length == 0) return res.status(404).send({ status: true, msg: "Request is Not found" });

    return res.status(200).send({ status: true, msg: filterBlogs });

  } catch (error) {
    res.status(500).send({ status: false, msg: error.message });
  }
};

const getBlogByFilter = async function (req, res) {
  try {
    //if (Object.keys(req.query).length < 1) return res.status(400).send({ status: false, msg: "provide filter" })
    
    if(Object.values(req.query).length < 1)return res.status(400).send({ status: false, msg: "provide filter" })

    let { tags, category, subcategory, title } = req.query

    
    // const findBlogs = await blogModel.find(req.query)
    let findBlogs ;

    if(tags){
      findBlogs = await blogModel.find({tags: { $regex: tags }})
    }

    if(subcategory){
      findBlogs = await blogModel.find({subcategory: { $regex: subcategory }})
    }

    if(title || category){
      findBlogs = await blogModel.find(req.query)
    }

    if(findBlogs === undefined) return res.status(400).send({status:false , msg : "No Blog Found"})
    if (findBlogs.length == 0) {
      return res.status(404).send({ status: false, msg: "No Blog Found" })
    }

    let finalData = []

    for (let item of findBlogs) {
      if (item.isDeleted == false) {
        const findUserName = await userModel.findById(item.userId)
        let data = {
          title: item.title,
          body: item.body,
          tags: item.tags,
          category: item.category,
          subcategory: item.subcategory,
          author: `${findUserName.fname} ${findUserName.lname}`
        }
        finalData.push(data)
      }
    }

    console.log(req.query)

    return res.status(200).send({ status: true, msg: "Success", data: finalData })

  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message })
  }
}

const updateBlog = async function (req, res) {
  try {
    let blogId = req.params.blogId;

    if (!blogId) return res.status(400).send({ status: false, msg: "Blog id is mandatory" });

    //if (!mongoose.isValidObjectId(blogId)) return res.status(400).send({ status: false, msg: "Type of BlogId must be ObjectId " });

    let foundDoc = await blogModel.findById(blogId);

    if (foundDoc == null || foundDoc.isDeleted === true) return res.status(404).send({ status: false, msg: "Blog is not found" });

    // Authorization Starts ---

    let findByBlogId = foundDoc.userId;
    if (findByBlogId != req.decodedToken.userId) { return res.status(403).send({ status: false, msg: "Unauthorized Author" }); }

    // Authorization Ends /--

    if (!isValidRequestBody(req.body)) return res.status(400).send({ status: false, msg: "Body can't be empty it must contain some data.", });

    let newData = {
      title: foundDoc.title,
      body: foundDoc.body,
      tags: foundDoc.tags,
      category: foundDoc.category,
      subcategory: foundDoc.subcategory
    }

    let { tags, category, subcategory, title, body } = req.body

    if (tags) {
      newData.tags = foundDoc.tags.concat(tags)
    }

    if (category) {
      newData.category = category
    }
    if (subcategory) {
      newData.subcategory = foundDoc.subcategory.concat(subcategory)
    }

    if (title) {
      newData.title = title
    }

    if (body) {
      newData.body = body
    }

    // foundDoc.tags = foundDoc.tags.concat(tags)
    // foundDoc.subcategory = foundDoc.subcategory.concat(subcategory);
    // let result1 = foundDoc.tags.filter((b) => b != null);
    // let result2 = foundDoc.subcategory.filter((b) => b != null);

    if (foundDoc && foundDoc.isDeleted == false) {
      let updatedDoc = await blogModel.findByIdAndUpdate(
        { _id: blogId },

        newData,

        { new: true }
      );

      return res.status(200).send({ status: true, msg: "Blog is succesfully Upadated", data: updatedDoc });
    }

    return res.status(400).send({ status: false, msg: "blog has been deleted" });

  }
  catch (error) {
    return res.status(500).send({ status: false, msg: error.message })
  }
}

const deleteBlog = async function (req, res) {
  try {

    let blogId = req.params.blogId;

    if (!mongoose.isValidObjectId(blogId)) return res.status(400).send({ status: false, msg: "Type of BlogId is must be ObjectId " });

    let findBlog = await blogModel.findById(blogId)

    if (findBlog.isDeleted === true || !findBlog) return res.status(404).send({ status: false, msg: "Already Deleted" })

    let checkUserId = findBlog.userId

    console.log("userId====>", checkUserId)
    console.log("userId in token===>", req.decodedToken.userId)

    if (checkUserId != req.decodedToken.userId) return res.status(403).send({ status: false, msg: "Unauthorized User" })

    let deleteDoc = await blogModel.findByIdAndUpdate(
      { _id: blogId },
      {
        isDeleted: true,
        deletedAt: Date.now()
      },
      { new: true }
    )

    return res.status(200).send({ status: true, msg: "Deleted Successfully" })

  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message })
  }
}
module.exports = { createBlog, getTheUserBlogs, getblog, getBlogByFilter, updateBlog, deleteBlog }