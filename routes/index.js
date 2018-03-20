var express = require('express');
var router = express.Router();

var db = require('../queries');


router.get('/api/usuarios', db.getAllUsuarios);
router.get('/api/usuarios/:id', db.getSingleUsuario);
router.post('/api/usuarios', db.createUsuario);
router.put('/api/usuarios/:id', db.updateUsuario);
router.delete('/api/usuarios/:id', db.removeUsuario);

router.get('/api/productos', db.getAllProductos);
router.get('/api/productos/:id', db.getSingleProducto);
router.post('/api/productos', db.createProducto);
router.put('/api/productos/:id', db.updateProducto);
router.delete('/api/productos/:id', db.removeProducto);

router.get('/api/:usuario/pedidos', db.getPedidosUsuario);
router.get('/api/:usuario/pedidos/:id', db.getPedidoUsuario);
router.post('/api/:usuario/pedidos', db.createPedidoUsuario);
router.delete('/api/:usuario/pedidos/:id', db.removePedidoUsuario);
router.post('/api/:usuario/:pedido/addProd/:canti/:idProd', db.createProductoPedido);
router.delete('/api/:usuario/:pedido/deleteProd/:idProd', db.deleteProductoPedido);


module.exports = router;