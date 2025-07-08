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
        console.log('About to save:', newServiceType);
        await newServiceType.save();
        const allServiceseTypes = await serviceTypemodel.find();
       res.render('services/createServiceType', {
            serviceId: serviceId,
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
exports.getServiceTypes = async (req, res) => {
    try {
        const serviceTypes = await serviceTypemodel.find();
        res.status(200).json({ message: 'Service types retrieved successfully', data: serviceTypes });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving service types', error: error.message });
    }
}
exports.updateServiceType = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const updatedServiceType = await serviceTypemodel.findOneAndUpdate(
            { serviceId },
            req.body,
            { new: true }
        );

        if (!updatedServiceType) {
            return res.status(404).json({ message: 'Service type not found' });
        }
        res.status(200).json({ message: 'Service type updated successfully', data: updatedServiceType });
    } catch (error) {
        res.status(500).json({ message: 'Error updating service type', error: error.message });
    }
}
exports.deleteServiceType = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const deletedServiceType = await serviceTypemodel.findOneAndDelete({ serviceId });
        if (!deletedServiceType) {
            return res.status(404).json({ message: 'Service type not found' });
        }
        res.status(200).json({ message: 'Service type deleted successfully', data: deletedServiceType });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting service type', error: error.message });
    }
}