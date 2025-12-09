const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, 'views', 'services', 'listofservice.ejs');
const template = fs.readFileSync(templatePath, 'utf8');

const mockData = {
    savedServices: [
        {
            serviceOffID: '1',
            serviceName: "Test's Service",
            servicePrice: '100',
            registrationId: 'REG1',
            assignedemployee: "John O'Doe",
            percentage: '50.0',
            status: 'Active',
            createdAt: new Date().toISOString()
        }
    ]
};

try {
    const html = ejs.render(template, mockData, { filename: templatePath });
    console.log('Render successful!');
} catch (err) {
    console.error('Render failed:', err);
}
