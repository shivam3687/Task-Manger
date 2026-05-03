"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const taskController_1 = require("../controllers/taskController");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
router.get('/:taskId', auth_1.authMiddleware, (0, errorHandler_1.asyncHandler)(taskController_1.getTaskById));
router.put('/:taskId', auth_1.authMiddleware, (0, errorHandler_1.asyncHandler)(taskController_1.updateTask));
router.patch('/:taskId/status', auth_1.authMiddleware, (0, errorHandler_1.asyncHandler)(taskController_1.updateTaskStatus));
router.post('/:taskId/comments', auth_1.authMiddleware, (0, errorHandler_1.asyncHandler)(taskController_1.addTaskComment));
router.delete('/:taskId', auth_1.authMiddleware, (0, errorHandler_1.asyncHandler)(taskController_1.deleteTask));
exports.default = router;
//# sourceMappingURL=tasks.js.map