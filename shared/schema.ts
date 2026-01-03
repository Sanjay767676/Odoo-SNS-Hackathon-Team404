import { pgTable, text, serial, integer, timestamp, decimal, boolean, index, primaryKey } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

// Users table for basic profile information
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  emailIdx: index("email_idx").on(t.email),
}));

// Trips table - can be public or private
export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  isPublic: boolean("is_public").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  ownerIdx: index("owner_idx").on(t.ownerId),
}));

// TripStops table - represents cities visited in a trip
export const tripStops = pgTable("trip_stops", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").references(() => trips.id).notNull(),
  city: text("city").notNull(),
  arrivalDate: timestamp("arrival_date").notNull(),
  departureDate: timestamp("departure_date").notNull(),
  order: integer("order").notNull(),
}, (t) => ({
  tripStopsIdx: index("trip_stops_idx").on(t.tripId),
}));

// Master list of Activities (reusable across trips)
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category"), // e.g., 'Dining', 'Museum', 'Park'
  description: text("description"),
  defaultCost: decimal("default_cost", { precision: 10, scale: 2 }),
});

// TripActivities - junction table for many-to-many relationship
export const tripActivities = pgTable("trip_activities", {
  id: serial("id").primaryKey(),
  tripStopId: integer("trip_stop_id").references(() => tripStops.id).notNull(),
  activityId: integer("activity_id").references(() => activities.id).notNull(),
  startTime: timestamp("start_time"),
  actualCost: decimal("actual_cost", { precision: 10, scale: 2 }),
  notes: text("notes"),
}, (t) => ({
  stopActivityIdx: index("stop_activity_idx").on(t.tripStopId, t.activityId),
}));

// Budgets table - supports budgeting per trip
export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").references(() => trips.id).notNull(),
  category: text("category").notNull(), // e.g., 'Transport', 'Food', 'Leisure'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("USD").notNull(),
}, (t) => ({
  tripBudgetIdx: index("trip_budget_idx").on(t.tripId),
}));

// SharedTrips - for public/shared itineraries
export const sharedTrips = pgTable("shared_trips", {
  tripId: integer("trip_id").references(() => trips.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  accessLevel: text("access_level", { enum: ["viewer", "editor"] }).default("viewer").notNull(),
  sharedAt: timestamp("shared_at").defaultNow().notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.tripId, t.userId] }),
  sharedTripIdx: index("shared_trip_idx").on(t.tripId),
}));

// === RELATIONS ===

export const usersRelations = relations(users, ({ many }) => ({
  ownedTrips: many(trips),
  sharedTrips: many(sharedTrips),
}));

export const tripsRelations = relations(trips, ({ one, many }) => ({
  owner: one(users, { fields: [trips.ownerId], references: [users.id] }),
  stops: many(tripStops),
  budgets: many(budgets),
  sharedWith: many(sharedTrips),
}));

export const tripStopsRelations = relations(tripStops, ({ one, many }) => ({
  trip: one(trips, { fields: [tripStops.tripId], references: [trips.id] }),
  tripActivities: many(tripActivities),
}));

export const activitiesRelations = relations(activities, ({ many }) => ({
  trips: many(tripActivities),
}));

export const tripActivitiesRelations = relations(tripActivities, ({ one }) => ({
  stop: one(tripStops, { fields: [tripActivities.tripStopId], references: [tripStops.id] }),
  activity: one(activities, { fields: [tripActivities.activityId], references: [activities.id] }),
}));

export const budgetsRelations = relations(budgets, ({ one }) => ({
  trip: one(trips, { fields: [budgets.tripId], references: [trips.id] }),
}));

export const sharedTripsRelations = relations(sharedTrips, ({ one }) => ({
  trip: one(trips, { fields: [sharedTrips.tripId], references: [trips.id] }),
  user: one(users, { fields: [sharedTrips.userId], references: [users.id] }),
}));

// === BASE SCHEMAS ===

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertTripSchema = createInsertSchema(trips).omit({ id: true, createdAt: true });
export const insertTripStopSchema = createInsertSchema(tripStops).omit({ id: true });
export const insertActivitySchema = createInsertSchema(activities).omit({ id: true });
export const insertTripActivitySchema = createInsertSchema(tripActivities).omit({ id: true });
export const insertBudgetSchema = createInsertSchema(budgets).omit({ id: true });
export const insertSharedTripSchema = createInsertSchema(sharedTrips).omit({ sharedAt: true });

// === EXPLICIT API CONTRACT TYPES ===

export type User = typeof users.$inferSelect;
export type Trip = typeof trips.$inferSelect;
export type TripStop = typeof tripStops.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type TripActivity = typeof tripActivities.$inferSelect;
export type Budget = typeof budgets.$inferSelect;
export type SharedTrip = typeof sharedTrips.$inferSelect;
