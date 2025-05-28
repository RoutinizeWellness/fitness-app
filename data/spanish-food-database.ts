/**
 * Base de datos de alimentos españoles
 * Incluye productos frescos, envasados y regionales con sus valores nutricionales
 */

export interface SpanishFoodItem {
  id: string;
  name: string;
  brand?: string;
  category: string;
  subcategory?: string;
  region?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  servingSize: number;
  servingUnit: string;
  image?: string;
  supermarket?: string[];
}

export const spanishFoodDatabase: SpanishFoodItem[] = [
  // FRUTAS
  {
    id: "fruit-001",
    name: "Naranja valenciana",
    category: "Frutas",
    region: "Valencia",
    calories: 47,
    protein: 0.9,
    carbs: 11.8,
    fat: 0.1,
    fiber: 2.4,
    sugar: 9.4,
    servingSize: 100,
    servingUnit: "g",
    supermarket: ["Mercadona", "Carrefour", "Dia", "Lidl"]
  },
  {
    id: "fruit-002",
    name: "Plátano de Canarias",
    category: "Frutas",
    region: "Islas Canarias",
    calories: 89,
    protein: 1.1,
    carbs: 22.8,
    fat: 0.3,
    fiber: 2.6,
    sugar: 12.2,
    servingSize: 100,
    servingUnit: "g",
    supermarket: ["Mercadona", "Carrefour", "Dia", "Lidl", "Alcampo"]
  },
  {
    id: "fruit-003",
    name: "Fresa de Huelva",
    category: "Frutas",
    region: "Andalucía",
    calories: 32,
    protein: 0.7,
    carbs: 7.7,
    fat: 0.3,
    fiber: 2.0,
    sugar: 4.9,
    servingSize: 100,
    servingUnit: "g",
    supermarket: ["Mercadona", "Carrefour", "El Corte Inglés"]
  },
  {
    id: "fruit-004",
    name: "Manzana Golden",
    category: "Frutas",
    calories: 52,
    protein: 0.3,
    carbs: 13.8,
    fat: 0.2,
    fiber: 2.4,
    sugar: 10.4,
    servingSize: 100,
    servingUnit: "g",
    supermarket: ["Mercadona", "Carrefour", "Dia", "Lidl", "Alcampo"]
  },
  {
    id: "fruit-005",
    name: "Uva blanca sin semillas",
    category: "Frutas",
    calories: 69,
    protein: 0.6,
    carbs: 18.1,
    fat: 0.2,
    fiber: 0.9,
    sugar: 15.5,
    servingSize: 100,
    servingUnit: "g",
    supermarket: ["Mercadona", "Carrefour", "El Corte Inglés"]
  },
  
  // VERDURAS
  {
    id: "veg-001",
    name: "Tomate de rama",
    category: "Verduras",
    calories: 18,
    protein: 0.9,
    carbs: 3.9,
    fat: 0.2,
    fiber: 1.2,
    sugar: 2.6,
    servingSize: 100,
    servingUnit: "g",
    supermarket: ["Mercadona", "Carrefour", "Dia", "Lidl", "Alcampo"]
  },
  {
    id: "veg-002",
    name: "Pimiento rojo",
    category: "Verduras",
    calories: 31,
    protein: 1.0,
    carbs: 6.0,
    fat: 0.3,
    fiber: 2.1,
    sugar: 4.2,
    servingSize: 100,
    servingUnit: "g",
    supermarket: ["Mercadona", "Carrefour", "Dia"]
  },
  {
    id: "veg-003",
    name: "Patata nueva",
    category: "Verduras",
    calories: 77,
    protein: 2.0,
    carbs: 17.0,
    fat: 0.1,
    fiber: 2.2,
    sugar: 0.8,
    servingSize: 100,
    servingUnit: "g",
    supermarket: ["Mercadona", "Carrefour", "Dia", "Lidl", "Alcampo"]
  },
  {
    id: "veg-004",
    name: "Cebolla dulce",
    category: "Verduras",
    calories: 40,
    protein: 1.1,
    carbs: 9.3,
    fat: 0.1,
    fiber: 1.7,
    sugar: 4.2,
    servingSize: 100,
    servingUnit: "g",
    supermarket: ["Mercadona", "Carrefour", "Dia"]
  },
  {
    id: "veg-005",
    name: "Calabacín",
    category: "Verduras",
    calories: 17,
    protein: 1.2,
    carbs: 3.1,
    fat: 0.3,
    fiber: 1.0,
    sugar: 2.5,
    servingSize: 100,
    servingUnit: "g",
    supermarket: ["Mercadona", "Carrefour", "Dia", "Lidl"]
  },
  
  // CARNES
  {
    id: "meat-001",
    name: "Jamón ibérico de bellota",
    category: "Carnes",
    subcategory: "Embutidos",
    region: "Extremadura",
    calories: 250,
    protein: 33.0,
    carbs: 0.5,
    fat: 13.0,
    servingSize: 100,
    servingUnit: "g",
    supermarket: ["El Corte Inglés", "Carrefour", "Mercadona"]
  },
  {
    id: "meat-002",
    name: "Lomo de cerdo ibérico",
    category: "Carnes",
    calories: 143,
    protein: 21.0,
    carbs: 0.0,
    fat: 6.5,
    servingSize: 100,
    servingUnit: "g",
    supermarket: ["Mercadona", "Carrefour", "El Corte Inglés"]
  },
  {
    id: "meat-003",
    name: "Pechuga de pollo",
    category: "Carnes",
    calories: 110,
    protein: 23.0,
    carbs: 0.0,
    fat: 1.5,
    servingSize: 100,
    servingUnit: "g",
    supermarket: ["Mercadona", "Carrefour", "Dia", "Lidl", "Alcampo"]
  },
  {
    id: "meat-004",
    name: "Chorizo ibérico",
    category: "Carnes",
    subcategory: "Embutidos",
    calories: 455,
    protein: 24.0,
    carbs: 1.9,
    fat: 38.0,
    servingSize: 100,
    servingUnit: "g",
    supermarket: ["Mercadona", "Carrefour", "El Corte Inglés"]
  },
  {
    id: "meat-005",
    name: "Ternera gallega",
    category: "Carnes",
    region: "Galicia",
    calories: 131,
    protein: 22.0,
    carbs: 0.0,
    fat: 4.5,
    servingSize: 100,
    servingUnit: "g",
    supermarket: ["El Corte Inglés", "Carrefour", "Mercadona"]
  },
  
  // PESCADOS
  {
    id: "fish-001",
    name: "Merluza del Cantábrico",
    category: "Pescados",
    region: "Cantabria",
    calories: 86,
    protein: 17.0,
    carbs: 0.0,
    fat: 2.0,
    servingSize: 100,
    servingUnit: "g",
    supermarket: ["Mercadona", "Carrefour", "El Corte Inglés"]
  },
  {
    id: "fish-002",
    name: "Boquerones frescos",
    category: "Pescados",
    calories: 96,
    protein: 16.8,
    carbs: 0.0,
    fat: 3.0,
    servingSize: 100,
    servingUnit: "g",
    supermarket: ["Mercadona", "Carrefour", "Dia"]
  },
  {
    id: "fish-003",
    name: "Pulpo gallego",
    category: "Pescados",
    subcategory: "Mariscos",
    region: "Galicia",
    calories: 82,
    protein: 15.6,
    carbs: 2.0,
    fat: 1.0,
    servingSize: 100,
    servingUnit: "g",
    supermarket: ["El Corte Inglés", "Carrefour"]
  },
  {
    id: "fish-004",
    name: "Atún fresco",
    category: "Pescados",
    calories: 144,
    protein: 23.0,
    carbs: 0.0,
    fat: 5.0,
    servingSize: 100,
    servingUnit: "g",
    supermarket: ["Mercadona", "Carrefour", "El Corte Inglés"]
  },
  {
    id: "fish-005",
    name: "Gambas blancas de Huelva",
    category: "Pescados",
    subcategory: "Mariscos",
    region: "Andalucía",
    calories: 99,
    protein: 20.5,
    carbs: 0.0,
    fat: 1.7,
    servingSize: 100,
    servingUnit: "g",
    supermarket: ["El Corte Inglés", "Carrefour"]
  },
  
  // LÁCTEOS
  {
    id: "dairy-001",
    name: "Queso manchego curado",
    category: "Lácteos",
    region: "Castilla-La Mancha",
    calories: 402,
    protein: 32.0,
    carbs: 0.5,
    fat: 33.0,
    servingSize: 100,
    servingUnit: "g",
    supermarket: ["Mercadona", "Carrefour", "El Corte Inglés", "Dia"]
  },
  {
    id: "dairy-002",
    name: "Yogur natural Danone",
    category: "Lácteos",
    brand: "Danone",
    calories: 55,
    protein: 3.5,
    carbs: 5.0,
    fat: 2.0,
    sugar: 5.0,
    servingSize: 125,
    servingUnit: "g",
    supermarket: ["Mercadona", "Carrefour", "Dia", "Lidl", "Alcampo"]
  },
  {
    id: "dairy-003",
    name: "Leche entera Pascual",
    category: "Lácteos",
    brand: "Pascual",
    calories: 65,
    protein: 3.1,
    carbs: 4.7,
    fat: 3.6,
    sugar: 4.7,
    servingSize: 100,
    servingUnit: "ml",
    supermarket: ["Mercadona", "Carrefour", "Dia", "Lidl", "Alcampo"]
  },
  {
    id: "dairy-004",
    name: "Queso de Cabrales",
    category: "Lácteos",
    region: "Asturias",
    calories: 389,
    protein: 21.0,
    carbs: 2.0,
    fat: 33.0,
    servingSize: 100,
    servingUnit: "g",
    supermarket: ["El Corte Inglés", "Carrefour"]
  },
  {
    id: "dairy-005",
    name: "Queso de Mahón",
    category: "Lácteos",
    region: "Islas Baleares",
    calories: 340,
    protein: 25.0,
    carbs: 0.5,
    fat: 26.0,
    servingSize: 100,
    servingUnit: "g",
    supermarket: ["El Corte Inglés", "Carrefour", "Mercadona"]
  },
  
  // PRODUCTOS ENVASADOS
  {
    id: "packaged-001",
    name: "Gazpacho Alvalle",
    category: "Productos envasados",
    brand: "Alvalle",
    calories: 33,
    protein: 0.8,
    carbs: 3.1,
    fat: 2.0,
    servingSize: 100,
    servingUnit: "ml",
    supermarket: ["Mercadona", "Carrefour", "El Corte Inglés", "Dia"]
  },
  {
    id: "packaged-002",
    name: "Aceitunas rellenas de anchoa La Española",
    category: "Productos envasados",
    brand: "La Española",
    calories: 150,
    protein: 1.0,
    carbs: 1.0,
    fat: 15.0,
    servingSize: 100,
    servingUnit: "g",
    supermarket: ["Mercadona", "Carrefour", "Dia", "Lidl"]
  },
  {
    id: "packaged-003",
    name: "Paella valenciana Brillante",
    category: "Productos envasados",
    brand: "Brillante",
    region: "Valencia",
    calories: 157,
    protein: 5.0,
    carbs: 26.0,
    fat: 3.5,
    servingSize: 100,
    servingUnit: "g",
    supermarket: ["Mercadona", "Carrefour", "Dia", "Lidl", "Alcampo"]
  },
  {
    id: "packaged-004",
    name: "Fabada asturiana Litoral",
    category: "Productos envasados",
    brand: "Litoral",
    region: "Asturias",
    calories: 160,
    protein: 7.0,
    carbs: 15.0,
    fat: 8.0,
    servingSize: 100,
    servingUnit: "g",
    supermarket: ["Mercadona", "Carrefour", "Dia", "Lidl", "Alcampo"]
  },
  {
    id: "packaged-005",
    name: "Tortilla de patatas Casa Tarradellas",
    category: "Productos envasados",
    brand: "Casa Tarradellas",
    calories: 190,
    protein: 5.0,
    carbs: 12.0,
    fat: 14.0,
    servingSize: 100,
    servingUnit: "g",
    supermarket: ["Mercadona", "Carrefour", "Dia", "Lidl"]
  }
];
