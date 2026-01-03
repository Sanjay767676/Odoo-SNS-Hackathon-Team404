import { z } from 'zod';
import { 
  insertUserSchema, users, 
  insertTripSchema, trips,
  insertStopSchema, stops,
  insertActivitySchema, activities,
  insertBudgetSchema, budgets,
  sharedTrips
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  users: {
    get: {
      method: 'GET' as const,
      path: '/api/users/:id',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/users',
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  trips: {
    list: {
      method: 'GET' as const,
      path: '/api/trips',
      responses: {
        200: z.array(z.custom<typeof trips.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/trips/:id',
      responses: {
        200: z.custom<typeof trips.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/trips',
      input: insertTripSchema,
      responses: {
        201: z.custom<typeof trips.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  stops: {
    listByTrip: {
      method: 'GET' as const,
      path: '/api/trips/:tripId/stops',
      responses: {
        200: z.array(z.custom<typeof stops.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/trips/:tripId/stops',
      input: insertStopSchema.omit({ tripId: true }),
      responses: {
        201: z.custom<typeof stops.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  activities: {
    listByStop: {
      method: 'GET' as const,
      path: '/api/stops/:stopId/activities',
      responses: {
        200: z.array(z.custom<typeof activities.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/stops/:stopId/activities',
      input: insertActivitySchema.omit({ stopId: true }),
      responses: {
        201: z.custom<typeof activities.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  budgets: {
    listByTrip: {
      method: 'GET' as const,
      path: '/api/trips/:tripId/budgets',
      responses: {
        200: z.array(z.custom<typeof budgets.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/trips/:tripId/budgets',
      input: insertBudgetSchema.omit({ tripId: true }),
      responses: {
        201: z.custom<typeof budgets.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
