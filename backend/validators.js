import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["owner", "agent"])
});

export const taskCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
});

export const setCreateSchema = z.object({
  name: z.string().min(1),
  max_tasks: z.number().int().min(1),
});

export const setTaskAddSchema = z.object({
  task_id: z.number().int().min(1),
});
