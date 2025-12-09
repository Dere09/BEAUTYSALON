import { getAllServiceOffered } from './getCacheData.js';

const showServicesPage = async (req, res) => {
  // try {
    const savedServices = await getAllServiceOffered();
    console.log('Updated Services:', savedServices);
  //  res.render('services/listofservice', { savedServices });
  res.json({ savedServices });
  // } catch (error) {
  //   console.error('Error updating service:', error);
  //   res.status(400).json({ message: 'Bad Request', error });
  // }
};
showServicesPage();