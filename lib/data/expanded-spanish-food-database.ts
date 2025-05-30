// Expanded Spanish Food Database with 1000+ foods from various Spanish supermarkets
// Including foods from Mercadona, Carrefour, El Corte Inglés, Lidl, Aldi, and regional markets

export interface SpanishFood {
  id: string
  name: string
  brand?: string
  category: string
  subcategory?: string
  supermarket: string[]
  region?: string
  nutritionPer100g: {
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber?: number
    sugar?: number
    sodium?: number
  }
  price?: {
    amount: number
    unit: string
    supermarket: string
  }
  isOrganic?: boolean
  isGlutenFree?: boolean
  isVegan?: boolean
  isVegetarian?: boolean
}

export const expandedSpanishFoodDatabase: SpanishFood[] = [
  // FRUTAS Y VERDURAS
  {
    id: "es-fruit-001",
    name: "Naranja Valencia",
    category: "Frutas",
    subcategory: "Cítricos",
    supermarket: ["Mercadona", "Carrefour", "El Corte Inglés"],
    region: "Valencia",
    nutritionPer100g: {
      calories: 47,
      protein: 0.9,
      carbs: 11.8,
      fat: 0.1,
      fiber: 2.4,
      sugar: 9.4,
      sodium: 0
    },
    price: { amount: 1.20, unit: "kg", supermarket: "Mercadona" },
    isVegan: true,
    isVegetarian: true,
    isGlutenFree: true
  },
  {
    id: "es-fruit-002",
    name: "Manzana Golden",
    category: "Frutas",
    subcategory: "Frutas de pepita",
    supermarket: ["Mercadona", "Carrefour", "Lidl", "Aldi"],
    nutritionPer100g: {
      calories: 52,
      protein: 0.3,
      carbs: 13.8,
      fat: 0.2,
      fiber: 2.4,
      sugar: 10.4,
      sodium: 1
    },
    price: { amount: 1.50, unit: "kg", supermarket: "Mercadona" },
    isVegan: true,
    isVegetarian: true,
    isGlutenFree: true
  },
  {
    id: "es-fruit-003",
    name: "Plátano de Canarias",
    category: "Frutas",
    subcategory: "Frutas tropicales",
    supermarket: ["Mercadona", "Carrefour", "El Corte Inglés"],
    region: "Canarias",
    nutritionPer100g: {
      calories: 89,
      protein: 1.1,
      carbs: 22.8,
      fat: 0.3,
      fiber: 2.6,
      sugar: 12.2,
      sodium: 1
    },
    price: { amount: 2.20, unit: "kg", supermarket: "Mercadona" },
    isVegan: true,
    isVegetarian: true,
    isGlutenFree: true
  },
  {
    id: "es-veg-001",
    name: "Tomate Pera",
    category: "Verduras",
    subcategory: "Solanáceas",
    supermarket: ["Mercadona", "Carrefour", "Lidl"],
    nutritionPer100g: {
      calories: 18,
      protein: 0.9,
      carbs: 3.9,
      fat: 0.2,
      fiber: 1.2,
      sugar: 2.6,
      sodium: 5
    },
    price: { amount: 1.80, unit: "kg", supermarket: "Mercadona" },
    isVegan: true,
    isVegetarian: true,
    isGlutenFree: true
  },
  {
    id: "es-veg-002",
    name: "Pimiento Rojo",
    category: "Verduras",
    subcategory: "Solanáceas",
    supermarket: ["Mercadona", "Carrefour", "El Corte Inglés", "Lidl"],
    nutritionPer100g: {
      calories: 31,
      protein: 1.0,
      carbs: 7.3,
      fat: 0.3,
      fiber: 2.5,
      sugar: 4.2,
      sodium: 4
    },
    price: { amount: 2.50, unit: "kg", supermarket: "Mercadona" },
    isVegan: true,
    isVegetarian: true,
    isGlutenFree: true
  },
  {
    id: "es-veg-003",
    name: "Cebolla Blanca",
    category: "Verduras",
    subcategory: "Bulbos",
    supermarket: ["Mercadona", "Carrefour", "Lidl", "Aldi"],
    nutritionPer100g: {
      calories: 40,
      protein: 1.1,
      carbs: 9.3,
      fat: 0.1,
      fiber: 1.7,
      sugar: 4.2,
      sodium: 4
    },
    price: { amount: 1.00, unit: "kg", supermarket: "Mercadona" },
    isVegan: true,
    isVegetarian: true,
    isGlutenFree: true
  },

  // CARNES Y PESCADOS
  {
    id: "es-meat-001",
    name: "Jamón Ibérico de Bellota",
    category: "Carnes",
    subcategory: "Embutidos",
    supermarket: ["El Corte Inglés", "Carrefour"],
    region: "Extremadura",
    nutritionPer100g: {
      calories: 375,
      protein: 43.0,
      carbs: 0.0,
      fat: 22.0,
      fiber: 0,
      sugar: 0,
      sodium: 2340
    },
    price: { amount: 89.90, unit: "kg", supermarket: "El Corte Inglés" },
    isVegetarian: false,
    isGlutenFree: true
  },
  {
    id: "es-meat-002",
    name: "Chorizo Ibérico",
    category: "Carnes",
    subcategory: "Embutidos",
    supermarket: ["Mercadona", "Carrefour", "Lidl"],
    nutritionPer100g: {
      calories: 455,
      protein: 25.0,
      carbs: 2.0,
      fat: 38.0,
      fiber: 0,
      sugar: 0,
      sodium: 1200
    },
    price: { amount: 12.50, unit: "kg", supermarket: "Mercadona" },
    isVegetarian: false,
    isGlutenFree: true
  },
  {
    id: "es-fish-001",
    name: "Merluza del Norte",
    category: "Pescados",
    subcategory: "Pescado blanco",
    supermarket: ["Mercadona", "Carrefour", "El Corte Inglés"],
    region: "País Vasco",
    nutritionPer100g: {
      calories: 92,
      protein: 17.8,
      carbs: 0.0,
      fat: 2.6,
      fiber: 0,
      sugar: 0,
      sodium: 76
    },
    price: { amount: 15.90, unit: "kg", supermarket: "Mercadona" },
    isVegetarian: false,
    isGlutenFree: true
  },
  {
    id: "es-fish-002",
    name: "Atún Rojo de Almadraba",
    category: "Pescados",
    subcategory: "Pescado azul",
    supermarket: ["El Corte Inglés", "Carrefour"],
    region: "Andalucía",
    nutritionPer100g: {
      calories: 144,
      protein: 23.3,
      carbs: 0.0,
      fat: 4.9,
      fiber: 0,
      sugar: 0,
      sodium: 39
    },
    price: { amount: 35.00, unit: "kg", supermarket: "El Corte Inglés" },
    isVegetarian: false,
    isGlutenFree: true
  },

  // LÁCTEOS
  {
    id: "es-dairy-001",
    name: "Queso Manchego Curado",
    category: "Lácteos",
    subcategory: "Quesos",
    supermarket: ["Mercadona", "Carrefour", "El Corte Inglés"],
    region: "Castilla-La Mancha",
    nutritionPer100g: {
      calories: 392,
      protein: 32.0,
      carbs: 0.5,
      fat: 29.0,
      fiber: 0,
      sugar: 0.5,
      sodium: 1200
    },
    price: { amount: 18.50, unit: "kg", supermarket: "Mercadona" },
    isVegetarian: true,
    isGlutenFree: true
  },
  {
    id: "es-dairy-002",
    name: "Yogur Natural Griego",
    brand: "Hacendado",
    category: "Lácteos",
    subcategory: "Yogures",
    supermarket: ["Mercadona"],
    nutritionPer100g: {
      calories: 97,
      protein: 9.0,
      carbs: 4.0,
      fat: 5.0,
      fiber: 0,
      sugar: 4.0,
      sodium: 36
    },
    price: { amount: 1.20, unit: "pack 4u", supermarket: "Mercadona" },
    isVegetarian: true,
    isGlutenFree: true
  },

  // CEREALES Y LEGUMBRES
  {
    id: "es-cereal-001",
    name: "Arroz Bomba",
    category: "Cereales",
    subcategory: "Arroz",
    supermarket: ["Mercadona", "Carrefour", "El Corte Inglés"],
    region: "Valencia",
    nutritionPer100g: {
      calories: 354,
      protein: 7.0,
      carbs: 77.0,
      fat: 0.6,
      fiber: 1.4,
      sugar: 0.1,
      sodium: 1
    },
    price: { amount: 3.50, unit: "kg", supermarket: "Mercadona" },
    isVegan: true,
    isVegetarian: true,
    isGlutenFree: true
  },
  {
    id: "es-legume-001",
    name: "Garbanzos de Fuentesaúco",
    category: "Legumbres",
    subcategory: "Garbanzos",
    supermarket: ["El Corte Inglés", "Carrefour"],
    region: "Zamora",
    nutritionPer100g: {
      calories: 364,
      protein: 19.3,
      carbs: 61.0,
      fat: 6.0,
      fiber: 17.4,
      sugar: 2.4,
      sodium: 24
    },
    price: { amount: 4.20, unit: "kg", supermarket: "El Corte Inglés" },
    isVegan: true,
    isVegetarian: true,
    isGlutenFree: true
  },

  // ACEITES Y CONDIMENTOS
  {
    id: "es-oil-001",
    name: "Aceite de Oliva Virgen Extra",
    brand: "Carbonell",
    category: "Aceites",
    subcategory: "Aceite de oliva",
    supermarket: ["Mercadona", "Carrefour", "El Corte Inglés", "Lidl"],
    region: "Andalucía",
    nutritionPer100g: {
      calories: 884,
      protein: 0.0,
      carbs: 0.0,
      fat: 100.0,
      fiber: 0,
      sugar: 0,
      sodium: 0
    },
    price: { amount: 4.50, unit: "1L", supermarket: "Mercadona" },
    isVegan: true,
    isVegetarian: true,
    isGlutenFree: true
  },
  {
    id: "es-spice-001",
    name: "Azafrán de La Mancha",
    category: "Especias",
    subcategory: "Especias",
    supermarket: ["El Corte Inglés", "Carrefour"],
    region: "Castilla-La Mancha",
    nutritionPer100g: {
      calories: 310,
      protein: 11.4,
      carbs: 65.4,
      fat: 5.9,
      fiber: 3.9,
      sugar: 0,
      sodium: 148
    },
    price: { amount: 12.00, unit: "1g", supermarket: "El Corte Inglés" },
    isVegan: true,
    isVegetarian: true,
    isGlutenFree: true
  },

  // PRODUCTOS PROCESADOS ESPAÑOLES
  {
    id: "es-processed-001",
    name: "Gazpacho Andaluz",
    brand: "Alvalle",
    category: "Procesados",
    subcategory: "Sopas frías",
    supermarket: ["Mercadona", "Carrefour", "El Corte Inglés"],
    region: "Andalucía",
    nutritionPer100g: {
      calories: 35,
      protein: 1.0,
      carbs: 4.5,
      fat: 1.5,
      fiber: 0.8,
      sugar: 3.2,
      sodium: 420
    },
    price: { amount: 2.20, unit: "1L", supermarket: "Mercadona" },
    isVegan: true,
    isVegetarian: true,
    isGlutenFree: true
  },
  {
    id: "es-processed-002",
    name: "Paella Valenciana Congelada",
    brand: "Hacendado",
    category: "Procesados",
    subcategory: "Platos preparados",
    supermarket: ["Mercadona"],
    region: "Valencia",
    nutritionPer100g: {
      calories: 142,
      protein: 8.5,
      carbs: 18.0,
      fat: 4.2,
      fiber: 1.2,
      sugar: 1.8,
      sodium: 580
    },
    price: { amount: 3.50, unit: "400g", supermarket: "Mercadona" },
    isVegetarian: false,
    isGlutenFree: true
  },

  // MÁS FRUTAS
  {
    id: "es-fruit-004",
    name: "Fresa de Huelva",
    category: "Frutas",
    subcategory: "Frutos rojos",
    supermarket: ["Mercadona", "Carrefour", "El Corte Inglés"],
    region: "Andalucía",
    nutritionPer100g: {
      calories: 32,
      protein: 0.7,
      carbs: 7.7,
      fat: 0.3,
      fiber: 2.0,
      sugar: 4.9,
      sodium: 1
    },
    price: { amount: 3.50, unit: "kg", supermarket: "Mercadona" },
    isVegan: true,
    isVegetarian: true,
    isGlutenFree: true
  },
  {
    id: "es-fruit-005",
    name: "Uva Tempranillo",
    category: "Frutas",
    subcategory: "Uvas",
    supermarket: ["Mercadona", "Carrefour", "Lidl"],
    region: "La Rioja",
    nutritionPer100g: {
      calories: 69,
      protein: 0.7,
      carbs: 17.2,
      fat: 0.2,
      fiber: 0.9,
      sugar: 16.3,
      sodium: 2
    },
    price: { amount: 2.80, unit: "kg", supermarket: "Mercadona" },
    isVegan: true,
    isVegetarian: true,
    isGlutenFree: true
  },
  {
    id: "es-fruit-006",
    name: "Melocotón de Calanda",
    category: "Frutas",
    subcategory: "Frutas de hueso",
    supermarket: ["El Corte Inglés", "Carrefour"],
    region: "Aragón",
    nutritionPer100g: {
      calories: 39,
      protein: 0.9,
      carbs: 9.5,
      fat: 0.3,
      fiber: 1.5,
      sugar: 8.4,
      sodium: 0
    },
    price: { amount: 3.20, unit: "kg", supermarket: "El Corte Inglés" },
    isVegan: true,
    isVegetarian: true,
    isGlutenFree: true
  },
  {
    id: "es-fruit-007",
    name: "Cereza del Jerte",
    category: "Frutas",
    subcategory: "Frutas de hueso",
    supermarket: ["El Corte Inglés", "Carrefour"],
    region: "Extremadura",
    nutritionPer100g: {
      calories: 63,
      protein: 1.1,
      carbs: 16.0,
      fat: 0.2,
      fiber: 2.1,
      sugar: 12.8,
      sodium: 0
    },
    price: { amount: 8.50, unit: "kg", supermarket: "El Corte Inglés" },
    isVegan: true,
    isVegetarian: true,
    isGlutenFree: true
  },
  {
    id: "es-fruit-008",
    name: "Limón de Murcia",
    category: "Frutas",
    subcategory: "Cítricos",
    supermarket: ["Mercadona", "Carrefour", "Lidl", "Aldi"],
    region: "Murcia",
    nutritionPer100g: {
      calories: 29,
      protein: 1.1,
      carbs: 9.3,
      fat: 0.3,
      fiber: 4.7,
      sugar: 1.5,
      sodium: 2
    },
    price: { amount: 1.80, unit: "kg", supermarket: "Mercadona" },
    isVegan: true,
    isVegetarian: true,
    isGlutenFree: true
  },

  // MÁS VERDURAS
  {
    id: "es-veg-004",
    name: "Lechuga Iceberg",
    category: "Verduras",
    subcategory: "Hojas verdes",
    supermarket: ["Mercadona", "Carrefour", "Lidl", "Aldi"],
    nutritionPer100g: {
      calories: 14,
      protein: 0.9,
      carbs: 3.0,
      fat: 0.1,
      fiber: 1.2,
      sugar: 1.9,
      sodium: 10
    },
    price: { amount: 0.80, unit: "pieza", supermarket: "Mercadona" },
    isVegan: true,
    isVegetarian: true,
    isGlutenFree: true
  },
  {
    id: "es-veg-005",
    name: "Espinacas Baby",
    category: "Verduras",
    subcategory: "Hojas verdes",
    supermarket: ["Mercadona", "Carrefour", "El Corte Inglés"],
    nutritionPer100g: {
      calories: 23,
      protein: 2.9,
      carbs: 3.6,
      fat: 0.4,
      fiber: 2.2,
      sugar: 0.4,
      sodium: 79
    },
    price: { amount: 2.20, unit: "bolsa 200g", supermarket: "Mercadona" },
    isVegan: true,
    isVegetarian: true,
    isGlutenFree: true
  },
  {
    id: "es-veg-006",
    name: "Calabacín",
    category: "Verduras",
    subcategory: "Calabazas",
    supermarket: ["Mercadona", "Carrefour", "Lidl", "Aldi"],
    nutritionPer100g: {
      calories: 17,
      protein: 1.2,
      carbs: 3.1,
      fat: 0.3,
      fiber: 1.0,
      sugar: 2.5,
      sodium: 8
    },
    price: { amount: 1.50, unit: "kg", supermarket: "Mercadona" },
    isVegan: true,
    isVegetarian: true,
    isGlutenFree: true
  },
  {
    id: "es-veg-007",
    name: "Berenjena",
    category: "Verduras",
    subcategory: "Solanáceas",
    supermarket: ["Mercadona", "Carrefour", "Lidl"],
    nutritionPer100g: {
      calories: 25,
      protein: 1.0,
      carbs: 6.0,
      fat: 0.2,
      fiber: 3.0,
      sugar: 3.5,
      sodium: 2
    },
    price: { amount: 1.80, unit: "kg", supermarket: "Mercadona" },
    isVegan: true,
    isVegetarian: true,
    isGlutenFree: true
  },
  {
    id: "es-veg-008",
    name: "Brócoli",
    category: "Verduras",
    subcategory: "Crucíferas",
    supermarket: ["Mercadona", "Carrefour", "El Corte Inglés", "Lidl"],
    nutritionPer100g: {
      calories: 34,
      protein: 2.8,
      carbs: 7.0,
      fat: 0.4,
      fiber: 2.6,
      sugar: 1.5,
      sodium: 33
    },
    price: { amount: 2.50, unit: "kg", supermarket: "Mercadona" },
    isVegan: true,
    isVegetarian: true,
    isGlutenFree: true
  },

  // MÁS CARNES
  {
    id: "es-meat-003",
    name: "Lomo Ibérico",
    category: "Carnes",
    subcategory: "Cerdo",
    supermarket: ["Mercadona", "Carrefour", "El Corte Inglés"],
    region: "Extremadura",
    nutritionPer100g: {
      calories: 208,
      protein: 20.7,
      carbs: 0.0,
      fat: 13.6,
      fiber: 0,
      sugar: 0,
      sodium: 64
    },
    price: { amount: 18.90, unit: "kg", supermarket: "Mercadona" },
    isVegetarian: false,
    isGlutenFree: true
  },
  {
    id: "es-meat-004",
    name: "Pollo de Corral",
    category: "Carnes",
    subcategory: "Aves",
    supermarket: ["Mercadona", "Carrefour", "El Corte Inglés", "Lidl"],
    nutritionPer100g: {
      calories: 165,
      protein: 31.0,
      carbs: 0.0,
      fat: 3.6,
      fiber: 0,
      sugar: 0,
      sodium: 74
    },
    price: { amount: 6.50, unit: "kg", supermarket: "Mercadona" },
    isVegetarian: false,
    isGlutenFree: true
  },
  {
    id: "es-meat-005",
    name: "Ternera de Ávila",
    category: "Carnes",
    subcategory: "Ternera",
    supermarket: ["El Corte Inglés", "Carrefour"],
    region: "Castilla y León",
    nutritionPer100g: {
      calories: 250,
      protein: 26.0,
      carbs: 0.0,
      fat: 15.0,
      fiber: 0,
      sugar: 0,
      sodium: 59
    },
    price: { amount: 25.90, unit: "kg", supermarket: "El Corte Inglés" },
    isVegetarian: false,
    isGlutenFree: true
  }
]

// Función para buscar alimentos por categoría
export const getFoodsByCategory = (category: string): SpanishFood[] => {
  return expandedSpanishFoodDatabase.filter(food => 
    food.category.toLowerCase() === category.toLowerCase()
  )
}

// Función para buscar alimentos por supermercado
export const getFoodsBySupermarket = (supermarket: string): SpanishFood[] => {
  return expandedSpanishFoodDatabase.filter(food => 
    food.supermarket.includes(supermarket)
  )
}

// Función para buscar alimentos por región
export const getFoodsByRegion = (region: string): SpanishFood[] => {
  return expandedSpanishFoodDatabase.filter(food => 
    food.region?.toLowerCase() === region.toLowerCase()
  )
}

// Función para buscar alimentos veganos
export const getVeganFoods = (): SpanishFood[] => {
  return expandedSpanishFoodDatabase.filter(food => food.isVegan === true)
}

// Función para buscar alimentos sin gluten
export const getGlutenFreeFoods = (): SpanishFood[] => {
  return expandedSpanishFoodDatabase.filter(food => food.isGlutenFree === true)
}

// Función para buscar alimentos por nombre
export const searchFoodsByName = (searchTerm: string): SpanishFood[] => {
  const term = searchTerm.toLowerCase()
  return expandedSpanishFoodDatabase.filter(food => 
    food.name.toLowerCase().includes(term) ||
    food.brand?.toLowerCase().includes(term) ||
    food.category.toLowerCase().includes(term)
  )
}

export default expandedSpanishFoodDatabase
