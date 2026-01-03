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
  createUserWithPassword(email: string, name: string, password: string): Promise<User>;
  updateUserPassword(userId: number, hashedPassword: string): Promise<void>;
  setResetToken(email: string, token: string, expiry: Date): Promise<void>;
  verifyResetToken(token: string): Promise<User | undefined>;

  // Trip operations
  getTrips(userId: number): Promise<Trip[]>;
  getTrip(id: number, userId: number): Promise<Trip | undefined>;
  getTripById(id: number): Promise<Trip | undefined>;
  createTrip(trip: InsertTrip): Promise<Trip>;
  updateTrip(id: number, userId: number, updates: Partial<InsertTrip>): Promise<Trip | undefined>;
  deleteTrip(id: number, userId: number): Promise<boolean>;

  // Stop operations
  getTripStops(tripId: number): Promise<TripStop[]>;
  getTripStopById(id: number): Promise<TripStop | undefined>;
  getStopsByTrip(tripId: number, userId: number): Promise<TripStop[]>;
  createTripStop(stop: InsertTripStop): Promise<TripStop>;
  updateTripStop(id: number, updates: Partial<InsertTripStop>): Promise<TripStop | undefined>;
  deleteTripStop(id: number): Promise<boolean>;
  updateStopOrder(id: number, userId: number, order: number): Promise<TripStop | undefined>;

  // Activity operations
  getActivities(): Promise<Activity[]>;
  searchActivities(query: string): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  seedActivities(): Promise<void>;

  // Trip Activity operations
  getTripActivities(tripId: number): Promise<TripActivity[]>;
  getTripActivityById(id: number): Promise<TripActivity | undefined>;
  getTripActivitiesByStop(tripStopId: number, userId: number): Promise<TripActivity[]>;
  createTripActivity(tripActivity: InsertTripActivity): Promise<TripActivity>;
  deleteTripActivity(id: number): Promise<boolean>;

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

  async createUserWithPassword(email: string, name: string, password: string): Promise<User> {
    const [user] = await db.insert(users).values({
      email,
      name,
      password,
      emailVerified: false,
    }).returning();
    return user;
  }

  async updateUserPassword(userId: number, hashedPassword: string): Promise<void> {
    await db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, userId));
  }

  async setResetToken(email: string, token: string, expiry: Date): Promise<void> {
    await db.update(users)
      .set({ resetToken: token, resetTokenExpiry: expiry })
      .where(eq(users.email, email));
  }

  async verifyResetToken(token: string): Promise<User | undefined> {
    const [user] = await db.select()
      .from(users)
      .where(and(
        eq(users.resetToken, token),
        sql`reset_token_expiry > NOW()`
      ));
    return user;
  }

  // === TRIP OPERATIONS ===

  async getTrips(userId: number): Promise<Trip[]> {
    return await db.select().from(trips).where(eq(trips.userId, userId));
  }

  async getTrip(id: number, userId: number): Promise<Trip | undefined> {
    const [trip] = await db.select().from(trips).where(and(eq(trips.id, id), eq(trips.userId, userId)));
    return trip;
  }

  async getTripById(id: number): Promise<Trip | undefined> {
    const [trip] = await db.select().from(trips).where(eq(trips.id, id));
    return trip;
  }

  async createTrip(insertTrip: InsertTrip): Promise<Trip> {
    const [trip] = await db.insert(trips).values(insertTrip).returning();
    return trip;
  }

  async updateTrip(id: number, userId: number, updates: Partial<InsertTrip>): Promise<Trip | undefined> {
    const [updated] = await db.update(trips)
      .set(updates)
      .where(and(eq(trips.id, id), eq(trips.userId, userId)))
      .returning();
    return updated;
  }

  async deleteTrip(id: number, userId: number): Promise<boolean> {
    const result = await db.delete(trips).where(and(eq(trips.id, id), eq(trips.userId, userId)));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // === TRIP STOPS ===

  async getTripStops(tripId: number): Promise<TripStop[]> {
    return await db.select().from(tripStops)
      .where(eq(tripStops.tripId, tripId))
      .orderBy(tripStops.orderIndex);
  }

  async getTripStopById(id: number): Promise<TripStop | undefined> {
    const [stop] = await db.select().from(tripStops).where(eq(tripStops.id, id));
    return stop;
  }

  async getStopsByTrip(tripId: number, userId: number): Promise<TripStop[]> {
    const trip = await this.getTrip(tripId, userId);
    if (!trip) return [];
    return await db.select().from(tripStops)
      .where(eq(tripStops.tripId, tripId))
      .orderBy(tripStops.orderIndex);
  }

  async createTripStop(insertStop: InsertTripStop): Promise<TripStop> {
    const [stop] = await db.insert(tripStops).values(insertStop).returning();
    return stop;
  }

  async updateTripStop(id: number, updates: Partial<InsertTripStop>): Promise<TripStop | undefined> {
    const [updated] = await db.update(tripStops)
      .set(updates)
      .where(eq(tripStops.id, id))
      .returning();
    return updated;
  }

  async deleteTripStop(id: number): Promise<boolean> {
    const result = await db.delete(tripStops).where(eq(tripStops.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }


  async updateStopOrder(id: number, userId: number, order: number): Promise<TripStop | undefined> {
    const [updated] = await db.update(tripStops)
      .set({ orderIndex: order })
      .where(eq(tripStops.id, id))
      .returning();
    return updated;
  }

  // === ACTIVITIES ===
  async getActivities(): Promise<Activity[]> {
    return await db.select().from(activities);
  }

  async searchActivities(query: string): Promise<Activity[]> {
    return await db.select().from(activities)
      .where(sql`LOWER(${activities.name}) LIKE LOWER(${'%' + query + '%'})`);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await db.insert(activities).values(insertActivity).returning();
    return activity;
  }

  async seedActivities() {
    const existing = await db.select().from(activities).limit(1);
    if (existing.length === 0) {
      await db.insert(activities).values([
        { name: "Eiffel Tower Visit", category: "Sightseeing", description: "Visit the iconic iron lattice tower", defaultCost: "30.00" },
        { name: "Louvre Museum", category: "Culture", description: "World's largest art museum", defaultCost: "25.00" },
        { name: "Colosseum Tour", category: "History", description: "Ancient Roman amphitheatre", defaultCost: "40.00" },
        { name: "Sushi Making Class", category: "Food", description: "Learn to make authentic sushi", defaultCost: "80.00" },
        { name: "Grand Canal Gondola", category: "Experience", description: "Romantic ride in Venice", defaultCost: "100.00" },
        { name: "Statue of Liberty Ferry", category: "Sightseeing", description: "Visit the symbol of freedom", defaultCost: "20.00" },
        { name: "Mount Fuji Day Trip", category: "Nature", description: "Full day tour to Japan's highest peak", defaultCost: "120.00" },
        { name: "Wine Tasting in Tuscany", category: "Food & Drink", description: "Visit local vineyards", defaultCost: "90.00" },
        { name: "Northern Lights Tour", category: "Nature", description: "Hunt for the aurora borealis", defaultCost: "150.00" },
        { name: "Safari in Kruger Park", category: "Adventure", description: "African wildlife experience", defaultCost: "250.00" },
      ]);
    }
  }

  // === TRIP ACTIVITIES ===

  async getTripActivities(tripId: number): Promise<TripActivity[]> {
    return await db.select().from(tripActivities)
      .where(eq(tripActivities.tripId, tripId))
      .orderBy(tripActivities.scheduledDate, tripActivities.orderIndex);
  }

  async getTripActivityById(id: number): Promise<TripActivity | undefined> {
    const [activity] = await db.select().from(tripActivities)
      .where(eq(tripActivities.id, id));
    return activity;
  }

  async getTripActivitiesByStop(tripStopId: number, userId: number): Promise<TripActivity[]> {
    return await db.select()
      .from(tripActivities)
      .innerJoin(trips, eq(tripActivities.tripId, trips.id))
      .where(and(eq(tripActivities.stopId, tripStopId), eq(trips.userId, userId)))
      .then(results => results.map(r => r.trip_activities));
  }

  async createTripActivity(insertTripActivity: InsertTripActivity): Promise<TripActivity> {
    const [tripActivity] = await db.insert(tripActivities).values(insertTripActivity).returning();
    return tripActivity;
  }

  async deleteTripActivity(id: number): Promise<boolean> {
    const result = await db.delete(tripActivities).where(eq(tripActivities.id, id));
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
