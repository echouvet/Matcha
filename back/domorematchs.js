function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

var i = 0
while (i < 10000) {
		sql = 'INSERT INTO `likes` (user_id, his_id) VALUES (?,?)'
		con.query(sql, [getRandomInt(600), getRandomInt(600)], function (err, result) { if (err) throw err })
	i++
}
res.redirect('/')