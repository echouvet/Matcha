
con.query( "SELECT * from `users` where id=? ", [req.params.id], function( err, user ) { if (err) throw err
		res.render('chat.ejs', {req: req, css: css, user: user[0]}) })
