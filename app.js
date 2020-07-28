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

const storage1 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/subidas/perfil/')
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  }
})
const upload1 = multer({ storage: storage1 })

const storage2 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/subidas/portada/')
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  }
})
const upload2 = multer({ storage: storage2 })


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
app.post('/add', upload1.single('file'), controladorUsuario.postSignup);

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

    let perPage = 9;
    let page = req.params.page || 1;
    var session = req.user;

    Work
      .find({}) // finding all documents
      .skip((perPage * page) - perPage) // in the first page the value of the skip is 0
      .limit(perPage) // output just 9 items
      .exec((err, works) => {
          if (err) return next(err);
          res.render('index', {
            session,
            works,
          });
      });
  });

//REGISTRAR UNA NUEVA PUBLICACION - SE ACTIVA CUANDO PRESIONAS ENVIAR EN EL FORMULARIO DE PUBLICACION
app.post('/addCatg', upload2.single('file'), controladorTrabajo.postRegistrar);



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
  let perPage = 3;
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


app.get('/editPublicacion', function(req, res){
      var wd = req.query.wd;
      res.type('text/html');
      var session = req.user;
      res.render('partes/editPublicacion', {session, wd});
});


app.post('/EditarPublicacion', upload2.single('file'), (req, res) => {
  var wd = req.body.id;
  console.log(wd);
  var session = req.user;
  Work.findByIdAndUpdate(wd, {
    publicaciones:{
        categoria : req.body.categoria,
        lugar : req.body.lugar,
        tituloTrabajo : req.body.tituloTrabajo,
        descripcion : req.body.descripcion
      },
      file : req.file.originalname
  }, (error, work) => {
    console.log(console.log(error),
    res.render('partes/editPublicacion', {session, wd})
  )
  })

})


//EDITAR LO DATOS DEL USUARIO
app.post('/editp', (req, res) => {

  var userID = req.body.id;
  console.log(userID);
  var session = req.user;
  Usuario.findByIdAndUpdate(userID, {
    nombre : req.body.nombre,
    apellido : req.body.apellido,
    email : req.body.email,
    telefono : req.body.telefono
  }, (error, usuario) => {
    console.log(console.log(error),
    res.render('partes/conf', {session})
  )
  })

})


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
