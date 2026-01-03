import { users, trips, tripStops, activities, tripActivities, budgets, sharedTrips, type User, type InsertUser, type Trip, type InsertTrip, type TripStop, type InsertTripStop, type Activity, type InsertActivity, type TripActivity, type InsertTripActivity, type Budget, type InsertBudget, type SharedTrip, type InsertSharedTrip } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Trip operations
  getTrips(): Promise<Trip[]>;
  getTrip(id: number): Promise<Trip | undefined>;
  createTrip(trip: InsertTrip): Promise<Trip>;

  // Stop operations
  getStopsByTrip(tripId: number): Promise<TripStop[]>;
  createStop(stop: InsertTripStop): Promise<TripStop>;

  // Activity operations
  getActivities(): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  // Trip Activity operations
  getTripActivitiesByStop(tripStopId: number): Promise<TripActivity[]>;
  createTripActivity(tripActivity: InsertTripActivity): Promise<TripActivity>;

  // Budget operations
  getBudgetsByTrip(tripId: number): Promise<Budget[]>;
  createBudget(budget: InsertBudget): Promise<Budget>;
}

export class DatabaseStorage implements IStorage {
  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getTrips(): Promise<Trip[]> {
    return await db.select().from(trips);
  }

  async getTrip(id: number): Promise<Trip | undefined> {
    const [trip] = await db.select().from(trips).where(eq(trips.id, id));
    return trip;
  }

  async createTrip(insertTrip: InsertTrip): Promise<Trip> {
    const [trip] = await db.insert(trips).values(insertTrip).returning();
    return trip;
  }

  async getStopsByTrip(tripId: number): Promise<TripStop[]> {
    return await db.select().from(tripStops).where(eq(tripStops.tripId, tripId));
  }

  async createStop(insertStop: InsertTripStop): Promise<TripStop> {
    const [stop] = await db.insert(tripStops).values(insertStop).returning();
    return stop;
  }

  async getActivities(): Promise<Activity[]> {
    return await db.select().from(activities);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await db.insert(activities).values(insertActivity).returning();
    return activity;
  }

  async getTripActivitiesByStop(tripStopId: number): Promise<TripActivity[]> {
    return await db.select().from(tripActivities).where(eq(tripActivities.tripStopId, tripStopId));
  }

  async createTripActivity(insertTripActivity: InsertTripActivity): Promise<TripActivity> {
    const [tripActivity] = await db.insert(tripActivities).values(insertTripActivity).returning();
    return tripActivity;
  }

  async getBudgetsByTrip(tripId: number): Promise<Budget[]> {
    return await db.select().from(budgets).where(eq(budgets.tripId, tripId));
  }

  async createBudget(insertBudget: InsertBudget): Promise<Budget> {
    const [budget] = await db.insert(budgets).values(insertBudget).returning();
    return budget;
  }
}

export const storage = new DatabaseStorage();
