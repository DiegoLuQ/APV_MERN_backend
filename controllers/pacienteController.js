import Paciente from "../models/Paciente.js";

const agregarPaciente = async (req,res) => {

    const paciente = new Paciente(req.body)
    // la constante paciente, que es la instancia de Paciente, tiene todos los atributos y uno de los atributos es;
    // el atributo veterinario, el cual es la relación que tendra el paciente y veterinario.
    // ¿Cómo obtuvimos la id del vet? facil, solo debemos poner en pacienteRoutes
    // *router.route('/').post(checkAuth,agregarPaciente)*, checkAuth: nos pedirá que validemos con un token
    // nuestra session, de ahi, el req.veterinario del archivo authMiddleware.js estará disponible
    // en toda la app
    paciente.veterinario = req.veterinario._id
    try {
        const pacienteAlmacenado = await paciente.save()
        res.json(pacienteAlmacenado)
    } catch (error) {
        console.log(error)
    }
};
const obtenerPacientes = async (req,res) => {
    // guardamos en una variable el objeto que obtendremos cuando busquemos en mongodb
    const paciente = await Paciente.find().where('veterinario').equals(req.veterinario);
    // respondemos con un json
    res.json(paciente);
};  

const obtenerPaciente =  async (req, res) => {
    // recordar que los endpoint para obtener un parametro por url es /:id
    const { id } = req.params
    // buscamos la id por findByid
    const paciente = await Paciente.findById(id)
       
    //comprobamos que el paciente exista
    if(!paciente) {
        return res.status(404).json({msg: ' no Encontrado'})
    }

    //convertimos las id de mongodb en string
    if(paciente.veterinario._id.toString() !== req.veterinario._id.toString()) {
        return res.json({msg:' Acción no valida '})
    }

    // si la condicion anterior dice que son diferentes, se termina ahi
    // obtenemos el paciente
    res.json(paciente)
}

const actualizarPaciente =  async (req, res) => {
    const { id } = req.params
    const paciente = await Paciente.findById(id)

    if(!paciente) {
        return res.status(404).json({msg: ' no Encontrado'})
    }

    if(paciente.veterinario._id.toString() !== req.veterinario._id.toString()){
        return res.json({msg: " Acción no valida "})
    }

    // actualizar paciente
    paciente.nombre = req.body.nombre || paciente.nombre
    paciente.propietario = req.body.propietario || paciente.propietario
    paciente.email = req.body.email || paciente.email
    paciente.fecha = req.body.fecha || paciente.fecha
    paciente.sintomas = req.body.sintomas || paciente.sintomas
    try {
        const pacienteActualizado = await paciente.save();
        res.json(pacienteActualizado	)
    } catch (error) {
        console.log(error)
    }
}

const eliminarPaciente =  async (req, res) => {
    const { id } = req.params
    const paciente = await Paciente.findById(id)

    if(!paciente) {
        return res.status(404).json({msg: ' no Encontrado'})
    }

    // una vez el veterinario haya ingresado a la plataforma se genera un token para tener los permisos de eliminar buscar o modificar.
    // ahora el paciente debe tener el mismo id del veterinario para eliminar
    if(paciente.veterinario._id.toString() !== req.veterinario._id.toString()){
        return res.json({msg: " Acción no valida "})
    }
    try {
        await paciente.deleteOne()
        res.json({msg: "paciente eliminado"})
    } catch (error) {
        console.log(error)
    }
}

export {
    agregarPaciente, 
    obtenerPacientes,
    obtenerPaciente,
    actualizarPaciente,
    eliminarPaciente
}