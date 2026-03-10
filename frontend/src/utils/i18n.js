const translations = {
  en: {
    'Access Denied': 'Access Denied',
    'You need admin privileges to access this page.': 'You need admin privileges to access this page.',
    'Product Management': 'Product Management',
    'Manage all products in the marketplace': 'Manage all products in the marketplace',
    'Add Product': 'Add Product',
    'All Categories': 'All Categories',
    'No products found': 'No products found',
    'Try adjusting your search or filter criteria.': 'Try adjusting your search or filter criteria.',
    'Edit Product': 'Edit Product',
    'Add New Product': 'Add New Product',
    'Product Name': 'Product Name',
    'Category': 'Category',
    'Description': 'Description',
    'Price': 'Price',
    'Stock Quantity': 'Stock Quantity',
    'Tags': 'Tags',
    'Specifications': 'Specifications',
    'Material': 'Material',
    'Dimensions': 'Dimensions',
    'Weight': 'Weight',
    'Origin': 'Origin',
    'Care Instructions': 'Care Instructions',
    'Cancel': 'Cancel',
    'Create Product': 'Create Product',
    'Update Product': 'Update Product'
  }
};

export const t = (key, lang = 'en') => translations[lang]?.[key] || key;