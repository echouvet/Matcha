
function    render(notifs, type, msg)
{
    tool.getlikes(con, req.session.profile.id, function(like){
    tool.getvisits(con, req.session.profile.id, function(visit){
    if (type == 'error')
        res.render('profile.ejs', {notif: notifs, css: css, like: like, visit: visit, error: msg, profile: req.session.profile})
    else if (type == 'success')
        res.render('profile.ejs', {notif: notifs, css: css, like: like, visit: visit, success: msg, profile: req.session.profile})
    else
        res.render('profile.ejs', {notif: notifs, css: css, like: like, visit: visit, profile: req.session.profile})
    }) })
}

function updateuser(column, change)
{
    var sql = 'UPDATE users SET ' + column + ' = ? WHERE id = ?'
    con.query(sql, [change, req.session.profile.id], function (err) { if (err) throw err })
    req.session.profile[column] = change
    render(notifs, 'success', 'Your ' + column + ' was successfully changed')
}

if (typeof req.session.profile == undefined)
{
    res.render('login.ejs', {req: req, css: css, error: 'Please login to access your profile page'})
}
else
    newimg(notifs);
function newimg(notifs)
{
    var form = new formidable.IncomingForm()
    form.parse(req, function (err, field, files) { if (err) throw err;
        if (field.img1 !== 'Upload Image' && field.img2 !== 'Upload Image' && field.img3 !== 'Upload Image' && field.img4 !== 'Upload Image' && field.img5 !== 'Upload Image')
        {
            render(notifs, 'error', 'A server error occured');
            return ;
        }
        if (files.file.type !== 'image/png' && files.file.type !== 'image/jpeg' && files.file.type !== 'image/jpg')
        {
            render(notifs, 'error', 'Only jpeg and png image types aloud');
            return ;
        }
        if (files.file.size > 5000000)
        {
            render(notifs, 'error', 'Your image is too big');
            return ;
        }
        var i = 1
        while (i <= 5)
        {
            var tmp = 'img' + i
            if (field[tmp] == 'Upload Image')
                var name = tmp;
            i++
        }
        var dir =  __dirname + '/img/users/' + req.session.profile.id;
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
        var oldpath = files.file.path;
            newpath = dir + '/' + name;
            fs.readFile(oldpath, function (err, data) { if (err) throw err; 
            fs.writeFile(newpath, data, function (err) { if (err) throw err; }); });
            updateuser(name, '/users/' + req.session.profile.id + '/' + name);
    });
}