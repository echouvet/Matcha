function updateuser(column, change)
{
    var sql = 'UPDATE users SET ' + column + ' = ? WHERE id = ?'
    con.query(sql, [change, ssn.profile.id], function (err) { if (err) throw err })
    ssn.profile[column] = change
    res.render('profile.ejs', {css: css, success: 'Your ' + column + ' was successfully changed', profile: ssn.profile})
}
if (typeof ssn.profile == undefined)
{
    res.render('login.ejs', {css: css, error: 'Please login to access your profile page'})
}

newimg();
function newimg()
{
	var form = new formidable.IncomingForm()
	form.parse(req, function (err, field, files) { if (err) throw err;
		if (field.img1 !== 'Upload Image' && field.img2 !== 'Upload Image' && field.img3 !== 'Upload Image' && field.img4 !== 'Upload Image' && field.img5 !== 'Upload Image')
		{
			res.render('profile.ejs', {css: css, error: 'A server error occured', profile: ssn.profile});
			return ;
		}
		if (files.file.type !== 'image/png' && files.file.type !== 'image/jpeg' && files.file.type !== 'image/jpg')
		{
			res.render('profile.ejs', {css: css, error: 'Only jpeg and png image types aloud', profile: ssn.profile});
			return ;
		}
		if (files.file.size > 5000000)
		{
			res.render('profile.ejs', {css: css, error: 'Your image is too big', profile: ssn.profile});
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
		var oldpath = files.file.path;
	     	newpath = __dirname + '/img/users/' + ssn.profile.id + '/' + name;
	     	fs.readFile(oldpath, function (err, data) { if (err) throw err; 
	     	fs.writeFile(newpath, data, function (err) { if (err) throw err; }); });
	     	updateuser(name, '/users/' + ssn.profile.id + '/' + name);
	});
}