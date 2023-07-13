const express= require('express');
const router= express.Router();
const tasksController= require('../controllers/tasksController')
const verifyJWT = require("../middleware/verifyJWT");

router.use(verifyJWT);

router.route('/')
    .get(tasksController.getAllTasks)
    .post(tasksController.createNewTask)
    .patch(tasksController.updateTask)
    .delete(tasksController.deleteTask)

    module.exports=router;