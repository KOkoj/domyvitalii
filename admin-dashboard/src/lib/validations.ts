import { z } from 'zod'

// Common schemas
export const fileSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  name: z.string().min(1),
  size: z.number().optional(),
  type: z.string().optional(),
})

// Property schemas
export const propertyBasicInfoSchema = z.object({
  title: z.string().min(5, 'Název musí mít alespoň 5 znaků').max(100, 'Název je příliš dlouhý'),
  description: z.string().min(20, 'Popis musí mít alespoň 20 znaků').max(2000, 'Popis je příliš dlouhý'),
  type: z.string().min(1, 'Vyberte typ nemovitosti'),
  status: z.enum(['AVAILABLE', 'SOLD', 'RENTED', 'DRAFT'], {
    required_error: 'Vyberte stav nemovitosti',
  }),
  region: z.string().min(1, 'Vyberte region'),
  city: z.string().min(1, 'Zadejte město'),
  address: z.string().min(5, 'Zadejte úplnou adresu'),
})

export const propertyDetailsSchema = z.object({
  price: z.number().min(10000, 'Cena musí být alespoň 10 000 EUR').max(5000000, 'Cena je příliš vysoká'),
  currency: z.enum(['EUR', 'CZK']).default('EUR'),
  bedrooms: z.number().min(0).max(20),
  bathrooms: z.number().min(0).max(20),
  yearBuilt: z.number().min(1800, 'Neplatný rok').max(2024, 'Rok nemůže být v budoucnosti').optional(),
  size: z.number().min(10, 'Minimální velikost 10 m²').max(2000, 'Maximální velikost 2000 m²').optional(),
  amenities: z.array(z.string()).default([]),
})

export const propertyMediaSchema = z.object({
  images: z.array(fileSchema).min(1, 'Přidejte alespoň 1 obrázek').max(20, 'Maximálně 20 obrázků'),
  mainImage: z.string().optional(),
})

export const propertySeoSchema = z.object({
  seoTitle: z.string().max(60, 'SEO titulek je příliš dlouhý').optional(),
  seoDescription: z.string().max(160, 'SEO popis je příliš dlouhý').optional(),
  seoKeywords: z.array(z.string()).default([]),
})

export const propertySchema = propertyBasicInfoSchema
  .merge(propertyDetailsSchema)
  .merge(propertyMediaSchema)
  .merge(propertySeoSchema)

// Blog Post schemas
export const blogPostSchema = z.object({
  title: z.string().min(5, 'Titulek musí mít alespoň 5 znaků').max(100, 'Titulek je příliš dlouhý'),
  slug: z.string().min(3, 'URL slug je příliš krátký').max(100, 'URL slug je příliš dlouhý')
    .regex(/^[a-z0-9-]+$/, 'URL slug může obsahovat pouze malá písmena, čísla a pomlčky'),
  excerpt: z.string().min(20, 'Perex musí mít alespoň 20 znaků').max(300, 'Perex je příliš dlouhý'),
  content: z.string().min(100, 'Obsah musí mít alespoň 100 znaků'),
  status: z.enum(['draft', 'published', 'archived'], {
    required_error: 'Vyberte stav článku',
  }),
  featuredImage: fileSchema.optional(),
  category: z.string().min(1, 'Vyberte kategorii'),
  tags: z.array(z.string()).default([]),
  publishedAt: z.date().optional(),
  seoTitle: z.string().max(60, 'SEO titulek je příliš dlouhý').optional(),
  seoDescription: z.string().max(160, 'SEO popis je příliš dlouhý').optional(),
  readingTime: z.number().min(1).optional(),
})

// Inquiry schemas
export const inquirySchema = z.object({
  name: z.string().min(2, 'Jméno musí mít alespoň 2 znaky').max(50, 'Jméno je příliš dlouhé'),
  email: z.string().email('Neplatný email'),
  phone: z.string().min(9, 'Telefon musí mít alespoň 9 číslic').optional(),
  subject: z.string().min(5, 'Předmět musí mít alespoň 5 znaků').max(100, 'Předmět je příliš dlouhý'),
  message: z.string().min(10, 'Zpráva musí mít alespoň 10 znaků').max(1000, 'Zpráva je příliš dlouhá'),
  propertyId: z.string().optional(),
  status: z.enum(['new', 'in_progress', 'resolved', 'spam'], {
    required_error: 'Vyberte stav poptávky',
  }),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  assignedTo: z.string().optional(),
  notes: z.string().max(500, 'Poznámky jsou příliš dlouhé').optional(),
})

// User schemas
export const userSchema = z.object({
  name: z.string().min(2, 'Jméno musí mít alespoň 2 znaky').max(50, 'Jméno je příliš dlouhé'),
  email: z.string().email('Neplatný email'),
  role: z.enum(['ADMIN', 'MANAGER', 'EMPLOYEE'], {
    required_error: 'Vyberte roli uživatele',
  }),
  phone: z.string().min(9, 'Telefon musí mít alespoň 9 číslic').optional(),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
  avatar: fileSchema.optional(),
  bio: z.string().max(200, 'Bio je příliš dlouhé').optional(),
  permissions: z.array(z.string()).default([]),
})

export const createUserSchema = userSchema.merge(
  z.object({
    password: z.string().min(8, 'Heslo musí mít alespoň 8 znaků')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Heslo musí obsahovat velké i malé písmeno a číslo'),
    confirmPassword: z.string(),
  })
).refine((data) => data.password === data.confirmPassword, {
  message: "Hesla se neshodují",
  path: ["confirmPassword"],
})

export const updateUserSchema = userSchema.partial().merge(
  z.object({
    password: z.string().min(8, 'Heslo musí mít alespoň 8 znaků')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Heslo musí obsahovat velké i malé písmeno a číslo')
      .optional(),
    confirmPassword: z.string().optional(),
  })
).refine((data) => {
  if (data.password && !data.confirmPassword) return false
  if (!data.password && data.confirmPassword) return false
  if (data.password && data.confirmPassword && data.password !== data.confirmPassword) return false
  return true
}, {
  message: "Hesla se neshodují",
  path: ["confirmPassword"],
})

// Settings schemas
export const settingsSchema = z.object({
  siteName: z.string().min(1, 'Název webu je povinný'),
  siteDescription: z.string().max(200, 'Popis je příliš dlouhý').optional(),
  contactEmail: z.string().email('Neplatný email'),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  currency: z.enum(['EUR', 'CZK']).default('EUR'),
  language: z.enum(['cs', 'en']).default('cs'),
  timezone: z.string().default('Europe/Prague'),
  emailNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(false),
  maintenanceMode: z.boolean().default(false),
  analyticsId: z.string().optional(),
  socialLinks: z.object({
    facebook: z.string().url().optional().or(z.literal('')),
    instagram: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
    youtube: z.string().url().optional().or(z.literal('')),
  }).default({}),
})

// Export types
export type PropertyFormData = z.infer<typeof propertySchema>
export type PropertyBasicInfo = z.infer<typeof propertyBasicInfoSchema>
export type PropertyDetails = z.infer<typeof propertyDetailsSchema>
export type PropertyMedia = z.infer<typeof propertyMediaSchema>
export type PropertySeo = z.infer<typeof propertySeoSchema>

export type BlogPostFormData = z.infer<typeof blogPostSchema>
export type InquiryFormData = z.infer<typeof inquirySchema>
export type UserFormData = z.infer<typeof userSchema>
export type CreateUserFormData = z.infer<typeof createUserSchema>
export type UpdateUserFormData = z.infer<typeof updateUserSchema>
export type SettingsFormData = z.infer<typeof settingsSchema> 