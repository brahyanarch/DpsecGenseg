import { randomBytes, createHash } from "crypto";
import { prisma } from "../../../../../shared/database/prisma.client";
import { SecurityContext } from "../../../../../shared/types/security";
import { appError } from "../../../../user/domain/exceptions/app.Error";
import { EmailService, SmtpEmailService } from "../../../../../shared/email/email.service";

const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export class useCreateInvitation {
    constructor(private readonly emailService: EmailService = new SmtpEmailService()) {}

    public async execute(data: unknown, context: SecurityContext) {
        if (context.cTipoRol !== "UNIVERSIDAD" || (context.scope != null && context.scope !== "LOCAL") || !Number.isInteger(context.idOficina) || context.idOficina! <= 0) {
            throw new appError("INVITATION_FORBIDDEN", "Contexto no autorizado", "A verified local UNIVERSIDAD context with a positive office is required", true);
        }
        if (!data || typeof data !== "object" || Array.isArray(data)) {
            throw new appError("INVITATION_INVALID", "Solicitud inválida", "Body must contain cEmail and idRol", true);
        }
        const body = data as Record<string, unknown>;
        if (Object.keys(body).some(key => key !== "cEmail" && key !== "idRol")) {
            throw new appError("INVITATION_INVALID", "Solicitud inválida", "Only cEmail and idRol are accepted", true);
        }
        const cEmail = typeof body.cEmail === "string" ? body.cEmail.trim().toLowerCase() : "";
        const idRol = body.idRol;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cEmail) || !Number.isInteger(idRol) || (idRol as number) <= 0) {
            throw new appError("INVITATION_INVALID", "Email o rol inválido", "A valid cEmail and positive integer idRol are required", true);
        }

        const rawToken = randomBytes(32).toString("base64url");
        const cToken = createHash("sha256").update(rawToken).digest("hex");
        const dExpiresAt = new Date(Date.now() + INVITATION_TTL_MS);
        try {
            const { invitation, roleName, officeName } = await prisma.$transaction(async tx => {
                const [user, role, existing] = await Promise.all([
                    tx.user.findUnique({ where: { cEmail } }),
                    tx.rol.findFirst({ where: { idRol: idRol as number, lActivo: true, lVigente: true, cTipoRol: "UNIVERSIDAD" } }),
                    tx.invitation.findUnique({ where: { cEmail } })
                ]);
                if (user) throw new appError("INVITATION_CONFLICT", "El email ya está registrado", "A user already exists for this email", true);
                if (!role) throw new appError("INVITATION_ROLE_NOT_FOUND", "Rol no disponible", "Role must exist, be active/current, and have type UNIVERSIDAD", true);
                if (existing && !existing.lIsUsed && existing.dExpiresAt > new Date()) {
                    throw new appError("INVITATION_CONFLICT", "Ya existe una invitación pendiente", "A valid pending invitation already exists for this email", true);
                }
                const values = { cToken, idRol: idRol as number, idOficina: context.idOficina!, dExpiresAt, lIsUsed: false };
                const savedInvitation = existing
                    ? tx.invitation.update({ where: { idInvitation: existing.idInvitation }, data: values })
                    : tx.invitation.create({ data: { cEmail, ...values } });
                const persistedInvitation = await savedInvitation;
                const office = await tx.oficina.findUnique({ where: { idOficina: context.idOficina! } });
                return { invitation: persistedInvitation, roleName: role.cNombreRol, officeName: office?.cNombreOficina ?? `Office ${context.idOficina}` };
            });
            try {
                await this.emailService.sendInvitationEmail({ to: invitation.cEmail, invitationId: invitation.idInvitation, roleName, officeName, expiresAt: invitation.dExpiresAt, token: rawToken });
            } catch {
                throw new appError("INVITATION_EMAIL_FAILED", "No se pudo enviar la invitación", "The invitation was saved, but its email could not be sent", true);
            }
            return { idInvitation: invitation.idInvitation, cEmail: invitation.cEmail, idRol: invitation.idRol, idOficina: invitation.idOficina, dExpiresAt: invitation.dExpiresAt, mailSent: true };
        } catch (error) {
            if (error instanceof appError) throw error;
            if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
                throw new appError("INVITATION_CONFLICT", "Ya existe una invitación o usuario para este email", "Unique email conflict", true);
            }
            throw error;
        }
    }
}
