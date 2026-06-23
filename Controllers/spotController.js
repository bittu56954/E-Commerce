import SpotModel from '../Models/Spot.js';

export const getSpots = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = type ? { type } : {};
    const spots = await SpotModel.find(filter);
    res.status(200).json({ spots });
  } catch (error) {
    console.error('Get spots error:', error);
    res.status(500).json({ error: 'Failed to retrieve spots list.' });
  }
};

export const createSpot = async (req, res) => {
  try {
    const { type, name, cuisine, location, rating, image, price } = req.body;
    if (!type || !name || !cuisine || !location || !image || !price) {
      return res.status(400).json({ error: 'All fields (type, name, cuisine, location, image, price) are required.' });
    }
    const newSpot = await SpotModel.create({ type, name, cuisine, location, rating, image, price });
    res.status(201).json({ message: 'Spot created successfully!', spot: newSpot });
  } catch (error) {
    console.error('Create spot error:', error);
    res.status(500).json({ error: 'Failed to create spot.' });
  }
};

export const updateSpot = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, name, cuisine, location, rating, image, price } = req.body;
    const updated = await SpotModel.findByIdAndUpdate(id, { type, name, cuisine, location, rating, image, price });
    if (!updated) {
      return res.status(404).json({ error: 'Spot not found.' });
    }
    res.status(200).json({ message: 'Spot updated successfully!', spot: updated });
  } catch (error) {
    console.error('Update spot error:', error);
    res.status(500).json({ error: 'Failed to update spot.' });
  }
};

export const deleteSpot = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await SpotModel.findByIdAndDelete(id);
    if (!success) {
      return res.status(404).json({ error: 'Spot not found.' });
    }
    res.status(200).json({ message: 'Spot deleted successfully!' });
  } catch (error) {
    console.error('Delete spot error:', error);
    res.status(500).json({ error: 'Failed to delete spot.' });
  }
};
