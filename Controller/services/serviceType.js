const serviceTypemodel = require('../../models/services/serviceType');
const getNextserviceIdId = require('../../utilities/sgetNextid');
exports.addServiceType = async (req, res) => {
    try {
          
        let { serviceId, serviceName, serviceDescription, servicePrice } = req.body;
           serviceId = serviceId || await getNextserviceIdId();  // Generate serviceId if not provided
               // Validate required fields
        if (!serviceId || !serviceName || !serviceDescription || !servicePrice) {
            return res.status(400).render('services/createServiceType', {
                serviceId: serviceId || '',
                data: [],
                message: 'All fields are required!'
            });
        }
        const newServiceType = new serviceTypemodel({
            serviceId,
            serviceName,
            serviceDescription,
            servicePrice
        });
        await newServiceType.save();
        const nextServiceId = await getNextserviceIdId(); // Get the next serviceId for the next entry
        const allServiceseTypes = await serviceTypemodel.find();
       res.render('services/createServiceType', {
            serviceId: nextServiceId,
            data: allServiceseTypes, // this is what the EJS is looping over
            message: 'Service type added successfully'
           
        });
    }
      catch (error) {
        console.log('About to save with error:');
       res.status(500).render('services/createServiceType', {
            serviceId: null,
            data: [],
            message: 'Error adding service type: ' + error.message});
    } 
}