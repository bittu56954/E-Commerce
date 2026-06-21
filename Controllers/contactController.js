import ContactModel from '../Models/Contact.js';

export const createMessage = async (req, res) => {
  try {
    const { name, email, phone, currentLocation, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Please provide name, email, and your message.' });
    }

    const contactData = {
      name,
      email,
      phone: phone || '',
      currentLocation: currentLocation || '',
      message
    };

    const newContact = await ContactModel.create(contactData);

    res.status(201).json({
      message: 'Support message sent successfully! We will get back to you soon.',
      contact: newContact
    });
  } catch (error) {
    console.error('Create contact error:', error);
    res.status(500).json({ error: 'Error sending support message.' });
  }
};

export const getAllMessages = async (req, res) => {
  try {
    const messages = await ContactModel.find({});
    res.status(200).json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Could not fetch support messages.' });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await ContactModel.findByIdAndDelete(id);
    if (!success) {
      return res.status(404).json({ error: 'Message not found.' });
    }
    res.status(200).json({ message: 'Message deleted successfully.' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Failed to delete message.' });
  }
};
