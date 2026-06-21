import SettingsModel from '../Models/Settings.js';

export const getSettings = async (req, res) => {
  try {
    const settings = await SettingsModel.get();
    res.status(200).json({ settings });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to retrieve configurations.' });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const settings = await SettingsModel.update(req.body);
    res.status(200).json({ message: 'Configurations updated successfully!', settings });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to save configurations.' });
  }
};
