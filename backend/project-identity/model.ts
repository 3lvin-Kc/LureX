import { z } from 'zod';

// Defines the core purpose, domain, and type of the project.
const CoreDefinitionSchema = z.object({
  purpose: z.string().min(1),
  domain: z.string().min(1),
  type: z.string().min(1),
});

// Defines the scope of the project, including what is explicitly included and excluded.
const ScopeSchema = z.object({
  included: z.array(z.string()),
  excluded: z.array(z.string()),
  boundary_principles: z.string(),
});

// Defines the scale of the project in terms of user base, data volume, and sophistication.
const ScaleSchema = z.object({
  user_base: z.string(),
  data_volume: z.string(),
  sophistication_level: z.string(),
});

// Defines the architectural principles, patterns, and constraints of the project.
const ArchitectureSchema = z.object({
  philosophy: z.string(),
  patterns: z.array(z.string()),
  constraints: z.array(z.string()),
});

// Defines the potential evolution paths for the project.
const EvolutionSchema = z.object({
  likely_next: z.array(z.string()),
  possible_later: z.array(z.string()),
  unlikely_ever: z.array(z.string()),
});

// Defines the technical foundation of the project, limited to a Flutter-based UI platform.
const TechnicalFoundationSchema = z.object({
  stack: z.literal('Flutter'),
  structure: z.string(),
  state_management: z.string(),
});

// The main Project Identity schema, which is immutable and serves as the authoritative definition of the project.
export const ProjectIdentitySchema = z.object({
  identity_id: z.string().uuid(),
  project_id: z.string().uuid().nullable(),
  core_definition: CoreDefinitionSchema,
  characteristics: z.array(z.string()),
  scope: ScopeSchema,
  scale: ScaleSchema,
  architecture: ArchitectureSchema,
  evolution: EvolutionSchema,
  technical_foundation: TechnicalFoundationSchema,
  created_at: z.date(),
  immutable: z.literal(true),
});

export type ProjectIdentity = z.infer<typeof ProjectIdentitySchema>;