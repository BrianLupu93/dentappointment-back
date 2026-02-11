import { asyncHandler } from "../utils/asyncHandler";
import Service from "../models/service.model";
import { logger } from "../utils/logger";

// --------------------- CREATE SERVICE -------------------------

export const createService = asyncHandler(async (req, res) => {
  const { name, duration, active } = req.body;

  const service = await Service.create({ name, duration, active });

  logger.info(`Service created: ${service.name}`);

  res.status(201).json(service);
});

// --------------------- GET ALL SERVICES -------------------------

export const getServices = asyncHandler(async (req, res) => {
  const services = await Service.find();
  res.json(services);
});

// --------------------- GET SERVICE {id} -------------------------

export const getService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    logger.warn(`Service not found: ${req.params.id}`);
    return res.status(404).json({ message: "Service not found" });
  }

  res.json(service);
});

// --------------------- UPDATE SERVICE {id} -------------------------

export const updateService = asyncHandler(async (req, res) => {
  const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!service) {
    logger.warn(`Service not found for update: ${req.params.id}`);
    return res.status(404).json({ message: "Service not found" });
  }

  logger.info(`Service updated: ${service.name}`);

  res.json(service);
});

// --------------------- DELETE SERVICE {id} -------------------------

export const deleteService = asyncHandler(async (req, res) => {
  console.log("======================");
  console.log(req.params.id);
  const service = await Service.findByIdAndDelete(req.params.id);

  if (!service) {
    logger.warn(`Service not found for delete: ${req.params.id}`);
    return res.status(404).json({ message: "Service not found" });
  }

  logger.info(`Service deleted: ${service.name}`);

  res.json({ message: "Service deleted" });
});
