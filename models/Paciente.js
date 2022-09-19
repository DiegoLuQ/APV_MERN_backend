import mongoose from 'mongoose'

const pacienteSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    propietario: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    fecha: {
        type: Date,
        required: true,
        default: Date.now()
    },
    sintomas: {
        type: String,
        required: true
    },
    //relacionamos la collecion paciente con la collecion veterinario
    veterinario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Veterinario'
    },

},{
    //crear las columnas de editado y creado
    //Si establece marcas de tiempo: verdadero, Mongoose agregará dos propiedades de tipo Fecha a su esquema
    //timestamps: {
    timestamps: true
    //createdAt: 'created_at', // Use `created_at` to store the created date
    //updatedAt: 'updated_at' // and `updated_at` to store the last updated date
});

const Paciente = mongoose.model("Paciente", pacienteSchema);


export default Paciente;