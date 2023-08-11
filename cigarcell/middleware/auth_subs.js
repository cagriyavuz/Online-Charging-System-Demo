module.exports = async function auth(req, res, next) {
    const jwt = require('jsonwebtoken')
    const db = require('../config/db')

    try {
        // console.log(req.cookies);
        const token = req.cookies.token;
        // const token2 = await req.headers['authorization'].split(' ')[1]
        // console.log(token);
        if (token == null) {
            return res.status(401).json({
                success: false,
                code: 401,
                message: "Lütfen Tekrar Giriş Yapın!"
            })
        } else {



            const sonuc = jwt.verify(token, 'supersecret')
            if (sonuc == "hata") {
                res.redirect('/homePage')
            } else {
                // console.log(sonuc);
                let sql = "SELECT * FROM subscriber WHERE subsId = ?";
                db.query(sql, [sonuc.id], (err, result) => {
                    if (err) throw err;
                    // console.log(result[0]);
                    req.user = result[0]
                    next()
                })


            }
        }


    } catch (err) {
        if (err.message == 'invalid signature') {
            res.status(401).json({
                success: false,
                code: 401,
                message: "Belirtilen token hatalı."
            })
        } else if (err.name == 'TokenExpiredError') {
            res.redirect('/signIn')
                // res.status(401).json({
                //     success: false,
                //     code: 401,
                //     message: "Token tüketim tarihini doldurmuştur."
                // })
        } else {
            console.log(err);
            res.status(401).json({
                success: false,
                code: 401,
                message: "Sistemin bilmediği bir hata oluştu."
            })
        }

    }
}