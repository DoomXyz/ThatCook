import express from "express";
import homeController from "../controllers/homeController"

let router = express.Router();

let initWebRoutes = (app) => {
    router.get('/', homeController.getHomePage);
    router.post('/post-crud', homeController.postCRUD);
    router.get('/crud', homeController.getCRUD);
    return app.use("/", router)
}

module.exports = initWebRoutes;