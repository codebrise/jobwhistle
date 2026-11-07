import type { NotificationEvent } from '@jobwhistle/contracts';
import type { NotificationProvider, NotificationResult } from './types';
import { brandConfig, brandColors } from '@jobwhistle/config';

export class EmailNotificationProvider implements NotificationProvider {
  id = 'email';

  constructor(
    private apiKey?: string,
    private fromEmail = 'Jobwhistle <alerts@jobwhistle.codebrise.com>'
  ) {}

  validateDestination(destination: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(destination);
  }

  async send(
    event: NotificationEvent,
    destination: string
  ): Promise<NotificationResult> {
    if (!this.validateDestination(destination)) {
      return { success: false, errorMessage: 'Invalid recipient email address' };
    }

    const isRecovery =
      event.eventType === 'monitor.up' || event.eventType === 'heartbeat.recovered';
    const statusText = isRecovery ? 'RECOVERED' : 'INCIDENT DOWN';
    const statusColor = isRecovery ? brandColors.status.up : brandColors.status.down;
    const subject = `[${statusText}] ${event.targetName} (${event.targetType})`;

    const html = this.renderHtmlTemplate({
      event,
      isRecovery,
      statusText,
      statusColor,
    });
    const text = this.renderPlainTextTemplate({
      event,
      isRecovery,
      statusText,
    });

    if (!this.apiKey) {
      // In development or when API key is not yet configured, log and return simulated success
      console.log(`[EmailNotification Simulated] To: ${destination} | Subject: ${subject}`);
      return {
        success: true,
        messageId: `simulated_${Date.now()}`,
      };
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: [destination],
          subject,
          html,
          text,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        return {
          success: false,
          errorMessage: `Resend API error (${response.status}): ${errorData}`,
        };
      }

      const resData = (await response.json()) as { id?: string };
      return {
        success: true,
        messageId: resData.id,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        errorMessage: `Email delivery failed: ${message}`,
      };
    }
  }

  private renderHtmlTemplate(opts: {
    event: NotificationEvent;
    isRecovery: boolean;
    statusText: string;
    statusColor: string;
  }): string {
    const { event, isRecovery, statusText, statusColor } = opts;
    const dashboardLink = `${brandConfig.appUrl}/app/incidents/${event.incidentId}`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${statusText}: ${event.targetName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0D1515; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #EAF0EC;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0D1515; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #131E1E; border-radius: 12px; border: 1px solid #2C3936; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 24px 32px; background-color: #142522; border-bottom: 1px solid #2C3936;">
              <span style="font-size: 20px; font-weight: 800; color: #C8F169; letter-spacing: -0.02em;">Job<span style="font-weight: 500; color: #FFFFFF;">whistle</span></span>
              <span style="font-size: 10px; font-weight: 700; color: #A9C5B1; letter-spacing: 0.25em; margin-left: 8px;">BY CODEBRISE</span>
            </td>
          </tr>
          
          <!-- Status Banner -->
          <tr>
            <td style="padding: 24px 32px 12px 32px;">
              <div style="display: inline-block; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; background-color: ${statusColor}22; color: ${statusColor}; border: 1px solid ${statusColor}44;">
                ${statusText}
              </div>
              <h1 style="margin: 16px 0 8px 0; font-size: 22px; font-weight: 700; color: #FFFFFF;">
                ${event.targetName}
              </h1>
              <p style="margin: 0; font-size: 14px; color: #A0ADA7;">
                ${isRecovery ? 'Service has resumed normal operation.' : 'Service degradation or disruption confirmed.'}
              </p>
            </td>
          </tr>

          <!-- Incident Details Box -->
          <tr>
            <td style="padding: 12px 32px 24px 32px;">
              <table width="100%" cellpadding="10" cellspacing="0" style="background-color: #1C2928; border-radius: 8px; font-size: 13px;">
                <tr>
                  <td width="30%" style="color: #A0ADA7; border-bottom: 1px solid #2C3936;">Target:</td>
                  <td style="color: #FFFFFF; font-family: monospace; border-bottom: 1px solid #2C3936;">${event.targetEndpoint}</td>
                </tr>
                <tr>
                  <td style="color: #A0ADA7; border-bottom: 1px solid #2C3936;">Timestamp:</td>
                  <td style="color: #FFFFFF; font-family: monospace; border-bottom: 1px solid #2C3936;">${event.timestamp}</td>
                </tr>
                <tr>
                  <td style="color: #A0ADA7;">Details / Reason:</td>
                  <td style="color: ${statusColor}; font-weight: 600;">${event.reason}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Action Button -->
          <tr>
            <td style="padding: 0 32px 32px 32px;" align="left">
              <a href="${dashboardLink}" style="display: inline-block; padding: 12px 24px; background-color: #C8F169; color: #142522; font-weight: 700; font-size: 14px; text-decoration: none; border-radius: 8px;">
                View Incident in Jobwhistle &rarr;
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #0D1515; border-top: 1px solid #2C3936; font-size: 12px; color: #687670;">
              Jobwhistle by CodeBrise &bull; Know when something goes quiet.<br>
              You received this automated alert because your workspace is configured for notification delivery.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  private renderPlainTextTemplate(opts: {
    event: NotificationEvent;
    isRecovery: boolean;
    statusText: string;
  }): string {
    const { event, isRecovery, statusText } = opts;
    return `[Jobwhistle Alert - ${statusText}]

Target: ${event.targetName} (${event.targetType})
Endpoint: ${event.targetEndpoint}
Timestamp: ${event.timestamp}
Reason: ${event.reason}
Status: ${isRecovery ? 'Operational / Recovered' : 'Down / Incident Open'}

View full incident timeline:
${brandConfig.appUrl}/app/incidents/${event.incidentId}

--
Jobwhistle by CodeBrise
Know when something goes quiet.
`;
  }
}

