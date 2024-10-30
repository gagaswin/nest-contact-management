import { z, ZodType } from 'zod';

export class AddressValidation {
  static readonly CREATE: ZodType = z.object({
    contactId: z.string(),
    street: z.string().min(1).max(255).optional(),
    city: z.string().min(1).max(100).optional(),
    province: z.string().min(1).max(100).optional(),
    country: z.string().min(1).max(100),
    postalCode: z.string().min(1).max(10),
  });

  static readonly GET: ZodType = z.object({
    contactId: z.string(),
    addressId: z.number().min(1).positive(),
  });

  static readonly UPDATE: ZodType = z.object({
    id: z.number().min(1).positive(),
    street: z.string().min(1).max(255).optional(),
    city: z.string().min(1).max(100).optional(),
    province: z.string().min(1).max(100).optional(),
    country: z.string().min(1).max(100),
    postalCode: z.string().min(1).max(10),
    contactId: z.string(),
  });

  static readonly REMOVE: ZodType = z.object({
    contactId: z.string(),
    addressId: z.number().min(1).positive(),
  });
}
