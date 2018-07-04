function    getlikes(user_id, callback)
{
    con.query('SELECT * FROM likes WHERE his_id = ?', [user_id], function (err, row) { if (err) throw err 
    if (row.length == 0)
        return callback('none')
        var i = 0; ids = '(';
        while (row[i]) {
            ids += row[i].user_id;
            i++;
            if (row[i])
                ids += ', ';
        } ids += ')'
        con.query( "SELECT * from `users` where `id` IN "+ ids, function(err, like) { if (err) throw err 
            return callback(like);
        })
    })
}

function    getvisits(user_id, callback)
{
    con.query('SELECT * FROM visits WHERE his_id = ?', [user_id], function (err, row) { if (err) throw err 
    if (row.length == 0)
        return callback('none')
        var i = 0; ids = '(';
        while (row[i]) {
            ids += row[i].user_id;
            i++;
            if (row[i])
                ids += ', ';
        } ids += ')'
        con.query( "SELECT * from `users` where `id` IN "+ ids, function(err, visit) { if (err) throw err
            var i = 0;
            while (visit[i])
            {
                visit[i].date = row[i].date
                i++;
            }
            return callback(visit);
        })
    })
}

function    render(type, msg)
{
    getlikes(req.session.profile.id, function(like){
    getvisits(req.session.profile.id, function(visit){
    if (type == 'error')
        res.render('profile.ejs', {req: req, css: css, like: like, visit: visit, error: msg, profile: req.session.profile})
    else if (type == 'success')
        res.render('profile.ejs', {req: req, css: css, like: like, visit: visit, success: msg, profile: req.session.profile})
    else
        res.render('profile.ejs', {req: req, css: css, like: like, visit: visit, profile: req.session.profile})
    }) })
}
function updateuser(column, change)
{
    var sql = 'UPDATE users SET ' + column + ' = ? WHERE id = ?'
    con.query(sql, [change, req.session.profile.id], function (err) { if (err) throw err })
    req.session.profile[column] = change
    render('success', 'Your ' + column + ' was successfully changed')
}

if (typeof req.session.profile == undefined)
{

    res.render('login.ejs', {req: req, css: css, error: 'Please login to access your profile page'})
}
else if (req.body.edit && req.body.general === 'Modify')
{
    var change = eschtml(req.body.changement)
    if (req.body.changement == '' || req.body.changement.length < '1' || typeof req.body.changement == undefined )
        render('error', 'Please input something to edit your profile')
    else if (change !== eschtml(req.body.confirm))
        render('error', 'Your input and confirmation were different')
    else if (req.body.edit === '1')
    {
        sql = 'SELECT * FROM `users` WHERE login = ?'
        con.query(sql, [change], function (err, result) { if (err) throw err 
            if (result.length === 0)
                updateuser('login', change)
            else
                render('error', 'Sorry, this login already exists')
        })
    }
    else if (req.body.edit === '2')
        updateuser('firstname', change)
    else if (req.body.edit === '3')
        updateuser('lastname', change)
    else if (req.body.edit === '4')
    {
        regLow = /[a-z]/ 
        regUp = /[A-Z]/
        if (change.length < 5)
            render('error', 'Password must be at least 6 characters long')
        else if (change.search(regLow) === -1)
            render('error', 'Password must contain a lowercase')
        else if (change.search(regUp) === -1)
            render('error', 'Password must contain an uppercase')
        else
        {
            bcrypt.hash(change, 10, function(erroo, hash) { if (erro) throw erroo
            updateuser('pass', hash)
            })
        }
    }
    else if (req.body.edit === '5')
    {
        if (validator.isEmail(change))
        {
            sql = 'SELECT * FROM `users` WHERE email = ?'
            con.query(sql, [change], function (err, result) { if (err) throw err 
                if (result.length === 0)
                    updateuser('email', change)
                else
                    render('error', 'Sorry, this email already exists')
            })
        }
        else
            render('error', 'Email must be valid')
    }
}
else if (req.body.orientation && req.body.sub_orientation === 'Modify')
{
    var change = eschtml(req.body.orientation) 
    if (change !== 'Select Sexual Orientation')
        updateuser('orientation', change)
    else
         render('error', 'Select an orientation to update')
}
else if (req.body.gender && req.body.sub_gender === 'Modify')
{
   var change = eschtml(req.body.gender) 
    if (change !== 'Select Gender')
        updateuser('gender', change)
    else
        render('error', 'Select a gender to update')
}
else if (req.body.age && req.body.sub_age === 'Modify')
    updateuser('age', req.body.age)
else if (req.body.bio && req.body.sub_bio === 'Update Biography')
{
    var change = eschtml(req.body.bio)
    updateuser('bio', change)
}
else if (req.body.newtag)
{
    var newtag = eschtml(req.body.newtag)
    if (newtag.length < 41)
    {
        sql = 'SELECT * FROM `tags` WHERE user_id = ? AND tag = ?'
        con.query(sql, [req.session.profile.id, newtag], function (err, result) { if (err) throw err
            if (result.length === 0)
            {
                sql = 'INSERT INTO tags (tag, user_id) VALUES (?,?)'
                con.query(sql, [newtag, req.session.profile.id], function (err, result) { if (err) throw err })
                sql = 'SELECT * FROM `tags` WHERE user_id = ?'
                con.query(sql, [req.session.profile.id], function (err, result) { if (err) throw err
                    req.session.profile.tag = result
                    render('success', 'Tag was added with Success!')
                })
            }
            else
                render('error', 'This tag already exists')
        })
    }
    else
        render('error', 'This tag is too long')
}
else if (req.body.deltag)
{
    sql = 'DELETE FROM `tags` WHERE user_id = ? AND id = ?'
    con.query(sql, [req.session.profile.id, req.body.deltag], function (err, result) { if (err) throw err
    if (result.length !== 0)
    {
        sql = 'SELECT * FROM tags WHERE user_id = ?'
        con.query(sql, [req.session.profile.id], function (err, result) { if (err) throw err
            req.session.profile.tag = result
            render('success', 'Tag was successfully deleted!')
        })
    }
    else
        render('error', 'This tag can\'t be delete')
    })
}
else if (req.body.switch)
{
    if (req.body.switch === 'false')
    {
        sql = 'UPDATE users SET showlocation = ? WHERE id = ?'
        con.query(sql, [0, req.session.profile.id], function (err, result) { if (err) throw err
            req.session.profile.showlocation = 0
            render('success', 'Show Location desactived !')
        })
    }
    else if (req.body.switch === 'true')
    {
        sql = 'UPDATE users SET showlocation = ? WHERE id = ?'
        con.query(sql, [1, req.session.profile.id], function (err, result) { if (err) throw err
            req.session.profile.showlocation = 1
            render('success', 'Show Location actived !')
        })
    }
}
else if (req.body.modifloc && req.body.fakeloc === 'Modify')
{
    var loc = eschtml(req.body.modifloc)
    updateuser('fakelocation', loc)
}
else
{
   render('none', '')
}