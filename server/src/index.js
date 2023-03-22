const express = require('express');
const bodyParser = require('body-parser');
const route = require('./route/route.js');
const { default: mongoose } = require('mongoose');
const cookieParser = require('cookie-Parser')

const app = express();
app.use(cookieParser())


// It is used to parse the incoming request body that is encoded in x-www-form-urlencoded format, which is commonly used when submitting HTML forms. When a form is submitted, the form data is sent in the request body in this format.

// When using EJS templates, it is common to render forms in the templates to allow users to input data. When the form is submitted, the form data is sent to the server using the x-www-form-urlencoded format. In order to parse this data and extract the form field values, we use the express.urlencoded() middleware.

app.use(express.urlencoded({ extended: false }))

app.set('views', __dirname + '/views')

app.set("view engine", "ejs")

app.use(bodyParser.json());

mongoose.connect("mongodb+srv://panigrahisameer_200:iklsSoxrtvpy4JOK@cluster0.kyd9m93.mongodb.net/group-56", {
    useNewUrlParser: true
})
    .then(() => console.log("MongoDb is connected"))
    .catch(err => console.log(err))

app.use('/', route);


app.listen(process.env.PORT || 3001, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3001))
});