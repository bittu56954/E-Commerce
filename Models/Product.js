import fs from 'fs';
import path from 'path';
import { MongoProduct, getMongoConnectionStatus } from './db.js';

const DATA_DIR = path.resolve('data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

// 10 base items per category (50 total)
const baseProducts = [
  // PIZZA (1-10)
  {
    id: "prod-1",
    name: "Classic Margherita Pizza",
    description: "Classic blend of fresh mozzarella, fresh basil, and sweet San Marzano tomato sauce on our sourdough crust.",
    price: 249,
    category: "Pizza",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=600"
  },
  {
    id: "prod-2",
    name: "Pepperoni Feast Pizza",
    description: "Generous loads of premium spicy pepperoni slices, loaded mozzarella cheese, and Italian herbs overlay.",
    price: 399,
    category: "Pizza",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=600"
  },
  {
    id: "prod-3",
    name: "Spicy Paneer Tikka Pizza",
    description: "Marinated cottage cheese chunks, bell peppers, onions, spicy tandoori sauce, and fresh coriander.",
    price: 349,
    category: "Pizza",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600"
  },
  {
    id: "prod-4",
    name: "Double Cheese Margherita",
    description: "Extra loaded stringy mozzarella cheese over a double layer of rich herbs infused San Marzano tomato sauce.",
    price: 299,
    category: "Pizza",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?q=80&w=600"
  },
  {
    id: "prod-5",
    name: "Farmhouse Garden Veggie Pizza",
    description: "Crispy capsicum, sweet corn, sliced black olives, earthy mushrooms, red onions, and hot jalapenos.",
    price: 329,
    category: "Pizza",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1571066811602-71683a3f680d?q=80&w=600"
  },
  {
    id: "prod-6",
    name: "Chicken Golden Delight Pizza",
    description: "Double layers of grilled golden chicken chunks, sweet pineapple slices, and extra mozzarella locks.",
    price: 389,
    category: "Pizza",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=600"
  },
  {
    id: "prod-7",
    name: "Tandoori Paneer Pizza",
    description: "Spiced paneer cubes, red paprika, bell peppers, onions, layered over tandoori sauce and mozzarella base.",
    price: 359,
    category: "Pizza",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?q=80&w=600"
  },
  {
    id: "prod-8",
    name: "Smoky BBQ Chicken Pizza",
    description: "Smoked shredded barbecue chicken, sweet red onions, fresh cilantro, cheddar and mozzarella cheese blend.",
    price: 399,
    category: "Pizza",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1594007654729-407ededc4963?q=80&w=600"
  },
  {
    id: "prod-9",
    name: "Chef's Spicy Meatball Pizza",
    description: "Spicy Italian lamb meatballs, caramelized onions, fresh garlic flakes, red chili flakes, and hot marinara.",
    price: 429,
    category: "Pizza",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1544982503-9f984c14501a?q=80&w=600"
  },
  {
    id: "prod-10",
    name: "Fiery Jalapeno & Red Pepper Pizza",
    description: "Hot sliced jalapeno slices, roasted red bell peppers, paprika seasoning, onion rings, and spicy chili sauce.",
    price: 319,
    category: "Pizza",
    rating: 4.4,
    image: "https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?q=80&w=600"
  },

  // BURGER (11-20)
  {
    id: "prod-11",
    name: "Crispy Veg Aloo Tikki Burger",
    description: "Golden crispy potato patty, fresh iceberg lettuce, sliced tomatoes, onions, and our signature mayo blend.",
    price: 99,
    category: "Burger",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600"
  },
  {
    id: "prod-12",
    name: "Ultimate Chicken Cheese Splash",
    description: "Flame-grilled succulent chicken breast, double cheddar cheese slices, caramelized onions, and smoky bbq dip.",
    price: 199,
    category: "Burger",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=600"
  },
  {
    id: "prod-13",
    name: "Double Grilled Paneer Burger",
    description: "Crispy grilled paneer slabs marinated in tikka spices, loaded with cream cheese, capsicum rings, and mint dressing.",
    price: 179,
    category: "Burger",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?q=80&w=600"
  },
  {
    id: "prod-14",
    name: "Spicy Crunch Chicken Burger",
    description: "Crumb-coated extra crispy golden chicken breast patty, chipotle dressing, jalapenos, and iceberg lettuce.",
    price: 189,
    category: "Burger",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?q=80&w=600"
  },
  {
    id: "prod-15",
    name: "Gourmet Mushroom Swiss Burger",
    description: "Hand-smashed veggie/mushroom patty, loaded sautéed button mushrooms, melted Swiss cheese, and garlic mayo.",
    price: 219,
    category: "Burger",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=600"
  },
  {
    id: "prod-16",
    name: "Classic American Lamb Burger",
    description: "Premium flame-broiled minced lamb patty, cheddar slices, pickle chips, sliced tomatoes, and house mustard sauce.",
    price: 249,
    category: "Burger",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?q=80&w=600"
  },
  {
    id: "prod-17",
    name: "Cheesy Mozzarella Melt Burger",
    description: "Crunchy crumb-coated mozzarella core slab, fresh basil pesto, tomato slices, and balsamic mayonnaise drop.",
    price: 159,
    category: "Burger",
    rating: 4.4,
    image: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?q=80&w=600"
  },
  {
    id: "prod-18",
    name: "Bacon & Cheddar Beef Burger",
    description: "Juicy flame-grilled beef/mutton patty, smoky bacon slices, double cheddar cheese, and signature smoke sauce.",
    price: 269,
    category: "Burger",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1582196016295-f8c894d37904?q=80&w=600"
  },
  {
    id: "prod-19",
    name: "Crispy Fish Fillet Burger",
    description: "Flaky golden fried fish fillet, rich caper tartar sauce, dill pickles, and soft buttered brioche bun.",
    price: 199,
    category: "Burger",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1512152272829-e3139592d56f?q=80&w=600"
  },
  {
    id: "prod-20",
    name: "Vegan Beetroot & Quinoa Burger",
    description: "Healthy house-made beetroot, quinoa and black bean patty, avocado slices, lettuce, and vegan cashew garlic mayo.",
    price: 149,
    category: "Burger",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1521305916504-4a1121188589?q=80&w=600"
  },

  // FOOD (21-30)
  {
    id: "prod-21",
    name: "Butter Paneer with Laccha Paratha",
    description: "Rich, creamy paneer gravy cooked in sweet tomato and butter sauce, served with hot crispy layered parathas.",
    price: 220,
    category: "Food",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=600"
  },
  {
    id: "prod-22",
    name: "Hakka Noodles with Chili Paneer",
    description: "Stir-fried indochinese eggless noodles tossed with bell peppers and green onions, served with dry chili paneer.",
    price: 180,
    category: "Food",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=600"
  },
  {
    id: "prod-23",
    name: "Dal Makhani with Jeera Rice Combo",
    description: "Creamy black lentils slow-cooked overnight with spices and fresh butter, served with fragrant cumin basmati rice.",
    price: 199,
    category: "Food",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=600"
  },
  {
    id: "prod-24",
    name: "Shahi Kadhai Paneer & Butter Naan",
    description: "Spicy cottage cheese strips tossed with thick bell pepper slices and kadhai gravy, served with soft butter naan.",
    price: 249,
    category: "Food",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=600"
  },
  {
    id: "prod-25",
    name: "Hyderabadi Veg Biryani Handi",
    description: "Traditional aromatic basmati rice cooked on dum with assorted fresh vegetables, mint leaves, and biryani spices.",
    price: 219,
    category: "Food",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=600"
  },
  {
    id: "prod-26",
    name: "Spicy Chicken Tikka Masala Combo",
    description: "Tandoor grilled chicken tikka chunks cooked in a thick spicy onion tomato gravy, served with butter naan.",
    price: 279,
    category: "Food",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=600"
  },
  {
    id: "prod-27",
    name: "Creamy Alfredo White Sauce Pasta",
    description: "Rich and creamy white sauce pasta tossed with butter, heavy garlic cream, broccoli florets, and sweet corn.",
    price: 189,
    category: "Food",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?q=80&w=600"
  },
  {
    id: "prod-28",
    name: "Sizzling Penne Arrabbiata Pasta",
    description: "Penne pasta tossed in dry hot olive oil, crushed garlic, fiery red peppers, sweet basil, and tangy tomato sauce.",
    price: 179,
    category: "Food",
    rating: 4.4,
    image: "https://images.unsplash.com/photo-1563379971899-660589a01cc3?q=80&w=600"
  },
  {
    id: "prod-29",
    name: "Wok-Tossed Chicken Fried Rice",
    description: "Premium jasmine rice wok-tossed with egg strips, seasoned shredded chicken, onions, and spicy soy garlic mix.",
    price: 199,
    category: "Food",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1603133872878-6966578417f5?q=80&w=600"
  },
  {
    id: "prod-30",
    name: "Chef's Special Chicken Lasagna",
    description: "Layered flat pasta sheet baked with minced chicken bolognese, fresh cream cheese sauce, and melted mozzarella top.",
    price: 239,
    category: "Food",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?q=80&w=600"
  },

  // DRINKS (31-40)
  {
    id: "prod-31",
    name: "Mint Lime Mojito Cooler",
    description: "Classic cooling beverage made of fresh mint leaves, lime slices, carbonated water, and sweetened cane syrup.",
    price: 95,
    category: "Drinks",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600"
  },
  {
    id: "prod-32",
    name: "Fresh Alphonso Mango Shake",
    description: "Creamy mango milkshake prepared with sweet pulpy Alphonso mangoes, fresh cold milk, and vanilla ice cream.",
    price: 120,
    category: "Drinks",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=600"
  },
  {
    id: "prod-33",
    name: "Iced Belgian Chocolate Frappe",
    description: "Rich blended beverage with dark Belgian chocolate syrup, ice cubes, cold milk, topped with whipped cream.",
    price: 149,
    category: "Drinks",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=600"
  },
  {
    id: "prod-34",
    name: "Sizzling Berry Blast Mocktail",
    description: "Tangy blend of blueberry, raspberry and strawberry extracts, lime drop, carbonated club soda, and ice crush.",
    price: 110,
    category: "Drinks",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600"
  },
  {
    id: "prod-35",
    name: "Creamy Avocado Matcha Shake",
    description: "Nutritious and thick energy shake blending ripe avocado pulp, Japanese green tea matcha, and raw honey.",
    price: 169,
    category: "Drinks",
    rating: 4.4,
    image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?q=80&w=600"
  },
  {
    id: "prod-36",
    name: "Classic Cold Coffee with Ice Cream",
    description: "Double shot espresso blended with cold milk and sugar, topped with a scoop of premium vanilla ice cream.",
    price: 129,
    category: "Drinks",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=600"
  },
  {
    id: "prod-37",
    name: "Royal Kesar Badam Milk",
    description: "Traditional chilled sweetened milk infused with premium Kashmiri saffron strands and crushed almonds.",
    price: 139,
    category: "Drinks",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1541658016709-82535e94bc69?q=80&w=600"
  },
  {
    id: "prod-38",
    name: "Tangy Orange Sunrise Spritzer",
    description: "Refreshing carbonated cooler mixing fresh orange juice, grenadine drop, crushed ice, and lime slices.",
    price: 99,
    category: "Drinks",
    rating: 4.3,
    image: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?q=80&w=600"
  },
  {
    id: "prod-39",
    name: "Refreshing Watermelon Mint Cooler",
    description: "Freshly squeezed watermelon juice mixed with lime juice, cooling mint extracts, served over crushed ice.",
    price: 95,
    category: "Drinks",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1506252374453-ef5237291d9d?q=80&w=600"
  },
  {
    id: "prod-40",
    name: "Premium Darjeeling Iced Tea",
    description: "Chilled brewed black tea from Darjeeling gardens, sweetened and infused with fresh lemon wedges.",
    price: 89,
    category: "Drinks",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1497534446932-c925b458314e?q=80&w=600"
  },

  // DESSERTS (41-50)
  {
    id: "prod-41",
    name: "Molten Chocolate Lava Cake",
    description: "Freshly baked warm chocolate cake with a delicious molten rich chocolate core filling.",
    price: 120,
    category: "Desserts",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=600"
  },
  {
    id: "prod-42",
    name: "Gulab Jamun with Vanilla Ice Cream",
    description: "Two hot gulab jamuns dipped in rose syrup, paired perfectly with a scoop of premium vanilla ice cream.",
    price: 90,
    category: "Desserts",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600"
  },
  {
    id: "prod-43",
    name: "Creamy Saffron Rasmalai",
    description: "Soft cottage cheese dumplings soaked in saffron milk syrup, garnished with pistachios and almonds.",
    price: 99,
    category: "Desserts",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600"
  },
  {
    id: "prod-44",
    name: "Red Velvet Cheesecake Slice",
    description: "Delightful layered pastry combining red velvet biscuit crumb crust and a rich baked cream cheese layer.",
    price: 159,
    category: "Desserts",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=600"
  },
  {
    id: "prod-45",
    name: "Walnut Brownie with Hot Fudge",
    description: "Fudgy walnut chocolate brownie slab served warm, topped with a scoop of chocolate ice cream and rich chocolate fudge.",
    price: 139,
    category: "Desserts",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?q=80&w=600"
  },
  {
    id: "prod-46",
    name: "Classic New York Baked Cheesecake",
    description: "Authentic dense and rich baked cream cheese cake slice over a crunchy graham cracker base layer.",
    price: 169,
    category: "Desserts",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?q=80&w=600"
  },
  {
    id: "prod-47",
    name: "Fresh Strawberry Mousse Cup",
    description: "Light and airy sweet strawberry mousse whipped with fresh cream, strawberry chunks, and mint garnish.",
    price: 110,
    category: "Desserts",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1546173159-315724a31696?q=80&w=600"
  },
  {
    id: "prod-48",
    name: "Italian Tiramisu Pastry",
    description: "Traditional Italian dessert dessert cake layer with coffee-soaked ladyfingers, whipped mascarpone cheese, cocoa powder.",
    price: 149,
    category: "Desserts",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=600"
  },
  {
    id: "prod-49",
    name: "Blueberry Glazed Waffle",
    description: "Freshly baked hot golden waffle topped with powdered sugar, sweet blueberry compote, and whipped cream.",
    price: 129,
    category: "Desserts",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=600"
  },
  {
    id: "prod-50",
    name: "Gourmet Mango Panna Cotta",
    description: "Chilled Italian dessert made of sweetened fresh cream, gelatin, layered with sweet Alphonso mango purée.",
    price: 119,
    category: "Desserts",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=600"
  }
];

// Extra 30 items per category lists to make exactly 40 items per category (200 total)
const extraPizzas = [
  ["Garden Fresh Pesto Pizza", "Fragrant house basil pesto base topped with roasted zucchini, baby spinach, and fresh mozzarella.", 339, 4.6, "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?q=80&w=600"],
  ["Truffle Wild Mushroom Pizza", "Earthy portobello mushrooms sautéed in truffle oil, over garlic white sauce and rich fontina.", 419, 4.9, "https://images.unsplash.com/photo-1571066811602-71683a3f680d?q=80&w=600"],
  ["Gorgonzola & Balsamic Fig Pizza", "Dried Turkish figs, tangy gorgonzola cheese, caramelized red onions, and aged balsamic glaze.", 389, 4.7, "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600"],
  ["Neapolitan Margherita Special", "Authentic soft sourdough crust topped with San Marzano tomatoes, buffalo mozzarella, and fresh basil.", 289, 4.8, "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=600"],
  ["Hot Honey & Spicy Pepperoni Pizza", "Spicy pepperoni slices layered over red sauce and finished with hot chili-infused honey.", 409, 4.9, "https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=600"],
  ["Smoky Bacon Breakfast Pizza", "Smoky bacon strips, baby spinach, caramelized onions, sunnyside-up eggs, and white cheddar.", 369, 4.6, "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?q=80&w=600"],
  ["Mediterranean Olive & Feta Pizza", "Sliced black olives, artichoke hearts, cherry tomatoes, crumbled feta, and fresh oregano leaves.", 329, 4.5, "https://images.unsplash.com/photo-1571066811602-71683a3f680d?q=80&w=600"],
  ["Sweet Chilli Chicken Pizza", "Grilled chicken strips tossed in sweet chilli sauce, sweet pineapple, and red capsicum.", 399, 4.7, "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=600"],
  ["Spinach & Creamy Ricotta Pizza", "Freshly chopped spinach, whipped ricotta cheese, roasted garlic flakes, and shaved parmesan.", 319, 4.5, "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600"],
  ["Roast Garlic Rosemary White Pizza", "Creamy ricotta and mozzarella base, topped with sliced roasted garlic, fresh rosemary, and olive oil.", 299, 4.4, "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=600"],
  ["Fiorentina Egg & Spinach Pizza", "Garlic butter baby spinach, soft farm egg crack, shaved parmigiano, and tomato sauce crust.", 349, 4.6, "https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=600"],
  ["Sun-Dried Tomato Pesto Pizza", "Rich sun-dried tomatoes, basil pesto sauce, fresh baby mozzarella balls, and roasted pine nuts.", 359, 4.7, "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?q=80&w=600"],
  ["Caramelized Onion & Goat Cheese Pizza", "Sweet slow-cooked red onions, rich goat cheese chunks, fresh thyme leaves, and mozzarella.", 379, 4.8, "https://images.unsplash.com/photo-1571066811602-71683a3f680d?q=80&w=600"],
  ["Chipotle Chicken Fajita Pizza", "Spiced chipotle chicken shreds, bell pepper strips, red onion rings, and cilantro crema drizzle.", 389, 4.7, "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=600"],
  ["Spicy Salami & Jalapeno Pizza", "Artisanal spicy salami slices, pickled jalapeno peppers, chili flakes, and hot marinara.", 399, 4.8, "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?q=80&w=600"],
  ["Tandoori Chicken Coriander Pizza", "Tandoori baked chicken chunks, red onion rings, fresh green chiles, and chopped cilantro leaves.", 389, 4.7, "https://images.unsplash.com/photo-1594007654729-407ededc4963?q=80&w=600"],
  ["Balsamic Glaze Tomato Margherita", "Ripe vine tomato slices, mozzarella pearls, fresh basil pesto, finished with sweet balsamic glaze.", 319, 4.6, "https://images.unsplash.com/photo-1544982503-9f984c14501a?q=80&w=600"],
  ["Shredded Duck & Hoisin Pizza", "Pulled duck leg confit, green onion slivers, cucumber strips, hoisin sauce, and white sesame.", 449, 4.9, "https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?q=80&w=600"],
  ["Artichoke Hearts & Red Pepper Pizza", "Marinated artichoke hearts, fire-roasted red bell peppers, baby spinach, and goat cheese.", 349, 4.5, "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?q=80&w=600"],
  ["Philly Cheesesteak Pizza", "Tender shaved sirloin steak, sautéed green peppers, caramelized onions, and provolone blend.", 429, 4.8, "https://images.unsplash.com/photo-1571066811602-71683a3f680d?q=80&w=600"],
  ["Carbonara Creamy Sauce Pizza", "Pancetta cubes, cracked egg yolk cream, shaved pecorino cheese, and freshly cracked black pepper.", 389, 4.7, "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600"],
  ["Vegan Cheesy Marinara Pizza", "Tangy tomato marinara sauce, roasted garlic, fresh basil, and dairy-free cashew mozzarella.", 319, 4.4, "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=600"],
  ["Pulled Pork BBQ Feast Pizza", "Slow-cooked pulled pork, sweet BBQ sauce drizzle, red onions, and smoked gouda cheese.", 419, 4.8, "https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=600"],
  ["Sweet Corn & Mushroom Truffle Pizza", "Sweet golden corn, sautéed wild mushrooms, fresh chives, and white truffle oil drops.", 369, 4.7, "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?q=80&w=600"],
  ["Peri Peri Chicken & Onion Pizza", "Spicy marinated peri peri chicken strips, red onion rings, capsicum, and hot peri peri mayo.", 389, 4.7, "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=600"],
  ["Spicy Keema & Green Chilli Pizza", "Flavorful spiced minced mutton keema, sliced green chillies, red onions, and fresh coriander.", 419, 4.8, "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?q=80&w=600"],
  ["Cajun Seafood & Parsley Pizza", "Cajun-seasoned baby prawns, squid rings, chopped fresh parsley, garlic oil, and mozzarella.", 459, 4.9, "https://images.unsplash.com/photo-1594007654729-407ededc4963?q=80&w=600"],
  ["Spiced Lamb & Mint Sauce Pizza", "Slow-cooked spiced lamb mince, crumbled feta, red onion, topped with refreshing mint yogurt sauce.", 439, 4.8, "https://images.unsplash.com/photo-1544982503-9f984c14501a?q=80&w=600"],
  ["Prosciutto & Arugula Green Pizza", "Delicate prosciutto slices layered over mozzarella crust, topped with fresh baby arugula and olive oil.", 429, 4.9, "https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?q=80&w=600"],
  ["Pesto Roasted Zucchini Pizza", "Sliced zucchini grilled in olive oil, over a rich nut-free basil pesto sauce and fresh mozzarella.", 339, 4.5, "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?q=80&w=600"]
];

const extraBurgers = [
  ["Double Smash Beef Burger", "Two crispy smashed beef patties, double cheddar cheese, grilled onions, and house smash sauce.", 259, 4.9, "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600"],
  ["Crispy Jalapeno Cheddar Burger", "Flame-grilled patty, crunchy fried jalapenos, warm cheddar cheese sauce, and chipotle aioli.", 189, 4.7, "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=600"],
  ["Flame-Grilled Teriyaki Burger", "Grilled beef/chicken patty, sweet teriyaki glaze, grilled pineapple slice, and sesame mayo.", 179, 4.6, "https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?q=80&w=600"],
  ["Avocado Garlic Aioli Veg Burger", "Wholesome veggie patty, fresh avocado slices, tomato, alfalfa sprouts, and roasted garlic aioli.", 159, 4.5, "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?q=80&w=600"],
  ["Spicy Crispy Buffalo Chicken Burger", "Crumbed chicken breast dipped in buffalo hot sauce, blue cheese dressing, and celery slaw.", 199, 4.8, "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=600"],
  ["Smoky Bacon Onion Ring Burger", "Grilled beef patty, crispy bacon strips, beer-battered onion rings, and sweet hickory BBQ sauce.", 229, 4.8, "https://images.unsplash.com/photo-1553979459-d2229ba7433b?q=80&w=600"],
  ["Gourmet Truffle Swiss Burger", "Beef patty, sautéed wild mushrooms in truffle oil, melted Swiss cheese, and truffle mayo.", 249, 4.9, "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?q=80&w=600"],
  ["Mediterranean Falafel Burger", "Crispy spiced falafel patty, hummus spread, sliced cucumber, tomatoes, and garlic tahini sauce.", 139, 4.4, "https://images.unsplash.com/photo-1582196016295-f8c894d37904?q=80&w=600"],
  ["Sweet Chilli Grilled Salmon Burger", "Premium salmon fillet grilled, sweet chili glaze, pickled ginger slaw, and wasabi mayonnaise.", 279, 4.8, "https://images.unsplash.com/photo-1512152272829-e3139592d56f?q=80&w=600"],
  ["Texas BBQ Pulled Pork Burger", "Slow-cooked pulled pork, sweet honey BBQ sauce, creamy cabbage slaw, on a toasted brioche bun.", 219, 4.7, "https://images.unsplash.com/photo-1521305916504-4a1121188589?q=80&w=600"],
  ["Spicy Chipotle Bean Veg Burger", "Black bean and sweet corn patty, pepper jack cheese, jalapeño slices, and spicy chipotle sauce.", 149, 4.5, "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600"],
  ["Classic Cheese Sliders Trio", "Three mini cheeseburgers featuring cheddar, pickles, ketchup, and mustard on soft toasted rolls.", 189, 4.6, "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=600"],
  ["Smoked Turkey Clubhouse Burger", "Sliced smoked turkey breast, crispy bacon, Swiss cheese, leaf lettuce, tomato, and avocado mayo.", 179, 4.6, "https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?q=80&w=600"],
  ["Korean Kimchi Spicy Burger", "Spiced pork/beef patty, warm melted cheddar, spicy cabbage kimchi, and gochujang garlic mayo.", 199, 4.7, "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?q=80&w=600"],
  ["Mac and Cheese Stuffed Burger", "Flame-grilled beef patty stuffed with creamy cheddar macaroni cheese, on a buttered bun.", 229, 4.8, "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=600"],
  ["Hickory Smoke Mutton Burger", "Seasoned minced mutton patty, sliced red onions, melted cheddar, and hickory smoke house sauce.", 239, 4.8, "https://images.unsplash.com/photo-1553979459-d2229ba7433b?q=80&w=600"],
  ["Herb Butter Grilled Paneer Burger", "Cottage cheese slab grilled in herb butter, capsicum rings, lettuce, and coriander-mint mayo.", 169, 4.6, "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?q=80&w=600"],
  ["Chipotle Sweet Potato Veg Burger", "Crispy baked sweet potato and chickpea patty, sliced avocado, tomato, and chipotle crema.", 139, 4.5, "https://images.unsplash.com/photo-1582196016295-f8c894d37904?q=80&w=600"],
  ["Sriracha Crispy Chicken Burger", "Panko-crumbed golden chicken breast patty, spicy sriracha honey glaze, pickles, and butter lettuce.", 189, 4.7, "https://images.unsplash.com/photo-1512152272829-e3139592d56f?q=80&w=600"],
  ["Gorgonzola Caramelized Onion Burger", "Smashed beef patty, crumbled Italian gorgonzola cheese, slow-cooked caramelized onions, and mayo.", 219, 4.7, "https://images.unsplash.com/photo-1521305916504-4a1121188589?q=80&w=600"],
  ["Curry Spiced Chickpea Vegan Burger", "Spiced chickpea and spinach patty, cucumber slices, red onion, and vegan coconut curry mayo.", 149, 4.4, "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600"],
  ["Pesto Mozzarella Grilled Chicken Burger", "Grilled chicken breast, fresh basil pesto, melted mozzarella slice, and sun-dried tomato spread.", 199, 4.7, "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=600"],
  ["California Sunshine Burger", "Grilled patty, sunnyside-up egg, crispy bacon, avocado mash, cheddar, and honey mustard.", 229, 4.8, "https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?q=80&w=600"],
  ["Southern Crispy Catfish Burger", "Southern-style cornmeal fried catfish fillet, lettuce, tomato, and tangy cajun tartar sauce.", 189, 4.5, "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?q=80&w=600"],
  ["Ultimate Double Cheese Beef Burger", "Two seasoned beef patties, double processed cheese layers, pickles, and classic burger sauce.", 249, 4.9, "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=600"],
  ["Spicy Habanero Pepper Jack Burger", "Beef patty, melted pepper jack cheese, sliced fresh habaneros, and fiery ghost pepper aioli.", 209, 4.7, "https://images.unsplash.com/photo-1553979459-d2229ba7433b?q=80&w=600"],
  ["Lemon Herb Grilled Turkey Burger", "Minced turkey breast patty seasoned with lemon and herbs, leaf lettuce, and cranberry mayo.", 179, 4.5, "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?q=80&w=600"],
  ["Maple Glazed Bacon Burger", "Grilled beef patty, thick-cut maple glazed bacon, double cheddar, and maple-mustard glaze.", 219, 4.8, "https://images.unsplash.com/photo-1582196016295-f8c894d37904?q=80&w=600"],
  ["Cheddar Cheese Pretzel Bun Burger", "Hand-pressed patty, sharp cheddar cheese sauce, caramelized onions, on a toasted pretzel bun.", 199, 4.7, "https://images.unsplash.com/photo-1512152272829-e3139592d56f?q=80&w=600"],
  ["Southwest Black Bean Burger", "Spiced black bean and sweet potato patty, roasted corn salsa, avocado, and tortilla strips.", 149, 4.5, "https://images.unsplash.com/photo-1521305916504-4a1121188589?q=80&w=600"]
];

const extraFoods = [
  ["Chole Bhature Traditional Combo", "Two large puffed fried leavened breads, served with spicy chickpea curry, onions, and pickles.", 160, 4.8, "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=600"],
  ["Paneer Butter Masala & Naan", "Rich cottage cheese cooked in creamy sweet tomato and butter sauce, served with butter naan.", 240, 4.8, "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=600"],
  ["Veg Manchurian & Fried Rice", "Deep fried mixed vegetable balls in sweet, sour and hot manchurian sauce, with fried rice.", 199, 4.7, "https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=600"],
  ["Crispy Veg Spring Rolls Basket", "Six rolls stuffed with cabbage, carrot, and glass noodles, deep fried and served with sweet chili dip.", 130, 4.6, "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=600"],
  ["Paneer Tikka Kathi Roll Duo", "Two rolls featuring spiced paneer tikka cubes, sliced onions, mint green chutney, in soft flatbreads.", 150, 4.6, "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=600"],
  ["Spicy Schezwan Fried Rice", "Fried jasmine rice wok-tossed with green beans, carrots, spring onions, and hot schezwan sauce.", 169, 4.5, "https://images.unsplash.com/photo-1603133872878-6966578417f5?q=80&w=600"],
  ["Steamed Veg Momos with Dip", "Eight steamed Tibetan-style vegetable dumplings served with spicy garlic sesame chili dipping sauce.", 120, 4.6, "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=600"],
  ["Kadai Mushroom & Lachha Paratha", "Fresh button mushrooms tossed with thick bell peppers and kadai masala, with layered parathas.", 210, 4.7, "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=600"],
  ["Chana Masala with Jeera Rice", "Spicy chickpea curry cooked with raw onions, ginger and green chiles, served with cumin basmati rice.", 179, 4.6, "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=600"],
  ["Fettuccine Creamy Alfredo Pasta", "Rich white sauce pasta tossed with butter, heavy cream, garlic, and fresh broccoli florets.", 199, 4.7, "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?q=80&w=600"],
  ["Spicy Chicken Hakka Noodles", "Stir-fried noodles tossed with green bell peppers, spring onions, egg strips, and shredded chicken.", 210, 4.8, "https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=600"],
  ["Aloo Gobi Matar & Roti Combo", "Dry potato, cauliflower and green peas dish cooked in Indian spices, with three soft wheat rotis.", 150, 4.5, "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=600"],
  ["Creamy Spinach Cannelloni", "Rolled pasta sheets stuffed with chopped spinach, ricotta, baked under marinara and cheese.", 219, 4.7, "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?q=80&w=600"],
  ["Garlic Herb Breadsticks Basket", "Six warm breadsticks freshly baked with garlic butter, Italian herbs, served with marinara dip.", 110, 4.5, "https://images.unsplash.com/photo-1563379971899-660589a01cc3?q=80&w=600"],
  ["Paneer Lababdar & Garlic Naan", "Paneer cubes in rich sweet-spicy tomato gravy cooked in butter, served with garlic naan bread.", 249, 4.8, "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=600"],
  ["Paneer Bhurji & Tandoori Roti", "Spiced scrambled cottage cheese cooked with onions, tomatoes and green chiles, with three rotis.", 220, 4.7, "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=600"],
  ["Veggie Stir Fry Brown Rice", "Healthy steamed brown rice stir-fried with carrots, broccoli, zucchini, and garlic soy seasoning.", 169, 4.5, "https://images.unsplash.com/photo-1603133872878-6966578417f5?q=80&w=600"],
  ["Kashmiri Dum Aloo & Rice Combo", "Baby potatoes slow-cooked in rich Kashmiri red chili yogurt sauce, served with basmati rice.", 199, 4.6, "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=600"],
  ["Stir Fried Garlic Mushrooms", "Fresh white button mushrooms pan-tossed in olive oil with loads of chopped garlic and fresh parsley.", 159, 4.5, "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=600"],
  ["Classic Veg Fried Rice Bowl", "Fragrant jasmine rice wok-tossed with chopped carrots, green beans, cabbage, and light soy sauce.", 159, 4.5, "https://images.unsplash.com/photo-1603133872878-6966578417f5?q=80&w=600"],
  ["Veg Penne Pesto Pasta", "Penne pasta tossed in fresh green basil pesto sauce, cherry tomatoes, and shaved parmigiano.", 189, 4.6, "https://images.unsplash.com/photo-1563379971899-660589a01cc3?q=80&w=600"],
  ["Crispy Corn Chili Pepper", "Deep-fried sweet corn kernels tossed with diced bell peppers, spring onions, and green chiles.", 149, 4.6, "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=600"],
  ["Paneer Do Pyaza & Roti Combo", "Paneer cubes cooked with a double portion of onions in a semi-dry gravy, served with three rotis.", 219, 4.7, "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=600"],
  ["Hyderabadi Veg Dum Biryani", "Fragrant basmati rice layered with spiced vegetables, saffron milk, slow-cooked in dum style.", 230, 4.8, "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=600"],
  ["Rajma Masala & Steamed Rice", "Red kidney beans simmered in thick spicy onion-tomato gravy, served with steamed basmati rice.", 180, 4.7, "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=600"],
  ["Veggie Chow Mein Bowl", "Indo-Chinese stir-fried eggless noodles tossed with shredded cabbage, carrots, and spicy soy-chili sauce.", 159, 4.6, "https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=600"],
  ["Peshawari Paneer & Naan Combo", "Cottage cheese chunks cooked in Peshawari spices and sweet cashew nut paste, served with soft naan.", 249, 4.8, "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=600"],
  ["Chili Garlic Potato Bites", "Twelve bite-sized crispy fried potato nuggets tossed in dry hot red chili flakes and chopped garlic.", 119, 4.5, "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=600"],
  ["Cheesy Garlic Naan Basket", "Soft flatbread stuffed with mozzarella cheese, brushed with garlic butter and fresh coriander.", 129, 4.7, "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=600"],
  ["Dal Tadka with Laccha Paratha", "Yellow split pigeon peas tempered with cumin, red chilies, garlic, served with layered paratha.", 189, 4.7, "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=600"]
];

const extraDrinks = [
  ["Refreshing Classic Lemonade", "Refreshing fresh-squeezed lemon juice, cold water, sugar syrup, served over ice blocks.", 79, 4.5, "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600"],
  ["Chilled Oreo Blast Shake", "Creamy milkshake blended with Oreo cookies, vanilla ice cream, topped with chocolate sauce.", 139, 4.8, "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=600"],
  ["Strawberry Basil Cooler", "Fresh strawberries muddled with fresh basil leaves, lemon juice, club soda, and ice crush.", 119, 4.6, "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600"],
  ["Cinnamon Honey Hot Latte", "Fresh espresso shot steamed with honey, milk, and a dusting of aromatic ground cinnamon.", 129, 4.7, "https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=600"],
  ["Matcha Coconut Iced Latte", "Chilled beverage with organic Japanese green tea matcha, creamy coconut milk, and syrup.", 149, 4.6, "https://images.unsplash.com/photo-1553530666-ba11a7da3888?q=80&w=600"],
  ["Lemon Mint Iced Tea Glass", "Brewed black tea chilled and blended with fresh lemon juice, sugar, and crushed mint leaves.", 99, 4.6, "https://images.unsplash.com/photo-1497534446932-c925b458314e?q=80&w=600"],
  ["Sparkling Cranberry Cooler", "Tart cranberry juice mixed with sweet ginger ale, lime squeeze, served over crushed ice.", 109, 4.5, "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600"],
  ["Pomegranate Sunrise Spritzer", "Fresh pomegranate juice, carbonated club soda, orange slices, and mint leaves, ice-crushed.", 119, 4.6, "https://images.unsplash.com/photo-1621263764928-df1444c5e859?q=80&w=600"],
  ["Banana Peanut Butter Smoothie", "Nutritious smoothie blending ripe bananas, creamy peanut butter, Greek yogurt, and raw honey.", 139, 4.7, "https://images.unsplash.com/photo-1553530666-ba11a7da3888?q=80&w=600"],
  ["Iced Vanilla Caramel Macchiato", "Chilled espresso with cold milk, vanilla syrup, drizzled with sweet caramel sauce.", 149, 4.8, "https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=600"],
  ["Warm Spiced Hot Chocolate", "Creamy hot chocolate prepared with dark Belgian cocoa, raw honey, and warm winter spices.", 119, 4.7, "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=600"],
  ["Chilled Irish Cream Cold Brew", "Slow-steeped cold brew coffee topped with a layer of sweet Irish cream flavored cold foam.", 139, 4.8, "https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=600"],
  ["Sparkling Blueberry Soda", "House-made sweet blueberry compote, carbonated club soda, lime juice, served with ice blocks.", 99, 4.5, "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600"],
  ["Tangy Kiwi Lime Mocktail", "Muddled fresh kiwi, lime juice, mint leaves, carbonated soda, topped with kiwi slices.", 119, 4.5, "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600"],
  ["Sweet Butterscotch Milkshake", "Rich milkshake blended with sweet butterscotch syrup, vanilla ice cream, and whipped cream.", 139, 4.7, "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=600"],
  ["Traditional Chilled Sweet Lassi", "Traditional thick yogurt beverage blended sweet with sugar, cardamom, topped with cream.", 99, 4.7, "https://images.unsplash.com/photo-1541658016709-82535e94bc69?q=80&w=600"],
  ["Chilled Masala Butter Milk", "Refreshing buttermilk blended with chopped coriander, green chiles, ginger, and cumin powder.", 79, 4.6, "https://images.unsplash.com/photo-1541658016709-82535e94bc69?q=80&w=600"],
  ["Green Apple Ginger Cooler", "Crisp green apple syrup, fresh ginger juice, lime juice, club soda, served over ice.", 109, 4.5, "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600"],
  ["Rose Milkshake with Almonds", "Chilled milk blended with sweet red rose syrup, vanilla ice cream, and slivered almonds.", 129, 4.7, "https://images.unsplash.com/photo-1541658016709-82535e94bc69?q=80&w=600"],
  ["Traditional Indian Masala Chai", "Hot brewed black tea simmered with milk, fresh ginger, cardamom, cloves, and black pepper.", 69, 4.8, "https://images.unsplash.com/photo-1541658016709-82535e94bc69?q=80&w=600"],
  ["Double Espresso Hot Shot", "Two shots of freshly pulled espresso featuring rich golden crema, served steaming hot.", 89, 4.7, "https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=600"],
  ["Chilled Peach Iced Tea", "Brewed black tea infused with sweet peach syrup, fresh lemon wedges, served over ice.", 99, 4.6, "https://images.unsplash.com/photo-1497534446932-c925b458314e?q=80&w=600"],
  ["Pineapple Coconut Virgin Colada", "Tropical mocktail blending fresh pineapple juice, sweet coconut cream, crushed ice blocks.", 129, 4.7, "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600"],
  ["Raspberry Iced Lemonade", "Zesty fresh lemonade infused with sweet raspberry syrup and fresh whole raspberries.", 109, 4.5, "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600"],
  ["Rich Chocolate Hazelnut Shake", "Creamy milkshake with Nutella spread, cocoa powder, vanilla ice cream, and chopped hazelnuts.", 149, 4.8, "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=600"],
  ["Spiced Mango Mint Cooler", "Sweet mango pulp blended with fresh mint leaves, lime juice, cumin powder, and soda water.", 119, 4.6, "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=600"],
  ["Sparkling Hibiscus Herbal Tea", "Chilled herbal tea brewed from dried hibiscus flowers, sweetened with raw honey over ice.", 99, 4.5, "https://images.unsplash.com/photo-1497534446932-c925b458314e?q=80&w=600"],
  ["Refreshing Cucumber Mint Spritzer", "Slices of fresh cucumber, mint leaves, lime juice, carbonated club soda, ice-crushed.", 99, 4.4, "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600"],
  ["Healthy Green Spinach Smoothie", "Nutritious shake with baby spinach leaves, green apple, cucumber, lemon juice, and honey.", 139, 4.5, "https://images.unsplash.com/photo-1553530666-ba11a7da3888?q=80&w=600"],
  ["Ginger Honey Lemon Hot Tea", "Hot steeped black tea with fresh crushed ginger root, raw organic honey, and fresh lemon.", 79, 4.6, "https://images.unsplash.com/photo-1497534446932-c925b458314e?q=80&w=600"]
];

const extraDesserts = [
  ["Warm Apple Pie with Ice Cream", "Freshly baked spiced apple pie featuring flaky pastry crust, with a scoop of vanilla ice cream.", 149, 4.7, "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=600"],
  ["Double Chocolate Donut Glazed", "Fluffy yeast-raised donut dipped in rich Belgian chocolate glaze, with chocolate sprinkles.", 89, 4.6, "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=600"],
  ["Rich Caramel Custard Cup", "Velvety smooth baked egg custard dessert layered with sweet liquid caramel syrup sauce.", 99, 4.7, "https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=600"],
  ["Traditional Saffron Kulfi", "Traditional dense and creamy Indian ice cream flavored with saffron, cardamom, and pistachios.", 89, 4.8, "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600"],
  ["Warm Cinnamon Rolls Glazed", "Soft roll baked with ground cinnamon sugar, covered in warm cream cheese glaze frosting.", 119, 4.7, "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=600"],
  ["Vanilla Bean Creme Brulee", "Rich vanilla bean custard base topped with a contrasting layer of hardened caramelized sugar.", 159, 4.8, "https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=600"],
  ["Rich Double Chocolate Sundae", "Scoops of double chocolate ice cream topped with hot chocolate fudge, nuts, and whipped cream.", 139, 4.8, "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?q=80&w=600"],
  ["Mango Cardamom Cream Mousse", "Light airy mousse prepared with fresh Alphonso mango pulp, whipped cream, cardamoms.", 119, 4.7, "https://images.unsplash.com/photo-1546173159-315724a31696?q=80&w=600"],
  ["Tangy Raspberry Sorbet Scoop", "Refreshing dairy-free frozen fruit sorbet scoop made with fresh sweet-sour raspberries.", 99, 4.6, "https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=600"],
  ["Espresso Chocolate Mousse Cup", "Fluffy whipped dessert combining dark Belgian chocolate and freshly brewed espresso coffee.", 129, 4.8, "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=600"],
  ["Warm Waffle with Nutella Drizzle", "Freshly baked hot waffle dusted with icing sugar, loaded with rich hazelnut Nutella spread.", 139, 4.7, "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=600"],
  ["Assorted Premium Macarons Box", "Six colorful French almond flour cookie shells sandwiched with rich chocolate ganaches.", 199, 4.8, "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=600"],
  ["Sweet Rose Syrup Baklava", "Crispy layers of filo pastry stuffed with chopped pistachios, sweetened with rose sugar syrup.", 159, 4.8, "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600"],
  ["Rich Chocolate Fudge Brownie", "Fudgy, dense baked chocolate cake slab packed with dark chocolate chips, served warm.", 119, 4.7, "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?q=80&w=600"],
  ["Chilled Pistachio Rasmalai Cup", "Soft cottage cheese patties soaked in pistachio saffron milk, served chilled in a cup.", 110, 4.8, "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600"],
  ["Tangy Lemon Tart Pastry Slice", "Crisp buttery pastry shell filled with tangy cooked lemon curd, dusted with sugar glaze.", 129, 4.6, "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?q=80&w=600"],
  ["Decadent Red Velvet Pastry", "Layered sponge cake colored red-brown, filled with cream cheese frosting icing, chocolate chips.", 139, 4.7, "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=600"],
  ["Chilled Blueberry Panna Cotta", "Creamy cooked gelatin pudding layered with sweet-tart blueberry puree, served chilled.", 119, 4.7, "https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=600"],
  ["Creamy Vanilla Bread Pudding", "Baked dessert with bread cubes soaked in vanilla egg custard, served warm with caramel.", 129, 4.6, "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=600"],
  ["Sweet Coconut Rabri Bowl", "Traditional sweet condensed milk dish slow-cooked with fresh grated coconut shreds.", 109, 4.7, "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600"],
  ["Traditional Hot Moong Dal Halwa", "Traditional warm sweet pudding made of yellow lentils slow-roasted in ghee with dry fruits.", 149, 4.8, "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600"],
  ["Assorted Kaju Katli Sweet Box", "Ten traditional diamond-shaped cashew fudge sweets garnished with edible silver foil.", 179, 4.8, "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600"],
  ["Moist Carrot Cake Pastry Slice", "Moist spiced cake layered with shredded sweet carrots, walnuts, and creamy frosting glaze.", 139, 4.7, "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?q=80&w=600"],
  ["Gourmet Italian Panna Cotta Slice", "Baked gelatin custard slice topped with raspberry glaze sauce, fresh mint leaves decoration.", 129, 4.7, "https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=600"],
  ["Crunchy Chocolate Chip Cookie Box", "Six fresh-baked thick cookies loaded with dark and milk Belgian chocolate chips, served warm.", 99, 4.6, "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=600"],
  ["Banana Split Ice Cream Sundae", "Three scoops of ice cream over a split banana, topped with chocolate sauce, whipped cream.", 159, 4.8, "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?q=80&w=600"],
  ["Rich Dark Chocolate Truffle Paste", "Rich and decadent dark chocolate ganache truffles coated in dark Dutch cocoa powder.", 149, 4.8, "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=600"],
  ["Creamy Mango Rabri Bowl", "Chilled slow-reduced milk rabri folded with sweet mango pulp, garnished with nuts.", 120, 4.7, "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600"],
  ["Sweet Malpua with Rabri Combo", "Two fried pancakes soaked in sweet sugar syrup, served warm with cold condensed milk rabri.", 159, 4.8, "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600"],
  ["Chilled Fruit Custard Salad", "Chilled vanilla egg custard mixed with fresh apples, grapes, bananas, and pomegranates.", 119, 4.6, "https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=600"]
];

const totalProducts = [...baseProducts];

// Let's populate the remaining 30 items per category to reach exactly 200 items (40 per category)
const categories = ["Pizza", "Burger", "Food", "Drinks", "Desserts"];

// Map categories to their corresponding extra lists
const extraMap = {
  "Pizza": extraPizzas,
  "Burger": extraBurgers,
  "Food": extraFoods,
  "Drinks": extraDrinks,
  "Desserts": extraDesserts
};

// Generate IDs from prod-51 to prod-200
let prodCounter = 51;
categories.forEach(cat => {
  const extraList = extraMap[cat];
  extraList.forEach(item => {
    totalProducts.push({
      id: `prod-${prodCounter++}`,
      name: item[0],
      description: item[1],
      price: item[2],
      category: cat,
      rating: item[3],
      image: item[4]
    });
  });
});

const DEFAULT_PRODUCTS = totalProducts;

class ProductModel {
  constructor() {
    this.filePath = path.join(DATA_DIR, 'products.json');
    
    // Always seed 200 products if file doesn't exist OR if length is less than 200 (for full seeder re-run)
    let shouldSeed = false;
    if (!fs.existsSync(this.filePath)) {
      shouldSeed = true;
    } else {
      const data = this.read();
      if (data.length < 200) {
        shouldSeed = true;
      }
    }

    if (shouldSeed) {
      this.write(DEFAULT_PRODUCTS);
    }
  }

  read() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading products data:', error);
      return DEFAULT_PRODUCTS;
    }
  }

  write(data) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error('Error writing products data:', error);
      return false;
    }
  }

  async find(query = {}) {
    if (getMongoConnectionStatus()) {
      try {
        const results = await MongoProduct.find(query);
        if (results.length > 0) return results.map(r => r.toObject());
      } catch (err) {
        console.error('MongoProduct find error, falling back to JSON:', err);
      }
    }
    const products = this.read();
    return products.filter(prod => {
      for (const key in query) {
        if (prod[key] !== query[key]) return false;
      }
      return true;
    }).map(p => ({ ...p }));
  }

  async findById(id) {
    if (getMongoConnectionStatus()) {
      try {
        const found = await MongoProduct.findOne({ id });
        if (found) return found.toObject();
      } catch (err) {
        console.error('MongoProduct findById error, falling back to JSON:', err);
      }
    }
    const products = this.read();
    const found = products.find(p => p.id === id);
    return found ? { ...found } : null;
  }

  async create(productData) {
    const newProduct = {
      id: 'prod-' + Date.now().toString(),
      rating: parseFloat(productData.rating) || 5.0,
      ...productData,
      price: Number(productData.price)
    };

    if (getMongoConnectionStatus()) {
      try {
        await MongoProduct.create(newProduct);
      } catch (err) {
        console.error('MongoProduct create error:', err);
      }
    }

    const products = this.read();
    products.push(newProduct);
    this.write(products);
    return { ...newProduct };
  }

  async findByIdAndUpdate(id, updateData) {
    if (getMongoConnectionStatus()) {
      try {
        const updated = await MongoProduct.findOneAndUpdate({ id }, updateData, { new: true });
        // update local JSON fallback
        const products = this.read();
        const idx = products.findIndex(p => p.id === id);
        if (idx > -1) {
          products[idx] = {
            ...products[idx],
            ...updateData,
            price: updateData.price !== undefined ? Number(updateData.price) : products[idx].price,
            rating: updateData.rating !== undefined ? parseFloat(updateData.rating) : products[idx].rating
          };
          this.write(products);
        }
        if (updated) return updated.toObject();
      } catch (err) {
        console.error('MongoProduct findByIdAndUpdate error, falling back to JSON:', err);
      }
    }

    const products = this.read();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    const updated = { 
      ...products[index], 
      ...updateData,
      price: updateData.price !== undefined ? Number(updateData.price) : products[index].price,
      rating: updateData.rating !== undefined ? parseFloat(updateData.rating) : products[index].rating
    };
    
    products[index] = updated;
    this.write(products);
    return { ...updated };
  }

  async findByIdAndDelete(id) {
    if (getMongoConnectionStatus()) {
      try {
        await MongoProduct.deleteOne({ id });
      } catch (err) {
        console.error('MongoProduct delete error:', err);
      }
    }
    const products = this.read();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return false;
    products.splice(index, 1);
    this.write(products);
    return true;
  }
}

export default new ProductModel();
export { DEFAULT_PRODUCTS };
