import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

async function seedDatabase() {
  const existingUsers = await storage.getUsers();
  if (existingUsers.length === 0) {
    const user = await storage.createUser({ name: "Alice Smith", email: "alice@example.com" });
    const trip = await storage.createTrip({ 
      ownerId: user.id, 
      title: "Summer in Europe", 
      description: "Visiting Paris and Rome", 
      isPublic: true 
    });
    
    const stop1 = await storage.createStop({
      tripId: trip.id,
      city: "Paris",
      arrivalDate: new Date("2024-06-01"),
      departureDate: new Date("2024-06-05"),
      order: 1
    });

    const stop2 = await storage.createStop({
      tripId: trip.id,
      city: "Rome",
      arrivalDate: new Date("2024-06-06"),
      departureDate: new Date("2024-06-10"),
      order: 2
    });

    const activity = await storage.createActivity({
      name: "Eiffel Tower Visit",
      category: "Sightseeing",
      description: "View from the top",
      defaultCost: "25.00"
    });

    await storage.createTripActivity({
      tripStopId: stop1.id,
      activityId: activity.id,
      startTime: new Date("2024-06-02T10:00:00Z"),
      actualCost: "30.00",
      notes: "Book in advance"
    });

    await storage.createBudget({
      tripId: trip.id,
      category: "Transport",
      amount: "500.00",
      currency: "USD"
    });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await seedDatabase();

  app.get(api.users.get.path, async (req, res) => {
    const user = await storage.getUser(Number(req.params.id));
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  });

  app.post(api.users.create.path, async (req, res) => {
    try {
      const input = api.users.create.input.parse(req.body);
      const user = await storage.createUser(input);
      res.status(201).json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get(api.trips.list.path, async (req, res) => {
    const trips = await storage.getTrips();
    res.json(trips);
  });

  app.get(api.trips.get.path, async (req, res) => {
    const trip = await storage.getTrip(Number(req.params.id));
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    res.json(trip);
  });

  app.post(api.trips.create.path, async (req, res) => {
    try {
      const input = api.trips.create.input.parse(req.body);
      const trip = await storage.createTrip(input);
      res.status(201).json(trip);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get(api.tripStops.listByTrip.path, async (req, res) => {
    const stops = await storage.getStopsByTrip(Number(req.params.tripId));
    res.json(stops);
  });

  app.post(api.tripStops.create.path, async (req, res) => {
    try {
      const tripId = Number(req.params.tripId);
      const input = api.tripStops.create.input.parse(req.body);
      const stop = await storage.createStop({ ...input, tripId });
      res.status(201).json(stop);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get(api.activities.list.path, async (req, res) => {
    const activitiesList = await storage.getActivities();
    res.json(activitiesList);
  });

  app.post(api.activities.create.path, async (req, res) => {
    try {
      const input = api.activities.create.input.parse(req.body);
      const activity = await storage.createActivity(input);
      res.status(201).json(activity);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get(api.tripActivities.listByStop.path, async (req, res) => {
    const activities = await storage.getTripActivitiesByStop(Number(req.params.tripStopId));
    res.json(activities);
  });

  app.post(api.tripActivities.create.path, async (req, res) => {
    try {
      const tripStopId = Number(req.params.tripStopId);
      const input = api.tripActivities.create.input.parse(req.body);
      const tripActivity = await storage.createTripActivity({ ...input, tripStopId });
      res.status(201).json(tripActivity);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get(api.budgets.listByTrip.path, async (req, res) => {
    const budgetList = await storage.getBudgetsByTrip(Number(req.params.tripId));
    res.json(budgetList);
  });

  app.post(api.budgets.create.path, async (req, res) => {
    try {
      const tripId = Number(req.params.tripId);
      const input = api.budgets.create.input.parse(req.body);
      const budget = await storage.createBudget({ ...input, tripId });
      res.status(201).json(budget);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  return httpServer;
}
