const customerService=require('../models/serviceModel');
class CustomerServiceService {
    static async createService(serviceData) {
        try {
            const service = new CustomerService(serviceData);
            return await service.save();
        } catch (error) {
            throw new Error(`Error creating service: ${error.message}`);
        }
    }

    static async getAllServices() {
        try {
            return await CustomerService.find();
        } catch (error) {
            throw new Error(`Error fetching services: ${error.message}`);
        }
    }

    static async getServiceById(serviceId) {
        try {
            const service = await CustomerService.findOne({ serviceId });
            if (!service) {
                throw new Error('Service not found');
            }
            return service;
        } catch (error) {
            throw new Error(`Error fetching service: ${error.message}`);
        }
    }

    static async updateService(serviceId, updateData) {
        try {
            const service = await CustomerService.findOneAndUpdate(
                { serviceId },
                updateData,
                { new: true, runValidators: true }
            );
            if (!service) {
                throw new Error('Service not found');
            }
            return service;
        } catch (error) {
            throw new Error(`Error updating service: ${error.message}`);
        }
    }

    static async deleteService(serviceId) {
        try {
            const service = await CustomerService.findOneAndDelete({ serviceId });
            if (!service) {
                throw new Error('Service not found');
            }
            return { message: 'Service deleted successfully' };
        } catch (error) {
            throw new Error(`Error deleting service: ${error.message}`);
        }
    }
}

module.exports = CustomerServiceService;