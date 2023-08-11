const jwt = require('jsonwebtoken');
const db = require('../config/db');
var nodemailer = require('nodemailer');


const signUp = async(req, res) => {
    try {
        // console.log(req.body);
        let packId = parseInt(req.body.package);
        // let subsId = 0;
        // subsId++;
        let MSISDN = parseInt(req.body.MSISDN);
        let name = req.body.name;
        let surname = req.body.surname;
        let email = req.body.email;
        let password = req.body.password;
        const SDate = new Date();
        db.connect((err) => {
            if (err) throw err;
            else {
                let sql = "INSERT INTO subscriber (MSISDN, NAME, SURNAME, EMAIL, PASSWORD, STATUS, SDate) VALUES ?";
                let value = [
                    [MSISDN, name, surname, email, password, "Aktif", SDate]
                ]
                db.query(sql, [value], (err, result1) => {
                    if (err) throw err;
                    console.log(result1);
                    const token = jwt.sign({ id: result1.insertId }, 'supersecret', {
                        expiresIn: '1h'
                    })
                    res.cookie("token", token, {
                        httpOnly: true
                    })
                    db.query("SELECT * FROM package where packId = ?", packId, (err, result) => {
                        if (err) {
                            console.log(err)
                        }
                        // console.log(result);
                        if (result) {

                            let tempDate = new Date(SDate);
                            tempDate = tempDate.setDate(tempDate.getDate() + result[0].duration)
                            let eDate = new Date(tempDate)

                            let sql2 = "INSERT INTO balance (packId, subsId, bal_lvl_voice, bal_lvl_data, bal_lvl_sms, sDate, eDate) VALUES ?";
                            let value2 = [
                                [packId, result1.insertId, result[0].amount_voice, result[0].amount_data, result[0].amount_sms, SDate, eDate]
                            ]
                            db.query(sql2, [value2], (err, result) => {
                                if (err) throw err;
                                // console.log(result);
                                res.redirect('/mainPage')

                            })
                        }

                    });
                });
            }
        })

    } catch (err) {
        res.json(err)
        console.log(err);

    }
}

const getPackages = async(req, res) => {
    db.query("SELECT * FROM package", (err, result) => {
        if (err) {
            console.log(err)
        }
        res.send(result)
    });
}

const updateUsage = async(req, res) => {
    try {
        // console.log(req.body);
        let obj = req.body
        Object.keys(obj).forEach(function(el) {
            obj[el] = parseInt(obj[el])
        })

        let newData, newSMS, newVoice;
        db.query("SELECT * FROM balance where subsId = ?", req.user.subsId, (err, result) => {
            if (err) {
                console.log(err)
                res.send(err);
            } else {
                // console.log(result[0]);
                // console.log(obj);
                newData = result[0].bal_lvl_data - obj.data;
                newSMS = result[0].bal_lvl_sms - obj.sms;
                newVoice = result[0].bal_lvl_voice - obj.voice;

                let values = [
                    newData,
                    req.user.subsId
                ]
                let values1 = [
                    newSMS,
                    req.user.subsId
                ]
                let values2 = [
                    newVoice,
                    req.user.subsId
                ]

                db.query("UPDATE balance SET bal_lvl_data = ? where subsId = ?", values, (err, result) => {
                    if (err) {
                        console.log(err);
                    } else {
                        db.query("UPDATE balance SET bal_lvl_sms = ? where subsId = ?", values1, (err, result) => {
                            if (err) {
                                console.log(err);
                            } else {
                                db.query("UPDATE balance SET bal_lvl_voice = ? where subsId = ?", values2, (err, result) => {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        res.redirect('/mainPage')
                                    }

                                })
                            }
                        })
                    }

                })
            }
        });
    } catch (error) {
        res.send(error);
        console.log(error);
    }

}

const getPackage = async(req, res) => {
    db.query("SELECT * FROM balance where subsId = ?", req.user.subsId, (err, result) => {
        if (err) {
            console.log(err)
        } else {
            let packId = result[0].packId;
            db.query("SELECT * FROM package where packId = ?", packId, (err, result1) => {
                if (err) {
                    console.log(err)
                } else {
                    // console.log(result1);
                    res.send(result1)
                }

            });
        }
    });
}

const getBalance = async(req, res) => {
    db.query("SELECT * FROM balance where subsId = ?", req.user.subsId, (err, result) => {
        if (err) {
            console.log(err)
        }
        // console.log(result);
        res.send(result)
    });
}
const getUser = async(req, res) => {
    res.send(req.user)
}

const signIn = async(req, res) => {
    db.connect((err) => {
            if (err) throw err;
            else {
                // console.log(req.body);
                let MSISDN = parseInt(req.body.MSISDN);
                let password = req.body.password;

                let sql = "SELECT * FROM subscriber WHERE MSISDN = ? AND password = ?";
                db.query(sql, [MSISDN, password], (err, result) => {
                    if (err) throw err;
                    // console.log(result);
                    const token = jwt.sign({ id: result[0].subsId }, 'supersecret', {
                        expiresIn: '1h'
                    })
                    res.cookie("token", token, {
                        httpOnly: true
                    })
                    res.redirect('/mainPage')

                })
            }
        })
        // const user = await Student.findOne({ email: req.body.email }, async(err, user) => {
        //     //console.log(user);
        //     if (err) {
        //         res.json(err)
        //     } else if (!user) {
        //         res.json('Hatalı bilgi...') // e posta hatalı
        //     } else {
        //         bcrypt.compare(req.body.password, user.password, (error, result) => {
        //             //console.log(req.body.password + user.password);
        //             if (error) {
        //                 res.json(error)
        //             } else if (!result) {
        //                 res.json('Hatalı bilgi...') // şifre hatalı
        //             } else if (result) {
        //                 const token = jwt.sign({ id: user._id }, 'supersecret', {
        //                     expiresIn: '1h'
        //                 })
        //                 res.cookie("token", token, {
        //                     httpOnly: true
        //                 })
        //                 res.redirect('/student/mainPage')
        //                     // res.status(200).json({
        //                     //     "success": true,
        //                     //     "code": 200,
        //                     //     "message": "Girişiniz başarıyla yapıldı.",
        //                     //     "data": {
        //                     //         profile: user,
        //                     //         token: token
        //                     //     }
        //                     // })
        //             }

    //         })
    //     }
    // })
}


const logOut = async(req, res) => {
    //res.json(req.headers.authorization);
    res.clearCookie('token').redirect('/')
}

const forgotPassword = async(req, res) => {
    let email = req.body.email;
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'cagriyavuz.a@gmail.com',
            pass: 'kmiwqdfuaxlftfhr'
        }
    });

    transporter.verify(function(error, success) {
        if (error) throw error;

        console.log('Bağlantı başarıyla sağlandı');
        if (success) {
            db.query("SELECT * FROM subscriber where EMAIL = ?", email, (err, result, fields) => {
                if (err) {
                    console.log(err);
                    res.send(err);
                } else {
                    let mailOptions = {
                        from: 'cagriyavuz.a@gmail.com',
                        to: email,
                        subject: 'reset password',
                        text: "Telefon Numaranız: " + result[0].MSISDN + "\nEmailiniz: " + result[0].EMAIL + "\nŞifreniz: " + result[0].PASSWORD
                    };
                    // console.log(result[0]);
                    transporter.sendMail(mailOptions, function(error, info) {
                        if (error) {
                            console.log(error);
                            res.send(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                            res.redirect("/signIn");
                        }
                    });
                }
            });
        }

    });
}

module.exports = {
    logOut,
    signUp,
    signIn,
    getPackages,
    getUser,
    getBalance,
    updateUsage,
    forgotPassword,
    getPackage
}