"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const projectController_1 = require("../controllers/projectController");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const teamController_1 = require("../controllers/teamController");
const taskController_1 = require("../controllers/taskController");
const router = (0, express_1.Router)();
// Project routes
router.get('/', auth_1.authMiddleware, (0, errorHandler_1.asyncHandler)(projectController_1.getProjects));
router.post('/', auth_1.authMiddleware, auth_1.adminMiddleware, (0, errorHandler_1.asyncHandler)(projectController_1.createProject));
router.get('/:id', auth_1.authMiddleware, (0, errorHandler_1.asyncHandler)(projectController_1.getProjectById));
router.put('/:id', auth_1.authMiddleware, auth_1.adminMiddleware, (0, errorHandler_1.asyncHandler)(projectController_1.updateProject));
router.delete('/:id', auth_1.authMiddleware, auth_1.adminMiddleware, (0, errorHandler_1.asyncHandler)(projectController_1.deleteProject));
// Team member routes
router.get('/:projectId/members', auth_1.authMiddleware, (0, errorHandler_1.asyncHandler)(teamController_1.getTeamMembers));
router.post('/:projectId/members', auth_1.authMiddleware, auth_1.adminMiddleware, (0, errorHandler_1.asyncHandler)(teamController_1.addTeamMember));
router.delete('/:projectId/members/:userId', auth_1.authMiddleware, auth_1.adminMiddleware, (0, errorHandler_1.asyncHandler)(teamController_1.removeTeamMember));
router.get('/:projectId/available-users', auth_1.authMiddleware, (0, errorHandler_1.asyncHandler)(teamController_1.getAvailableUsers));
// Task routes
router.get('/:projectId/tasks', auth_1.authMiddleware, (0, errorHandler_1.asyncHandler)(taskController_1.getProjectTasks));
router.post('/:projectId/tasks', auth_1.authMiddleware, (0, errorHandler_1.asyncHandler)(taskController_1.createTask));
exports.default = router;
//# sourceMappingURL=projects.js.map