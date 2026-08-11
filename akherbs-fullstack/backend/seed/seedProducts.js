/* Seeds the database with the original AK Herbs demo catalogue.
   Run with: npm run seed  (make sure MONGO_URI is set in .env) */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');

const products = [
  { name: 'Premium Almonds', cat: 'Nuts & Dry Fruits', price: 449, unit: '250g', icon: 'nut', desc: 'Sun-dried, hand-sorted almonds sourced from trusted growers.' },
  { name: 'Kashmiri Walnuts', cat: 'Nuts & Dry Fruits', price: 599, unit: '250g', icon: 'nut', desc: 'Rich, buttery walnut halves — a wholesome daily snack.' },
  { name: 'Cashew Nuts W240', cat: 'Nuts & Dry Fruits', price: 529, unit: '250g', icon: 'nut', desc: 'Whole, creamy cashews roasted lightly for natural sweetness.' },
  { name: 'Dried Black Dates', cat: 'Nuts & Dry Fruits', price: 249, unit: '250g', icon: 'nut', desc: 'Naturally sweet dates, a gentle everyday energy booster.' },
  { name: 'Nilavembu Kudineer', cat: 'Herbal Products', price: 180, unit: '200g pack', icon: 'leaf', desc: 'Traditional Siddha decoction mix to support seasonal immunity.' },
  { name: 'Herbal Wellness Syrup', cat: 'Herbal Products', price: 320, unit: '200ml', icon: 'bottle', desc: 'A time-tested herbal tonic passed down over three decades.' },
  { name: 'Ashwagandha Capsules', cat: 'Herbal Products', price: 399, unit: '60 caps', icon: 'leaf', desc: 'Adaptogenic root extract to support calm and steady energy.' },
  { name: 'Triphala Churna', cat: 'Herbal Products', price: 150, unit: '150g', icon: 'leaf', desc: 'Classic three-fruit blend for gentle daily digestive care.' },
  { name: 'Neem & Turmeric Soap', cat: 'Herbal Soap', price: 99, unit: '100g bar', icon: 'soap', desc: 'A purifying bar made with cold-pressed neem and turmeric.' },
  { name: 'Sandalwood Herbal Soap', cat: 'Herbal Soap', price: 119, unit: '100g bar', icon: 'soap', desc: 'Soothing sandalwood blend, gentle and naturally fragrant.' },
  { name: 'Aloe & Rose Soap', cat: 'Herbal Soap', price: 109, unit: '100g bar', icon: 'soap', desc: 'Hydrating aloe vera with rose extracts for soft skin.' },
  { name: 'Siddha Care Balm', cat: 'Herbal Products', price: 175, unit: '50g jar', icon: 'leaf', desc: 'Warming herbal balm rooted in traditional Siddha practice.' },
];

(async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/akherbs';
    await mongoose.connect(uri);
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log(`Seeded ${products.length} products.`);
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
})();
