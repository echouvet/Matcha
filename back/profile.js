
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
function showlocation(set)
{
    sql = 'UPDATE users SET showlocation = ? WHERE id = ?'
    con.query(sql, [set, req.session.profile.id], function (err, result) { if (err) throw err
        req.session.profile.showlocation = set;
        render(notifs, 'success', 'Show Location desactived !')
    })
}
function settags()
{
    sql = 'SELECT * FROM `tags` WHERE user_id = ?'
    con.query(sql, [req.session.profile.id], function (err, result) { if (err) throw err
    req.session.profile.tag = result; })
}

if (req.body.table)
{
    var table = JSON.parse(req.body.table)
    
    location = 'Continent : ' + table.continent_name + ' | Country : ' + table.country_name + ' | Region : ' + table.region_name + ' | City : ' + table.city + ' | Postal Code : ' + table.zip
    con.query('UPDATE users SET longitude = ?, latitude = ?, location = ? WHERE id = ?', [table.longitude, table.latitude, location, req.session.profile.id], function (err) { if (err) throw err })
    req.session.profile.location = location
    req.session.profile.longitude = table.longitude
    req.session.profile.latitude = table.latitude
    user[req.session.profile.id].emit('locationset', {})
}

if (typeof req.session.profile == undefined)
{
    res.render(notifs, 'login.ejs', {req: req, css: css, error: 'Please login to access your profile page'})
}
else if (req.body.edit && req.body.general === 'Modify')
{
    if (!req.body.changement.trim())
        render(notifs, 'error', 'Input must contain more than whitespaces')
    else {
        var change = eschtml(req.body.changement)
        if (req.body.changement == '' || req.body.changement.length < '1' || typeof req.body.changement == undefined )
            render(notifs, 'error', 'Please input something to edit your profile')
        else if (change !== eschtml(req.body.confirm))
            render(notifs, 'error', 'Your input and confirmation were different')
        else if (req.body.edit === '1')
        {
            sql = 'SELECT * FROM `users` WHERE login = ?'
            con.query(sql, [change], function (err, result) { if (err) throw err 
                if (result.length === 0)
                    updateuser('login', change)
                else
                    render(notifs, 'error', 'Sorry, this login already exists')
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
                render(notifs, 'error', 'Password must be at least 6 characters long')
            else if (change.search(regLow) === -1)
                render(notifs, 'error', 'Password must contain a lowercase')
            else if (change.search(regUp) === -1)
                render(notifs, 'error', 'Password must contain an uppercase')
            else
            {
                bcrypt.hash(change, 10, function(erroo, hash) { if (erroo) throw erroo
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
                        render(notifs, 'error', 'Sorry, this email already exists')
                })
            }
            else
                render(notifs, 'error', 'Email must be valid')
        }
    }
}
else if (req.body.orientation && req.body.sub_orientation === 'Modify')
{
    if (req.body.orientation == 'Heterosexual' || 'Bisexual' || 'Homosexual')
        updateuser('orientation', req.body.orientation)
    else
         render(notifs, 'error', 'Please select a proposed orientation')
}
else if (req.body.gender && req.body.sub_gender === 'Modify')
{
    if (req.body.gender == 'Male' || 'Female')
        updateuser('gender', req.body.gender)
    else
        render(notifs, 'error', 'Please select a proposed gender')
}
else if (req.body.age && req.body.sub_age === 'Modify')
{
    if (isNaN(req.body.age) || req.body.age < 1)
        render(notifs, 'error', 'Your age must be a positive number')
    else
        updateuser('age', req.body.age)
}
else if (req.body.bio && req.body.sub_bio === 'Update Biography')
{
    if (!req.body.bio.trim())
        render(notifs, 'error', 'Your Biography must contain more than whitespaces')
    else {
        var change = eschtml(req.body.bio)
        updateuser('bio', change)
    }
}
else if (req.body.newtag)
{
    if (!req.body.newtag.trim())
        render(notifs, 'error', 'Your tag must contain more than whitespaces')
    else {
        var newtag = eschtml(req.body.newtag)
        if (newtag.length < 41)
        {
            sql = 'SELECT * FROM `tags` WHERE user_id = ? AND tag = ?'
            con.query(sql, [req.session.profile.id, newtag], function (err, result) { if (err) throw err
                if (result.length === 0)
                {
                    sql = 'INSERT INTO tags (tag, user_id) VALUES (?,?)'
                    con.query(sql, [newtag, req.session.profile.id], function (err, result) { if (err) throw err })
                    settags();
                    render(notifs, 'success', 'Tag was added with Success!')   
                }
                else
                    render(notifs, 'error', 'This tag already exists')
            })
        }
        else
            render(notifs, 'error', 'This tag is too long')
    }
}
else if (req.body.deltag)
{
    sql = 'DELETE FROM `tags` WHERE user_id = ? AND id = ?'
    con.query(sql, [req.session.profile.id, req.body.deltag], function (err, result) { if (err) throw err
        if (result.length !== 0)
        {
            settags();    
            render(notifs, 'success', 'Tag was successfully deleted!')
        }
        else
            render(notifs, 'error', 'This tag can\'t be delete')
    })
}
else if (req.body.switch)
{
    if (req.body.switch === 'false')
        showlocation(0);
    else if (req.body.switch === 'true')
        showlocation(1);
}
else if (req.body.modifloc && req.body.fakeloc === 'Modify')
{
    if (!req.body.modifloc.trim())
        render(notifs, 'error', 'Your Location must contain more than whitespaces')
    else {
        var loc = eschtml(req.body.modifloc)
        updateuser('fakelocation', loc)
    }
}
else
{
   render(notifs, 'none', '')
}