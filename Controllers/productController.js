import ProductModel from '../Models/Product.js';

export const getProducts = async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};
    if (category && category !== 'All') {
      query.category = category;
    }
    const products = await ProductModel.find(query);
    res.status(200).json({ products });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to retrieve products menu.' });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, rating } = req.body;
    if (!name || !price || !category || !image) {
      return res.status(400).json({ error: 'Please provide product name, price, category, and image URL.' });
    }
    const newProduct = await ProductModel.create({
      name,
      description: description || '',
      price: Number(price),
      category,
      image,
      rating: rating ? parseFloat(rating) : 5.0
    });
    res.status(201).json({ message: 'Product created successfully!', product: newProduct });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product.' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, image, rating } = req.body;
    const updated = await ProductModel.findByIdAndUpdate(id, {
      name,
      description,
      price,
      category,
      image,
      rating
    });
    if (!updated) {
      return res.status(404).json({ error: 'Product not found in catalog.' });
    }
    res.status(200).json({ message: 'Product updated successfully!', product: updated });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product.' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await ProductModel.findByIdAndDelete(id);
    if (!success) {
      return res.status(404).json({ error: 'Product not found in catalog.' });
    }
    res.status(200).json({ message: 'Product deleted successfully!' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product.' });
  }
};
