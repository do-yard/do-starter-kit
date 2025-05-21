"use client";

import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress
} from "@mui/material";

const PublicPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ path: string; url: string } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadError(null);
      setUploadResult(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setUploadError("Please select a file first");
      return;
    }
    try {
      setUploading(true);
      setUploadError(null);
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/file", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }
      setUploadResult(result);
    } catch (err) {
      if (err instanceof Error) {
        setUploadError(err.message);
      } else {
        setUploadError("Failed to upload file");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box minHeight="100vh" display="flex" flexDirection="column" alignItems="center" justifyContent="center" bgcolor="grey.100" p={6}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, width: '100%', maxWidth: 400, textAlign: 'center', mb: 4 }}>
        <Typography variant="h1" sx={{ fontSize: '2rem', fontWeight: 700, mb: 2, color: 'text.primary' }}>
          Public Example
        </Typography>
      </Paper>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, width: '100%', maxWidth: 400 }}>
        <Typography variant="h2" sx={{ fontSize: '1.25rem', fontWeight: 600, mb: 2, color: 'text.primary' }}>
          File Upload
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box display="flex" flexDirection="column" alignItems="flex-start">
            <label htmlFor="file">
              <Typography variant="body2" color="text.secondary" mb={1}>
                Select a file to upload:
              </Typography>
            </label>
            <Button
              variant="outlined"
              component="label"
              sx={{ width: '100%', justifyContent: 'flex-start' }}
            >
              {file ? file.name : "Choose File"}
              <input
                type="file"
                id="file"
                hidden
                onChange={handleFileChange}
              />
            </Button>
          </Box>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={uploading || !file}
            sx={{ width: '100%', fontWeight: 600, minHeight: 40 }}
            startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {uploading ? "Uploading..." : "Upload File"}
          </Button>
        </Box>
        {uploadError && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {uploadError}
          </Alert>
        )}
        {uploadResult && (
          <Alert severity="success" sx={{ mt: 3 }}>
            <Typography variant="body2" fontWeight={600} color="success.main">
              Upload successful!
            </Typography>
            <Box mt={1} fontSize="0.85rem" color="text.secondary">
              <div><span style={{ fontWeight: 500 }}>Path:</span> {uploadResult.path}</div>
              <div style={{ marginTop: 4 }}>
                <span style={{ fontWeight: 500 }}>URL:</span>{' '}
                <a
                  href={uploadResult.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#2563eb', wordBreak: 'break-all', textDecoration: 'underline' }}
                >
                  {uploadResult.url}
                </a>
              </div>
            </Box>
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default PublicPage;