"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboardController_1 = require("../controllers/dashboardController");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
router.get('/overview', auth_1.authMiddleware, (0, errorHandler_1.asyncHandler)(dashboardController_1.getDashboardOverview));
exports.default = router;
//# sourceMappingURL=dashboard.js.map