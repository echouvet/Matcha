module.exports = {
getlikes: function(con, user_id, callback) {
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
},
getvisits: function(con, user_id, callback) {
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
},
getnotifs: function(con, id, callback) {
    con.query('SELECT * FROM notifs WHERE user_id = ? ORDER BY date DESC LIMIT 20', [id], function(err, notifs){ if (err) throw err
    if (notifs.length == 0)
        return callback(id);
    else
        return callback(notifs);
}) },
checkmatch: function(con, user_id, his_id, callback)
{
    var a = 0
    var b = 0
     con.query('SELECT * FROM likes WHERE user_id = ? AND his_id = ?', [user_id, his_id], function (err, rows) { if (err) throw err 
        if (rows.length == 1)
            a = 1;       
        con.query('SELECT * FROM likes WHERE user_id = ? AND his_id = ?', [his_id, user_id], function (err, rows) { if (err) throw err 
        if (rows.length == 1)
            b = 1;
        if (a == 1 && b == 1)
            return callback(1);
        else
            return callback(0);
     }) })
},
checkparamint: function(req, res, next){

	if (isNaN(req.params.id))
        res.redirect('/');
    else
        next();
}
};