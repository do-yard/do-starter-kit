"use client";

import { useState, useTransition } from "react";
import { Typography, Box } from "@mui/material";
import { EmailClient } from "lib/api/email";
import Button from "@mui/material/Button";

/**
 * DashboardPageClient renders the dashboard UI and allows the user to send a test email to themselves.
 * @param userEmail - The email address of the logged-in user.
 */
export default function DashboardPageClient({ userEmail }: { userEmail: string }) {
  const [sending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendEmail = () => {
    setError(null);
    setSent(false);
    startTransition(async () => {
      try {
        const api = new EmailClient();
        await api.testEmail(userEmail);
        setSent(true);
      } catch (e) {
        setError((e as Error).message || "Failed to send email");
      }
    });
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="80vh"
    >
      <Typography variant="h4">Welcome back, {userEmail}!</Typography>
      <Button
        variant="contained"
        sx={{ mt: 4, minWidth: 200 }}
        disabled={sending}
        onClick={handleSendEmail}
      >
        {sending ? "Sending..." : "Send Test Email"}
      </Button>
      {sent && (
        <Typography color="success.main" sx={{ mt: 2 }}>
          Email sent!
        </Typography>
      )}
      {error && (
        <Typography color="error.main" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}
