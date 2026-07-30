-- ADStore schema for MySQL 8+
-- Generated from API models

-- Drop tables in reverse dependency order
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS DetallesEntradaStock;
DROP TABLE IF EXISTS EntradasStock;
DROP TABLE IF EXISTS PedidoDetalles;
DROP TABLE IF EXISTS Pedidos;
DROP TABLE IF EXISTS ProductoImagenes;
DROP TABLE IF EXISTS ProductoTalles;
DROP TABLE IF EXISTS Productos;
DROP TABLE IF EXISTS Proveedores;
DROP TABLE IF EXISTS Categorias;
DROP TABLE IF EXISTS Marcas;
DROP TABLE IF EXISTS Usuarios;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE IF NOT EXISTS Usuarios (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  Nombre VARCHAR(200) NOT NULL,
  Email VARCHAR(200) NOT NULL,
  PasswordHash VARCHAR(255) NOT NULL,
  Rol VARCHAR(100) NOT NULL,
  AvatarPath VARCHAR(300) NULL,
  Activo TINYINT(1) NOT NULL DEFAULT 1,
  UNIQUE KEY UQ_Usuarios_Email (Email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Marcas (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  Nombre VARCHAR(100) NOT NULL,
  Activo TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Categorias (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  Nombre VARCHAR(100) NOT NULL,
  Activo TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Proveedores (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  Nombre VARCHAR(200) NOT NULL,
  Telefono VARCHAR(50) NULL,
  Direccion VARCHAR(500) NULL,
  Activo TINYINT(1) NOT NULL DEFAULT 1,
  UNIQUE KEY UQ_Proveedores_Nombre (Nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Productos (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  Nombre VARCHAR(150) NOT NULL,
  Descripcion VARCHAR(1000) NULL,
  Precio DECIMAL(10,2) NOT NULL,
  MarcaId INT NOT NULL,
  CategoriaId INT NOT NULL,
  ProveedorId INT NULL,
  Activo TINYINT(1) NOT NULL DEFAULT 1,
  CONSTRAINT FK_Productos_Marcas FOREIGN KEY (MarcaId) REFERENCES Marcas(Id) ON DELETE RESTRICT,
  CONSTRAINT FK_Productos_Categorias FOREIGN KEY (CategoriaId) REFERENCES Categorias(Id) ON DELETE RESTRICT,
  CONSTRAINT FK_Productos_Proveedores FOREIGN KEY (ProveedorId) REFERENCES Proveedores(Id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ProductoTalles (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  ProductoId INT NOT NULL,
  Talle VARCHAR(20) NOT NULL,
  Stock INT NOT NULL,
  CONSTRAINT FK_ProductoTalles_Productos FOREIGN KEY (ProductoId) REFERENCES Productos(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ProductoImagenes (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  ProductoId INT NOT NULL,
  RutaImagen VARCHAR(300) NOT NULL,
  EsPrincipal TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT FK_ProductoImagenes_Productos FOREIGN KEY (ProductoId) REFERENCES Productos(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Pedidos (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  UsuarioId INT NOT NULL,
  Fecha DATETIME NOT NULL,
  Total DECIMAL(10,2) NOT NULL,
  Estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente',
  CONSTRAINT FK_Pedidos_Usuarios FOREIGN KEY (UsuarioId) REFERENCES Usuarios(Id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS PedidoDetalles (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  PedidoId INT NOT NULL,
  ProductoTalleId INT NOT NULL,
  Cantidad INT NOT NULL,
  PrecioUnitario DECIMAL(10,2) NOT NULL,
  CONSTRAINT FK_PedidoDetalles_Pedidos FOREIGN KEY (PedidoId) REFERENCES Pedidos(Id) ON DELETE CASCADE,
  CONSTRAINT FK_PedidoDetalles_ProductoTalles FOREIGN KEY (ProductoTalleId) REFERENCES ProductoTalles(Id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS EntradasStock (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  ProveedorId INT NOT NULL,
  Fecha DATETIME NOT NULL,
  NumeroDocumento VARCHAR(50) NOT NULL,
  Observaciones VARCHAR(1000) NULL,
  MontoTotal DECIMAL(10,2) NOT NULL,
  CONSTRAINT FK_EntradasStock_Proveedores FOREIGN KEY (ProveedorId) REFERENCES Proveedores(Id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS DetallesEntradaStock (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  EntradaStockId INT NOT NULL,
  ProductoTalleId INT NOT NULL,
  Cantidad INT NOT NULL,
  PrecioUnitario DECIMAL(10,2) NOT NULL,
  Subtotal DECIMAL(10,2) NOT NULL,
  CONSTRAINT FK_DetallesEntradaStock_EntradasStock FOREIGN KEY (EntradaStockId) REFERENCES EntradasStock(Id) ON DELETE CASCADE,
  CONSTRAINT FK_DetallesEntradaStock_ProductoTalles FOREIGN KEY (ProductoTalleId) REFERENCES ProductoTalles(Id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX IX_Productos_MarcaId ON Productos (MarcaId);
CREATE INDEX IX_Productos_CategoriaId ON Productos (CategoriaId);
CREATE INDEX IX_Productos_ProveedorId ON Productos (ProveedorId);
CREATE INDEX IX_ProductoTalles_ProductoId ON ProductoTalles (ProductoId);
CREATE INDEX IX_ProductoImagenes_ProductoId ON ProductoImagenes (ProductoId);
CREATE INDEX IX_Pedidos_UsuarioId ON Pedidos (UsuarioId);
CREATE INDEX IX_PedidoDetalles_PedidoId ON PedidoDetalles (PedidoId);
CREATE INDEX IX_PedidoDetalles_ProductoTalleId ON PedidoDetalles (ProductoTalleId);
CREATE INDEX IX_EntradasStock_ProveedorId ON EntradasStock (ProveedorId);
CREATE INDEX IX_EntradasStock_Fecha ON EntradasStock (Fecha);
CREATE INDEX IX_DetallesEntradaStock_EntradaStockId ON DetallesEntradaStock (EntradaStockId);
CREATE INDEX IX_DetallesEntradaStock_ProductoTalleId ON DetallesEntradaStock (ProductoTalleId);

CREATE TABLE IF NOT EXISTS PasswordResetTokens (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  UsuarioId INT NOT NULL,
  Token VARCHAR(100) NOT NULL,
  Expiration DATETIME NOT NULL,
  Used TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT FK_PasswordResetTokens_Usuarios FOREIGN KEY (UsuarioId) REFERENCES Usuarios(Id) ON DELETE CASCADE,
  UNIQUE KEY UQ_PasswordResetTokens_Token (Token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX IX_PasswordResetTokens_Token ON PasswordResetTokens (Token);
CREATE INDEX IX_PasswordResetTokens_UsuarioId ON PasswordResetTokens (UsuarioId);
