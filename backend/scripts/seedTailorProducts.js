const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Product = require('../models/Product');

dotenv.config();

const SELLER_EMAIL = 'tailoryash676@gmail.com';

const tailorProducts = [
  {
    name: 'Handwoven Tribal Kurta',
    description: 'Cotton kurta with handwoven tribal motifs, tailored for everyday comfort.',
    price: 1599,
    category: 'Textiles',
    images: ['https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=800'],
    stock: 15
  },
  {
    name: 'Embroidered Tribal Jacket',
    description: 'Short jacket with bold tribal embroidery, perfect over casual wear.',
    price: 2499,
    category: 'Textiles',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800'],
    stock: 10
  },
  {
    name: 'Tribal Print Cotton Shirt',
    description: 'Slim-fit cotton shirt featuring all-over tribal block print.',
    price: 1299,
    category: 'Textiles',
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'],
    stock: 20
  },
  {
    name: 'Handloom Dhurrie Tote Bag',
    description: 'Everyday tote bag stitched from handloom dhurrie with tribal patterns.',
    price: 999,
    category: 'Handicrafts',
    images: ['https://images.unsplash.com/photo-1445205170230-053b83016050?w=800'],
    stock: 25
  },
  {
    name: 'Patchwork Tribal Skirt',
    description: 'Midi skirt with patchwork panels inspired by tribal textiles.',
    price: 1899,
    category: 'Textiles',
    images: ['https://images.unsplash.com/photo-1525171254930-643fc658b64e?w=800'],
    stock: 12
  },
  {
    name: 'Hand-stitched Tribal Cushion Cover Set',
    description: 'Set of 4 cushion covers with hand-stitched tribal motifs and mirror work.',
    price: 1450,
    category: 'Home Decor',
    images: ['https://images.unsplash.com/photo-1519710884009-22a6913909f2?w=800'],
    stock: 30
  },
  {
    name: 'Indigo Block Print Stole',
    description: 'Lightweight cotton stole with indigo tribal block printing.',
    price: 799,
    category: 'Textiles',
    images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800'],
    stock: 40
  },
  {
    name: 'Tribal Border Saree Blouse',
    description: 'Ready-made blouse with woven tribal border and back tie-up.',
    price: 1399,
    category: 'Textiles',
    images: ['https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800'],
    stock: 18
  },
  {
    name: 'Appliqué Tribal Wall Hanging',
    description: 'Fabric wall hanging crafted with appliqué tribal figures and patterns.',
    price: 1750,
    category: 'Home Decor',
    images: ['https://images.unsplash.com/photo-1519710889045-2dfe6aab23e3?w=800'],
    stock: 9
  },
  {
    name: 'Handcrafted Tribal Laptop Sleeve',
    description: 'Padded laptop sleeve stitched from tribal handloom fabric.',
    price: 1199,
    category: 'Handicrafts',
    images: ['https://images.unsplash.com/photo-1516387938699-a93567ec168e?w=800'],
    stock: 16
  },
  {
    name: 'Embroidered Tribal Kurti Set',
    description: 'Kurti and pant set with detailed tribal embroidery on yoke and hem.',
    price: 2299,
    category: 'Textiles',
    images: ['https://images.unsplash.com/photo-1541099644538-2effe7edc413?w=800'],
    stock: 14
  },
  {
    name: 'Handloom Tribal Shorts',
    description: 'Casual shorts made from handloom tribal fabric with drawstring waist.',
    price: 899,
    category: 'Textiles',
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'],
    stock: 22
  },
  {
    name: 'Tribal Motif Table Runner',
    description: 'Runner stitched from woven textile featuring repeating tribal motifs.',
    price: 950,
    category: 'Home Decor',
    images: ['https://images.unsplash.com/photo-1523475472560-d2df97ec485c?w=800'],
    stock: 28
  },
  {
    name: 'Quilted Tribal Jacket',
    description: 'Reversible quilted jacket combining plain cotton with tribal prints.',
    price: 2599,
    category: 'Textiles',
    images: ['https://images.unsplash.com/photo-1514996937319-344454492b37?w=800'],
    stock: 11
  },
  {
    name: 'Kids Tribal Print Kurta Set',
    description: 'Comfortable kids kurta-pant set with playful tribal prints.',
    price: 1290,
    category: 'Textiles',
    images: ['https://images.unsplash.com/photo-1550246140-29f40b909e5b?w=800'],
    stock: 20
  },
  {
    name: 'Handcrafted Tribal Belt',
    description: 'Fabric belt with embroidered tribal patterns and wooden buckle.',
    price: 650,
    category: 'Textiles',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800'],
    stock: 35
  },
  {
    name: 'Patchwork Tribal Quilt',
    description: 'Double-bed quilt made from patchwork tribal textiles and soft cotton filling.',
    price: 3499,
    category: 'Home Decor',
    images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'],
    stock: 6
  },
  {
    name: 'Handloom Tribal Scarf Trio',
    description: 'Set of 3 handloom scarves in different tribal patterns and colors.',
    price: 1890,
    category: 'Textiles',
    images: ['https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800'],
    stock: 24
  },
  {
    name: 'Tribal Patch Tote with Tassels',
    description: 'Large tote bag made from tribal patchwork fabric, finished with tassels.',
    price: 1350,
    category: 'Handicrafts',
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'],
    stock: 18
  },
  {
    name: 'Hand-embroidered Tribal Cushion Set',
    description: 'Set of 2 cushions with dense tribal embroidery and contrast piping.',
    price: 1650,
    category: 'Home Decor',
    images: ['https://images.unsplash.com/photo-1519710884009-22a6913909f2?w=800'],
    stock: 15
  }
];

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tribalmarketplace');
    console.log('Connected to MongoDB');

    let seller = await User.findOne({ email: SELLER_EMAIL });
    if (!seller) {
      seller = new User({
        name: 'Tailor Yash',
        email: SELLER_EMAIL,
        password: process.env.TAILOR_SELLER_PASSWORD || 'seller123',
        role: 'seller',
        phone: '9999999998',
        sellerInfo: {
          businessName: 'Tailor Yash Studio',
          tribe: 'Tribal',
          region: 'India',
          verified: true
        }
      });
      await seller.save();
      console.log(`Created seller user for ${SELLER_EMAIL}`);
    } else {
      console.log(`Found existing seller user for ${SELLER_EMAIL}`);
    }

    const docs = tailorProducts.map((p) => ({
      ...p,
      seller: seller._id
    }));

    await Product.insertMany(docs);
    console.log(`Inserted ${docs.length} products for seller ${SELLER_EMAIL}`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding tailor products:', err);
    process.exit(1);
  }
};

run();

