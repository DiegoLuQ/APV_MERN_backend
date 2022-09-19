import express from 'express';
import { 
    registrar, 
    perfil, 
    confirmar, 
    autenticar, 
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    actualizarPerfil,
    actualizarPassword } from '../controllers/veterinarioController.js';
import checkAuth from '../middleware/authMiddleware.js';

const router =  express.Router() // instanciamos las rutas, al igual cuando pone APIRouter de fastapi


//area publica
router.post('/', registrar);
router.get('/confirmar/:token', confirmar) // parametro dinamico con express - luego lo leeremos con req.params
router.post('/login', autenticar)
router.post('/olvide-password', olvidePassword) // validar email del usuario

// router.get('/olvide-password/:token', comprobarToken) // leer token
// router.post('/olvide-password/:token', nuevoPassword) // almacenar nuevo password
router.route('/olvide-password/:token').get(comprobarToken).post(nuevoPassword) // lo mismo de arriba pero en 1 linea


//area privada
router.get('/perfil', checkAuth, perfil)
router.put('/perfil/:id', checkAuth, actualizarPerfil)
router.put('/actualizar-password', checkAuth, actualizarPassword)

export default router;