const path = require('path');
const express = require('express');
  /*  ejs = require('ejs'),
    cookieParser = require('cookie-parser');*/
const app = express();
const session = require('express-session');
const morgan = require('morgan');
const multer = require('multer');//PARA MANEJAR LOS ARCHIVOS
const mongoose = require('./models/connection'); // importa el archivo de conexión
const faker  = require('faker');
const MongoStore = require('connect-mongo')(session);
const MONGO_URL = 'mongodb://localhost/testDB';
const bodyParser = require('body-parser');
const passport = require('passport');
const passportConfig = require('./config/passport');


const Usuario = require('./models/user'); // importa el esquema
const Work = require('./models/work'); // importa el esquema

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


//RUTAS
const controladorUsuario = require('./controladores/usuario');
const controladorTrabajo = require('./controladores/trabajo');

//REGISTRAR UN NUEVO USUARIO
app.post('/add', upload.single('file'), controladorUsuario.postSignup);

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

//REGISTRAR UNA NUEVA PUBLICACION - SE ACTIVA CUANDO PRESIONAS ENVIAR EN EL FORMULARIO DE PUBLICACION
app.post('/addCatg', upload.single('file'), controladorTrabajo.postRegistrar);



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
    var qwery1 = { "_id" : req.query.dp }; //CONSULTA PARA LA TABLA DE TRABAJOS
    var qwery2 = { "_id" : req.query.du }; //CONSULTA PARA LA TABLA DE USUARIOS

    Work
      .find(qwery1) // finding all documents
      .exec((err, works) => {

        Usuario
          .find(qwery2) // finding all documents
          .exec((err, usuarios) => {

            res.type('text/html');
            var session = req.user;
            workDp = works[0];
            userDu = usuarios[0];
            res.render('partes/trabajo', {session, workDp, userDu});

          });

      });
});


app.get('/PerfilView', function(req, res){
    var qwery1 = { "_id" : req.query.ud }; //CONSULTA PARA LA TABLA DE USER
    var qwery2 = { "userID" : req.query.ud }; //CONSULTA PARA LA TABLA DE TRABAJOS

    Work
      .find(qwery2) // finding all documents
      .exec((err, works) => {

        Usuario
          .find(qwery1) // finding all documents
          .exec((err, usuarios) => {
          //  console.log(works);
            console.log(usuarios[0].nombre);
            res.type('text/html');
            var session = req.user;
            var userD = usuarios[0];

            res.render('partes/perfilView', {session, works, userD});

          });

      });
});


//MUESTRA EL PERFL DEL USUARIO
app.get('/Perfil', function(req, res){
  var session = req.user;
  var qwery1 = { "userID" : session._id }; //CONSULTA PARA LA TABLA DE TRABAJOS
  Work
    .find(qwery1) // finding all documents
    .exec((err, works) => {

          res.type('text/html');
          res.render('partes/perfil', {session, works});

    });
});

//MUESTRA CREAR PUBLICACION
app.get('/CrearPublicacion', function(req, res){
    res.type('text/html');
    var session = req.user;
    res.render('partes/crearPublicacion', {session},
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

//MUESTRA LAS OFERTAS POR CATEGORIAS

app.get('/Category/:page', (req, res) => {
  console.log(req.query.v1);
  let perPage = 6;
  let page = req.params.page || 1;
  var session = req.user;
  var qwery = { "publicaciones.categoria" : req.query.v1 };
  var catg = req.query.v1;
  Work
    .find(qwery) // finding all documents
    .skip((perPage * page) - perPage) // in the first page the value of the skip is 0
    .limit(perPage) // output just 9 items
    .exec((err, works) => {
      Work.find(qwery).count((err, count) => { // count to calculate the number of pages
        if (err) return next(err);
        res.render('partes/category', {
          session,
          works,
          catg,
          current: page,
          pages: Math.ceil(count / perPage)
        });
      });
    });
});

//MUESTRA el perfil del trabajador
app.get('/PerfilView', function(req, res){
    var qwery1 = { "_id" : req.query.dp }; //CONSULTA PARA LA TABLA DE TRABAJOS
    var qwery2 = { "_id" : req.query.du }; //CONSULTA PARA LA TABLA DE USUARIOS
    Work
      .find(qwery1) // finding all documents
      .exec((err, works) => {
        Usuario
          .find(qwery2) // finding all documents
          .exec((err, usuarios) => {
            res.type('text/html');
            var session = req.user;
            userDu = usuarios[0];
            res.render('partes/perfilView', {session, works, userDu});

          });

      });
});

//MUESTRA EL PERFILO DE LOS DUEÑOS DE LA PAGINA
app.get('/Perfil_autor', function(req, res){
    var ceDe = req.query.ce;
    res.type('text/html');
    var session = req.user;
    res.render('partes/perfil_autor', {session, ceDe},
    function(err, html){
        if(err) throw err;
        res.send(html);
    });
});



app.get('/PerfilView', function(req, res){
    var ceDe = { "_id" : req.query.dp }; //CONSULTA PARA LA TABLA DE TRABAJOS
            res.type('text/html');
            var session = req.user;
            res.render('partes/perfil_autor', {session, ceDe});
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
