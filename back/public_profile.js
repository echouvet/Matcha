function	checklike(user_id, his_id, callback)
{
	var a = 0
	var b = 0
	 con.query('SELECT * FROM likes WHERE user_id = ? AND his_id = ?', [user_id, his_id], function (err, rows) { if (err) throw err 
	 	if (rows.length == 1)
	 		a = 1;
	 	
	 	con.query('SELECT * FROM likes WHERE user_id = ? AND his_id = ?', [his_id, user_id], function (err, rows) { if (err) throw err 
	 	if (rows.length == 1)
	 		b = 1;
	 	if (user_id == his_id)
	 		return callback(-1);
	 	else if (a == 0 && b == 0)
	 		return callback(0);
	 	else if (a == 1 && b == 0)
	 		return callback(1);
	 	else if (a == 0 && b == 1)
	 		return callback(2);
	 	else if (a == 1 && b == 1)
	 		return callback(3);
	 }) })
}

function	check(table, user_id, his_id, callback)
{
	con.query('SELECT * FROM ' + table + ' WHERE user_id = ? AND his_id = ?', [user_id, his_id], function (err, rows) { if (err) throw err 
		if (rows.length == 0)
			return callback(0);
		else
			return callback(1);
	})
}
function	insertinto(table)
{
	con.query('INSERT INTO ' + table + ' (user_id, his_id) VALUES (?,?) ', [req.session.profile.id, req.params.id], function (err) { if (err) throw err })
}
function	deletefrom(table)
{
	con.query('DELETE FROM ' + table + ' WHERE user_id = ? AND his_id = ?', [req.session.profile.id, req.params.id], function (err) { if (err) throw err })
}

if (req.body.like)
{
	checklike(req.session.profile.id, req.params.id, function(like){
		if (like == -1 || like == 1 || like == 3)
			return ;
		else
			insertinto('likes')
	})
}
if (req.body.dislike)
{
	checklike(req.session.profile.id, req.params.id, function(like){
		if (like == 0 || like == 2)
			return ;
		else
			deletefrom('likes')
	})
}
if (req.body.block)
{
	check('block', req.session.profile.id, req.params.id, function(block){
		if (block == 0)
			insertinto('block')
		else
			deletefrom('block')
	})
}
if (req.body.report)
{
	check('report', req.session.profile.id, req.params.id, function(report){
		if (report == 0)
			insertinto('report')
		else
			deletefrom('report')
	})
}

con.query('SELECT * FROM users WHERE id = ?', [req.params.id], function (err, result) { if (err) throw err
con.query('SELECT * FROM tags WHERE user_id = ?', [req.params.id], function (err, resultag) { if (err) throw err 
checklike(req.session.profile.id, req.params.id, function(like) {
check('block', req.session.profile.id, req.params.id, function(block){
check('report', req.session.profile.id, req.params.id, function(report){
res.render('public_profile.ejs', {req: req, css: css, like: like, block: block, report: report, profile: result[0], tag: resultag }) }) }) }) }) })