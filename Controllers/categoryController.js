import CategoryModel from '../Models/Category.js';

export const getCategories = async (req, res) => {
  try {
    const categories = await CategoryModel.find({});
    res.status(200).json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to retrieve categories list.' });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, icon } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category name is required.' });
    }
    const newCategory = await CategoryModel.create({ name, icon });
    res.status(201).json({ message: 'Category created successfully!', category: newCategory });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Failed to create category.' });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon } = req.body;
    const updated = await CategoryModel.findByIdAndUpdate(id, { name, icon });
    if (!updated) {
      return res.status(404).json({ error: 'Category not found.' });
    }
    res.status(200).json({ message: 'Category updated successfully!', category: updated });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Failed to update category.' });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await CategoryModel.findByIdAndDelete(id);
    if (!success) {
      return res.status(404).json({ error: 'Category not found.' });
    }
    res.status(200).json({ message: 'Category deleted successfully!' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Failed to delete category.' });
  }
};
