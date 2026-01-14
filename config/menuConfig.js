module.exports = {
    admin: [
        { label: 'Dashboard', url: '/dashboard', icon: 'fa-border-all' },
        { label: 'Pending Customers', url: '/Customers', icon: 'fa-user-friends' },
        { label: 'Recurring Customers', url: '/recurring-customers', icon: 'fa-star' },
        { label: 'User List', url: '/userslist', icon: 'fa-users-line' },
        { label: 'Add New User', url: '/createUser', icon: 'fa-user-plus' },
        { label: 'Add Institution', url: '/Institution', icon: 'fa-building' },
        { label: 'Manage Services', url: '/services/createServiceType', icon: 'fa-wand-magic-sparkles' }
    ],

    staff: [
        { label: 'Dashboard', url: '/dashboard', icon: 'fa-border-all' },
        { label: 'Pending Customers', url: '/Customers', icon: 'fa-user-friends' },
        { label: 'Recurring Customers', url: '/recurring-customers', icon: 'fa-star' },
        { label: 'Manage Services', url: '/services/createServiceType', icon: 'fa-wand-magic-sparkles' }
    ]
};
