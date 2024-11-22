export const PrintStyles = () => {
  return (
    <style>
      {`
        @media print {
          body {
            background: white !important;
            color: black !important;
            font-size: 10pt !important;
            line-height: 1.2 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          .worksheet-content {
            margin: 0 !important;
            padding: 0.25in !important;
            max-width: 100% !important;
          }
          .worksheet-content h1 {
            font-size: 14pt !important;
            margin-bottom: 0.2in !important;
          }
          .worksheet-content h3 {
            font-size: 11pt !important;
            margin-bottom: 0.1in !important;
            margin-top: 0.1in !important;
          }
          .question {
            break-inside: avoid;
            margin-bottom: 0.15in !important;
          }
          .questions {
            margin-top: 0.15in !important;
          }
          .answer-key {
            margin-top: 0.15in !important;
            padding-top: 0.15in !important;
          }
          .reading-passage {
            font-size: 9pt !important;
            margin-bottom: 0.15in !important;
          }
          .options {
            margin-left: 0.15in !important;
            margin-top: 0.05in !important;
          }
          .short-answer-space {
            height: 0.5in !important;
          }
          @page {
            size: letter;
            margin: 0.25in;
          }
        }
      `}
    </style>
  );
};
