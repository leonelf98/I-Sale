const path = require('path');
const express = require('express');
  /*  ejs = require('ejs'),
    cookieParser = require('cookie-parser');*/
const app = express();
//const router = express.Router();
const session = require('express-session');
const morgan = require('morgan');
const multer = require('multer');//PARA MANEJAR LOS ARCHIVOS
const mongoose = require('./models/connection'); // importa el archivo de conexión
const Usuario = require('./models/user'); // importa el esquema
const MongoStore = require('connect-mongo')(session);
const MONGO_URL = 'mongodb://localhost/testDB';
const bodyParser = require('body-parser');
const passport = require('passport');
const passportConfig = require('./config/passport');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/subidas/')
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  }
})
const upload = multer({ storage })

//Hay que indicarle a node que view engine se va a usar
app.set('view engine', 'ejs');
//Hay que indicarle a node donde estarán los acrhivos públicos
app.use(express.static('public'));


//app.use(express.urlencoded({extended: false})) //Para interpretar los datos que vienen de un formulario y poder procesarlo

app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({
      url: MONGO_URL,
      autoReconnect: true
    })
}))



app.use(passport.initialize()); //iniciar pasport
app.use(passport.session()); //usar sesion de passport

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true})); //Para interpretar los datos que vienen de un formulario y poder procesarlo


//Metodo que establece la direccion y el nombre de la imagen
/*var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null,path.join(__dirname,'/public/subidas'));
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  }
});*/

//RUTAS
const controladorUsuario = require('./controladores/usuario');

//REGISTRAR UN NUEVO USUARIO
app.post('/add', upload.single('file'),/*
function(req,res){
    console.log(JSON.stringify(req.body.email));
    var upload = multer({ storage : storage}).single('file');
    upload(req,res,function(err) {
        if(err) {
            return res.end("Error uploading file.");
        }
        res.end("File is uploaded");
    });
}*/
controladorUsuario.postSignup);

//LOGIN DE UN USUARIO EXISTENTE
app.post('/login2', controladorUsuario.postLogin);

//VERIFICAR LA SESION DEL USUARIO
app.get('/usuarioInfo', passportConfig.estaAutenticado, (req, res) => {
  //res.json(req.user);
  var test = req.user;
  res.send(test);
})

//CERRAR SESION
app.get('/logout', passportConfig.estaAutenticado, controladorUsuario.logout);

//MUESTRA EL HOME
  app.get('/', function(req, res){
      res.type('text/html');
      var session = req.user;
      res.render('index', {session},
      function(err, html){
          if(err) throw err;
          res.send(html);
      });
  });


//MUESTRA EL PANEL DE REGISTRO DE USUARIO
app.get('/Registro', function(req, res){
    res.type('text/html');
    var session = req.user;
    res.render('partes/registro', {session},
    function(err, html){
        if(err) throw err;
        res.send(html);
    });
});

//MUESTRA EL LOGIN
app.get('/Login', function(req, res){
    res.type('text/html');
    var session = req.user;
    res.render('partes/login', {session},
    function(err, html){
        if(err) throw err;
        res.send(html);
    });
});

//MUESTRA LA LISTA DE TRABAJOS
app.get('/Trabajos', function(req, res){
    res.type('text/html');
    var session = req.user;
    res.render('partes/trabajo', {session},
    function(err, html){
        if(err) throw err;
        res.send(html);
    });
});

//MUESTRA EL PERFL DEL USUARIO
app.get('/Perfil', function(req, res){
    res.type('text/html');
    var session = req.user;
    res.render('partes/perfil', {session},
    function(err, html){
        if(err) throw err;
        res.send(html);
    });
});

//MUESTRA EL PANEL DE CONFIGURACION DEL USUARIO
app.get('/Conf', function(req, res){
    res.type('text/html');
    var session = req.user;
    res.render('partes/conf', {session},
    function(err, html){
        if(err) throw err;
        res.send(html);
    });
});

//MUESTRA EL PERFILO DE LOS DUEÑOS DE LA PAGINA
app.get('/Perfil_autor', function(req, res){
    res.type('text/html');
    var session = req.user;
    res.render('partes/perfil_autor', {session},
    function(err, html){
        if(err) throw err;
        res.send(html);
    });
});

//MUESTRA LAS OFERTAS POR CATEGORIAS
app.get('/Category', function(req, res){
    res.type('text/html');
    var session = req.user;
    res.render('partes/category', {session},
    function(err, html){
        if(err) throw err;
        res.send(html);
    });
});


//Error 404
app.use(function(req, res){
    var msg = 'Pagina No Encontrada';
    var error = '404';
    var session = req.user;
    res.type('text/html');
    res.status(404);
    res.render('partes/404', {error, msg, session},
    function(err, html){
        if(err) throw err;
        res.send(html);
    });

});


//module.exports = router;

app.set('port', process.env.PORT || 4000);

app.listen(app.get('port'), function(){
    console.log( 'Servidor iniciado en http://localhost:' +
    app.get('port') + '; presiona Ctrl-C para terminar.' );
});
