"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const attribute_service_1 = require("../services/attribute.service");
class AttributeController {
    service;
    constructor() {
        this.service = new attribute_service_1.AttributeService();
    }
    getAllAttributes = async (req, res, next) => {
        try {
            const attributes = await this.service.getAllAttributes();
            res.status(200).json({ success: true, data: attributes });
        }
        catch (error) {
            next(error);
        }
    };
    createAttribute = async (req, res, next) => {
        try {
            const { name } = req.body;
            const attribute = await this.service.createAttribute(name);
            res.status(201).json({ success: true, data: attribute });
        }
        catch (error) {
            next(error);
        }
    };
    addAttributeValue = async (req, res, next) => {
        try {
            const { id } = req.params;
            const { value } = req.body;
            const result = await this.service.addAttributeValue(id, value);
            res.status(201).json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    };
    deleteAttribute = async (req, res, next) => {
        try {
            const { id } = req.params;
            await this.service.deleteAttribute(id);
            res.status(200).json({ success: true, message: "Attribute deleted" });
        }
        catch (error) {
            next(error);
        }
    };
    deleteAttributeValue = async (req, res, next) => {
        try {
            const { id } = req.params;
            await this.service.deleteAttributeValue(id);
            res
                .status(200)
                .json({ success: true, message: "Attribute value deleted" });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.default = AttributeController;
