import mongoose from "mongoose";
import bcrypt from "bcrypt";
import generarId from "../helpers/generarId.js";

const veterinarioSchema = mongoose.Schema({
    nombre:{
        type: String,
        required: true, //obligatorio
        trim: true //eliminar espacios en blanco
    },
    password: {
        type: String,
        required: true //obligatorio
    },
    email: {
        type: String,
        required: true, //obligatorio
        unique: true,
        trim: true,
    },
    telefono:{
        type: String,
        default: null, // no es obligatorio, por eso lo demas no lo tienen
        trim: true,
    },
    web: {
        type: String,
        default: null,
    },
    token:{
        type: String,
        default: generarId() // funcion que creara un token
    },
    confirmado: {
        type: Boolean,
        default: false
    }
})

veterinarioSchema.pre('save', async function(next) {
    // ESTE IF solo funcionara cuando el usuario MODIFIQUE SU PASSWORD
    // si el password ya esta hasheado, no lo vuelvas a hashear
    if(!this.isModified('password')){
        next();
    }
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
})
// metodo de veterinario
veterinarioSchema.methods.comprobarPassword = async function(passwordFormulario){

    return await bcrypt.compare(passwordFormulario, this.password)
}

                                //modelo, y segundo parametro es el esquema q usaremos
const Veterinario =  mongoose.model("Veterinario", veterinarioSchema)
export default Veterinario;