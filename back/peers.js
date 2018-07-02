function ascendingdist(first, second)
{
    if (first.distance == second.distance)
        return 0;
    if (first.distance < second.distance)
        return -1;
    else
        return 1; 
}

function ascendingscore(first, second)
{
    if (first.score == second.score)
        return 0;
    if (first.score > second.score)
        return -1;
    else
        return 1; 
}

function triage(first, second)
{
    if (first.age == second.age)
        return 0;
    if (first.age < second.age)
        return -1;
    else
        return 1; 
}

function sortdistance(result)
{
    var mypoint = new geopoint(req.session.profile.latitude, req.session.profile.longitude)
        i = 0;
    while (result[i])
    {
        point2 = new geopoint(result[i].latitude, result[i].longitude)
        result[i].distance = mypoint.distanceTo(point2, true)
        i++;
    }
    return(result.sort(ascendingdist))
}

function profilevalidate(req, res, css, p)
{
    if (p.confirm !== 1)
    {
        res.render('login.ejs', {req: req, css: css, error: 'Please confirm your accont by email'})
        return false
    }
    else if (!p.gender || !p.orientation || !p.bio || !p.age || p.img1 == 'empty.png')
    {
        res.render('profile.ejs', {req: req, css: css, error: 'Please complete your profile before choosing your peer', profile: p})
        return false
    }
    else
        return true
}

function    lookingfor(gender, orientation1, orientation2, myid, callback)
{
    sql = 'SELECT * FROM users WHERE orientation = ? AND gender = ? AND id <> ?';
    vars = [orientation1, gender, myid]
    con.query(sql, vars, function (err, result) { if (err) throw err
        sql = 'SELECT * FROM users WHERE orientation = ? AND gender = ? AND id <> ?';
        vars = [orientation2, gender, myid]
        con.query(sql, vars, function (err, result2) { if (err) throw err
        result = result.concat(result2)
        return callback(result);
    }) })
}
function    settags(result, callback)
{
    con.query('SELECT * FROM tags', function(err, tag) { if (err) throw err; 
        var i = 0;
            tags = new Array();
        while (result[i])
        {
            var onetag = tag.filter(function(val, a, tag) {return (val.user_id == result[i].id)})
            result[i].tags = onetag
            i++;
        }
        return (callback(result))
    })
}
function descendingtags(first, second)
{
    if (first.scoretag == second.scoretag)
        return 0;
    if (first.scoretag > second.scoretag)
        return -1;
    else
        return 1; 
}
function    tritags(profile, result)
{
    i = 0
    while (result[i])
    {
        result[i].scoretag = 0
        var a = 0;
        while(profile.tag[a])
        {
            var e = 0;
            while (result[i].tags[e])
            {
                if (result[i].tags[e].tag == profile.tag[a].tag)
                    result[i].scoretag++;
                e++;
            }
            a++;
        }
        console.log(result[i].scoretag)
    console.log(result[i].tags)

        i++;
    }
    result = result.sort(descendingtags)

    return (result);
}

function    gender_orientation(orientation, gender, callback)
{
    if (orientation == 'Heterosexual')
    {
        if (gender == 'Male')
        {
            lookingfor('Female', 'Heterosexual', 'Bisexual', req.session.profile.id, function(result) { return callback(result); })
        }
        else if (gender == 'Female')
        {
            lookingfor('Male', 'Heterosexual', 'Bisexual', req.session.profile.id, function(result) { return callback(result); })
        }
    }
    else if (orientation == 'Homosexual')
    {
        if (gender == 'Male')
        {
            lookingfor('Male', 'Homosexual', 'Bisexual', req.session.profile.id, function(result) { return callback(result); })
        }
        else if (gender == 'Female')
        {
            lookingfor('Female', 'Homosexual', 'Bisexual', req.session.profile.id, function(result) { return callback(result); })
        }
    }
    else if (orientation == 'Bisexual')
    { 
        if (gender == 'Male')
        {
            lookingfor('Male', 'Homosexual', 'Bisexual', req.session.profile.id, function(result1) {
            lookingfor('Female', 'Heterosexual', 'Bisexual', req.session.profile.id, function(result2) { 
            result = result1.concat(result2)
            return callback(result); }) })
        }
        else if (gender == 'Female')
        {
            lookingfor('Female', 'Homosexual', 'Bisexual', req.session.profile.id, function(result1) {
            lookingfor('Male', 'Heterosexual', 'Bisexual', req.session.profile.id, function(result2) { 
            result = result1.concat(result2)
            return callback(result); }) })
        }
    }
}

if (req.session.profile == undefined)
    res.render('index.ejs', {req: req, css: css})
else if (profilevalidate(req, res, css, req.session.profile) == false)
     ;
else
{
   gender_orientation(req.session.profile.orientation, req.session.profile.gender, function(result_1) {
        settags(result_1, function(result) {
        result = sortdistance(result)
        if (req.body.tri == "Age")
            result = result.sort(triage)
        else if (req.body.tri == "Location")
            ;
        else if (req.body.tri == "Score")
            result = result.sort(ascendingscore)
        else if (req.body.tri == "Tags")
            tritags(req.session.profile, result)
        else
        {
            result = result.sort(ascendingscore)
            result = result.sort(triage)
            result = sortdistance(result)
            tritags(req.session.profile, result)
        }

        if (req.body.agemax)
        {
            result = result.filter(function(val, i, result) {
                return (val.age <= req.body.agemax);
            });
        }
        if (req.body.agemin)
        {
            result = result.filter(function(val, i, result) {
                return (val.age >= req.body.agemin);
            });
        }
        if (req.body.scoremax)
        {
            result = result.filter(function(val, i, result) {
                return (val.score <= req.body.scoremax);
            });
        }
        if (req.body.scoremin)
        {
            result = result.filter(function(val, i, result) {
                return (val.score >= req.body.scoremin);
            });
        }
        if (req.body.distance)
        {
            result = result.filter(function(val, i, result) {
                return (val.distance <= req.body.distance);
            });
        }
        if (req.body.tags)
        {
            var tags = eschtml(req.body.tags)
            var tabtags = tags.split(";")
            console.log(tabtags)
            // result = result.filter(function(val, i, result) {
                // return (val.tags == req.body.distance);
            // });
        }
       res.render('peers.ejs', {req: req, peer: result, css: css})
    }) });
}
        