function updateuser(column, change)
{
    var sql = 'UPDATE users SET ' + column + ' = ? WHERE id = ?'
    con.query(sql, [change, req.session.profile.id], function (err) { if (err) throw err })
    req.session.profile[column] = change
    res.render('profile.ejs', {req: req, css: css, success: 'Your ' + column + ' was successfully changed', profile: req.session.profile})
}
if (typeof req.session.profile == undefined)
{
    res.render('login.ejs', {req: req, css: css, error: 'Please login to access your profile page'})
}
else if (req.body.edit && req.body.general === 'Modify')
{
    var change = eschtml(req.body.changement)
	if (req.body.changement == '' || req.body.changement.length < '1' || typeof req.body.changement == undefined )
		res.render('profile.ejs', {req: req, css: css, error: 'Please input something to edit your profile', profile: req.session.profile})
    else if (change !== eschtml(req.body.confirm))
        res.render('profile.ejs', {req: req, css: css, error: 'Your input and confirmation were different', profile: req.session.profile})
	else if (req.body.edit === '1')
	{
		sql = 'SELECT * FROM `users` WHERE login = ?'
		con.query(sql, [change], function (err, result) { if (err) throw err 
    		if (result.length === 0)
	    		updateuser('login', change)
			else
				res.render('profile.ejs', {req: req, css: css, error: 'Sorry, this login already exists', profile: req.session.profile})
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
        	res.render('profile.ejs', {req: req, css: css, error: 'Password must be at least 6 characters long', profile: req.session.profile})
        else if (change.search(regLow) === -1) 
        	res.render('profile.ejs', {req: req, css: css, error: 'Password must contain a lowercase', profile: req.session.profile})
        else if (change.search(regUp) === -1) 
        	res.render('profile.ejs', {req: req, css: css, error: 'Password must contain an uppercase', profile: req.session.profile})
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
    				res.render('profile.ejs', {req: req, css: css, error: 'Sorry, this email already exists', profile: req.session.profile})
    		})
        }
        else
            res.render('profile.ejs', {req: req, css: css, error: 'Email must be valid', profile: req.session.profile})
	}
}
else if (req.body.orientation && req.body.sub_orientation === 'Modify')
{
    var change = eschtml(req.body.orientation) 
	if (change !== 'Select Sexual Orientation')
        updateuser('orientation', change)
    else
        res.render('profile.ejs', {req: req, css: css, error: 'Select an orientation to update', profile: req.session.profile})
}
else if (req.body.gender && req.body.sub_gender === 'Modify')
{
   var change = eschtml(req.body.gender) 
    if (change !== 'Select Gender')
        updateuser('gender', change)
    else
        res.render('profile.ejs', {req: req, css: css, error: 'Select a gender to update', profile: req.session.profile})
}
else if (req.body.age && req.body.sub_age === 'Modify')
{
    updateuser('age', req.body.age)
}
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
                        con.query(sql, [req.session.profile.id], function (err, result) {
                          if (err) throw err
                        req.session.profile.tag = result
                    res.render('profile.ejs', {req: req, css: css, success: 'Tag ajouté avec succés !', profile: req.session.profile})
                      })
            }
            else
                res.render('profile.ejs', {req: req, css: css, error: 'This tag already exists', profile: req.session.profile}) })
    }
    else
        res.render('profile.ejs', {req: req, css: css, error: 'This tag is too long', profile: req.session.profile})
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
                    res.render('profile.ejs', {req: req, css: css, success: 'Tag supprimé avec succés !', profile: req.session.profile})
                })
                        
            }
            else
                res.render('profile.ejs', {req: req, css: css, error: 'This tag can\'t be delete', profile: req.session.profile}) })
}
else if (req.body.switch)
{
    if (req.body.switch === 'false')
    {
        sql = 'UPDATE users SET showlocation = ? WHERE id = ?'
        con.query(sql, [0, req.session.profile.id], function (err, result) { if (err) throw err
            req.session.profile.showlocation = 0
            res.render('profile.ejs', {req: req, css: css, success: 'Show Location desactived !', profile: req.session.profile})
        })
    }
    else if (req.body.switch === 'true')
    {
        sql = 'UPDATE users SET showlocation = ? WHERE id = ?'
        con.query(sql, [1, req.session.profile.id], function (err, result) { if (err) throw err
            req.session.profile.showlocation = 1
            res.render('profile.ejs', {req: req, css: css, success: 'Show Location actived !', profile: req.session.profile})
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
   res.render('index.ejs', {req: req, css: css})
}

