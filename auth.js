const passport= require('passport');
const MrmDAO= require("./public/js/MrmDAO.js")
const medDAO= new MrmDAO();
const PassportLocal = require('passport-local').Strategy;


passport.use(new PassportLocal(function(username, password, done){

    // enviar datos a la funcion
    medDAO.createConnection();
    medDAO.connectToDatabase();
    var credentials = [username, password];
    medDAO.loginUsuario(credentials, function(err,result){
        if(err != null){
            console.log("Error al autenticar");
            return done(err, null);
        }else if(result == "vacio"){
            console.log("El usuario no existe")
            return done(err, null);
        }else{
            // si existe el usuario entonces hay que revisar que la password sea correcta
            medDAO.compararPassword(credentials, function(err, result){
                if(err != null){
                    console.log("Error al autenticar");
                    return done(err, null);
                }else if(result == "incorrecta"){
                    console.log("La contraseña es incorrecta");
                    return done(err, null);
                }else if(result == "loggeado"){
                    console.log("Autenticado correctamente");
                    
                    
                    // Crear la session para el usuario
                    // 1. Obtener el usuarioD

                    medDAO.consultarClaveDoctor(credentials, function(err, result){
                        var uD = 0;
                        if(err != null){
                            console.log("Error al autenticar");
                            return done(err, null);
                        }else{
                            var userD = result[0];
                            uD = userD.usuarioD;
                            //console.log("Usuario Doctor es: "+ uD);
                            // 2. Guardar el usuarioD en la session
                            return done(null,{id: uD});
                        }
                    // redirigir al menu
                    res.redirect("/menuGeneral");
                    done(null, false);
                    });
                }
            });
        }
        
    });
        
    
}));

// Serializar al usuario
passport.serializeUser(function(user, done){
    done(null, user.id);
});

// Deserialización
passport.deserializeUser(function(id, done){
    done(null,{id: 1});
});


module.exports=passport;