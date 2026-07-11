import { Request, Response, NextFunction } from 'express';
import { PaymentGateway } from '../models/PaymentGateway.js';
import { AppError } from '../middleware/errorHandler.js';
import { uploadImage } from '../utils/imageUpload.js';
import { createAuditLog } from '../services/audit.service.js';
import { AuditAction, PaymentGatewayType } from '../types/index.js';

export const getPaymentGateways = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const gateways = await PaymentGateway.find().sort('displayOrder');

    res.status(200).json({
      success: true,
      message: 'Payment gateways retrieved successfully',
      data: gateways,
    });
  } catch (error) {
    next(error);
  }
};

export const getPaymentGatewayById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const gateway = await PaymentGateway.findById(req.params.id);

    if (!gateway) {
      throw new AppError('Payment gateway not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Payment gateway retrieved successfully',
      data: gateway,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePaymentGateway = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { enabled, displayOrder, configuration, instructions } = req.body;

    const gateway = await PaymentGateway.findById(req.params.id);

    if (!gateway) {
      throw new AppError('Payment gateway not found', 404);
    }

    if (gateway.type === PaymentGatewayType.STRIPE) {
      if (configuration?.secretKey) {
        throw new AppError('Stripe secret key cannot be updated via API', 400);
      }
    }

    let updatedConfiguration = { ...gateway.configuration, ...configuration };

    if (gateway.type === PaymentGatewayType.BKASH || gateway.type === PaymentGatewayType.NAGAD) {
      if (configuration?.qrImage && configuration.qrImage.startsWith('data:')) {
        updatedConfiguration.qrImage = await uploadImage(configuration.qrImage);
      }
    }

    const updatedGateway = await PaymentGateway.findByIdAndUpdate(
      req.params.id,
      { enabled, displayOrder, configuration: updatedConfiguration, instructions },
      { new: true, runValidators: true }
    );

    await createAuditLog({
      user: req.user?._id,
      action: AuditAction.UPDATE,
      entity: 'PaymentGateway',
      entityId: gateway._id,
      details: { name: gateway.name, enabled: updatedGateway?.enabled },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Payment gateway updated successfully',
      data: updatedGateway,
    });
  } catch (error) {
    next(error);
  }
};

export const togglePaymentGateway = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const gateway = await PaymentGateway.findById(req.params.id);

    if (!gateway) {
      throw new AppError('Payment gateway not found', 404);
    }

    gateway.enabled = !gateway.enabled;
    await gateway.save();

    await createAuditLog({
      user: req.user?._id,
      action: AuditAction.UPDATE,
      entity: 'PaymentGateway',
      entityId: gateway._id,
      details: { name: gateway.name, enabled: gateway.enabled },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: `Gateway ${gateway.enabled ? 'enabled' : 'disabled'} successfully`,
      data: gateway,
    });
  } catch (error) {
    next(error);
  }
};

export const reorderPaymentGateways = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { gatewayIds } = req.body;

    for (let i = 0; i < gatewayIds.length; i++) {
      await PaymentGateway.findByIdAndUpdate(gatewayIds[i], { displayOrder: i + 1 });
    }

    res.status(200).json({
      success: true,
      message: 'Payment gateways reordered successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateStripeConfiguration = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const gateway = await PaymentGateway.findOne({ type: PaymentGatewayType.STRIPE });

    if (!gateway) {
      throw new AppError('Stripe gateway not found', 404);
    }

    const { publishableKey } = req.body;

    if (publishableKey) {
      gateway.configuration = {
        ...gateway.configuration,
        publishableKey,
      };
      await gateway.save();
    }

    await createAuditLog({
      user: req.user?._id,
      action: AuditAction.UPDATE,
      entity: 'PaymentGateway',
      entityId: gateway._id,
      details: { name: 'Stripe', action: 'configuration_updated' },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Stripe configuration updated successfully',
      data: {
        publishableKey: gateway.configuration?.publishableKey,
        configured: !!gateway.configuration?.secretKey,
      },
    });
  } catch (error) {
    next(error);
  }
};
