const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Product = require('../models/Product');
const Artisan = require('../models/Artisan');
const Category = require('../models/Category');

dotenv.config();

const categories = [
  { name: 'Jewelry', slug: 'jewelry', description: 'Traditional tribal ornaments' },
  { name: 'Textiles', slug: 'textiles', description: 'Hand-woven tribal fabrics' },
  { name: 'Pottery', slug: 'pottery', description: 'Handcrafted clay items' },
  { name: 'Paintings', slug: 'paintings', description: 'Authentic tribal art' },
  { name: 'Handicrafts', slug: 'handicrafts', description: 'Handcrafted tribal decor and utility items' },
  { name: 'Metal Crafts', slug: 'metal-crafts', description: 'Bastar, Dhokra and wrought iron crafts' },
  { name: 'Bamboo & Cane', slug: 'bamboo-cane', description: 'Eco-friendly bamboo and cane products' },
  { name: 'Home Decor', slug: 'home-decor', description: 'Decor inspired by indigenous motifs' }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tribalmarketplace');
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({ role: { $ne: 'admin' } }); // Keep admin users if any
    await Product.deleteMany({});
    await Artisan.deleteMany({});
    await Category.deleteMany({});

    // 1. Seed Categories
    const createdCategories = await Category.insertMany(categories);
    console.log('Categories seeded');

    // 2. Ensure primary admin user exists (and has known password)
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@tribalmarketplace.com';
    let adminUser = await User.findOne({ email: adminEmail });

    if (!adminUser) {
      adminUser = new User({
        name: 'Tribal Admin',
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD || 'admin123',
        role: 'admin',
        phone: '9999999999',
        isActive: true
      });
      console.log(`Admin user created (${adminEmail})`);
    } else {
      // Ensure role and password are correct
      adminUser.role = 'admin';
      adminUser.isActive = true;
      adminUser.password = process.env.ADMIN_PASSWORD || 'admin123';
      console.log(`Admin user updated (${adminEmail})`);
    }

    await adminUser.save();

    // 3. Create seller users
    const demoSeller = new User({
      name: 'Somu Gond',
      email: 'artisan@demo.com',
      password: 'password123',
      role: 'seller',
      phone: '9876543210',
      sellerInfo: {
        businessName: 'Gond Art Studio',
        tribe: 'Gond',
        region: 'Madhya Pradesh',
        verified: true
      }
    });
    await demoSeller.save();

    const bastarSeller = new User({
      name: 'Ramji Marawi',
      email: 'bastar@demo.com',
      password: 'password123',
      role: 'seller',
      phone: '9876543211',
      sellerInfo: {
        businessName: 'Bastar Iron Crafts',
        tribe: 'Maria',
        region: 'Chhattisgarh',
        verified: true
      }
    });
    await bastarSeller.save();

    const warliSeller = new User({
      name: 'Sunita Mashe',
      email: 'warli@demo.com',
      password: 'password123',
      role: 'seller',
      phone: '9876543212',
      sellerInfo: {
        businessName: 'Warli Art Studio',
        tribe: 'Warli',
        region: 'Maharashtra',
        verified: true
      }
    });
    await warliSeller.save();

    const gondPeacockSeller = new User({
      name: 'Venkat Shyam',
      email: 'gondpeacock@demo.com',
      password: 'password123',
      role: 'seller',
      phone: '9876543213',
      sellerInfo: {
        businessName: 'Peacock Gond Arts',
        tribe: 'Gond',
        region: 'Madhya Pradesh',
        verified: true
      }
    });
    await gondPeacockSeller.save();

    const bambooSeller = new User({
      name: 'Lakshmi Korsa',
      email: 'bamboo@demo.com',
      password: 'password123',
      role: 'seller',
      phone: '9876543214',
      sellerInfo: {
        businessName: 'Muria Bamboo Collective',
        tribe: 'Muria',
        region: 'Chhattisgarh',
        verified: true
      }
    });
    await bambooSeller.save();

    const jewelrySeller = new User({
      name: 'Malti Bharewa',
      email: 'jewelry@demo.com',
      password: 'password123',
      role: 'seller',
      phone: '9876543215',
      sellerInfo: {
        businessName: 'Bharewa Dhokra Jewels',
        tribe: 'Gond (Bharewa)',
        region: 'Madhya Pradesh',
        verified: true
      }
    });
    await jewelrySeller.save();

    const terracottaSeller = new User({
      name: 'Biswanath Kumbhakar',
      email: 'terracotta@demo.com',
      password: 'password123',
      role: 'seller',
      phone: '9876543216',
      sellerInfo: {
        businessName: 'Bankura Terracotta Studio',
        tribe: 'Panchmura Craftsmen',
        region: 'West Bengal',
        verified: true
      }
    });
    await terracottaSeller.save();

    const demoBuyer = new User({
      name: 'Demo Buyer',
      email: 'buyer@example.com',
      password: 'buyer123',
      role: 'buyer',
      phone: '9876543201'
    });
    await demoBuyer.save();

    console.log('Admin, seller and buyer users created');

    // 4. Create core artisan profiles
    const artisanProfile = new Artisan({
      name: 'Somu Gond',
      tribe: 'Gond',
      region: 'Madhya Pradesh',
      bio: 'Somu is a master of Gond art, specializing in intricate patterns that tell stories of nature and mythology.',
      user: demoSeller._id,
      profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop'
    });
    await artisanProfile.save();
    console.log('Primary artisan profile created');

    const bastarArtisan = new Artisan({
      name: 'Ramji Marawi',
      tribe: 'Maria',
      region: 'Chhattisgarh',
      bio: 'Specialist in Bastar wrought iron craft, depicting folk dances and daily life scenes.',
      user: bastarSeller._id
    });
    await bastarArtisan.save();

    const warliArtisan = new Artisan({
      name: 'Sunita Mashe',
      tribe: 'Warli',
      region: 'Maharashtra',
      bio: 'Warli artist focusing on harvest festivals and Tarpa dance scenes.',
      user: warliSeller._id
    });
    await warliArtisan.save();

    const gondPeacockArtisan = new Artisan({
      name: 'Venkat Shyam',
      tribe: 'Gond',
      region: 'Madhya Pradesh',
      bio: 'Known for vibrant Gond peacock and nature-inspired compositions.',
      user: gondPeacockSeller._id
    });
    await gondPeacockArtisan.save();

    const bambooArtisan = new Artisan({
      name: 'Lakshmi Korsa',
      tribe: 'Muria',
      region: 'Chhattisgarh',
      bio: 'Craftswoman creating functional bamboo storage and home accessories.',
      user: bambooSeller._id
    });
    await bambooArtisan.save();

    const jewelryArtisan = new Artisan({
      name: 'Malti Bharewa',
      tribe: 'Gond (Bharewa)',
      region: 'Madhya Pradesh',
      bio: 'Dhokra jewelry artisan blending traditional motifs with contemporary styling.',
      user: jewelrySeller._id
    });
    await jewelryArtisan.save();

    const terracottaArtisan = new Artisan({
      name: 'Biswanath Kumbhakar',
      tribe: 'Panchmura Craftsmen',
      region: 'West Bengal',
      bio: 'Terracotta artisan from Bankura, famous for sculpting ceremonial horses.',
      user: terracottaSeller._id
    });
    await terracottaArtisan.save();

    console.log('Additional artisan profiles created');

    // 5. Seed Products
    const products = [
      {
        name: 'Gond Tree of Life Painting',
        description: 'Traditional Gond painting on handmade paper using natural pigments, depicting the Tree of Life with birds and animals.',
        price: 2500,
        discount: 10,
        category: 'Paintings',
        seller: demoSeller._id,
        artisanId: artisanProfile._id,
        artisan: {
          name: 'Somu Gond',
          tribe: 'Gond',
          region: 'Madhya Pradesh'
        },
        images: ['https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800'],
        stock: 5
      },
      {
        name: 'Dhokra Brass Elephant',
        description: 'Antique finish Dhokra metal craft elephant, made using ancient lost-wax casting technique with intricate geometric patterns symbolizing strength and wisdom.',
        price: 1800,
        discount: 15,
        category: 'Handicrafts',
        seller: demoSeller._id,
        artisanId: artisanProfile._id,
        artisan: {
          name: 'Somu Gond',
          tribe: 'Gond',
          region: 'Madhya Pradesh'
        },
        images: ['https://images.unsplash.com/photo-1566378246598-5b11a0d486cc?w=800'],
        stock: 12
      },
      {
        name: 'Bastar Wrought Iron Tribal Couple',
        description: 'Handcrafted wrought iron sculpture depicting a traditional tribal couple performing the Bastar dance, made using the Lohe Shilp hammering technique.',
        price: 2400,
        discount: 10,
        category: 'Metal Crafts',
        seller: bastarSeller._id,
        artisanId: bastarArtisan._id,
        artisan: {
          name: 'Ramji Marawi',
          tribe: 'Maria',
          region: 'Chhattisgarh'
        },
        images: ['https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800'],
        stock: 8
      },
      {
        name: 'Warli Painting - Harvest Festival',
        description: 'Traditional Warli painting on canvas depicting the Tarpa dance during harvest festival, painted using rice paste and natural gum.',
        price: 3200,
        discount: 20,
        category: 'Paintings',
        seller: warliSeller._id,
        artisanId: warliArtisan._id,
        artisan: {
          name: 'Sunita Mashe',
          tribe: 'Warli',
          region: 'Maharashtra'
        },
        images: ['https://images.unsplash.com/photo-1578926288207-a90a5366759d?w=800'],
        stock: 5
      },
      {
        name: 'Gond Art Peacock Wall Hanging',
        description: 'Vibrant Gond painting on wood featuring a majestic peacock with intricate dot and line patterns using natural colors.',
        price: 4500,
        discount: 12,
        category: 'Paintings',
        seller: gondPeacockSeller._id,
        artisanId: gondPeacockArtisan._id,
        artisan: {
          name: 'Venkat Shyam',
          tribe: 'Gond',
          region: 'Madhya Pradesh'
        },
        images: ['https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?w=800'],
        stock: 3
      },
      {
        name: 'Bamboo Storage Basket Set',
        description: 'Set of three eco-friendly storage baskets handwoven from locally sourced bamboo with traditional geometric weaving patterns.',
        price: 850,
        discount: 5,
        category: 'Bamboo & Cane',
        seller: bambooSeller._id,
        artisanId: bambooArtisan._id,
        artisan: {
          name: 'Lakshmi Korsa',
          tribe: 'Muria',
          region: 'Chhattisgarh'
        },
        images: ['https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?w=800'],
        stock: 25
      },
      {
        name: 'Dhokra Brass Tribal Necklace',
        description: 'Statement necklace featuring Dhokra brass pendants with sun and moon motifs combined with colorful glass beads.',
        price: 1200,
        discount: 18,
        category: 'Jewelry',
        seller: jewelrySeller._id,
        artisanId: jewelryArtisan._id,
        artisan: {
          name: 'Malti Bharewa',
          tribe: 'Gond (Bharewa)',
          region: 'Madhya Pradesh'
        },
        images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800'],
        stock: 15
      },
      {
        name: 'Terracotta Horse from Bankura',
        description: 'Traditional Bankura terracotta horse, symbol of fertility and prosperity, hand-moulded from local clay and fired in open kilns.',
        price: 2800,
        discount: 8,
        category: 'Pottery',
        seller: terracottaSeller._id,
        artisanId: terracottaArtisan._id,
        artisan: {
          name: 'Biswanath Kumbhakar',
          tribe: 'Panchmura Craftsmen',
          region: 'West Bengal'
        },
        images: ['https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800'],
        stock: 7
      },
      {
        name: 'Toda Embroidered Wool Shawl',
        description: 'Hand-embroidered shawl from the Toda community of the Nilgiri hills, featuring bold red and black geometric motifs on off-white wool.',
        price: 3200,
        discount: 10,
        category: 'Textiles',
        seller: demoSeller._id,
        artisanId: artisanProfile._id,
        artisan: {
          name: 'Somu Gond',
          tribe: 'Gond',
          region: 'Madhya Pradesh'
        },
        images: ['https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800'],
        stock: 8
      },
      {
        name: 'Naga Beaded Statement Necklace',
        description: 'Layered Naga necklace crafted with bold beads and brass elements, inspired by ceremonial ornaments worn during tribal festivals.',
        price: 2100,
        discount: 12,
        category: 'Jewelry',
        seller: jewelrySeller._id,
        artisanId: jewelryArtisan._id,
        artisan: {
          name: 'Malti Bharewa',
          tribe: 'Gond (Bharewa)',
          region: 'Madhya Pradesh'
        },
        images: ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800'],
        stock: 18
      },
      {
        name: 'Dhokra Bell Wind Chime',
        description: 'Set of handcrafted Dhokra brass bells strung on natural fiber rope, producing a warm, earthy chime for doorways and balconies.',
        price: 1450,
        discount: 7,
        category: 'Handicrafts',
        seller: demoSeller._id,
        artisanId: artisanProfile._id,
        artisan: {
          name: 'Somu Gond',
          tribe: 'Gond',
          region: 'Madhya Pradesh'
        },
        images: ['https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=800'],
        stock: 22
      },
      {
        name: 'Pattachitra Story Scroll',
        description: 'Traditional Pattachitra scroll painting on cloth, depicting mythological stories with intricate borders and natural dyes from Odisha.',
        price: 3900,
        discount: 18,
        category: 'Paintings',
        seller: warliSeller._id,
        artisanId: warliArtisan._id,
        artisan: {
          name: 'Sunita Mashe',
          tribe: 'Warli',
          region: 'Maharashtra'
        },
        images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'],
        stock: 5
      }
    ];

    await Product.insertMany(products);
    console.log('Products seeded');

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
