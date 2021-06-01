//const { query } = require('express');
const mysql=require('mysql');
const crypto = require('crypto-js');
var dateFormat = require('dateformat');


class MrmDAO{
    constructor(){
        
    }

    createConnection(){
        this.con = mysql.createConnection({
            host: "10.39.240.3",
            user: "root",
            password: "cK0DFFJ5jwfEw53g",
            database:"docbay",
            port:3306
        });
    }

    connectToDatabase(){
        this.con.connect(function(err) {
            if (err) throw err;
            console.log("Connected to database!");
        });
    }
    // Consultar todos los pacientes
    consultarPacientes(callback){
        let sql="SELECT * FROM Paciente";
        this.con.query(sql, function(err, results){
            if (err){ 
                let result="error";
                callback(result);

            }
            else{
                callback(results);
            }
            
        });
    }

    registrarPaciente(userValues,callback){
        let nombre=userValues[0];
        let aPaterno = userValues[1];
        let aMaterno = userValues[2];
        let curp = userValues[3];
        let fecha=userValues[4];
        let sexo=userValues[5];
        let usuarioDoctor = userValues[6];
        let sql="INSERT INTO Paciente(claveP, nombre, aPaterno, aMaterno, fechaN,usuarioD,sexo) VALUES ('"+curp+"','"+nombre+"','"+aPaterno+"','"+aMaterno+"','"+fecha+"',"+usuarioDoctor+",'"+sexo+"')";
       
        this.con.query(sql, function(err, results){
            if (err){ 
                let result="error";
                callback(err,result);
            }
            else{
                let result="success";
                callback(err,result);
            } 
        });
    }

    inicializarHClinica(curp,callback){
        let sql="INSERT INTO HClinica(clavep) VALUES('"+curp+"')";
        this.con.query(sql, function(err, results){
            if (err){ 
                let result="error";
                callback(err,result);
            }
            else{
                let result="success";
                callback(err,result);
            } 
        });
    }

    actualizarPaciente(credentials,callback){
        let nombre = credentials[0];
        let apellidoP = credentials[1];
        let apellidoM = credentials[2];
        let curp = credentials[3];
        let fechaN = credentials[4];
        
        dateFormat(fechaN,"yyyy, mmm, dd");

        console.log(fechaN);
        let sexoId = credentials[5];

        let sql = "UPDATE Paciente SET ";
        sql += "nombre = '"+nombre+"',";
        sql += "aPaterno = '"+apellidoP+"',";
        sql += "aMaterno = '"+apellidoM+"',";
        sql += "fechaN = '"+fechaN+"',";
        sql += "sexo = '"+sexoId+"' ";
        sql += "WHERE claveP = '"+curp+"';";

        console.log(sql);

        this.con.query(sql, function(err, results){
            if (err){ 
                let result="error";
                callback(err,result);
            }
            else{
                let result="success";
                callback(err,result);
            } 
        });
    }

    actualizarHClinica(credentials, callback){

        let nombre = credentials[0];
        let apellidoP = credentials[1];
        let apellidoM = credentials[2];
        let curp = credentials[3];
        let fechaN = credentials[4];
        let sexoId = credentials[5];
        let antecedentesH = credentials[6];
        let antecedentesPNP = credentials[7];
        let antecedentesPP = credentials[8];
        let padecimiento = credentials[9];
        let interrogatorioA = credentials[10];
        let exploracionF = credentials[11];
        let resultadosP = credentials[12];
        let terapeuticaE = credentials[13];
        let diagnosticoP = credentials[14];

        let sql = "UPDATE HClinica SET ";
        sql += "antecedentesH = '"+antecedentesH+"',";
        sql += "antecedentesPNP = '"+antecedentesPNP+"',";
        sql += "antecedentesPP = '"+antecedentesPP+"',";
        sql += "padecimiento = '"+padecimiento+"',";
        sql += "interrogatorioA = '"+interrogatorioA+"',";
        sql += "exploracionF = '"+exploracionF+"',";
        sql += "resultadosP = '"+resultadosP+"',";
        sql += "terapeuticaE = '"+terapeuticaE+"',";
        sql += "diagnosticoP = '"+diagnosticoP+"' ";
        sql += "WHERE claveP = '"+curp+"';";

        console.log(sql);
        
        this.con.query(sql, function(err, results){
            if (err){ 
                let result="error";
                callback(err,result);
            }
            else{
                let result="success";
                callback(err,result);
            } 
        });
    }

    loginUsuario(credentials,callback){
        let correo=credentials[0];

        var sql = "SELECT nombre FROM Doctor WHERE correo ='"+correo+"';";
       
        //console.log(sql);
        this.con.query(sql, function(err, results){
            //console.log(results[0]);
            if (err){ 
                console.log("El error es:"+err);
                callback(err,results);
            }
            else{
                if(results[0] === undefined){
                    results = "vacio";
                }else{
                    results = "existe";
                }
                callback(err,results);
            }
        })
    }

    compararPassword(credentials,callback){
        let correo=credentials[0];
        var password = credentials[1];
        // transformar password para poder compararla
        password = crypto.MD5(password);

        var sql = "SELECT nombre FROM Doctor WHERE correo ='"+correo+"' AND password='"+password+"';";
        //console.log(sql);
        
        this.con.query(sql, function(err, results){
            //console.log(results[0]);
            if (err){ 
                console.log("El error es:"+err);
                callback(err,results);
            }
            else{
                if(results[0] === undefined){
                    results = "incorrecta";
                }else{
                    results = "loggeado";
                }
                callback(err,results);
            }
        })
    }

    registrarMedico(credentials,callback){
        var result = "error";
        let nombre = credentials[0];
        let aPaterno = credentials[4];
        let aMaterno = credentials[5];
        let correo = credentials[1];
        let cedula=credentials[2];
        let password = credentials[3];
        // encriptar la password antes de insertar los datos
        password = crypto.MD5(password);

        var sql="insert into Doctor (password,nombre, aPaterno, aMaterno, correo, cedula) values ('"+password+"','"+nombre+"','"+aPaterno+"','"+aMaterno+"','"+correo+"','"+cedula+"');";
        this.con.query(sql, function(err, results){
            if (err){ 
                console.log("El error es:"+err);
                callback(err,result);
            }
            else{ 
                result = "success";
                callback(err,result);
            }
            
        })
      
    }

    // Consultar todos los pacientes de un médico
    consultarPacientes(credentials, callback){
        let usuarioD = credentials[0];

        var sql = "SELECT * FROM Paciente WHERE usuarioD ='"+usuarioD+"';";
       
        //console.log(sql);
        this.con.query(sql, function(err, results){
            //console.log(results[0]);
            if (err){ 
                console.log("El error es:"+err);
                callback(err,results);
            }
            else{
                if(results[0] === undefined){
                    results = "vacio";
                }
                
                callback(err,results);
            }
        })
    }

    eliminarPaciente(credentials, callback){
        let curp = credentials[0];
        var sql = "DELETE FROM Paciente WHERE claveP ='"+curp+"';";
        console.log(sql);
        this.con.query(sql, function(err, result){
            if (err){ 
                console.log("El error es:"+err);
                callback(err,result);
            }
            else{ 
                result = "success";
                callback(err,result);
            }
            
        })
    }

    eliminarVisitas(curp,callback){
        var sql = "DELETE FROM Visitas WHERE claveP ='"+curp+"';";
        console.log(sql);
        this.con.query(sql, function(err, result){
            if (err){ 
                console.log("El error es:"+err);
                callback(err,result);
            }
            else{ 
                result = "success";
                callback(err,result);
            }
            
        });
    }

    consultarClaveDoctor(credentials, callback){
        let correo = credentials[0];

        var sql = "SELECT usuarioD FROM Doctor WHERE correo ='"+correo+"';";
       
        //console.log(sql);
        this.con.query(sql, function(err, results){
            //console.log(results[0]);
            if (err){ 
                console.log("El error es:"+err);
                callback(err,results);
            }
            else{
                if(results[0] === undefined){
                    results = "vacio";
                }
                //console.log(results);
                callback(err,results);
            }
        })
    }

    // Consultar Paciente por CURP
    consultarPaciente(credentials, callback){
        let curp = credentials[0];
        let uD = credentials[1];

        var sql = "SELECT * FROM Paciente WHERE claveP ='"+curp+"' AND usuarioD = '"+ uD +"';";
       
        console.log(sql);
        this.con.query(sql, function(err, results){
            //console.log(results[0]);
            if (err){ 
                console.log("El error es:"+err);
                callback(err,results);
            }
            else{
                if(results[0] === undefined){
                    results = "vacio";
                }
                //console.log(results);
                callback(err,results);
            }
        })
    }
    // Consultar Historia Clinica por CURP
    consultarHistorial(credentials, callback){
        let curp = credentials[0];
        let uD = credentials[1];

        var sql = "SELECT * FROM HClinica WHERE claveP ='"+curp+"';";
       
        console.log(sql);
        this.con.query(sql, function(err, results){
            //console.log(results[0]);
            if (err){ 
                console.log("El error es:"+err);
                callback(err,results);
            }
            else{
                if(results[0] === undefined){
                    results = "vacio";
                }
                //console.log(results);
                callback(err,results);
            }
        })
    }

    // Consultar Archivos por CURP
    consultarArchivos(credentials, callback){
        let curp = credentials[0];
        let uD = credentials[1];

        var sql = "SELECT * FROM Archivos WHERE claveP ='"+curp+"';";
       
        console.log(sql);
        this.con.query(sql, function(err, results){
            //console.log(results[0]);
            if (err){ 
                console.log("El error es:"+err);
                callback(err,results);
            }
            else{
                if(results[0] === undefined){
                    results = "vacio";
                }
                //console.log(results);
                callback(err,results);
            }
        })
    }

    consultarVisitas(credentials, callback){

        let curp = credentials[0];
        let uD = credentials[1];

        var sql = "SELECT * FROM Visitas WHERE claveP ='"+curp+"' AND usuarioD = '"+uD+"' ORDER BY 3 DESC;";
       
        console.log(sql);
        this.con.query(sql, function(err, results){
            //console.log(results[0]);
            if (err){ 
                console.log("El error es:"+err);
                callback(err,results);
            }
            else{
                if(results[0] === undefined){
                    results = "vacio";
                }
                //console.log(results);
                callback(err,results);
            }
        })
    }

    insertarVisita(credentials,callback){
        
        let usuarioD = credentials[0];
        let curp = credentials[1];
        let fecha = credentials[2];
        let peso = credentials[3];
        let talla = credentials[4];
        let tensionA = credentials[5];
        let frecuenciaC = credentials[6];
        let frecuenciaR = credentials[7];
        let temperatura = credentials[8];
        let resumen = credentials[9];
        let exploracionF = credentials[10];
        let resultadoE = credentials[11];
        let diagnostico = credentials[12];
        let planTratamiento = credentials[13];
        let pronostico = credentials[14];

        var sql="INSERT INTO Visitas (usuarioD, claveP, fechaC, peso, talla, tensionA, frecuenciaC, frecuenciaR, temperatura, resumenI, exploracionF, resultadoE, diagnosticos, planTratamiento, pronostico) values (";
        sql += usuarioD+",'"+curp+"','"+fecha+"',"+peso+",'"+talla+"','"+tensionA+"','"+frecuenciaC+"','"+frecuenciaR+"','"+temperatura+"','"+resumen+"','"+exploracionF+"','"+resultadoE+"','"+diagnostico+"','"+planTratamiento+"','"+pronostico+"');";
        this.con.query(sql, function(err, result){
            if (err){ 
                console.log("El error es:"+err);
                callback(err,result);
            }
            else{ 
                result = "success";
                console.log("Registrada visita");
                callback(err,result);
            }
            
        })
      
    }
    // Consultar Paciente por CURP
    consultarDoctor(credentials, callback){
        let uD = credentials[0];

        var sql = "SELECT * FROM Doctor WHERE usuarioD ='"+uD+"';";
       
        this.con.query(sql, function(err, results){
            //console.log(results[0]);
            if (err){ 
                console.log("El error es:"+err);
                callback(err,results);
            }
            else{
                if(results[0] === undefined){
                    results = "vacio";
                }
                //console.log(results);
                callback(err,results);
            }
        })
    }

    insertarArchivos(credentials,callback){
        
        let nombre = credentials[0];
        let curp = credentials[1];
        let fecha = credentials[2];
        
        var sql="INSERT INTO Archivos (nombre, claveP, fecha) VALUES ('"+nombre+"','"+curp+"','"+fecha+"');";
        console.log(sql);
        this.con.query(sql, function(err, result){
            if (err){ 
                console.log("El error es:"+err);
                callback(err,result);
            }
            else{ 
                result = "success";
                console.log("Archivo registrado");
                callback(err,result);
            }
            
        })
    }
    


}

module.exports=MrmDAO;