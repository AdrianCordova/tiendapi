DROP DATABASE IF EXISTS tienda;
CREATE DATABASE tienda;

\c tienda;

CREATE TABLE usuarios (
  usuario_ID SERIAL PRIMARY KEY,
  nombre VARCHAR(45)
);

CREATE TABLE productos (
  producto_ID SERIAL PRIMARY KEY,
  nombre VARCHAR(45),
  precio FLOAT
);

CREATE TABLE pedidos (
  pedido_ID SERIAL PRIMARY KEY,
  usuario_ID INTEGER REFERENCES usuarios (usuario_ID) ON DELETE CASCADE,
  total FLOAT,
  iva FLOAT,
  subtotal FLOAT
);

CREATE TABLE entradas (
  pedidos_id INTEGER REFERENCES pedidos (pedido_ID) ON DELETE CASCADE,
  productos_id INTEGER REFERENCES productos (producto_ID),
  canti INT,
  importe FLOAT,
  PRIMARY KEY (pedidos_id, productos_id)
);
