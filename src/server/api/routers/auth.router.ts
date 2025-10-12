import { z } from "zod";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc";
import { users } from "~/server/db/schema";

export const authRouter = createTRPCRouter({
  /**
   * Registrar un nuevo usuario
   */
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "El nombre es requerido"),
        email: z.string().email("Email inválido"),
        password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verificar si el email ya existe
      const existingUser = await ctx.db.query.users.findFirst({
        where: eq(users.email, input.email),
      });

      if (existingUser) {
        throw new Error("El email ya está registrado");
      }

      // Hashear password
      const hashedPassword = await bcrypt.hash(input.password, 10);

      // Crear usuario
      const [newUser] = await ctx.db
        .insert(users)
        .values({
          name: input.name,
          email: input.email,
          password: hashedPassword,
        })
        .returning();

      // Retornar usuario sin password
      return {
        id: newUser!.id,
        name: newUser!.name,
        email: newUser!.email,
      };
    }),

  /**
   * Cambiar contraseña (requiere autenticación)
   */
  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Buscar usuario autenticado
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, ctx.session.user.id),
      });

      if (!user || !user.password) {
        throw new Error("Usuario no encontrado");
      }

      // Verificar contraseña actual
      const isValidPassword = await bcrypt.compare(
        input.currentPassword,
        user.password,
      );

      if (!isValidPassword) {
        throw new Error("Contraseña actual incorrecta");
      }

      // Hashear nueva contraseña
      const hashedPassword = await bcrypt.hash(input.newPassword, 10);

      // Actualizar contraseña
      await ctx.db
        .update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, user.id));

      return { success: true };
    }),
});
