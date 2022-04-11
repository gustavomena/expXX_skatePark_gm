const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const expressFileUpload = require('express-fileupload');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const {newSkater, getSkaters, setSkater, setValid, deleteSkater} = require('./private/db/queries');

const {key} = require('./jwt/key');

const port = process.env.PORT || 5000;



app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(expressFileUpload({
    limits: {fileSize: 5000000},
    abortOnLimit: true,
    responseOnLimit: 'El peso del arhivo que intentar subir supera el limite permitido',
}));


app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/bootstrapJS', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/swal', express.static(__dirname + '/node_modules/sweetalert/dist'));
app.use('/public', express.static(__dirname + '/public'));

app.set('view engine', 'handlebars')

app.engine('handlebars', exphbs.engine({
    layoutsDir: __dirname + '/views',
    partialsDir: __dirname + '/views/components'
}))

app.get('/', async (req, res) => {
    const {id, estado} = req.query
    await setValid(id, estado)
    const skaters = await getSkaters()
    res.render('index', {
        layout: 'index',
        skaters
    })
})

app.get('/registro', (req, res) => {
    res.render('register', {
        layout: 'register'
    })
})

app.post('/registrado', async (req, res) =>{ 
    const {email, skater_name, password, password2, experience_yrs, specialty} = req.body
    const {photo} = req.files
    const isValid = false
    const new_photo = `${skater_name}.jpg`
    if (password == password2) {
        photo.mv(`${__dirname}/public/imgs/${skater_name}.jpg`)
        await newSkater(email, skater_name, password, experience_yrs, specialty, new_photo, isValid)
        res.send(`<script>alert('El usuario ha sido creado éxitosamente'); window.location.href = '/registro'</script>`)
    } else {
        res.send(`<script>alert('Las contraseñas no coinciden'); window.location.href = '/registro'</script>`)
    }
})

app.get('/login', (req, res) => {
    res.render('login', {
        layout: 'login'
    })
})


app.use('/signin', async (req, res, next) => {
    const {email, password} = req.query
    email == 'admin@admin.com' && password == '123456'
        ? res.redirect('/admin')
        : next()
})

app.get('/admin', async (req, res) => {
    const skaters = await getSkaters()
    res.render('admin', {
        layout: 'admin',
        skaters
    })
})

app.get('/signin', async (req, res) => {
    const {email, password} = req.query
    const skaters = await getSkaters()
    const auth = skaters.find((s) => s.email == email && s.password == password)
    
    if (auth) {
        const token = jwt.sign({
            exp: Math.floor(Date.now()/ 1000) + 300,
            data: auth
        }, key)

        res.send(`<script>alert('vamos!, ahora debes actualizar tus datos'); window.location.href = '/actualizar?token=${token}'</script>`)
    } else {
        res.status(401).send(`<script>alert('Email y contraseña no válidos'); window.location.href = '/login'</script>`)
    }
})

app.get('/actualizar', (req, res) => {
    const {token} = req.query
    jwt.verify(token, key, (err, decoded) => {
        const skater = decoded.data
        err
            ? res.status(401).send({
                error: '401 Unauthorized',
                message: err.message
            })
            : res.render('update', {
                layout: 'update',
                skater
            })
    })
})


app.post('/actualizando', async (req, res) => {
    const {skater_name, password, experience_yrs, specialty, email, password2} = req.body
    if (password == password2) {
        await setSkater(email, skater_name, password, experience_yrs, specialty)
        res.send(`<script>alert('Se han actualizado los datos'); window.location.href = '/'</script>`)
        
    }else {
        res.send(`<script>alert('Las nuevas contraseñas deben ser iguales'); window.location.href = '/login'</script>`)
    }

})

app.get('/delete', async (req, res) =>{
    const {id} = req.query
    await deleteSkater(id)
    res.send(`<script>alert('Se han eliminado los datos'); window.location.href = '/'</script>`)
})




app.listen(port, () => console.log(`Servidor levantado en el puerto ${port}`))