require('dotenv').config();
const mongoose = require('mongoose');
const Tenant = require('../models/Tenant');
const User = require('../models/User');


mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const tenants = [
  {
    name: 'Acme',
    slug: 'acme',
    subscription: 'free'
  },
  {
    name: 'Globex',
    slug: 'globex',
    subscription: 'free'
  }
];

const users = [
  {
    email: 'admin@acme.test',
    password: 'password',
    role: 'admin',
    tenantSlug: 'acme'
  },
  {
    email: 'user@acme.test',
    password: 'password',
    role: 'member',
    tenantSlug: 'acme'
  },
  {
    email: 'admin@globex.test',
    password: 'password',
    role: 'admin',
    tenantSlug: 'globex'
  },
  {
    email: 'user@globex.test',
    password: 'password',
    role: 'member',
    tenantSlug: 'globex'
  }
];

async function seedDatabase() {
  try {
    
    await Tenant.deleteMany({});
    await User.deleteMany({});
    
    console.log('Cleared existing data');
    
    
    const createdTenants = await Tenant.insertMany(tenants);
    console.log('Tenants created:', createdTenants.map(t => t.name));
    
    
    const tenantMap = {};
    createdTenants.forEach(tenant => {
      tenantMap[tenant.slug] = tenant._id;
    });
    
  
    const userPromises = users.map(async (userData) => {
      const user = new User({
        email: userData.email,
        password: userData.password,
        role: userData.role,
        tenantId: tenantMap[userData.tenantSlug]
      });
      
      return user.save();
    });
    
    const createdUsers = await Promise.all(userPromises);
    console.log('Users created:', createdUsers.map(u => u.email));
    
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}


seedDatabase();