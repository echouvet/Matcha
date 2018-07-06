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
    formidable = require('formidable')
    geopoint = require('geopoint')
    http = require("http")
    ent = require("ent")

// others
var app = express()
    server = http.createServer(app);
    io = require("socket.io").listen(server);
    urlencodedParser = bodyParser.urlencoded({ extended: false })
    css = { style : fs.readFileSync('./style.css','utf8') }
    MemoryStore = require('session-memory-store')(ssn);
    
    sessionMiddleware = ssn({
        secret: "Eloi has a beautiful secret",
        store: new MemoryStore(),
        key: 'sid',
        resave: true, 
        saveUninitialized: true
    });

app.use(sessionMiddleware);

app.use(express.static(__dirname + '/img'))
app.use(bodyParser.urlencoded({ extended: true }))

var user = new Array;
io.sockets.on('connection', function (socket) {
    socket.on('setUserId', function (userId) {
        user[userId] = socket;
    })
    socket.on('seen', function (user_id) {
        con.query('UPDATE notifs SET seen=1 WHERE user_id=?', [user_id])
    })
});


server.listen(8080)

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root42"
})

con.connect(function(err) { if (err) throw err
    con.query('CREATE DATABASE IF NOT EXISTS `matcha`', function (err) { if (err) throw err })
    con.query('USE `matcha`', function (err) { if (err) throw err })
    con.query('SET NAMES utf8mb4', function (err) { if (err) throw err })
    var users = `CREATE TABLE IF NOT EXISTS users ( \
        id INT AUTO_INCREMENT PRIMARY KEY, \
        login VARCHAR(255), \
        firstname VARCHAR(255), \
        lastname VARCHAR(255), \
        pass VARCHAR(255), \
        email VARCHAR(255), \
        confirmkey VARCHAR(10), \
        confirm INT DEFAULT 0, \
        gender VARCHAR(255), \
        orientation VARCHAR(255), \
        bio TEXT, \
        age INT DEFAULT 0, \
        score INT DEFAULT 0, \
        longitude DOUBLE, \
        latitude DOUBLE, \
        location TEXT, \
        fakelocation TEXT, \
        showlocation INT DEFAULT 1, \
        img1 VARCHAR(255) DEFAULT 'empty.png', \
        img2 VARCHAR(255) DEFAULT 'empty.png', \
        img3 VARCHAR(255) DEFAULT 'empty.png', \
        img4 VARCHAR(255) DEFAULT 'empty.png', \
        img5 VARCHAR(255) DEFAULT 'empty.png')`
    con.query(users, function (err) { if (err) throw err })

    var tags = `CREATE TABLE IF NOT EXISTS tags ( \
        id INT AUTO_INCREMENT PRIMARY KEY, \
        user_id INT, \
        tag VARCHAR(255))`
    con.query(tags, function (err) { if (err) throw err }) 
    
    var likes = `CREATE TABLE IF NOT EXISTS likes (\
        id INT AUTO_INCREMENT PRIMARY KEY, \
        user_id INT NOT NULL, \ 
        his_id INT NOT NULL)`
    con.query(likes, function (err) { if (err) throw err }) 
    
    var block = `CREATE TABLE IF NOT EXISTS block (\
        id INT AUTO_INCREMENT PRIMARY KEY, \
        user_id INT NOT NULL, \ 
        his_id INT NOT NULL)`
    con.query(block, function (err) { if (err) throw err }) 
    
    var report = `CREATE TABLE IF NOT EXISTS report (\
        id INT AUTO_INCREMENT PRIMARY KEY, \
        user_id INT NOT NULL, \ 
        his_id INT NOT NULL)`
    con.query(report, function (err) { if (err) throw err })

    var visits = `CREATE TABLE IF NOT EXISTS visits (\
        id INT AUTO_INCREMENT PRIMARY KEY, \
        user_id INT NOT NULL, \ 
        his_id INT NOT NULL, \
        date DATETIME DEFAULT CURRENT_TIMESTAMP)`
     con.query(visits, function (err) { if (err) throw err })

     var notifs = `CREATE TABLE IF NOT EXISTS notifs (\
        id INT AUTO_INCREMENT PRIMARY KEY, \
        user_id INT NOT NULL, \ 
        his_id INT NOT NULL, \
        notif TEXT, \
        seen INT NOT NULL DEFAULT 0, \
        date DATETIME DEFAULT CURRENT_TIMESTAMP)`
     con.query(notifs, function (err) { if (err) throw err })
})

function    getnotifs(id, callback) {
    con.query('SELECT * FROM notifs WHERE user_id = ? ORDER BY date DESC LIMIT 20', [id], function(err, notifs){ if (err) throw err
    if (notifs.length == 0)
        return callback(id);
    else
        return callback(notifs);
}) }

    app.get('/', function(req,res){
        if (req.session.profile == undefined)
            res.redirect('/index')
        else
            res.redirect('/peers')
    })
    .get('/index', function(req, res) {
        res.render('index.ejs')
    })
    .get('/register', function(req,res){
        res.render('register.ejs', {css: css, error: 'none'})
    })
    .post('/register', urlencodedParser, function(req,res){
        eval(fs.readFileSync(__dirname + "/back/register.js")+'')
    })
    .get('/confirm', urlencodedParser, function(req,res){
        eval(fs.readFileSync(__dirname + "/back/confirm.js")+'')
     })
    .get('/login', function(req,res){   
        if (req.session.profile == undefined)
            res.render('login.ejs', {req: req, css: css})
        else
        {
            getnotifs(req.session.profile.id, function(notifs){
            eval(fs.readFileSync(__dirname + "/back/profile.js")+'') })
        }
    })
    .post('/login', urlencodedParser, function(req,res){
        eval(fs.readFileSync(__dirname + "/back/login.js")+'')
    })
    .post('/forgot', urlencodedParser, function(req,res){
        eval(fs.readFileSync(__dirname + "/back/forgotpass.js")+'')
    })
    .get('/logout', function(req,res){
        req.session.destroy()
        req.session = 0;
        res.redirect('/')
    })
    .get('/peers', function(req, res) {
        getnotifs(req.session.profile.id, function(notifs){
        eval(fs.readFileSync(__dirname + "/back/peers.js")+'') })
    })
    .get('/user_profile/:id', function(req,res){
        getnotifs(req.session.profile.id, function(notifs){
        eval(fs.readFileSync(__dirname + "/back/public_profile.js")+'') })
    })
    .post('/public_profile/:id', function(req, res) {
        getnotifs(req.session.profile.id, function(notifs){
        eval(fs.readFileSync(__dirname + "/back/public_profile.js")+'') })
    })
    .get('/matchs', function(req,res){
        getnotifs(req.session.profile.id, function(notifs){
        eval(fs.readFileSync(__dirname + "/back/matchs.js")+'') })
    })
    .get('/public_profile', function(req,res){
        getnotifs(req.session.profile.id, function(notifs){
        res.render('public_profile.ejs', {notif: notifs, req:req, like: -1, block: 0, report: 0, css: css, profile: req.session.profile, tag: req.session.profile.tag}) })
    })
    .post('/peers', function(req, res) {
        getnotifs(req.session.profile.id, function(notifs){
        eval(fs.readFileSync(__dirname + "/back/peers.js")+'') })
    })
    .post('/profile', urlencodedParser, function(req,res){
        getnotifs(req.session.profile.id, function(notifs){
        eval(fs.readFileSync(__dirname + "/back/profile.js")+'') })
    })
    .post('/new_img', urlencodedParser, function(req,res){
        getnotifs(req.session.profile.id, function(notifs){
        eval(fs.readFileSync(__dirname + "/back/new_img.js")+'') })
    })
    .get('/seed', urlencodedParser, function(req,res){
        eval(fs.readFileSync(__dirname + "/back/createaccounts.js")+'')
     })
    .get('/domatch', urlencodedParser, function(req,res){
       eval(fs.readFileSync(__dirname + "/back/domorematchs.js")+'')
    })
    .get('/user_chat/:id', function(req,res){
       eval(fs.readFileSync(__dirname + "/back/chat.js")+'')
    })