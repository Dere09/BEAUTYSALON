# Copilot Instructions for BEAUTYSALON Node.js Codebase

## Project Overview
- This is a Node.js/Express application for managing a beauty salon, with features for user registration, service assignment, employee tracking, and customer management.
- The app uses EJS for server-side rendering, MongoDB for persistent storage (via Mongoose models), and Redis for caching service data.
- Key directories: 
  - `Controller/` (business logic, grouped by domain)
  - `models/` (Mongoose schemas)
  - `routes/` (Express routers, some nested for domain separation)
  - `views/` (EJS templates, including subfolders for Employee/services)
  - `utilities/` (shared helpers, e.g., caching logic)
  - `public/` (static assets)
  - `config/` (external service configs, e.g., Redis)

## Data Flow & Patterns
- Controllers fetch data from MongoDB, process it, and pass results to EJS views for rendering.
- Redis is used for caching expensive queries (see `utilities/getCacheData.js`). Always check cache before querying MongoDB.
- Service assignment and employee statistics are calculated in controllers/utilities and passed to views as `savedServices`.
- EJS templates expect arrays of service objects, often enhanced with computed fields (e.g., `percentage`).
- AJAX endpoints (e.g., `/employee-counts`) return JSON for dynamic UI updates.

## Developer Workflows
- **Start app:** `node app.js` (or use `nodemon` for auto-reload)
- **MongoDB:** Ensure local or remote MongoDB is running and accessible.
- **Redis:** Start Redis server on `localhost:6379` before running the app.
- **Debugging:** Use `console.log` in controllers/utilities; errors are logged to the console.
- **Adding features:** Place new business logic in `Controller/`, update or add routes in `routes/`, and create/update EJS templates in `views/`.
- **Caching:** Use `redisClient` from `config/redis.js` for shared cache access.

## Project-Specific Conventions
- Service-related logic is split by domain (see `Controller/services/` and `routes/serviceRoute/`).
- Employee assignment stats are calculated and cached; always update cache after DB changes.
- EJS templates use data attributes and classes for dynamic JS updates (see `employee-percentage-bar`).
- Only non-completed services are shown in main lists (`status: {$ne: 'Completed'}` in queries).
- Use `getAllServiceOffered` from `utilities/getCacheData.js` for service lists with percentages.

## Integration Points
- MongoDB via Mongoose (see `models/`)
- Redis for caching (see `config/redis.js`)
- Static assets served from `public/`
- EJS for all server-rendered views

## Example Patterns
- To add a new service and update the UI:
  1. Use controller to save to MongoDB
  2. Update Redis cache
  3. Pass updated data to EJS view
  4. Use AJAX to fetch `/employee-counts` for live UI updates
- To reuse shared logic, import from `utilities/` (e.g., `getAllServiceOffered`)

## Key Files
- `app.js` (main entry)
- `Controller/services/addServiceController.js` (service creation, stats)
- `utilities/getCacheData.js` (caching, stats)
- `config/redis.js` (Redis setup)
- `views/services/listofservice.ejs` (main service list UI)

---

If any section is unclear or missing important details, please provide feedback or specify which workflows or patterns need more documentation.
