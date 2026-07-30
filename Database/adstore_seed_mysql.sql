
--admin@adstore.com / admin123
INSERT INTO Usuarios (Nombre, Email, PasswordHash, Rol, Activo)
VALUES (
  'Administrador',
  'admin@adstore.com',
  'JAvlGPq9JyTdtvBO6x2llnRI1+gxwIyPqCKAn3THIKk=',
  'Administrador',
  1
);

-- ============================================================
-- PRODUCTOS  (MarcaId: Nike=2, Adidas=6, Puma=9, Reebok=10, UA=11)
--            (CategoriaId: Remeras=8, Pantalones=9, Zapatillas=10, Camperas=11, Buzos=12, Shorts=13)
--            (ProveedorId: Norte=5, Sur=6, Centro=7)
-- ============================================================
INSERT INTO Productos (Nombre, Descripcion, Precio, MarcaId, CategoriaId, ProveedorId, Activo) VALUES
  ('Remera Nike Dri-FIT',         'Remera deportiva con tecnologia Dri-FIT para mayor transpiracion. Ideal para entrenamientos de alta intensidad.',  8500.00,  2, 8,  5, 1),
  ('Remera Adidas Climalite',     'Remera con tela Climalite que aleja la humedad de la piel. Corte slim fit.',                                        7900.00,  6, 8,  6, 1),
  ('Remera Puma Training',        'Remera de entrenamiento liviana con estampado frontal. Material 100% poliester reciclado.',                          6500.00,  9, 8,  7, 1),
  ('Remera Under Armour Tech',    'Tejido suave, ligero y transpirable. Perfecto para cualquier tipo de actividad fisica.',                             9200.00, 11, 8,  5, 1),
  ('Pantalon Nike Fleece',        'Pantalon de buzo con bolsillos laterales y tiro elastico. Tela fleece de alta calidad.',                           14500.00,  2, 9,  5, 1),
  ('Pantalon Adidas Tiro',        'Pantalon deportivo con diseno clasico de tres tiras. Ajuste regular.',                                             13800.00,  6, 9,  6, 1),
  ('Pantalon Puma ESS',           'Pantalon comodo con elastico en la cintura y dobladillo ajustable.',                                               11200.00,  9, 9,  7, 1),
  ('Nike Air Max 270',            'Zapatillas con unidad Air de 270 en el talon para maxima amortiguacion. Upper de malla transpirable.',             42000.00,  2, 10, 5, 1),
  ('Adidas Ultraboost 22',        'Zapatillas con suela Boost para maxima energia de retorno. Upper Primeknit adaptable.',                            48000.00,  6, 10, 6, 1),
  ('Puma RS-X',                   'Zapatillas con diseno retro y tecnologia RS en la suela para amortiguacion optima.',                               35500.00,  9, 10, 7, 1),
  ('Reebok Classic Leather',      'Zapatillas clasicas de cuero con suela EVA de baja densidad. Atemporales y versatiles.',                           29800.00, 10, 10, 6, 1),
  ('Under Armour HOVR Sonic',     'Zapatillas con tecnologia HOVR para amortiguacion sin peso y retorno de energia.',                                 38500.00, 11, 10, 5, 1),
  ('Campera Nike Windrunner',     'Campera cortaviento liviana con capucha. Corte holgado y bolsillos con cierre.',                                   28000.00,  2, 11, 5, 1),
  ('Campera Adidas Track',        'Campera deportiva con cierre completo y logo bordado. Tela suave al tacto.',                                       25500.00,  6, 11, 6, 1),
  ('Campera Puma Essentials',     'Campera full zip ligera ideal para el entrenamiento. Bolsillos laterales.',                                        22000.00,  9, 11, 7, 1),
  ('Buzo Nike Club Fleece',       'Buzo con capucha y bolsillo canguro. Interior fleece suave para maxima comodidad.',                               18500.00,  2, 12, 5, 1),
  ('Buzo Adidas Essentials 3S',   'Buzo hoodie con las iconicas tres tiras en las mangas. Tela de algodon French Terry.',                            17800.00,  6, 12, 6, 1),
  ('Buzo Reebok Identity',        'Buzo clasico con logo en el pecho. Material grueso ideal para el frio.',                                          16200.00, 10, 12, 6, 1),
  ('Short Nike Dri-FIT',          'Short de entrenamiento con tecnologia Dri-FIT y forro interior. Bolsillo trasero con velcro.',                     9800.00,  2, 13, 5, 1),
  ('Short Adidas Own The Run',    'Short ligero para running con tira reflectante. Bolsillo posterior con cierre.',                                    9200.00,  6, 13, 6, 1),
  ('Short Puma Evostripe',        'Short deportivo con franja lateral y elastico en la cintura. Comodo para cualquier actividad.',                    8100.00,  9, 13, 7, 1);

-- ============================================================
-- TALLES — usando subquery por nombre para evitar IDs hardcodeados
-- ============================================================

-- Remeras
INSERT INTO ProductoTalles (ProductoId, Talle, Stock)
SELECT Id, talle, stock FROM Productos
JOIN (SELECT 'Remera Nike Dri-FIT' AS nombre, 'S' AS talle, 15 AS stock
 UNION ALL SELECT 'Remera Nike Dri-FIT','M',20 UNION ALL SELECT 'Remera Nike Dri-FIT','L',18 UNION ALL SELECT 'Remera Nike Dri-FIT','XL',10
 UNION ALL SELECT 'Remera Adidas Climalite','S',12 UNION ALL SELECT 'Remera Adidas Climalite','M',22 UNION ALL SELECT 'Remera Adidas Climalite','L',16 UNION ALL SELECT 'Remera Adidas Climalite','XL',8
 UNION ALL SELECT 'Remera Puma Training','S',18 UNION ALL SELECT 'Remera Puma Training','M',25 UNION ALL SELECT 'Remera Puma Training','L',20 UNION ALL SELECT 'Remera Puma Training','XL',12
 UNION ALL SELECT 'Remera Under Armour Tech','S',10 UNION ALL SELECT 'Remera Under Armour Tech','M',15 UNION ALL SELECT 'Remera Under Armour Tech','L',14 UNION ALL SELECT 'Remera Under Armour Tech','XL',9
) AS t ON Productos.Nombre = t.nombre;

-- Pantalones
INSERT INTO ProductoTalles (ProductoId, Talle, Stock)
SELECT Id, talle, stock FROM Productos
JOIN (SELECT 'Pantalon Nike Fleece' AS nombre, 'S' AS talle, 8 AS stock
 UNION ALL SELECT 'Pantalon Nike Fleece','M',14 UNION ALL SELECT 'Pantalon Nike Fleece','L',12 UNION ALL SELECT 'Pantalon Nike Fleece','XL',7
 UNION ALL SELECT 'Pantalon Adidas Tiro','S',10 UNION ALL SELECT 'Pantalon Adidas Tiro','M',18 UNION ALL SELECT 'Pantalon Adidas Tiro','L',15 UNION ALL SELECT 'Pantalon Adidas Tiro','XL',6
 UNION ALL SELECT 'Pantalon Puma ESS','S',9 UNION ALL SELECT 'Pantalon Puma ESS','M',16 UNION ALL SELECT 'Pantalon Puma ESS','L',13 UNION ALL SELECT 'Pantalon Puma ESS','XL',8
) AS t ON Productos.Nombre = t.nombre;

-- Zapatillas
INSERT INTO ProductoTalles (ProductoId, Talle, Stock)
SELECT Id, talle, stock FROM Productos
JOIN (SELECT 'Nike Air Max 270' AS nombre, '38' AS talle, 5 AS stock
 UNION ALL SELECT 'Nike Air Max 270','39',8 UNION ALL SELECT 'Nike Air Max 270','40',10 UNION ALL SELECT 'Nike Air Max 270','41',9 UNION ALL SELECT 'Nike Air Max 270','42',7 UNION ALL SELECT 'Nike Air Max 270','43',4
 UNION ALL SELECT 'Adidas Ultraboost 22','38',4 UNION ALL SELECT 'Adidas Ultraboost 22','39',7 UNION ALL SELECT 'Adidas Ultraboost 22','40',9 UNION ALL SELECT 'Adidas Ultraboost 22','41',8 UNION ALL SELECT 'Adidas Ultraboost 22','42',6 UNION ALL SELECT 'Adidas Ultraboost 22','43',3
 UNION ALL SELECT 'Puma RS-X','38',6 UNION ALL SELECT 'Puma RS-X','39',9 UNION ALL SELECT 'Puma RS-X','40',11 UNION ALL SELECT 'Puma RS-X','41',10 UNION ALL SELECT 'Puma RS-X','42',8 UNION ALL SELECT 'Puma RS-X','43',5
 UNION ALL SELECT 'Reebok Classic Leather','38',7 UNION ALL SELECT 'Reebok Classic Leather','39',10 UNION ALL SELECT 'Reebok Classic Leather','40',12 UNION ALL SELECT 'Reebok Classic Leather','41',11 UNION ALL SELECT 'Reebok Classic Leather','42',9 UNION ALL SELECT 'Reebok Classic Leather','43',6
 UNION ALL SELECT 'Under Armour HOVR Sonic','38',5 UNION ALL SELECT 'Under Armour HOVR Sonic','39',8 UNION ALL SELECT 'Under Armour HOVR Sonic','40',10 UNION ALL SELECT 'Under Armour HOVR Sonic','41',9 UNION ALL SELECT 'Under Armour HOVR Sonic','42',7 UNION ALL SELECT 'Under Armour HOVR Sonic','43',4
) AS t ON Productos.Nombre = t.nombre;

-- Camperas
INSERT INTO ProductoTalles (ProductoId, Talle, Stock)
SELECT Id, talle, stock FROM Productos
JOIN (SELECT 'Campera Nike Windrunner' AS nombre, 'S' AS talle, 7 AS stock
 UNION ALL SELECT 'Campera Nike Windrunner','M',12 UNION ALL SELECT 'Campera Nike Windrunner','L',10 UNION ALL SELECT 'Campera Nike Windrunner','XL',5
 UNION ALL SELECT 'Campera Adidas Track','S',8 UNION ALL SELECT 'Campera Adidas Track','M',14 UNION ALL SELECT 'Campera Adidas Track','L',11 UNION ALL SELECT 'Campera Adidas Track','XL',6
 UNION ALL SELECT 'Campera Puma Essentials','S',9 UNION ALL SELECT 'Campera Puma Essentials','M',15 UNION ALL SELECT 'Campera Puma Essentials','L',12 UNION ALL SELECT 'Campera Puma Essentials','XL',7
) AS t ON Productos.Nombre = t.nombre;

-- Buzos
INSERT INTO ProductoTalles (ProductoId, Talle, Stock)
SELECT Id, talle, stock FROM Productos
JOIN (SELECT 'Buzo Nike Club Fleece' AS nombre, 'S' AS talle, 10 AS stock
 UNION ALL SELECT 'Buzo Nike Club Fleece','M',16 UNION ALL SELECT 'Buzo Nike Club Fleece','L',14 UNION ALL SELECT 'Buzo Nike Club Fleece','XL',8
 UNION ALL SELECT 'Buzo Adidas Essentials 3S','S',9 UNION ALL SELECT 'Buzo Adidas Essentials 3S','M',18 UNION ALL SELECT 'Buzo Adidas Essentials 3S','L',15 UNION ALL SELECT 'Buzo Adidas Essentials 3S','XL',7
 UNION ALL SELECT 'Buzo Reebok Identity','S',8 UNION ALL SELECT 'Buzo Reebok Identity','M',14 UNION ALL SELECT 'Buzo Reebok Identity','L',12 UNION ALL SELECT 'Buzo Reebok Identity','XL',6
) AS t ON Productos.Nombre = t.nombre;

-- Shorts
INSERT INTO ProductoTalles (ProductoId, Talle, Stock)
SELECT Id, talle, stock FROM Productos
JOIN (SELECT 'Short Nike Dri-FIT' AS nombre, 'S' AS talle, 14 AS stock
 UNION ALL SELECT 'Short Nike Dri-FIT','M',20 UNION ALL SELECT 'Short Nike Dri-FIT','L',17 UNION ALL SELECT 'Short Nike Dri-FIT','XL',10
 UNION ALL SELECT 'Short Adidas Own The Run','S',12 UNION ALL SELECT 'Short Adidas Own The Run','M',18 UNION ALL SELECT 'Short Adidas Own The Run','L',15 UNION ALL SELECT 'Short Adidas Own The Run','XL',9
 UNION ALL SELECT 'Short Puma Evostripe','S',15 UNION ALL SELECT 'Short Puma Evostripe','M',22 UNION ALL SELECT 'Short Puma Evostripe','L',18 UNION ALL SELECT 'Short Puma Evostripe','XL',11
) AS t ON Productos.Nombre = t.nombre;
