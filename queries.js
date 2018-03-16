var promise = require('bluebird');

var options = {
  // Initialization Options
  promiseLib: promise
};

var pgp = require('pg-promise')(options);
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/tienda';
var db = pgp(connectionString);

// add query functions

module.exports = {
  getAllUsuarios: getAllUsuarios,
  getSingleUsuario: getSingleUsuario,
  createUsuario: createUsuario,
  updateUsuario: updateUsuario,
  removeUsuario: removeUsuario,
  getAllProductos: getAllProductos,
  getSingleProducto: getSingleProducto,
  createProducto: createProducto,
  updateProducto: updateProducto,
  removeProducto: removeProducto,
  getPedidosUsuario: getPedidosUsuario,
  getPedidoUsuario: getPedidoUsuario,
  createPedidoUsuario: createPedidoUsuario,
  createProductoPedido: createProductoPedido,
  deleteProductoPedido: deleteProductoPedido
};

function getAllUsuarios(req, res, next) {
  db.any('select * from usuarios')
    .then(function (data) {
      res.status(200).json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function getAllProductos(req, res, next) {
  db.any('select * from productos')
    .then(function (data) {
      res.status(200).json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function getSingleUsuario(req, res, next) {
  var usrID = parseInt(req.params.id);
  db.one('select * from usuarios where usuario_id = $1', usrID)
    .then(function (data) {
      res.status(200).json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

// /api/
function getSingleProducto(req, res, next) {
  var prodID = parseInt(req.params.id);
  db.one('select * from productos where producto_id = $1', prodID)
    .then(function (data) {
      res.status(200).json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function createUsuario(req, res, next) {
  db.one('insert into usuarios(nombre) ' +
      'values(${nombre}) returning *', req.body)
    .then(function (data) {
      res.status(200).json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function createProducto(req, res, next) {
	req.body.precio = parseFloat(req.body.precio);
  db.one('insert into productos(nombre, precio) ' +
      'values(${nombre}, ${precio}) returning *', req.body)
    .then(function (data) {
      res.status(200).json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function updateUsuario(req, res, next) {
  db.one('update usuarios set nombre=$1 where usuario_id=$2 returning *',
  	[req.body.nom, parseInt(req.params.id)])
    .then(function (data) {
      res.status(200).json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function updateProducto(req, res, next) {
	req.body.precio = parseFloat(req.body.precio);
  db.one('update productos set nombre=$1, precio=$2 where producto_id=$3 returning *',
    [req.body.nombre, req.body.precio, parseInt(req.params.id)])
    .then(function (data) {
      res.status(200).json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function removeUsuario(req, res, next) {
  var usrID = parseInt(req.params.id);
  db.one('delete from usuarios where usuario_id = $1 returning *', usrID)
    .then(function (data) {
      res.status(200).json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function removeProducto(req, res, next) {
  var prodID = parseInt(req.params.id);
  db.one('delete from productos where producto_id = $1 returning *', prodID)
    .then(function (data) {
      res.status(200).json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

// --------------------------------------------------------------------

function createPedidoUsuario(req, res, next) {
  var usrID = parseInt(req.params.usuario);
  db.one('insert into pedidos(usuario_id, total, iva, subtotal) ' +
    'values($1, 0, 0, 0) returning *', usrID)
  .then(function(data) {
    res.status(200).json(data);
  })
  .catch(function (err) {
    return next(err);
  });
}

function getPedidosUsuario(req, res, next) {
  var usrID = parseInt(req.params.usuario);
  db.any('select * from pedidos where usuario_id = $1', usrID)
    .then(function (data) {
      res.status(200).json(data);
    })
    .catch(function (err){
      return next(err);
    });
}

function getPedidoUsuario(req, res, next) {
  var usrID = parseInt(req.params.usuario);
  var pedID = parseInt(req.params.id);
  pedidoUsuario(usrID, pedID, res);
}

function createProductoPedido(req, res, next) {
  var pedID = parseInt(req.params.pedido);
  var prodID = parseInt(req.params.idProd);
  var canti = parseInt(req.params.canti);
  var usrID = parseInt(req.params.usuario);
  
  db.one('select * from productos where producto_id = $1', prodID)
    .then(function(p){
      var importe = parseFloat(p.precio)*canti;
      db.none('insert into entradas(pedidos_id, productos_id, canti, importe) ' +
        'values($1, $2, $3, $4)', [pedID, prodID, canti, importe])
        .then(function(){
            updateTotalesPedido(pedID, importe, 1).then(function(){
              pedidoUsuario(usrID, pedID, res);
            });
        })
        .catch(function(err){
          return next(err);
        });
    })
    .catch(function(err){
      return next(err);
    });
}

function deleteProductoPedido(req, res, next) {
  var pedID = parseInt(req.params.pedido);
  var prodID = parseInt(req.params.idProd);
  var usrID = parseInt(req.params.usuario);
  var importe;
  getEntrada(pedID, prodID).then(function(entrada){
    importe = entrada.importe;
  });
  db.none('delete from entradas where pedidos_id = $1 and productos_id = $2', [pedID, prodID])
    .then(function(){
      updateTotalesPedido(pedID, importe, -1).then(function(){
        pedidoUsuario(usrID, pedID, res);
      });
    })
    .catch(function(err){
      return next(err);
    });
}

function pedidoUsuario(usuario, pedido, res){
  db.any('select * from pedidos where usuario_id = $1 and pedido_id = $2', [usuario, pedido])
    .then(function (p){
      db.any('select * from entradas where pedidos_id = $1', pedido)
        .then(entradas => {
            entradas.forEach((entrada, index, data) => {
              getProducto(entrada.productos_id).then(function(producto){
                entrada.producto = producto;
                p[0].entradas = data;
                if((index+1)==entradas.length)
                  res.status(200).json(p);
              });
            });
            if(entradas.length==0){
              p[0].entradas = entradas;
              res.status(200).json(p);
            }
        });
        if (p.length == 0)
          res.status(200).json(p);
    })
    .catch(function(err){
      return next(err);
    });
}

function getProducto(producto_id){
  producto_id = parseInt(producto_id);
  return db.one('select * from productos where producto_id = $1', producto_id)
    .then(function(producto){
      return producto;
    });
}

function updateTotalesPedido(pedido, importe, op){
  var total, iva, subtotal;
  return db.one('select subtotal from pedidos where pedido_id = $1', pedido)
    .then(function(p){
      subtotal = parseFloat(p.subtotal) + (importe*op);
      iva = subtotal*0.16;
      total = subtotal + iva;
      db.none('update pedidos set subtotal = $1, total = $2, iva = $3 where pedido_id = $4',
        [subtotal, total, iva, pedido]);
    });
}

function getEntrada(pedido, producto){
  return db.one('select * from entradas where pedidos_id = $1 and productos_id = $2', [pedido, producto])
    .then(function(entrada){
      return entrada;
    });
}



