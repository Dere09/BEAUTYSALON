const getNextRegistrationId = require('../../utilities/sgetNextid');
exports.renderServiceForm = (req, res) => {
  res.render('services/createServiceType'); // Render the form
}
exports.enderServiceType = async (req, res) => {
  try {
    //Check if serviceId exists in session, generate new one only if it doesn't
    let serviceId ='';
     if(!req.session.serviceId) {
     serviceId = await getNextRegistrationId(); // however you generate it
     req.session.serviceId = serviceId; // Store it in session
    }
    else {
      serviceId = req.session.serviceId; // Use existing serviceId from session
    }
    res.render('services/createServiceType', { serviceId: serviceId });
   //console.log('Service ID:', serviceId); // Debugging line to check the serviceId
   
  } catch (err) {
    res.render('services/createServiceType', { serviceId: '' });
  }
};
