
import React from 'react';

// This component provides guidance on setting up your EmailJS template
// It contains sample HTML that you can copy into your EmailJS dashboard

const EmailJSTemplateGuide: React.FC = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">EmailJS Template Guide</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">Required Template Variables:</h3>
        <ul className="list-disc pl-5 space-y-1 text-gray-700">
          <li><strong>from_name</strong>: Sender's name (e.g., "Recruitment Team")</li>
          <li><strong>from_email</strong>: Sender's email address</li>
          <li><strong>to_name</strong>: Candidate's name</li>
          <li><strong>to_email</strong>: Candidate's email address</li>
          <li><strong>reply_to</strong>: Email address for replies</li>
          <li><strong>subject</strong>: Email subject line</li>
          <li><strong>content</strong>: Main email content (HTML supported)</li>
          <li><strong>cc</strong>: Carbon copy email addresses (if any)</li>
          <li><strong>bcc</strong>: Blind carbon copy email addresses (if any)</li>
        </ul>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">How to Set Up Your Template:</h3>
        <ol className="list-decimal pl-5 space-y-2 text-gray-700">
          <li>Log in to your EmailJS dashboard</li>
          <li>Navigate to Email Templates section</li>
          <li>Create a new template or edit the existing one (template_mdj1x5f)</li>
          <li>Copy and paste the HTML template below</li>
          <li>Save your template</li>
          <li>Make sure the template ID matches what's in your code (template_mdj1x5f)</li>
        </ol>
      </div>

      <div className="bg-gray-50 p-4 rounded border border-gray-200 mb-6 overflow-auto">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">HTML Email Template:</h3>
        <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-4 rounded">
{`<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{subject}}</title>
    <style type="text/css">
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #f8fafc;
            padding: 20px;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background-color: #ffffff;
            padding: 20px;
            border-left: 1px solid #e2e8f0;
            border-right: 1px solid #e2e8f0;
        }
        .interview-details {
            background-color: #f8fafc;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 20px;
            border: 1px solid #e2e8f0;
        }
        .footer {
            background-color: #f8fafc;
            padding: 15px;
            border-radius: 0 0 8px 8px;
            font-size: 14px;
            color: #64748b;
            text-align: center;
            border: 1px solid #e2e8f0;
        }
        h1, h2, h3 {
            color: #4f46e5;
        }
        ul {
            padding-left: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Interview Confirmation</h2>
        </div>
        <div class="content">
            <p>Hello {{to_name}},</p>
            <p>Your interview for the <strong>{{position}}</strong> position at <strong>{{client_name}}</strong> has been confirmed.</p>
            
            <div class="interview-details">
                <p><strong>Interview Details:</strong></p>
                <ul>
                    <li><strong>Date:</strong> {{interview_date}}</li>
                    <li><strong>Time:</strong> {{interview_time}}</li>
                    <li><strong>Mode:</strong> {{interview_mode}}</li>
                </ul>
            </div>
            
            <p>Please make sure to be prepared and available at the scheduled time.</p>
            <p>If you need to reschedule or have any questions, please contact {{recruiter_name}} at {{contact_info}}.</p>
            
            <p>{{content}}</p>
            
            <p>Best regards,<br>{{from_name}}</p>
        </div>
        <div class="footer">
            <p>This is an automated confirmation email. Please do not reply directly to this email.</p>
        </div>
    </div>
</body>
</html>`}
        </pre>
      </div>

      <div className="bg-blue-50 p-4 rounded border border-blue-200">
        <h3 className="text-lg font-semibold mb-2 text-blue-800">Mapping Fields from Image to Template Variables:</h3>
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left p-2 bg-blue-100">Form Field (Image)</th>
              <th className="text-left p-2 bg-blue-100">Template Variable</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border-b">Subject</td>
              <td className="p-2 border-b"><code>{"{{subject}}"}</code></td>
            </tr>
            <tr>
              <td className="p-2 border-b">To Email</td>
              <td className="p-2 border-b"><code>{"{{to_email}}"}</code></td>
            </tr>
            <tr>
              <td className="p-2 border-b">From Name</td>
              <td className="p-2 border-b"><code>{"{{from_name}}"}</code></td>
            </tr>
            <tr>
              <td className="p-2 border-b">From Email</td>
              <td className="p-2 border-b"><code>{"{{from_email}}"}</code></td>
            </tr>
            <tr>
              <td className="p-2 border-b">Reply To</td>
              <td className="p-2 border-b"><code>{"{{reply_to}}"}</code></td>
            </tr>
            <tr>
              <td className="p-2 border-b">Content</td>
              <td className="p-2 border-b"><code>{"{{content}}"}</code></td>
            </tr>
            <tr>
              <td className="p-2 border-b">CC</td>
              <td className="p-2 border-b"><code>{"{{cc}}"}</code></td>
            </tr>
            <tr>
              <td className="p-2 border-b">BCC</td>
              <td className="p-2 border-b"><code>{"{{bcc}}"}</code></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmailJSTemplateGuide;
