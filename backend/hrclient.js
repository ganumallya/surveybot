var app = require('express')();
var _ = require('lodash');
var mysql = require('mysql');
var con = mysql.createConnection({
    host: "or1010051248181.corp.adobe.com",
    user: "root",
    password: "1234",
    port: 3306,
    database: 'hr'
});

function hrAPI(app) {

    app.post('/fetchResults', function (req, res) {
        let query;
        const queryString = req.body.query;
        if (queryString)
            query = "SELECT * FROM employee_records WHERE " + queryString;
        else
            query = "SELECT * FROM employee_records";
    
        console.log("query: ", query);
    
        // connect to database and query
        if (!con._connectCalled) {
            // console.log("IF");
            con.connect(function (err) {
                if (err) {
                    console.log(err);
                    res.send("");
                }
                console.log("connected");
                con.query(query, function (err, result) {
                    if (err) {
                        console.log(err);
                        res.send("");
                    }
                    res.send(result);
                });
    
            });
    
        }
        else {
            // console.log("ELSE");
            con.query(query, function (err, result) {
                if (err) {
                    console.log(err);
                    res.send("");
                };
                res.send(result);
            });
        }
    
    });
    
    // get COUNTRY
    app.get('/getCountry/:geography', function (req, res) {
        let query = "SELECT DISTINCT COUNTRY FROM employee_records WHERE GEOGRAPHY = '" + req.params.geography + "' AND COUNTRY != ''";
        console.log(query);

        if (!con._connectCalled) {
            // console.log("IF");
            con.connect(function (err) {
                if (err) {
                    console.log(err);
                    res.send("");
                } else {
                    console.log("Connected to database..");
                    con.query(query, function (err, result) {

                        if (err) {
                            console.log(err);
                            res.send("");
                        }
                        console.log("Success");
                        res.send(result);
                    });
                }


            });

        }
        else {
            // console.log("ELSE");
            con.query(query, function (err, result) {
                if (err) {
                    console.log(err);
                    res.send("");
                };
                res.send(result);
            });
        }


    });


    // get Business Unit
    app.get('/getBU', function (req, res) {
        let query = "SELECT DISTINCT BUSINESS_UNIT FROM employee_records WHERE BUSINESS_UNIT != ''";
        console.log(query);

        if (!con._connectCalled) {
            // console.log("IF");
            con.connect(function (err) {
                if (err) {
                    console.log(err);
                    res.send("");
                }
                console.log("Connected to database..");
                con.query(query, function (err, result) {
                    if (err) {
                        console.log(err);
                        res.send("");
                    }
                    console.log("Success...");
                    res.send(result);
                });

            });

        }
        else {
            // console.log("ELSE");
            con.query(query, function (err, result) {
                if (err) {
                    console.log(err);
                    res.send("");
                };
                console.log("Success..");
                res.send(result);
            });
        }
    });


    // get Role
    app.get('/getRole', function (req, res) {
        let query = "SELECT DISTINCT ROLE FROM employee_records WHERE ROLE != ''";
        console.log(query);

        if (!con._connectCalled) {
            // console.log("IF");
            con.connect(function (err) {
                if (err) {
                    console.log(err);
                    res.send("");
                }
                console.log("Connected to database..");
                con.query(query, function (err, result) {
                    if (err) {
                        console.log(err);
                        res.send("");
                    }
                    console.log("Success...");
                    res.send(result);
                });

            });

        }
        else {
            // console.log("ELSE");
            con.query(query, function (err, result) {
                if (err) {
                    console.log(err);
                    res.send("");
                };
                console.log("Success..");
                res.send(result);
            });
        }
    });


    // get Mgmt_level
    app.get('/getMgmtLevel', function (req, res) {
        let query = "SELECT DISTINCT MGMT_LVL_GRP ROLE FROM employee_records WHERE MGMT_LVL_GRP != '' ";
        console.log(query);

        if (!con._connectCalled) {
            // console.log("IF");
            con.connect(function (err) {
                if (err) {
                    console.log(err);
                    res.send("");
                }
                console.log("Connected to database..");
                con.query(query, function (err, result) {
                    if (err) {
                        console.log(err);
                        res.send("");
                    }
                    console.log("Success...");
                    res.send(result);
                });

            });

        }
        else {
            // console.log("ELSE");
            con.query(query, function (err, result) {
                if (err) {
                    console.log(err);
                    res.send("");
                };
                console.log("Success..");
                res.send(result);
            });
        }
    });


    // get City
    app.get('/getCity', function (req, res) {
        let query = "SELECT DISTINCT  CITY FROM employee_records WHERE CITY != '' ";
        console.log(query);

        if (!con._connectCalled) {
            // console.log("IF");
            con.connect(function (err) {
                if (err) {
                    console.log(err);
                    res.send("");
                }
                console.log("Connected to database..");
                con.query(query, function (err, result) {
                    if (err) {
                        console.log(err);
                        res.send("");
                    }
                    console.log("Success...");
                    res.send(result);
                });

            });

        }
        else {
            // console.log("ELSE");
            con.query(query, function (err, result) {
                if (err) {
                    console.log(err);
                    res.send("");
                };
                console.log("Success..");
                res.send(result);
            });
        }
    });

    // get Region
    app.get('/getRegion/:country', function (req, res) {
        let query = "SELECT DISTINCT CITY FROM employee_records WHERE COUNTRY = '" + req.params.country + "' AND REGION != '' ";
        console.log(query);

        if (!con._connectCalled) {
            // console.log("IF");
            con.connect(function (err) {
                if (err) {
                    console.log(err);
                    res.send("");
                }
                console.log("Connected to database..");
                con.query(query, function (err, result) {
                    if (err) {
                        console.log(err);
                        res.send("");
                    }
                    console.log("Success...");
                    res.send(result);
                });

            });

        }
        else {
            // console.log("ELSE");
            con.query(query, function (err, result) {
                if (err) {
                    console.log(err);
                    res.send("");
                };
                console.log("Success..");
                res.send(result);
            });
        }
    });

    // get Geography
    app.get('/getGeography', function (req, res) {
        let query = "SELECT DISTINCT GEOGRAPHY FROM employee_records WHERE GEOGRAPHY != '' ";
        console.log(query);

        if (!con._connectCalled) {
            // console.log("IF");
            con.connect(function (err) {
                if (err) {
                    console.log(err);
                    res.send("");
                }
                console.log("Connected to database..");
                con.query(query, function (err, result) {
                    if (err) {
                        console.log(err);
                        res.send("");
                    }
                    console.log("Success...");
                    res.send(result);
                });

            });

        }
        else {
            // console.log("ELSE");
            con.query(query, function (err, result) {
                if (err) {
                    console.log(err);
                    res.send("");
                };
                console.log("Success..");
                res.send(result);
            });
        }
    });

    // get Dept_name
    app.get('/getDepartment', function (req, res) {
        let query = "SELECT DISTINCT DEPARTMENT_NAME FROM employee_records WHERE DEPARTMENT_NAME != '' ";
        console.log(query);

        if (!con._connectCalled) {
            // console.log("IF");
            con.connect(function (err) {
                if (err) {
                    console.log(err);
                    res.send("");
                }
                console.log("Connected to database..");
                con.query(query, function (err, result) {
                    if (err) {
                        console.log(err);
                        res.send("");
                    }
                    console.log("Success...");
                    res.send(result);
                });

            });

        }
        else {
            // console.log("ELSE");
            con.query(query, function (err, result) {
                if (err) {
                    console.log(err);
                    res.send("");
                };
                console.log("Success..");
                res.send(result);
            });
        }
    });


    // get Company Code
    app.get('/getCompanyCode', function (req, res) {
        let query = "SELECT DISTINCT COMPANY_CODE FROM employee_records WHERE COMPANY_CODE != '' ";
        console.log(query);

        if (!con._connectCalled) {
            // console.log("IF");
            con.connect(function (err) {
                if (err) {
                    console.log(err);
                    res.send("");
                }
                console.log("Connected to database..");
                con.query(query, function (err, result) {
                    if (err) {
                        console.log(err);
                        res.send("");
                    }
                    console.log("Success...");
                    res.send(result);
                });

            });

        }
        else {
            // console.log("ELSE");
            con.query(query, function (err, result) {
                if (err) {
                    console.log(err);
                    res.send("");
                };
                console.log("Success..");
                res.send(result);
            });
        }
    });


    // get Senior Directors
    app.get('/getSeniorDirector', function (req, res) {
        let query = 'select * from employee_records where business_title like "Senior Director%";';
        console.log(query);

        if (!con._connectCalled) {
            // console.log("IF");
            con.connect(function (err) {
                if (err) {
                    console.log(err);
                    res.send("");
                }
                console.log("Connected to database..");
                con.query(query, function (err, result) {
                    if (err) {
                        console.log(err);
                        res.send("");
                    }
                    console.log("Success...");
                    res.send(result);
                });

            });

        }
        else {
            // console.log("ELSE");
            con.query(query, function (err, result) {
                if (err) {
                    console.log(err);
                    res.send("");
                };
                console.log("Success..");
                res.send(result);
            });
        }
    });

    //Get Reportees
    app.get('/getreportee/:name', function (req, res) {
        let query = 'select * from employee_records where manager_ldap="' + req.params.name + '";';
        console.log(query);

        if (!con._connectCalled) {
            // console.log("IF");
            con.connect(function (err) {
                if (err) {
                    console.log(err);
                    res.send("");
                }
                console.log("Connected to database..");
                con.query(query, function (err, result) {
                    if (err) {
                        console.log(err);
                        res.send("");
                    }
                    console.log("Success...");
                    res.send(result);
                });

            });

        }
        else {
            // console.log("ELSE");
            con.query(query, function (err, result) {
                if (err) {
                    console.log(err);
                    res.send("");
                };
                console.log("Success..");
                res.send(result);
            });
        }
    });

}


module.exports = hrAPI;
