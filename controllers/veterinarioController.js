import Veterinario from "../models/Veterinario.js";
import generarJWT from "../helpers/generarJWT.js";
import generarId from "../helpers/generarId.js";
import emailRegistro from "../helpers/emailRegistro.js";
import emailOlvidePassword from "../helpers/emailOlvidePassword.js";

const registrar = async (req, res) => {

    const { email,nombre } = req.body // obtenemos un body como solicitud
    
    // validar si el usuario esta registrado
    const existeUsuario = await Veterinario.findOne({email: email}) // buscamos el email si esta registrado en el collecion

    if(existeUsuario){
        const error = new Error('Usuario ya registrado')
        return res.status(400).json({msg: error.message})
    }

    try {
        //guardar un nuevo veterinario
        const veterinario = new Veterinario(req.body)
        const veterinarioGuardado = await veterinario.save()
        
        //enviar EMAIL
        emailRegistro({
            email,
            nombre,
            token: veterinarioGuardado.token
        })

        res.send(veterinarioGuardado) // enviamos el json 

    } catch (error) {
        console.log(error)
    }
    
};

const perfil = (req, res) => {
    const {veterinario} = req // este destructuring es la SESSION que obtenemos del authMiddleware.js
    res.json(veterinario)
}

const confirmar = async (req, res) => {
    // console.log(req.params.token) parametro dinamico con express - luego lo leeremos con req.params
    const { token } = req.params

    const usuarioConfirmar = await Veterinario.findOne({token})

    if(!usuarioConfirmar) {
        const error = new Error('Token no valido')
        return res.status(404).json({ msg: error.message})
    }
    try {
        // en estas lineas eliminaremos el token despues de confirmarlo via email
        // luego el campo de confirmado del documento de mongodb sera modificado y la cuenta estara confirmada
        // por ultimo guardaremos
        usuarioConfirmar.token = null
        usuarioConfirmar.confirmado = true
        await usuarioConfirmar.save()
        res.json({msg: 'Usuario Confirmado Correctamente'})
    } catch (error) {
        console.log(error)
    }
};

// CREAMOS UN TOKEN

const autenticar = async (req, res) => {
    // console.log(req.body) muestra en consola lo que se envia desde postman, en body - raw - json
    //destructuring
    const { email, password } = req.body

    // Comprobar si el usuario existe
    const usuario = await Veterinario.findOne({email})

    if(!usuario) {
        const error = new Error('Usuario no existe')
        return res.status(404).json({ msg: error.message})
    }

    // Comprobar si el usuario esta confirmado
    if(!usuario.confirmado) {
        const error = new Error('Tu cuenta no ha sido confirmada')
        return res.status(403).json({msg:error.message})
    }
    // revisar el password
    if( await usuario.comprobarPassword(password)){

        // Autenticar - generando un JWT - AHORA PASAREMOS EL ID 
        // console.log('Password Correcto')
        // usuario.token = generarJWT(usuario.id)
        // res.json(usuario)
        res.json({
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            token: generarJWT(usuario.id),
        })
    } else {
        const error = new Error('El Password es incorrecto')
        return res.status(403).json({msg:error.message})
    }
};

// RECUPERANDO CONTRASEÑA

const olvidePassword = async (req, res) => {
    //obtenemos el email desde el req.body
    const {email} = req.body
    // console.log(email)
    // guardamos en una variable si el usuario existe
    const existeVeterinario = await Veterinario.findOne({email})
    // sino existe hacemos lo siguiente
    if(!existeVeterinario) {
        const error = new Error('El Usuario no existe crjo')
        return res.status(400).json({msg: error.message})
    } 
    // si pasa la condicion generamos un token y lo guardamos en el objeto EXISTEVETERINARIO
    try {
        existeVeterinario.token = generarId()
        await existeVeterinario.save()

        // Enviar email con instrucciones

        emailOlvidePassword({
            email,
            nombre: existeVeterinario.nombre,
            token: existeVeterinario.token
        })


        res.json({msg: 'Hemos enviado un email con las instrucciones'})
    } catch (error) {
        console.log(error)
    }
}
const comprobarToken = async (req, res) => {

    const {token} = req.params // usamos params cuando viene un solicitud/variable desde la URL
    const tokenValido = await Veterinario.findOne({token})
    if(tokenValido){
        // eL TOKEN es valido el usuario existe
        res.json({msg: 'Token valido, el usuario SI existe'})
    } else {
        const error = new Error('Token no valido')
        res.status(400).json({msg:error.message})
    }
}

const nuevoPassword = async (req, res) => {
    const {token} = req.params;
    const {password} = req.body;

    const veterinario = await Veterinario.findOne({token})

    if(!veterinario){
        const error = new Error('Hubo un error')
        return res.status(400).json({msg:error.message})
    }
    try {
        // console.log(veterinario)
        veterinario.token = null
        veterinario.password = password
        await veterinario.save()
        res.json({msg:'password modificado correctamente'})
    } catch (error) {
        console.log(error)
    }

}

const actualizarPerfil = async (req, res) => {
    //comprobamos que los parametros son enviados desde el frontend
    // console.log(req.params.id);
    // console.log(req.body);

    const veterinario = await Veterinario.findById(req.params.id)
     if(!veterinario){
        const error = new Error('Hubo un error')
        return res.status(400).json({msg:error.message})

     }
     const {email} = req.body
     if(veterinario.email !== req.body.email) {
        const existeEmail = await Veterinario.findOne({email})
        if(existeEmail) {
            const error = new Error('Ese email ya esta en uso')
            return res.status(400).json({msg:error.message})
        }
     }
     try {
        //mapeamos lo que venga del frontend 
        veterinario.nombre = req.body.nombre ;
        veterinario.email = req.body.email;
        veterinario.web = req.body.web;
        veterinario.telefono = req.body.telefono;


        // actulizamos el nuevo objeto 
        const veterinarioActualizado = await veterinario.save()
        //mostramos lo que actualizamos
        res.json(veterinarioActualizado)
    } catch (error) {
        console.log(error)
    }
}

const actualizarPassword = async (req,res) => {
    // console.log(req.veterinario)
    // console.log(req.body)
    //leer los datos
    const {id} = req.veterinario //
    const {pwd_actual, pwd_nuevo} = req.body //

    //comprobar que el veterinario existe
    const veterinario = await Veterinario.findById(id)
     if(!veterinario){
        const error = new Error('Hubo un error')
        return res.status(400).json({msg:error.message})

     }

    // comprobar su password
     if(await veterinario.comprobarPassword(pwd_actual)){
        // Almacenar nuevo password
        veterinario.password = pwd_nuevo
        await veterinario.save()
        res.json({msg:'Password almacenado correctamente'})
     } else {
        const error = new Error('El Password actual es incorrecto')
        return res.status(400).json({msg:error.message})
     }

    // almacenar el nuevo password


}

export {
    registrar, 
    perfil,
    confirmar,
    autenticar,
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    actualizarPerfil,
    actualizarPassword
}