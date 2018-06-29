if (req.body.table)
{
var table = JSON.parse(req.body.table)
    location = 'Continent : ' + table.continent_name + ' | Country : ' + table.country_name + 
  ' | Region : ' + table.region_name + ' | City : ' + table.city + ' | Postal Code : ' + table.zip

    con.query('UPDATE users SET location = ? WHERE id = ?', [location, req.session.profile.id], function (err) { if (err) throw err })
    req.session.profile.location = location;
}
else if (req.body.login && req.body.pass)
{
    sql = 'SELECT * FROM `users` WHERE login = ?'
    variables = [req.body.login]
    con.query(sql, variables,
    function (err, result) { if (err) throw err
       if (result.length > 0)
       {
           bcrypt.compare(req.body.pass, result[0].pass, function(err, reso) 
           {
               if (reso)
               {
                   if (result[0].confirm === 1)
                   {
                        req.session.profile = result[0]
                        sql = 'SELECT * FROM `tags` WHERE user_id = ?'
                        con.query(sql, [req.session.profile.id], function (err, result) {
                          if (err) throw err
                            i = 0;
                            req.session.profile.tag = result
                      })
                       res.render('login.ejs', {req: req, css: css, success: 'CONGRATULATION YOU ARE LOGGED IN'})
                   }
                   else
                       res.render('login.ejs', {req: req, css: css, error: 'A confirmation e-mail has been sent'})
               }
               else
                   res.render('login.ejs', {req: req, css: css, error: 'ERREUR DE CONNEXION ! (invalid pass)'})
           })
       }
       else
       {
           res.render('login.ejs', {req: req, css: css, error: 'ERREUR DE CONNEXION ! (login inconnu)'})
       }
    })
}
else
    res.render('login.ejs', {req: req, css: css, error: 'Filling in Every field is required'})