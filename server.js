// requires
var express = require('express')
    mysql = require('mysql')
    compression = require('compression')
    cookie = require('cookie-session')
    bodyParser = require('body-parser')
    fs = require('fs')
    html = require('html')
    bcrypt = require('bcrypt')
    validator = require('validator')
    mailer = require("nodemailer")    
    rand = require("random-key")
    eschtml = require('htmlspecialchars')
    vm = require('vm')
    ssn = require('express-session')
    MemoryStore = require('session-memory-store')(ssn);
    formidable = require('formidable')
    geopoint = require('geopoint')
    http = require("http")
    ent = require("ent")
    app = express()
    server = http.createServer(app);
    io = require("socket.io").listen(server);
    tool = require("./back/tools.js")
    sessionMiddleware = ssn({
        secret: "Eloi has a beautiful secret",
        store: new MemoryStore(),
        key: 'sid',
        resave: true, 
        saveUninitialized: true
    });
    css = { style : fs.readFileSync('./style.css','utf8') }

app.use(sessionMiddleware);
app.use(express.static(__dirname + '/img'))
app.use(bodyParser.urlencoded({ extended: true }))

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root42"
})

con.connect(function(err) { if (err) throw err
    eval(fs.readFileSync(__dirname + "/back/database.js")+'')
})

var user = new Array;
io.sockets.on('connection', function (socket) {
    eval(fs.readFileSync(__dirname + "/back/socket.js")+'')
});
server.listen(8080)

app.get('/', function(req,res){
    if (req.session.profile == undefined)
        res.redirect('/index')
    else
        res.redirect('/profile')
})
.get('/index', function(req, res) {
    res.render('index.ejs')
})
.get('/register', function(req,res){
    res.render('register.ejs', {css: css, error: 'none'})
})
.post('/register', function(req,res){
    eval(fs.readFileSync(__dirname + "/back/register.js")+'')
})
.get('/confirm', function(req,res){
    eval(fs.readFileSync(__dirname + "/back/confirm.js")+'')
 })
.all('/login', function(req,res){
    eval(fs.readFileSync(__dirname + "/back/login.js")+'')
})
.post('/forgot', function(req,res){
    eval(fs.readFileSync(__dirname + "/back/forgotpass.js")+'')
})
.get('/logout', function(req,res){
    req.session.destroy()
    req.session = 0;
    res.redirect('/')
})
.get('/seed', function(req,res){
    eval(fs.readFileSync(__dirname + "/back/createaccounts.js")+'')
 })
.get('/domatch', function(req,res){
   eval(fs.readFileSync(__dirname + "/back/domorematchs.js")+'')
})
app.use(function(req, res, next) {
    if (req.session.profile == undefined)
        res.redirect('/');
    else
        next();
});
app.all('/profile', function(req,res){
    tool.getnotifs(con, req.session.profile.id, function(notifs){
    eval(fs.readFileSync(__dirname + "/back/profile.js")+'') })
})
.all('/peers', function(req, res) {
    tool.getnotifs(con, req.session.profile.id, function(notifs){
    eval(fs.readFileSync(__dirname + "/back/peers.js")+'') })
})
.get('/matchs', function(req,res){
    tool.getnotifs(con, req.session.profile.id, function(notifs){
    eval(fs.readFileSync(__dirname + "/back/matchs.js")+'') })
})
.get('/public_profile', function(req,res){
    tool.getnotifs(con, req.session.profile.id, function(notifs){
    res.render('public_profile.ejs', {notif: notifs, req: req, like: -1, block: 0, 
        online: 1, report: 0, css: css, profile: req.session.profile, tag: req.session.profile.tag}) })
})
.post('/new_img', function(req,res){
    tool.getnotifs(con, req.session.profile.id, function(notifs){
    eval(fs.readFileSync(__dirname + "/back/new_img.js")+'') })
})
.all('/user_profile/:id', tool.checkparamint ,function(req,res){
    tool.getnotifs(con, req.session.profile.id, function(notifs){
    eval(fs.readFileSync(__dirname + "/back/public_profile.js")+'') })
})
.get('/user_chat/:id', tool.checkparamint, function(req,res){
    con.query("SELECT * from `users` where id = ?", [req.params.id], function( err, user2 ) { if (err) throw err
    con.query('SELECT * FROM `chat` WHERE user_id = ? OR his_id = ?', [req.params.id, req.params.id], function (err, chat) { if (err) throw err 
    tool.checkmatch(con, req.session.profile.id, req.params.id, function(match){
        if (match == 0)
            res.redirect('/')
        else {
            tool.getnotifs(con, req.session.profile.id, function(notifs){
            res.render('chat.ejs', {notif: notifs, req: req, css: css, user2: user2[0], chat:chat}) }) } })  }) })
})
.all('*', function(req, res) {
  res.redirect('/');
});