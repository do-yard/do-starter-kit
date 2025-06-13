import * as React from 'react';
import { Html, Head, Preview, Section, Text, Container, Hr } from '@react-email/components';

interface SubscriptionUpdatedEmailProps {
  plan: string;
  currentPlan?: {
    name: string;
    description: string;
    amount: number;
    interval: string | null;
    features: string[];
    priceId: string;
  };
}

/**
 * SubscriptionUpdatedEmail React email template.
 * Renders a transactional email for notifying users about subscription plan updates.
 * Uses @react-email/components for compatibility with email clients.
 */
export function SubscriptionUpdatedEmail({ plan, currentPlan }: SubscriptionUpdatedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your subscription was updated</Preview>
      <Section style={{ background: '#0061EB', padding: '32px 0' }}>
        <Text style={{ color: '#fff', fontSize: '24px', textAlign: 'center', margin: 0 }}>
          DO Starter Kit - Your subscription was updated
        </Text>
      </Section>
      <Container
        style={{
          background: '#fff',
          borderRadius: 8,
          maxWidth: 480,
          margin: '32px auto',
          padding: 0,
        }}
      >
        <Section style={{ padding: '32px 24px' }}>
          <Text style={{ textAlign: 'center', margin: '0 0 24px 0' }}>
            Your subscription plan was updated to <b>{plan}</b> plan.
            <br />
            Thank you for using our service!
          </Text>
          {currentPlan && (
            <Section
              style={{
                background: '#f4f8ff',
                border: '1px solid #dbeafe',
                borderRadius: 8,
                margin: '24px 0',
                padding: 16,
              }}
            >
              <Text
                style={{ color: '#0061EB', fontWeight: 'bold', fontSize: 18, margin: '0 0 12px 0' }}
              >
                Plan Details
              </Text>
              <Text>
                <b>Name:</b> {currentPlan.name}
              </Text>
              <Text>
                <b>Description:</b> {currentPlan.description}
              </Text>
              <Text>
                <b>Price:</b> ${currentPlan.amount} / {currentPlan.interval ?? 'one-time'}
              </Text>
              <Text>
                <b>Features:</b>
              </Text>
              <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                {currentPlan.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
              <Text style={{ fontSize: 12, color: '#888' }}>Price ID: {currentPlan.priceId}</Text>
            </Section>
          )}
        </Section>
      </Container>
      <Hr />
    </Html>
  );
}
