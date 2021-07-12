if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const app = express()
const Msg = require('./msgModel')
const methodOverride = require('method-override');
const session = require('express-session')
const flash = require('connect-flash')
const MongoStore = require("connect-mongo")(session)

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/my-portfolio';

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});
const secret = process.env.SECRET || 'thisshouldbeabettersecret!';
const store = new MongoStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash())
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res)=>{
    res.render('index', {flashMsg: req.flash('success')})
})

app.post('/msg', async (req, res)=>{
    console.log(req.body);
    const {msg} = req.body;
    const newMsg = new Msg(msg)
    await newMsg.save()
    console.log(newMsg);
    req.flash('success', 'Thanks For Your Valuable Effort😀')
    res.redirect('/')
})

app.get('/iamravishowmeallmsgs', async (req, res)=>{
    const msgs = await Msg.find({})
    res.render('allMsgs', { msgs })
})

app.delete('/msg/:id', async(req, res)=>{
    const {id} = req.params;
    console.log(id);
    const msg = await Msg.findByIdAndDelete(id)
    res.redirect('/iamravishowmeallmsgs')
})

const port = process.env.PORT || 3000
app.listen(port, ()=>{
    console.log(`Listening on port ${port}`);
})