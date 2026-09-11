/* Catalogo semilla de AD Moda & Confort.
   availability: 'stock' (entrega inmediata) | 'order' (pedido, ~5 dias habiles)

   - Productos 'stock': el inventario se lleva POR TALLE en `stock` = { talle: unidades }.
     El total disponible se calcula sumando (ver src/lib/inventory.js).
   - Productos 'order': `stock` = {} y no tienen limite de unidades.

   El panel de admin puede editar / agregar productos; los cambios se guardan en
   localStorage y tienen prioridad sobre esta semilla. */

const img = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=70`

export const CATEGORIES = ['Zapatillas', 'Ropa', 'Accesorios']

export const SEED_PRODUCTS = [
  {
    id: 'p-001', name: 'Runner Pro Air', brand: 'Vellon', category: 'Zapatillas',
    price: 189990, availability: 'stock',
    sizes: ['38', '39', '40', '41', '42', '43'],
    stock: { '38': 1, '39': 2, '40': 3, '41': 3, '42': 2, '43': 1 },
    image: img('1542291026-7eec264c27ff'),
    description: 'Zapatilla de running con amortiguacion reactiva y upper de malla transpirable. Ideal para uso diario y entrenamientos de media distancia.',
  },
  {
    id: 'p-002', name: 'Court Classic Low', brand: 'Vellon', category: 'Zapatillas',
    price: 154990, availability: 'stock',
    sizes: ['37', '38', '39', '40', '41'],
    stock: { '37': 1, '38': 2, '39': 2, '40': 2, '41': 1 },
    image: img('1595950653106-6c9ebd614d3a'),
    description: 'Silueta retro de cuero premium con suela vulcanizada. Un basico atemporal para combinar con todo.',
  },
  {
    id: 'p-003', name: 'Trail Storm GTX', brand: 'Kova', category: 'Zapatillas',
    price: 219990, availability: 'order',
    sizes: ['40', '41', '42', '43', '44'], stock: {},
    image: img('1606107557195-0e29a4b5b4aa'),
    description: 'Zapatilla de trail impermeable con agarre multiterreno. Se fabrica bajo pedido segun tu talle.',
  },
  {
    id: 'p-004', name: 'Campera Rompeviento Shell', brand: 'Kova', category: 'Ropa',
    price: 134990, availability: 'stock',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: { S: 3, M: 5, L: 4, XL: 3 },
    image: img('1551028719-00167b16eac5'),
    description: 'Campera liviana plegable, resistente al agua y al viento. Costuras selladas y capucha ajustable.',
  },
  {
    id: 'p-005', name: 'Buzo Oversize Heavy', brand: 'AD Basics', category: 'Ropa',
    price: 78990, availability: 'stock',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: { S: 4, M: 6, L: 6, XL: 5, XXL: 3 },
    image: img('1556821840-3a63f95609a7'),
    description: 'Frisa de 480 g/m2, calce oversize y punos reforzados. Prenda estrella para el invierno.',
  },
  {
    id: 'p-006', name: 'Remera Pima Essential', brand: 'AD Basics', category: 'Ropa',
    price: 32990, availability: 'stock',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: { S: 8, M: 12, L: 12, XL: 8 },
    image: img('1521572163474-6864f9cf17ab'),
    description: 'Algodon pima de fibra larga, tacto suave y caida perfecta. Cuello reforzado que no se deforma.',
  },
  {
    id: 'p-007', name: 'Pantalon Jogger Tech', brand: 'Kova', category: 'Ropa',
    price: 89990, availability: 'order',
    sizes: ['S', 'M', 'L', 'XL'], stock: {},
    image: img('1552902865-b72c031ac5ea'),
    description: 'Jogger de tejido tecnico con bolsillos con cierre. Produccion a pedido, ~5 dias habiles.',
  },
  {
    id: 'p-008', name: 'Slip-On Canvas', brand: 'Vellon', category: 'Zapatillas',
    price: 98990, availability: 'stock',
    sizes: ['36', '37', '38', '39', '40', '41'],
    stock: { '36': 1, '37': 1, '38': 1, '39': 1, '40': 1, '41': 1 },
    image: img('1525966222134-fcfa99b8ae77'),
    description: 'Zapatilla sin cordones de lona resistente. Liviana y flexible para el dia a dia.',
  },
  {
    id: 'p-009', name: 'Mochila Urban 22L', brand: 'AD Basics', category: 'Accesorios',
    price: 64990, availability: 'stock',
    sizes: ['Unico'], stock: { Unico: 10 },
    image: img('1553062407-98eeb64c6a62'),
    description: 'Mochila con compartimento acolchado para notebook 15", tela repelente y espalda ventilada.',
  },
  {
    id: 'p-010', name: 'Gorra Trucker Logo', brand: 'AD Basics', category: 'Accesorios',
    price: 24990, availability: 'stock',
    sizes: ['Unico'], stock: { Unico: 30 },
    image: img('1588850561407-ed78c282e89b'),
    description: 'Gorra de corte trucker con frente estructurado y malla trasera. Cierre snapback regulable.',
  },
  {
    id: 'p-011', name: 'Zapatilla Retro Wave', brand: 'Vellon', category: 'Zapatillas',
    price: 167990, availability: 'order',
    sizes: ['38', '39', '40', '41', '42'], stock: {},
    image: img('1600185365483-26d7a4cc7519'),
    description: 'Diseno inspirado en los 90 con paneles de gamuza y midsole contrastante. Bajo pedido.',
  },
  {
    id: 'p-012', name: 'Short Deportivo Airflow', brand: 'Kova', category: 'Ropa',
    price: 42990, availability: 'stock',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: { S: 4, M: 6, L: 5, XL: 3 },
    image: img('1591195853828-11db59a44f6b'),
    description: 'Short de entrenamiento ultraliviano con calza interna y tela de secado rapido.',
  },
  {
    id: 'p-013', name: 'Campera Puffer Light', brand: 'Kova', category: 'Ropa',
    price: 179990, availability: 'stock',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: { S: 1, M: 2, L: 2, XL: 2 },
    image: img('1544022613-e87ca75a784a'),
    description: 'Abrigo acolchado con relleno termico reciclado. Compacta y abrigada sin volumen.',
  },
  {
    id: 'p-014', name: 'Medias Cushion Pack x3', brand: 'AD Basics', category: 'Accesorios',
    price: 18990, availability: 'stock',
    sizes: ['35-38', '39-42', '43-46'],
    stock: { '35-38': 15, '39-42': 20, '43-46': 15 },
    image: img('1586350977771-b3b0abd50c82'),
    description: 'Pack de 3 pares de medias con refuerzo en talon y puntera. Algodon con toque de elastano.',
  },
  {
    id: 'p-015', name: 'Zapatilla Skate Grip', brand: 'Vellon', category: 'Zapatillas',
    price: 142990, availability: 'stock',
    sizes: ['39', '40', '41', '42', '43'],
    stock: { '39': 1, '40': 2, '41': 3, '42': 2, '43': 1 },
    image: img('1608231387042-66d1773070a5'),
    description: 'Suela vulcanizada de alto agarre y puntera reforzada. Pensada para uso intensivo.',
  },
  {
    id: 'p-016', name: 'Camisa Lino Relajada', brand: 'AD Basics', category: 'Ropa',
    price: 69990, availability: 'order',
    sizes: ['S', 'M', 'L', 'XL'], stock: {},
    image: img('1602810318383-e386cc2a3ccf'),
    description: 'Camisa 100% lino de calce relajado, fresca para el verano. Confeccion a pedido.',
  },
  {
    id: 'p-017', name: 'Botines Urbanos Chelsea', brand: 'Kova', category: 'Zapatillas',
    price: 198990, availability: 'stock',
    sizes: ['39', '40', '41', '42', '43', '44'],
    stock: { '39': 1, '40': 1, '41': 2, '42': 1, '43': 0, '44': 0 },
    image: img('1520639888713-7851133b1ed0'),
    description: 'Botin estilo Chelsea de cuero con elasticos laterales y suela track. Versatil y elegante.',
  },
  {
    id: 'p-018', name: 'Rinonera Crossbody', brand: 'AD Basics', category: 'Accesorios',
    price: 34990, availability: 'stock',
    sizes: ['Unico'], stock: { Unico: 20 },
    image: img('1553545204-4f7d339aa06a'),
    description: 'Rinonera compacta con multiples bolsillos y correa ajustable. Uso cruzado o a la cintura.',
  },
]

export const ORDER_LEAD_DAYS = 5
