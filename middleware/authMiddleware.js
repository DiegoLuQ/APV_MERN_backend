import jwt  from "jsonwebtoken"
import Veterinario from "../models/Veterinario.js";
const checkAuth = async (req, res, next) => {

    let token;

    // aqui comprobamos que tenemos el token en los headers y tambien si el token empieza con BEARER
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        
        try {
            // generamos una variable token para almacenar el jwt que viene en el HEADER
            token = req.headers.authorization.split(' ')[1] // separamos el bearer[0] del token[1], con split
            const decoded = jwt.verify(token, process.env.JWT_SECRET) // verificamos que el token sea correcto
            // console.log(decoded) mostramos en la terminal el usuario, el la funcion VERIFY
            
            req.veterinario = await Veterinario.findById(decoded.id).select("-password -token -confirmado") // evitamos los campos que no son necesarios
            //el req.veterinario inicia una session y ALMACENAMOS LOS DATOS DEL USUARIO

            // console.log(veterinario) aqui mostraremos solo los campos NECEESARIOS del usuario 
            return next() // esto retornara al siguiente middleware y no seguira con lo siguiente 
            //  | 
            // \/

        } catch (error) {
            // sino existe el token mostramos lo sgte.
            const e = new Error("Token no Válido")
            return res.status(403).json({msg: e.message})
        }

    } 
    // si el token queda vacio
    if(!token){
        // sino pasa la condicion del token, mostramos lo sgte.
        const error = new Error("Token no Válido o inexistente")
        res.status(403).json({msg: error.message})
    }

    next()
}

export default checkAuth;