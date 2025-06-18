import * as brevo from "@getbrevo/brevo";

const apiInstance = new brevo.TransactionalEmailsApi();

apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY!
);

export async function sendEmail() {
  const smtpEmail = new brevo.SendSmtpEmail();
  smtpEmail.subject = "Hello, World!";
  smtpEmail.to = [{ email: "davidlarotapilco@gmail.com", name: "Jose Perez" }];
  smtpEmail.htmlContent = "<html><body><h1>Hello, World !</h1></body></html>";
  smtpEmail.sender = { name: "David brahyanS", email: "brahyanarch@gmail.com" };

  await apiInstance.sendTransacEmail(smtpEmail);
}


class EmailService {
  private apiInstance: brevo.TransactionalEmailsApi;
  private defaultSender: { name: string; email: string };

  constructor(apiKey: string, defaultSender: { name: string; email: string }) {
    this.apiInstance = new brevo.TransactionalEmailsApi();
    this.apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);
    this.defaultSender = defaultSender;
  }

  async sendEmail(options: {
    subject: string;
    to: { email: string; name?: string }[];
    htmlContent: string;
    sender?: { email: string; name?: string };
  }): Promise<void> {
    const smtpEmail = new brevo.SendSmtpEmail();
    
    smtpEmail.subject = options.subject;
    smtpEmail.to = options.to;
    smtpEmail.htmlContent = options.htmlContent;
    smtpEmail.sender = options.sender || this.defaultSender;

    try {
      await this.apiInstance.sendTransacEmail(smtpEmail);
      console.log(`Email sent to ${options.to.map(r => r.email).join(', ')}`);
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error('Failed to send email');
    }
  }
}


const emailServiceDavid = new EmailService(
  process.env.BREVO_API_KEY!, // API Key desde variables de entorno
  { 
    name: "David Brahyan Larota Pilco", 
    email: "brahyanarch@gmail.com" 
  }
);

export default emailServiceDavid;