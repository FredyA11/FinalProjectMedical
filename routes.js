const express= require('express');
const router= express.Router();
const passport = require('passport');
const multer =  require('multer');
const MrmDAO= require("./public/js/MrmDAO.js")
const medDAO= new MrmDAO();
var dateFormat = require('dateformat');

router.use(express.json());
router.use(express.urlencoded({extended:false}));



const storage = multer.diskStorage( {
    destination: (req, file, cb) =>
    {
        cb(null, 'uploads');
    }, 
    filename: (req, file, cb) =>        
    {
        const { originalname } = file;
        cb(null, originalname);
        console.log(curpG);
    }
});

const upload = multer({storage: storage});

router.use(function timeLog(req, res, next) {
    next();
});

//Request Handling

//LOGIN

router.get('/',(req,res)=>{
    res.render("login");
});

//LOGOUT

router.get("/logout",(req,res)=>{
    
    req.session.destroy();
    req.logout();
    res.redirect('/login');
});

//LOGIN

router.get('/login',(req,res)=>{
    // mostrar el formulario de login
    res.render("login");
});


// Log in
router.post('/loginMed',passport.authenticate('local',{
    successRedirect: "/menuGeneral",
    failureRedirect: "/login"
}));


//REGISTRO DE DOCTOR

router.get('/registro',(req,res)=>{
    res.render("registro");
});

//MENU GENERAL

router.get("/menuGeneral", (req,res,next)=>{
    if(req.isAuthenticated()) return next();

    res.redirect("/login");
} ,(req,res)=>{
    // si ya iniciamos session mostramos la vista
    // si no hay session se redirecciona a /login

    var idDoctor = req.session.passport.user;
    console.log("OBJETO SESSION: "+idDoctor);
    
    usuarioD = idDoctor; // sacar de la session
    credentials = [usuarioD];

    // obtenga todos los pacientes
    medDAO.createConnection();
    medDAO.connectToDatabase();
    medDAO.consultarPacientes(credentials, function(err,result){
        if(err == null){
            console.log("Consulta exitosa");
            //console.log(result);
            let datesArray=[];
            for(let i=0;i<result.length;i++)
            {
                var date= result[i].fechaN;
                let d=dateFormat(date, "yyyy-mm-dd");
                result[i].fechaN=d;
                datesArray.push(d);
                console.log(d);
            }
            
            res.render('menuGeneral.ejs', {
               patients: result
            });
            // mandar el resultado al render
        }else{
            console.log(err)
            console.log("No se pudo consultar");
            // mandar el resultado al render
        }
    });
});

//INFORMACION DE PACIENTE

router.post("/informacionPaciente",(req,res)=>{
    const{curp} = req.body;

    console.log("Curp recibida: "+curp)
    // obtener Informacion del Paciente
    var idDoctor = req.session.passport.user;

    credentials = [curp ,idDoctor];

    medDAO.createConnection();
    medDAO.connectToDatabase();

    var credentials = [curp, usuarioD];
    var infoPaciente = [];
    var histoPaciente = [];
    var archivosPaciente = [];
    var visitasPaciente = [];

    medDAO.consultarPaciente(credentials, function(err,result1){
        if(err == null){
            console.log("Consulta de info paciente exitosa");
            infoPaciente=JSON.parse(JSON.stringify(result1))
            console.log("Prueba:"+infoPaciente[0].fechaN);
            var date= infoPaciente[0].fechaN;
            let d=dateFormat(date, "yyyy-mm-dd");
                infoPaciente[0].fechaN=d;
                console.log(d);
            console.log(infoPaciente);
            //console.log(infoPaciente[0].nombre);
        }else{
            infoPaciente = "vacio";
        }
        // obtener Historia Clinica del Paciente
        medDAO.consultarHistorial(credentials, function(err,result2){
            if(err == null){
                console.log("Consulta de HC exitosa");
                histoPaciente =JSON.parse(JSON.stringify(result2));
                console.log(histoPaciente);
            }else{
                histoPaciente = "vacio";
            }
            // obtener Archivos del Paciente
            medDAO.consultarArchivos(credentials, function(err,result3){
                if(err == null){
                    console.log("Consulta de archivos exitosa");
                    archivosPaciente =JSON.parse(JSON.stringify(result3))
                    console.log(archivosPaciente);
                }else{
                    archivosPaciente = "vacio";
                }

                 // obtener Archivos del Paciente
                medDAO.consultarVisitas(credentials, function(err,result4){
                    if(err == null){
                        console.log("Consulta de visitas exitosa");
                        visitasPaciente =JSON.parse(JSON.stringify(result4))
                        for(let i=0;i<visitasPaciente.length;i++){
                            var datev= visitasPaciente[i].fechaC;
                            let dv=dateFormat(datev, "yyyy-mm-dd");
                            visitasPaciente[i].fechaC=dv;
                            console.log(dv);
                            console.log(visitasPaciente);  
                        }
                        
                        
                    }else{
                        visitasPaciente = "vacio";
                    }

                    res.render('historialMedico', {
                        info: infoPaciente,
                        historial: histoPaciente,
                        archivos: archivosPaciente, 
                        visitas: visitasPaciente
                    });

                });
            
            });
        });        
    });
});

//RECETAS DE PACIENTES
router.post("/generarReceta",(req,res)=>{
    const{nombrePaciente} = req.body;
    var idDoctor = req.session.passport.user;
    
    credentials = [idDoctor];
    medDAO.consultarDoctor(credentials, function(err,result){
        if(err == null){
            console.log("B??squeda por idDoctor exitosa");
            res.render("recetas", {
                nombrePac: nombrePaciente,
                doctor: result
            });
        }else{
            res.render("recetas", {
                nombrePac: nombrePaciente,
                doctor: "vacio"
            });
        }
    });
});



//**************Ruteo de Funciones****************//
// Registro de nuevo m??dico
router.post('/newUser', (req, res) =>{
    
    // obtener datos del form
    const {nombre, aPaterno, aMaterno, correo, cedula, password} = req.body;

    // enviar datos a la funcion
    medDAO.createConnection();
    medDAO.connectToDatabase();
    var credentials = [nombre, correo, cedula, password, aPaterno, aMaterno];
    medDAO.registrarMedico(credentials, function(err,result){
        if(err == null){
            console.log("Registro exitoso");
            res.render("login");
        }else{
            console.log(err)
            res.render("registro");
        }
    });
});

// Log in
router.post('/loginMed2',(req, res) =>{
    // Recibir las credenciales e iniciar session

    // obtener datos del form
    const {correo, password} = req.body;

    // enviar datos a la funcion
    medDAO.createConnection();
    medDAO.connectToDatabase();
    var credentials = [correo, password];
    medDAO.loginUsuario(credentials, function(err,result){
        if(err != null){
            console.log("Error al autenticar");
            res.render("login");
        }else if(result == "vacio"){
            console.log("El usuario no existe")
            res.render("login");
        }else{
            // si existe el usuario entonces hay que revisar que la password sea correcta
            medDAO.compararPassword(credentials, function(err, result){
                if(err != null){
                    console.log("Error al autenticar");
                    res.render("login");
                }else if(result == "incorrecta"){
                    console.log("La contrase??a es incorrecta");
                    res.render("login");
                }else if(result == "loggeado"){
                    console.log("Autenticado correctamente");
                    medDAO.createConnection();
                    medDAO.connectToDatabase();
                    usuarioD = 1;
                    credentials = [usuarioD];
                    medDAO.consultarPacientes(credentials, function(err,result){
                        if(err == null){
                            console.log("Consulta exitosa");
                            console.log(result);
                            res.render('menuGeneral.ejs', {
                            patients: result 
                            });
                            // mandar el resultado al render
                        }else{
                            console.log(err)
                            console.log("No se pudo consultar");
                            // mandar el resultado al render
                        }
                    });
                }
            });
        }
        
    });
});

// Nuevo paciente

router.post('/nuevoPaciente',(req, res) =>{
    // obtener datos del form
    const {nombre, aPaterno, aMaterno, curp, fechan, genero} = req.body;

    var idDoctor = req.session.passport.user;    
    usuarioD = idDoctor;

    let credentials = [nombre, aPaterno, aMaterno, curp, fechan, genero, usuarioD];
    medDAO.createConnection();
    medDAO.connectToDatabase();
    medDAO.registrarPaciente(credentials, function(err,result){
        if(err == null){
            console.log("Registro exitoso");
            // Mostrar el menu general con la nueva consulta
            
            medDAO.inicializarHClinica(curp,function(err,result){
                if(err==null){
                    console.log("HClinica inicializado");
                    
                }
                else{
                    console.log("error inicializar");
                }
                var idDoctor = req.session.passport.user;
                    credentials = [idDoctor];
                    medDAO.consultarPacientes(credentials, function(err,result){
                        if(err == null){
                            console.log("Consulta exitosa");
                            console.log(result);
                            for(let i=0;i<result.length;i++)
                            {
                                var date= result[i].fechaN;
                                let d=dateFormat(date, "yyyy-mm-dd");
                                result[i].fechaN=d;
                                console.log(d);
                            }
                            // mandar el resultado al render
                            res.render('menuGeneral.ejs', {
                                patients: result 
                            });
                        }else{
                            console.log(err)
                            console.log("No se pudo consultar");
                            // mandar el resultado al render
                        }
                    });
            });
            
        }else{
            console.log(err)
            console.log("No se pudo registrar");
            // Mostrar el menu general con la nueva consulta
            var idDoctor = req.session.passport.user;
            
            usuarioD = idDoctor;
            credentials = [usuarioD];
            medDAO.consultarPacientes(credentials, function(err,result){
                if(err == null){
                    console.log("Consulta exitosa");
                    console.log(result);
                    // mandar el resultado al render
                    res.render('menuGeneral.ejs', {
                        patients: result 
                    });
                }else{
                    console.log(err)
                    console.log("No se pudo consultar");
                    // mandar el resultado al render
                }
            });
        }
    });
});

// consultarInfoPaciente

router.get('/consultarInfoPaciente', (req, res)=>{
    
});

router.post('/eliminarPaciente', (req, res)=>{
    const {curp} = req.body;
    let credentials = [curp];

    medDAO.createConnection();
    medDAO.connectToDatabase();
    medDAO.eliminarVisitas(curp,function(err,result){
        medDAO.eliminarPaciente(credentials, function(err,result){
            if(err == null){
                console.log("Eliminado exitosamente");
                // Mostrar el menu general con la nueva consulta
                var idDoctor = req.session.passport.user;
                
                usuarioD = idDoctor;
                credentials = [usuarioD];
                medDAO.consultarPacientes(credentials, function(err,result){
                    if(err == null){
                        console.log("Consulta exitosa");
                        console.log(result);
                        for(let i=0;i<result.length;i++)
                        {
                            var date= result[i].fechaN;
                            let d=dateFormat(date, "yyyy-mm-dd");
                            result[i].fechaN=d;
                            console.log(d);
                        }
                
                        res.render('menuGeneral.ejs', {
                            patients: result 
                        });
                        // mandar el resultado al render
                    }else{
                        console.log(err)
                        console.log("No se pudo consultar");
                        // mandar el resultado al render
                    }
                });
            }else{
                console.log(err)
                console.log("No se pudo eliminar");
                // Mostrar el menu general con la nueva consulta
                var idDoctor = req.session.passport.user;
                
                usuarioD = idDoctor;
                credentials = [usuarioD];
                medDAO.consultarPacientes(credentials, function(err,result){
                    if(err == null){
                        console.log("Consulta exitosa");
                        console.log(result);
                        res.render('menuGeneral.ejs', {
                            patients: result 
                        });
                        // mandar el resultado al render
                    }else{
                        console.log(err)
                        console.log("No se pudo consultar");
                        // mandar el resultado al render
                    }
                });
            }
        });
    });
    
});


router.post('/search', (req, res) =>{
    const{curp} = req.body;
    var idDoctor = req.session.passport.user;
    
    usuarioD = idDoctor; // sacar de la session

    medDAO.createConnection();
    medDAO.connectToDatabase();

    console.log(curp);
    var credentials = [curp, usuarioD];

    medDAO.consultarPaciente(credentials, function(err,result){
        if(err == null){
            console.log("B??squeda por curp exitosa");
            for(let i=0;i<result.length;i++)
            {
                var date= result[i].fechaN;
                let d=dateFormat(date, "yyyy-mm-dd");
                result[i].fechaN=d;
                console.log(d);
            }
            res.render('menuGeneral.ejs', {
                    patients: result 
                });
        }else{
            res.render('menuGeneral.ejs', {
                patients: "vacio" 
            });
        }
    });

});

// Inserci??n de visitas
router.post('/insertarVisita', (req, res)=>{
    const{fecha, curp, peso, talla, tensionA, frecuenciaC, frecuenciaR, temperatura, resumen, exploracionF, resultadoE, diagnostico, planTratamiento, pronostico} = req.body;
    var idDoctor = req.session.passport.user;
    medDAO.createConnection();
    medDAO.connectToDatabase();
    var credentials = [idDoctor, curp, fecha, peso, talla, tensionA, frecuenciaC, frecuenciaR, temperatura, resumen, exploracionF, resultadoE, diagnostico, planTratamiento, pronostico];
    medDAO.insertarVisita(credentials, function(err,result){
        if(err == null){
            console.log("Insertar visita exitosamente");
            res.redirect(307, '/informacionPaciente');
        }else{
            console.log("Error al ingresar visita");
            res.redirect(307, '/informacionPaciente');
        }
    });

});

// Generar recetas

router.post('/generarRecetaPDF', (req, res)=>{
    const{nombreDoc, fecha, nombreP, cedula, inst, tel, dir, trat} = req.body;

    credentials = [nombreDoc, fecha, nombreP, cedula, inst, tel, dir, trat];

    console.log(credentials);
});

// Modificar info del paciente
router.post('/cambiarInfo', (req, res)=>{
    const{nombre, apellidoP, apellidoM, curp, fechaN, sexoId, antecedentesH, antecedentesPNP, antecedentesPP, padecimiento, interrogatorioA, exploracionF, resultadosP, terapeuticaE, diagnosticoP} = req.body;

    credentials = [nombre, apellidoP, apellidoM, curp, fechaN, sexoId, antecedentesH, antecedentesPNP, antecedentesPP, padecimiento, interrogatorioA, exploracionF, resultadosP, terapeuticaE, diagnosticoP];
    console.log(credentials);

    medDAO.createConnection();
    medDAO.connectToDatabase();
    // Hacer los cambios para historia clinica del paciente
    medDAO.actualizarHClinica(credentials, function(err,result){
        if(err == null){
            console.log("Cambio HC realizado exitosamente");
            // Hacer los cambios ahora para la tabla paciente
            medDAO.actualizarPaciente(credentials, function(err,result){
                if(err == null){
                    console.log("Cambio Paciente realizado exitosamente");
                    console.log(result);
                    // mandar el resultado al render
                    res.redirect(307, '/informacionPaciente');
                }else{
                    console.log(err)
                    console.log("No se pudo consultar");
                    // mandar el resultado al render
                    res.redirect(307, '/informacionPaciente');
                }
            });
        }else{
            console.log(err)
            console.log("No se pudieron hacer los cambios");
            // Mostrar el menu general con la nueva consulta
            res.redirect(307, '/informacionPaciente');
        }
    });
});




router.post("/upload", (req, res) =>
{
    let claveP = req.body.curp;
    console.log(claveP);
    curpG = claveP;
    let uploadedFile = req.files.my_file;
    let file_name = uploadedFile.name;
    const fecha = dateFormat(now, "yyyy-mm-dd");

    credentials = [file_name ,claveP, fecha];
    console.log(credentials);

    medDAO.createConnection();
    medDAO.connectToDatabase();
    
    medDAO.insertarArchivos(credentials, function(err,result){
        let claveP = req.body.claveP;
        console.log("Clave PACIENTE: "+claveP);
        if(err == null){
            // Hacer los cambios ahora para la tabla paciente
            res.redirect(307, '/informacionPaciente');
        }else{
            console.log(err)
            console.log("No se pudieron hacer la insercion");
            // Mostrar el menu general con la nueva consulta
            res.redirect(307, '/informacionPaciente');
        }
    });

},upload.single('my_file'));

module.exports=router;