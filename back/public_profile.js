function	checklike(user_id, like_id, callback)
{
	var a = 0
	var b = 0
	 con.query('SELECT * FROM likes WHERE user_id = ? AND like_id = ?', [user_id, like_id], function (err, rows) { if (err) throw err 
	 	if (rows.length == 1)
	 		a = 1;
	 	
	 	con.query('SELECT * FROM tags WHERE user_id = ? AND like_id = ?', [like_id, user_id], function (err, rows) { if (err) throw err 
	 	if (rows.length == 1)
	 		b = 1;
	 	
	 	if (a == 0 && b == 0)
	 		return callback(0);
	 	else if (a == 1 && b == 0)
	 		return callback(1);
	 	else if (a == 0 && b == 1)
	 		return callback(2);
	 	else if (a == 1 && b == 1)
	 		return callback(3);
	 }) })
}

con.query('SELECT * FROM users WHERE id = ?', [req.params.id], function (err, result) { if (err) throw err
con.query('SELECT * FROM tags WHERE user_id = ?', [req.params.id], function (err, resultag) { if (err) throw err 
checklike(req.session.profile.id, result[0].id, function(like) { if (req.session.profile.id == result[0].id) {like = -1}
res.render('public_profile.ejs', {req: req, css: css, like: like, profile: result[0], tag: resultag }) }) }) })