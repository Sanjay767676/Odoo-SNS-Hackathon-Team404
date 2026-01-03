import { pgTable, text, serial, integer, timestamp, decimal, boolean, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  image: text("image"),
});

export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  isPublic: boolean("is_public").default(false).notNull(),
});

export const sharedTrips = pgTable("shared_trips", {
  tripId: integer("trip_id").references(() => trips.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  role: text("role", { enum: ["viewer", "editor"] }).default("viewer").notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.tripId, t.userId] }),
}));

export const stops = pgTable("stops", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").references(() => trips.id).notNull(),
  location: text("location").notNull(),
  arrivalDate: timestamp("arrival_date"),
  departureDate: timestamp("departure_date"),
  order: integer("order").notNull(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  stopId: integer("stop_id").references(() => stops.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time"),
  duration: integer("duration"), // in minutes
  cost: decimal("cost", { precision: 10, scale: 2 }),
});

export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").references(() => trips.id).notNull(),
  category: text("category").notNull(), // e.g., 'Flight', 'Hotel', 'Food'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("USD").notNull(),
});

// === RELATIONS ===

export const usersRelations = relations(users, ({ many }) => ({
  trips: many(trips),
  sharedTrips: many(sharedTrips),
}));

export const tripsRelations = relations(trips, ({ one, many }) => ({
  owner: one(users, { fields: [trips.userId], references: [users.id] }),
  sharedWith: many(sharedTrips),
  stops: many(stops),
  budgets: many(budgets),
}));

export const sharedTripsRelations = relations(sharedTrips, ({ one }) => ({
  trip: one(trips, { fields: [sharedTrips.tripId], references: [trips.id] }),
  user: one(users, { fields: [sharedTrips.userId], references: [users.id] }),
}));

export const stopsRelations = relations(stops, ({ one, many }) => ({
  trip: one(trips, { fields: [stops.tripId], references: [trips.id] }),
  activities: many(activities),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  stop: one(stops, { fields: [activities.stopId], references: [stops.id] }),
}));

export const budgetsRelations = relations(budgets, ({ one }) => ({
  trip: one(trips, { fields: [budgets.tripId], references: [trips.id] }),
}));

// === BASE SCHEMAS ===

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertTripSchema = createInsertSchema(trips).omit({ id: true });
export const insertStopSchema = createInsertSchema(stops).omit({ id: true });
export const insertActivitySchema = createInsertSchema(activities).omit({ id: true });
export const insertBudgetSchema = createInsertSchema(budgets).omit({ id: true });
export const insertSharedTripSchema = createInsertSchema(sharedTrips);

// === EXPLICIT API CONTRACT TYPES ===

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Trip = typeof trips.$inferSelect;
export type InsertTrip = z.infer<typeof insertTripSchema>;

export type Stop = typeof stops.$inferSelect;
export type InsertStop = z.infer<typeof insertStopSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = z.infer<typeof insertBudgetSchema>;

export type SharedTrip = typeof sharedTrips.$inferSelect;
export type InsertSharedTrip = z.infer<typeof insertSharedTripSchema>;
