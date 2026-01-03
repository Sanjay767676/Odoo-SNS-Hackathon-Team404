import { 
  users, trips, tripStops, activities, tripActivities, budgets, sharedTrips, 
  type User, type InsertUser, 
  type Trip, type InsertTrip, 
  type TripStop, type InsertTripStop, 
  type Activity, type InsertActivity, 
  type TripActivity, type InsertTripActivity, 
  type Budget, type InsertBudget 
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Trip operations
  getTrips(userId: number): Promise<Trip[]>;
  getTrip(id: number, userId: number): Promise<Trip | undefined>;
  createTrip(trip: InsertTrip): Promise<Trip>;
  updateTrip(id: number, userId: number, updates: Partial<InsertTrip>): Promise<Trip | undefined>;
  deleteTrip(id: number, userId: number): Promise<boolean>;

  // Stop operations
  getStopsByTrip(tripId: number, userId: number): Promise<TripStop[]>;
  createStop(stop: InsertTripStop): Promise<TripStop>;
  deleteStop(id: number, userId: number): Promise<boolean>;
  updateStopOrder(id: number, userId: number, order: number): Promise<TripStop | undefined>;

  // Activity operations
  getActivities(): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  // Trip Activity operations
  getTripActivitiesByStop(tripStopId: number, userId: number): Promise<TripActivity[]>;
  createTripActivity(tripActivity: InsertTripActivity): Promise<TripActivity>;
  deleteTripActivity(id: number, userId: number): Promise<boolean>;

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

  // Trip operations with ownership
  async getTrips(userId: number): Promise<Trip[]> {
    return await db.select().from(trips).where(eq(trips.ownerId, userId));
  }

  async getTrip(id: number, userId: number): Promise<Trip | undefined> {
    const [trip] = await db.select().from(trips).where(and(eq(trips.id, id), eq(trips.ownerId, userId)));
    return trip;
  }

  async createTrip(insertTrip: InsertTrip): Promise<Trip> {
    const [trip] = await db.insert(trips).values(insertTrip).returning();
    return trip;
  }

  async updateTrip(id: number, userId: number, updates: Partial<InsertTrip>): Promise<Trip | undefined> {
    const [updated] = await db.update(trips)
      .set(updates)
      .where(and(eq(trips.id, id), eq(trips.ownerId, userId)))
      .returning();
    return updated;
  }

  async deleteTrip(id: number, userId: number): Promise<boolean> {
    const result = await db.delete(trips).where(and(eq(trips.id, id), eq(trips.ownerId, userId)));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Stop operations
  async getStopsByTrip(tripId: number, userId: number): Promise<TripStop[]> {
    const trip = await this.getTrip(tripId, userId);
    if (!trip) return [];
    return await db.select().from(tripStops).where(eq(tripStops.tripId, tripId));
  }

  async createStop(insertStop: InsertTripStop): Promise<TripStop> {
    const [stop] = await db.insert(tripStops).values(insertStop).returning();
    return stop;
  }

  async deleteStop(id: number, userId: number): Promise<boolean> {
    const result = await db.delete(tripStops)
      .where(and(
        eq(tripStops.id, id),
        sql`trip_id IN (SELECT id FROM trips WHERE owner_id = ${userId})`
      ));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async updateStopOrder(id: number, userId: number, order: number): Promise<TripStop | undefined> {
    const [updated] = await db.update(tripStops)
      .set({ order })
      .where(and(
        eq(tripStops.id, id),
        sql`trip_id IN (SELECT id FROM trips WHERE owner_id = ${userId})`
      ))
      .returning();
    return updated;
  }

  // Activity operations
  async getActivities(): Promise<Activity[]> {
    return await db.select().from(activities);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await db.insert(activities).values(insertActivity).returning();
    return activity;
  }

  // Trip Activity operations
  async getTripActivitiesByStop(tripStopId: number, userId: number): Promise<TripActivity[]> {
    const [stop] = await db.select()
      .from(tripStops)
      .where(and(
        eq(tripStops.id, tripStopId),
        sql`trip_id IN (SELECT id FROM trips WHERE owner_id = ${userId})`
      ));
    if (!stop) return [];
    return await db.select().from(tripActivities).where(eq(tripActivities.tripStopId, tripStopId));
  }

  async createTripActivity(insertTripActivity: InsertTripActivity): Promise<TripActivity> {
    const [tripActivity] = await db.insert(tripActivities).values(insertTripActivity).returning();
    return tripActivity;
  }

  async deleteTripActivity(id: number, userId: number): Promise<boolean> {
    const result = await db.delete(tripActivities)
      .where(and(
        eq(tripActivities.id, id),
        sql`trip_stop_id IN (SELECT id FROM trip_stops WHERE trip_id IN (SELECT id FROM trips WHERE owner_id = ${userId}))`
      ));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Budget operations
  async getBudgetsByTrip(tripId: number): Promise<Budget[]> {
    return await db.select().from(budgets).where(eq(budgets.tripId, tripId));
  }

  async createBudget(insertBudget: InsertBudget): Promise<Budget> {
    const [budget] = await db.insert(budgets).values(insertBudget).returning();
    return budget;
  }
}

export const storage = new DatabaseStorage();
