import express from 'express'
import dotenv from "dotenv";
import cors from "cors";
import conectarDB from './config/db.js';
import veterinarioRoutes from './routes/veterinarioRoutes.js';
import pacienteRoutes from './routes/pacientesRoutes.js';


//ESTOS * SON MIDDLEWARES - CADA MIDDLEWARE TIENE UN NEXT QUE EMPIEZA UNO, TERMINA Y PASA AL SIGUIENTE
const app = express(); // instanciamos express para tener toda funcionaldiad para crear el servidor
app.use(express.json()); //le diremos al servidor que le enviaremos datos de tipo json (req.body)
dotenv.config()
conectarDB()

const dominiosPermitidos = [process.env.FRONTEND_URL]
const corsOptions = {
    origin: function(origin, callback){
        // si el origen esta dentro de los dominios permitidos(la lista[])
        if(dominiosPermitidos.indexOf(origin) !== -1 ){
            // El origin de request esta permitido
            callback(null, true)
        } else {
            callback(new Error('No permitido por CORS'))
        }
    }
}
//AQUI LE DECIMOS A EXPRESS QUE QUEREMOS OCUPARLO
app.use(cors(corsOptions))


app.use('/api/veterinarios', veterinarioRoutes) //nuestra ruta principal de la API
app.use('/api/pacientes', pacienteRoutes)

const PORT = process.env.PORT || 4000 // en caso de encontrar la variable de entorno pondre el peurto 4000

app.listen(4000, () => {
    console.log(`Servidor funcionando en el puerto ${PORT}`)
})