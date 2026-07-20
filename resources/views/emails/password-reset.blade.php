<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Request</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #0b1026 0%, #312e81 45%, #6366f1 100%);
            color: #ffffff;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .header p {
            margin: 5px 0 0;
            font-size: 14px;
            opacity: 0.9;
        }
        .content {
            padding: 30px 40px;
        }
        .content h2 {
            color: #312e81;
            font-size: 20px;
            margin-top: 0;
        }
        .content p {
            margin: 15px 0;
            color: #555;
        }
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        .reset-button {
            display: inline-block;
            padding: 14px 32px;
            background-color: #6366f1;
            color: #ffffff;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            transition: background-color 0.3s ease;
        }
        .reset-button:hover {
            background-color: #4f46e5;
        }
        .info-box {
            background-color: #f8f9fa;
            border-left: 4px solid #6366f1;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .info-box p {
            margin: 0;
            font-size: 14px;
            color: #666;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 13px;
            color: #777;
            border-top: 1px solid #e0e0e0;
        }
        .footer p {
            margin: 5px 0;
        }
        .link-text {
            word-break: break-all;
            color: #6366f1;
            font-size: 13px;
            margin-top: 20px;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>FLMS v2.0</h1>
            <p>FOREIGN LEAVE MANAGEMENT SYSTEM</p>
        </div>
        
        <div class="content">
            <h2>Password Reset Request</h2>
            
            <p>Hello <strong>{{ $user->full_name }}</strong>,</p>
            
            <p>We received a request to reset the password for your account. If you made this request, please click the button below to reset your password:</p>
            
            <div class="button-container">
                <a href="{{ $resetLink }}" class="reset-button">Reset Password</a>
            </div>
            
            <div class="info-box">
                <p><strong>⏱️ Important:</strong> This password reset link will expire in <strong>{{ $expireMinutes }} minutes</strong>.</p>
            </div>
            
            <p>If the button above doesn't work, you can copy and paste the following link into your web browser:</p>
            
            <div class="link-text">
                {{ $resetLink }}
            </div>
            
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
                <strong>Security Tip:</strong> If you didn't request this password reset, please ignore this email or contact your system administrator immediately. Your password will remain unchanged.
            </p>
        </div>
        
        <div class="footer">
            <p><strong>PM Office | Sri Lanka</strong></p>
            <p>© {{ date('Y') }} Prime Minister's Office. All rights reserved.</p>
            <p style="font-size: 12px; color: #999; margin-top: 10px;">
                This is an automated message. Please do not reply to this email.
            </p>
        </div>
    </div>
</body>
</html>
