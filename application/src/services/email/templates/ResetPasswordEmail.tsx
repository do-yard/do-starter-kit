import * as React from 'react';
import { EmailLayout } from './EmailLayout';
import { Button, Text, Section, Container, Link } from '@react-email/components';

interface ResetPasswordEmailProps {
  resetUrl: string;
  userEmail: string;
}

/**
 * ResetPasswordEmail renders a password reset email using react-email components.
 * The content includes a button and a fallback link for users to reset their password.
 */
export const ResetPasswordEmail: React.FC<ResetPasswordEmailProps> = ({ resetUrl, userEmail }) => (
  <EmailLayout title="Password Reset Request">
    <Container
      style={{
        background: '#fff',
        borderRadius: 8,
        maxWidth: 480,
        margin: '32px auto',
        padding: 0,
        textAlign: 'center', // Center all content
      }}
    >
      <Section style={{ textAlign: 'center' }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' }}>
          Password Reset Request
        </Text>
        <Text style={{ textAlign: 'center' }}>
          We received a request to reset the password for your account (<b>{userEmail}</b>).
        </Text>
        <Button
          href={resetUrl}
          style={{
            background: '#0070f3',
            color: '#fff',
            borderRadius: 8,
            padding: '10px 20px',
            fontWeight: 'bold',
            textDecoration: 'none',
            margin: '20px 0',
            display: 'inline-block',
            textAlign: 'center',
          }}
        >
          Reset Password
        </Button>
        <Text style={{ textAlign: 'center' }}>
          If you did not request this, you can safely ignore this email.
        </Text>
        <Text style={{ textAlign: 'center' }}>
          This link will expire in 1 hour for your security.
        </Text>
        <Text style={{ fontSize: 14, color: '#555', margin: '32px 0 0 0', textAlign: 'center' }}>
          If the button above does not work, copy and paste the following link into your browser:
        </Text>
        <Text
          style={{
            wordBreak: 'break-all',
            color: '#0070f3',
            fontSize: 14,
            textAlign: 'center',
            paddingTop: 0,
            marginTop: 0,
          }}
        >
          <Link href={resetUrl}>{resetUrl}</Link>
        </Text>
      </Section>
    </Container>
  </EmailLayout>
);
