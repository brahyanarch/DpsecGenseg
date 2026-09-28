import nodemailer, { Transporter } from "nodemailer";

export interface InvitationEmail {
    to: string;
    invitationId: number;
    roleName: string;
    officeName: string;
    expiresAt: Date;
    token: string;
}

export interface EmailService {
    sendInvitationEmail(invitation: InvitationEmail): Promise<void>;
}

function requiredEnv(name: string): string {
    const value = process.env[name]?.trim();
    if (!value) throw new Error(`Missing required email configuration: ${name}`);
    return value;
}

function createTransport(): Transporter {
    const host = requiredEnv("SMTP_HOST");
    const portValue = requiredEnv("SMTP_PORT");
    const port = Number(portValue);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error("Invalid email configuration: SMTP_PORT must be a valid port number");
    }

    const secureValue = requiredEnv("SMTP_SECURE").toLowerCase();
    if (secureValue !== "true" && secureValue !== "false") {
        throw new Error("Invalid email configuration: SMTP_SECURE must be true or false");
    }

    return nodemailer.createTransport({
        host,
        port,
        secure: secureValue === "true",
        auth: { user: requiredEnv("SMTP_USER"), pass: requiredEnv("SMTP_PASSWORD") }
    });
}

export class SmtpEmailService implements EmailService {
    async sendInvitationEmail(invitation: InvitationEmail): Promise<void> {
        const from = requiredEnv("SMTP_FROM");
        const acceptanceUrl = requiredEnv("INVITATION_ACCEPT_URL");
        let url: URL;
        try {
            url = new URL(acceptanceUrl);
        } catch {
            throw new Error("Invalid email configuration: INVITATION_ACCEPT_URL must be an absolute URL");
        }
        url.searchParams.set("token", invitation.token);

        const transporter = createTransport();
        try {
            await transporter.sendMail({
                from,
                to: invitation.to,
                subject: "You are invited",
                text: [
                    "You have been invited to join the platform.",
                    `Invitation reference: ${invitation.invitationId}`,
                    `Role: ${invitation.roleName}`,
                    `Office: ${invitation.officeName}`,
                    `This invitation expires at ${invitation.expiresAt.toISOString()}.`,
                    `Accept your invitation: ${url.toString()}`
                ].join("\n\n"),
                html: `<p>You have been invited to join the platform.</p><p>Invitation reference: ${invitation.invitationId}</p><p>Role: ${escapeHtml(invitation.roleName)}<br>Office: ${escapeHtml(invitation.officeName)}</p><p>This invitation expires at ${invitation.expiresAt.toISOString()}.</p><p><a href="${escapeHtml(url.toString())}">Accept your invitation</a></p>`
            });
        } catch (error: unknown) {
            const diagnostic = error as { code?: unknown; responseCode?: unknown; command?: unknown };
            console.error("Invitation email SMTP delivery failed", {
                code: diagnostic?.code,
                responseCode: diagnostic?.responseCode,
                command: diagnostic?.command
            });
            throw new Error("Invitation email delivery failed");
        }
    }
}

function escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, character => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
    })[character]!);
}
