"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
router.post('/signup', (0, errorHandler_1.asyncHandler)(authController_1.signup));
router.post('/login', (0, errorHandler_1.asyncHandler)(authController_1.login));
router.get('/me', auth_1.authMiddleware, (0, errorHandler_1.asyncHandler)(authController_1.getProfile));
exports.default = router;
//# sourceMappingURL=auth.js.map