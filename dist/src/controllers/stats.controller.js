"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stats_service_1 = require("../services/stats.service");
const logger_1 = __importDefault(require("../utils/logger"));
class StatsController {
    statsService;
    constructor() {
        this.statsService = new stats_service_1.StatsService();
    }
    getStats = async (req, res, next) => {
        try {
            const result = await this.statsService.getStats();
            res.status(200).send({
                success: true,
                message: "Stats retrieved successfully",
                data: result,
            });
        }
        catch (error) {
            logger_1.default.error("Error in getStats controller", error);
            next(error);
        }
    };
}
exports.default = StatsController;
