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
function    checkonline()
{
    if (req.session.profile.id == req.params.id)
        online = 1;
    else if (user[req.params.id])
        online = 1;
    else
        online = 0;
    return online;
}
function	notif(msg)
{
	con.query('INSERT INTO notifs (user_id, his_id, notif) VALUES (?, ?, ?) ', [req.params.id, req.session.profile.id, msg], function (err) { if (err) throw err })
	if (user[req.params.id])
    	user[req.params.id].emit('notification', {})
}
function	createnotif(table)
{
	var name = req.session.profile.login;
	if (table == 'likes')
	{
		checklike(req.session.profile.id, req.params.id, function (like){
			if (like == 1)
				notif(name +' HAS LIKED YOU!');
			else if (like == 3)
				notif('YOU HAVE MATCHED WITH ' + name + '!');
		})
	}
	else if (table == 'dislike')
	{
		checklike(req.session.profile.id, req.params.id, function (like){
			if (like == 2)
				notif('YOU ARE NO LONGER MATCHED WITH ' + name + ' :(');
		})
	}
	else if (table == 'visits')
		notif(name + ' HAS VISITED YOUR PROFILE!');
}

function	insertinto(table)
{
	con.query('INSERT INTO ' + table + ' (user_id, his_id) VALUES (?,?) ', [req.session.profile.id, req.params.id], function (err) { if (err) throw err })
	createnotif(table);
}
function	deletefrom(table)
{
	con.query('DELETE FROM ' + table + ' WHERE user_id = ? AND his_id = ?', [req.session.profile.id, req.params.id], function (err) { if (err) throw err })
	createnotif('dislike');
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
if ((req.session.profile.id != req.params.id) && !req.body.like && !req.body.dislike && !req.body.block && !req.body.report)
	insertinto('visits')

con.query('SELECT * FROM users WHERE id = ?', [req.params.id], function (err, result) { if (err) throw err
con.query('SELECT * FROM tags WHERE user_id = ?', [req.params.id], function (err, resultag) { if (err) throw err 
checklike(req.session.profile.id, req.params.id, function(like) {
check('block', req.session.profile.id, req.params.id, function(block){
check('report', req.session.profile.id, req.params.id, function(report){
var online = checkonline();
res.render('public_profile.ejs', {notif: notifs, req: req, online: online, css: css, like: like, block: block, report: report, profile: result[0], tag: resultag }) }) }) }) }) })


