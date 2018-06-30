var i = 0
	firstname = 'FakeUserFirstName'
	lastname = 'FakeUserLadtName'
	pass = '$2a$10$fXJ03NwABaEi4HLQhWiGpOhdbpcTEo93DvY0UBAJlbyhpdvPkXnzu' // Fakeuser42
	confirm = 1
while (i < 600) {
	var login = 'FakeUser' + i
		email = 'fakeuser' + i + '@gmail.com'
		bio = 'La belle bio du FakeUser' + i
		score = i
		location = 'La vrai location du FakeUser' + i
		fakelocation = 'La fakelocation du FakeUser' + i
		key = 'Key'+ i
	if (i % 2 == 0)
		gender = 'Male'
	else
		gender = 'Female'
	if (i % 3 == 0) {
		var showlocation = 0
			age = 22
			orientation = 'Heterosexual'
	}
	else if (i % 3 == 1) {
		var showlocation = 1
			age = 21
			orientation = 'Bisexual'
	}
	else {
		var showlocation = 1
			age = 23
			orientation = 'Homosexual'
	}
	if (i % 4 == 0) {
		var img1 = '/seed/1.jpg'
			img2 = '/seed/2.jpg'
			img3 = '/seed/3.jpg'
			img4 = '/seed/4.jpg'
			img5 = '/seed/5.jpg'
	}
	else if (i % 4 == 1) {
		var img1 = '/seed/6.jpg'
			img2 = '/seed/7.jpg'
			img3 = '/seed/8.png'
			img4 = '/seed/9.jpg'
			img5 = '/seed/10.jpg'
	}
	else if (i % 4 == 2) {
		var img1 = '/seed/11.png'
			img2 = '/seed/12.jpg'
			img3 = '/seed/13.jpg'
			img4 = '/seed/14.jpg'
			img5 = '/seed/15.png'
	}
	else {
		var img1 = '/seed/16.jpg'
			img2 = '/seed/17.jpg'
			img3 = '/seed/18.jpg'
			img4 = '/seed/19.jpg'
			img5 = '/seed/20.jpg'
	}
	sql = 'INSERT INTO `users` (`login`, `firstname`, `lastname`, `pass`, `email`, `confirmkey`, `confirm`, `gender`, `orientation`, `bio`, `age`, `score`, `location`, `fakelocation`, `showlocation`, `img1`, `img2`, `img3`, `img4`, `img5`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
	con.query(sql, [login, firstname, lastname, pass, email, key, confirm, gender, orientation, bio, age, score, location, fakelocation, showlocation, img1, img2, img3, img4, img5], function (err, result) { if (err) throw err })
	sql = 'INSERT INTO `tags` (tag, user_id) VALUES (?,?)'
	con.query(sql, [login, i], function (err, result) { if (err) throw err })
	var tag = 'tag' + i
	sql = 'INSERT INTO `tags` (tag, user_id) VALUES (?,?)'
	con.query(sql, [tag, i], function (err, result) { if (err) throw err })
	i++
}
res.render('index.ejs', {req: req, css: css})