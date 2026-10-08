import React, { useState } from "react";
import { OfferEmailPayload } from "./recruiter-shortlist";

interface OfferSentModalProps {
  payload: OfferEmailPayload | null;
  close: () => void;
}

export function OfferSentModal({ payload, close }: OfferSentModalProps) {
  const [copied, setCopied] = useState(false);

  if (!payload) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(payload.body).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "680px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
          overflow: "hidden",
          animation: "modalSlideIn 0.2s ease-out",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
            color: "#ffffff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span
                style={{
                  background: "#10b981",
                  color: "#ffffff",
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "3px 8px",
                  borderRadius: "6px",
                  letterSpacing: "0.05em",
                }}
              >
                ✓ EMAIL CLIENT REDIRECTED
              </span>
              <span style={{ fontSize: "12px", color: "#c7d2fe" }}>Employment Job Offer</span>
            </div>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#ffffff" }}>
              Offer Sent for {payload.candidateName}
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#e0e7ff" }}>
              Redirected to your email client to send official employment notice to{" "}
              <strong style={{ color: "#a5f3fc" }}>{payload.targetEmail}</strong>
            </p>
          </div>
          <button
            onClick={close}
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              border: "none",
              color: "#ffffff",
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "18px",
              display: "grid",
              placeItems: "center",
            }}
          >
            ×
          </button>
        </div>

        {/* Content Details */}
        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <div style={{ background: "#f8fafc", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "11px", color: "#64748b", display: "block", textTransform: "uppercase", fontWeight: 700 }}>Recipient (Recruiter Email)</span>
              <strong style={{ fontSize: "13px", color: "#0f172a" }}>{payload.targetEmail}</strong>
            </div>
            <div style={{ background: "#f8fafc", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "11px", color: "#64748b", display: "block", textTransform: "uppercase", fontWeight: 700 }}>Candidate Email</span>
              <strong style={{ fontSize: "13px", color: "#0f172a" }}>{payload.candidateEmail}</strong>
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <span style={{ fontSize: "11px", color: "#64748b", display: "block", textTransform: "uppercase", fontWeight: 700, marginBottom: "4px" }}>
              Subject Line
            </span>
            <div style={{ padding: "10px 14px", background: "#f1f5f9", borderRadius: "8px", fontSize: "13px", fontWeight: 600, color: "#1e293b", border: "1px solid #cbd5e1" }}>
              {payload.subject}
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>
                Message Content (Recruited as Employee)
              </span>
              <button
                onClick={handleCopy}
                style={{
                  background: copied ? "#10b981" : "#f1f5f9",
                  color: copied ? "#ffffff" : "#475569",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  padding: "4px 10px",
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {copied ? "✓ Copied to Clipboard" : "📋 Copy Message"}
              </button>
            </div>
            <pre
              style={{
                background: "#0f172a",
                color: "#e2e8f0",
                padding: "16px",
                borderRadius: "10px",
                fontSize: "12px",
                lineHeight: "1.55",
                whiteSpace: "pre-wrap",
                maxHeight: "220px",
                overflowY: "auto",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                margin: 0,
              }}
            >
              {payload.body}
            </pre>
          </div>
        </div>

        {/* Action Footer */}
        <div
          style={{
            padding: "16px 24px",
            background: "#f8fafc",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ fontSize: "12px", color: "#64748b" }}>
            Didn't launch? Click below to open directly in Gmail web:
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <a
              href={payload.gmailUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "#dc2626",
                color: "#ffffff",
                padding: "9px 16px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                textDecoration: "none",
                boxShadow: "0 2px 4px rgba(220, 38, 38, 0.25)",
              }}
            >
              <span>✉️ Open in Gmail Web</span>
            </a>
            <button
              onClick={close}
              style={{
                background: "#334155",
                color: "#ffffff",
                border: "none",
                padding: "9px 18px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
