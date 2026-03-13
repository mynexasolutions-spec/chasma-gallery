import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // sends httpOnly cookie automatically
  headers: { 'Content-Type': 'application/json' },
});

// Luxury Jewellery Data Mapper (Frontend-only transformation)
const jewelleryNames = [
  "Diamond Eternity Ring", "18K Gold Choker", "Pearl Drop Earrings",
  "Sapphire Pendant", "Rose Gold Bracelet", "Emerald Studs",
  "Platinum Band", "Crystal Statement", "Silver Anklet",
  "Luxury Timepiece", "Vintage Brooch", "Solitaire Diamond",
  "Gold Hoops", "Bead Strand", "Tennis Bracelet",
  "Blue Topaz Ring", "Ruby Necklace", "Garnet Earrings",
  "Opal Bracelet", "Jade Pendant"
];

const categoryMapper = {
  "Shoes": "Rings",
  "Electronics": "Necklaces",
  "Clothing": "Earrings",
  "Cloths": "Earrings",
  "Furniture": "Bracelets",
  "Laptops": "Watches",
  "Home": "Gifts",
  "Mobile": "Jewels"
};

const transformData = (data) => {
  if (!data) return data;

  // Transform product objects
  if (data.id && (data.name || data.category_name)) {
    const nameIndex = parseInt(data.id) % jewelleryNames.length;
    data.name = jewelleryNames[nameIndex];

    // Add jewellery descriptions if generic ones are detected
    const genericTerms = ['shoe', 'speaker', 'laptop', 'shirt', 'clothing', 'furniture', 'electronic'];
    const desc = (data.description || '').toLowerCase();
    const shortDesc = (data.short_description || '').toLowerCase();
    const isGeneric = genericTerms.some(term => desc.includes(term) || shortDesc.includes(term));

    if (isGeneric || !data.description) {
      data.description = "A masterpiece of artisanal craftsmanship, this exquisite piece combines timeless elegance with contemporary design. Handcrafted using the finest materials, it is designed to reflect your unique journey and celebrate life's most precious moments.";
      data.short_description = "Exquisite handcrafted jewellery piece featuring premium materials and timeless design.";
    }

    if (data.category_name && categoryMapper[data.category_name]) {
      data.category_name = categoryMapper[data.category_name];
    }
  }

  // Transform category objects
  if (data.id && data.name && !data.price) { // likely a category
    if (categoryMapper[data.name]) {
      data.name = categoryMapper[data.name];
    }
  }

  // Recurse for arrays or objects
  if (Array.isArray(data)) {
    data.forEach(item => transformData(item));
  } else if (typeof data === 'object') {
    Object.values(data).forEach(val => {
      if (Array.isArray(val) || (val && typeof val === 'object')) {
        transformData(val);
      }
    });
  }
  return data;
};

// Auto redirect on 401 and Transform Data
api.interceptors.response.use(
  (res) => {
    if (res.data && res.data.data) {
      transformData(res.data.data);
    }
    return res;
  },
  (err) => {
    if (err.response?.status === 401 && !err.config.url.includes('/auth/')) {
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
