import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

// Mock auth middleware - assuming user ID is in req.user
// Since JWT middleware is mentioned as already implemented but not shown,
// we will assume req.user.id exists.
const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // In a real app, this would be set by passport/jwt middleware
  // For now, we'll try to get it from a header or default for testing
  const userId = req.headers["x-user-id"];
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  (req as any).user = { id: Number(userId) };
  next();
};

async function seedDatabase() {
  const existingUsers = await storage.getUsers();
  if (existingUsers.length === 0) {
    const user = await storage.createUser({ name: "Traveler", email: "traveler@example.com" });
    const trip = await storage.createTrip({ 
      ownerId: user.id, 
      title: "My Adventure", 
      description: "Exploring the world", 
      isPublic: true 
    });
    
    const stop = await storage.createStop({
      tripId: trip.id,
      city: "London",
      arrivalDate: new Date(),
      departureDate: new Date(),
      order: 1
    });

    const activity = await storage.createActivity({
      name: "Big Ben",
      category: "Sightseeing",
      description: "Famous clock tower",
      defaultCost: "0"
    });

    await storage.createTripActivity({
      tripStopId: stop.id,
      activityId: activity.id,
      startTime: new Date(),
      actualCost: "0",
      notes: "Free to see from outside"
    });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await seedDatabase();

  // Trips
  app.get(api.trips.list.path, authenticate, async (req: any, res) => {
    const trips = await storage.getTrips(req.user.id);
    res.json(trips);
  });

  app.get(api.trips.get.path, authenticate, async (req: any, res) => {
    const trip = await storage.getTrip(Number(req.params.id), req.user.id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    res.json(trip);
  });

  app.post(api.trips.create.path, authenticate, async (req: any, res) => {
    try {
      const input = api.trips.create.input.parse(req.body);
      const trip = await storage.createTrip({ ...input, ownerId: req.user.id });
      res.status(201).json(trip);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch(api.trips.update.path, authenticate, async (req: any, res) => {
    try {
      const input = api.trips.update.input.parse(req.body);
      const trip = await storage.updateTrip(Number(req.params.id), req.user.id, input);
      if (!trip) return res.status(404).json({ message: "Trip not found" });
      res.json(trip);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.trips.delete.path, authenticate, async (req: any, res) => {
    const deleted = await storage.deleteTrip(Number(req.params.id), req.user.id);
    if (!deleted) return res.status(404).json({ message: "Trip not found" });
    res.status(204).end();
  });

  // Trip Stops
  app.get(api.tripStops.listByTrip.path, authenticate, async (req: any, res) => {
    const stops = await storage.getStopsByTrip(Number(req.params.tripId), req.user.id);
    res.json(stops);
  });

  app.post(api.tripStops.create.path, authenticate, async (req: any, res) => {
    try {
      const tripId = Number(req.params.tripId);
      // Verify trip ownership
      const trip = await storage.getTrip(tripId, req.user.id);
      if (!trip) return res.status(403).json({ message: "Forbidden" });

      const input = api.tripStops.create.input.parse(req.body);
      const stop = await storage.createStop({ ...input, tripId });
      res.status(201).json(stop);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.tripStops.delete.path, authenticate, async (req: any, res) => {
    const deleted = await storage.deleteStop(Number(req.params.id), req.user.id);
    if (!deleted) return res.status(404).json({ message: "Stop not found" });
    res.status(204).end();
  });

  app.patch(api.tripStops.reorder.path, authenticate, async (req: any, res) => {
    const input = api.tripStops.reorder.input.parse(req.body);
    const stop = await storage.updateStopOrder(Number(req.params.id), req.user.id, input.order);
    if (!stop) return res.status(404).json({ message: "Stop not found" });
    res.json(stop);
  });

  // Activities (Search/Read-only)
  app.get(api.activities.list.path, authenticate, async (req, res) => {
    const list = await storage.getActivities();
    res.json(list);
  });

  // Trip Activities
  app.get(api.tripActivities.listByStop.path, authenticate, async (req: any, res) => {
    const activities = await storage.getTripActivitiesByStop(Number(req.params.tripStopId), req.user.id);
    res.json(activities);
  });

  app.post(api.tripActivities.create.path, authenticate, async (req: any, res) => {
    try {
      const tripStopId = Number(req.params.tripStopId);
      const input = api.tripActivities.create.input.parse(req.body);
      const tripActivity = await storage.createTripActivity({ ...input, tripStopId });
      res.status(201).json(tripActivity);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.tripActivities.delete.path, authenticate, async (req: any, res) => {
    const deleted = await storage.deleteTripActivity(Number(req.params.id), req.user.id);
    if (!deleted) return res.status(404).json({ message: "Activity not found" });
    res.status(204).end();
  });

  return httpServer;
}
