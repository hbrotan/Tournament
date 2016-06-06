// server.js

// BASE SETUP
// =============================================================================
// packages
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var uuid = require('node-uuid');
var bodyParser = require('body-parser');
var _ = require('lodash');

// AZURE SQL DATABASE CONNECTION
// ===================================================================================
var sql = require( "seriate" );
var config = {  
    "server": process.env.server,
	"port": 1433,
    "user": process.env.user,
    "password": process.env.password,
    "database": process.env.database,
    "pool": { "max": 5, "min": 1 },
	"options": { "encrypt": true }
};
sql.setDefaultConfig( config );

// CONFIG
// ===================================================================================

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'OPTIONS,GET,POST,PUT,DELETE');
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    if ('OPTIONS' == req.method){
        return res.send(200);
    }
    next();
});
app.use(function (req, res, next) {
	res.header('Content-Type', 'application/json; charset=utf-8');
	next();
});

var port = process.env.PORT || 3000;        // set the port

// ROUTES FOR THE API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to the api!' });   
});

router.get('/tournament/:tournament/league', function (req, res) {
	sql.execute({  
        query: 'SELECT [League] FROM [dbo].[Result] WHERE Tournament = @tournament',
        params: {
        tournament: {
            type: sql.VARCHAR,
            val: req.params.tournament,
            }
        }
    }).then( function( results ) {
        res.send(results);
    }).catch(function(error){
		res.json(error);
		throw error;
	});	
});

router.route('/tournament/:tournament/league/:league/result')
    .get( function (req, res) {
        sql.execute({  
            query: 'SELECT [CalculatedAt],[Result] FROM [dbo].[Result] WHERE CalculatedAt = (SELECT MAX(CalculatedAt) FROM [dbo].[Result] WHERE Tournament = @tournament AND League = @league)',
            params: {
				tournament: {
					type: sql.VARCHAR,
					val: req.params.tournament,
				},
                league: {
					type: sql.VARCHAR,
					val: req.params.league,
				}
			}
        }).then( function( results ) {
            res.send(results);
        }).catch(function(error){
            res.json(error);
            throw error;
        });	
    })
	.post(function(req, res){
		var result = JSON.stringify(req.body);
			
        // Add new result			
        var userId = uuid.v1();							
        sql.execute({  
            query: 'INSERT INTO [dbo].[Result]([Id],[Tournament],[League],[CalculatedAt],[Result]) VALUES (@id, @tournament, @league, @calculatedAt, @result)',
            params: {
                id: {
                    type: sql.UNIQUEIDENTIFIER,
                    val: userId,
                },
                tournament: {
                    type: sql.VARCHAR,
                    val: req.params.tournament,
                },
                league: {
                    type: sql.VARCHAR,
                    val: req.params.league,
                },
                calculatedAt: {
                    type: sql.DATETIME,
                    val: new Date(),
                },
                result: {
                    type: sql.VARCHAR,
                    val: result,
                },
            }
        }).then( function() {
            res.send(result);
            //res.json({message: 'Results added'});
        }).catch(function(error){
            res.json(error);
            throw error;
        });					
	});
	
// REGISTER THE ROUTES -------------------------------
app.use('/api', router);//Api
app.use('/', express.static(__dirname)); //Serve web

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);