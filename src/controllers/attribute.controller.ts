import { Response, NextFunction } from "express";
import { AttributeService } from "../services/attribute.service";
import { RequestWithUser } from "../middleware/auth.middleware";

class AttributeController {
  private service: AttributeService;

  constructor() {
    this.service = new AttributeService();
  }

  public getAllAttributes = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const attributes = await this.service.getAllAttributes();
      res.status(200).json({ success: true, data: attributes });
    } catch (error) {
      next(error);
    }
  };

  public createAttribute = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { name } = req.body;
      const attribute = await this.service.createAttribute(name);
      res.status(201).json({ success: true, data: attribute });
    } catch (error) {
      next(error);
    }
  };

  public addAttributeValue = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const { value } = req.body;
      const result = await this.service.addAttributeValue(id, value);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  public deleteAttribute = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      await this.service.deleteAttribute(id);
      res.status(200).json({ success: true, message: "Attribute deleted" });
    } catch (error) {
      next(error);
    }
  };

  public deleteAttributeValue = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      await this.service.deleteAttributeValue(id);
      res
        .status(200)
        .json({ success: true, message: "Attribute value deleted" });
    } catch (error) {
      next(error);
    }
  };
}

export default AttributeController;
