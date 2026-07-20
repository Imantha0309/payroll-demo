<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>PMO-FLMS | Welcome</title>

        <!-- Fonts -->
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">

        <style>
            :root {
                --primary: #2563eb;
                --primary-hover: #1d4ed8;
                --bg: #f8fafc;
                --text: #0f172a;
                --card-bg: #ffffff;
            }

            @media (prefers-color-scheme: dark) {
                :root {
                    --bg: #0f172a;
                    --text: #f8fafc;
                    --card-bg: #1e293b;
                }
            }

            body {
                font-family: 'Inter', sans-serif;
                background-color: var(--bg);
                color: var(--text);
                margin: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                overflow: hidden;
            }

            .container {
                text-align: center;
                padding: 2rem;
                max-width: 600px;
                width: 100%;
            }

            .card {
                background: var(--card-bg);
                padding: 3rem;
                border-radius: 1.5rem;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
                border: 1px solid rgba(226, 232, 240, 0.1);
                backdrop-filter: blur(10px);
                animation: fadeInUp 0.8s ease-out forwards;
                transition: transform 0.3s ease, box-shadow 0.3s ease;
                position: relative;
                overflow: hidden;
            }

            .card:hover {
                transform: translateY(-5px);
                box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.15);
            }

            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .logo-img {
                height: 100px;
                width: auto;
                margin-bottom: 1.5rem;
                object-fit: contain;
            }

            .logo {
                font-size: 2.5rem;
                font-weight: 800;
                margin-bottom: 1rem;
                background: linear-gradient(to right, #2563eb, #7c3aed);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            .title {
                font-size: 1.5rem;
                font-weight: 600;
                margin-bottom: 0.5rem;
            }

            .subtitle {
                color: #64748b;
                margin-bottom: 2.5rem;
                line-height: 1.6;
            }

            .btn {
                display: inline-block;
                background-color: var(--primary);
                color: white;
                padding: 1rem 2.5rem;
                border-radius: 0.75rem;
                font-weight: 600;
                text-decoration: none;
                transition: all 0.2s ease;
                box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
            }

            .btn:hover {
                background-color: var(--primary-hover);
                transform: translateY(-2px);
                box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);
            }

            .footer {
                margin-top: 2rem;
                font-size: 0.875rem;
                color: #64748b;
            }

            /* Decorative Background */
            .blob {
                position: absolute;
                width: 500px;
                height: 500px;
                background: radial-gradient(circle, rgba(37, 99, 235, 0.1) 0%, rgba(255, 255, 255, 0) 70%);
                z-index: -1;
                filter: blur(40px);
                animation: float 20s infinite alternate ease-in-out;
            }

            .blob-1 { top: -100px; right: -100px; }
            .blob-2 { bottom: -100px; left: -100px; animation-delay: -5s; }

            @keyframes float {
                0% { transform: translate(0, 0) scale(1); }
                33% { transform: translate(30px, -50px) scale(1.1); }
                66% { transform: translate(-20px, 20px) scale(0.9); }
                100% { transform: translate(0, 0) scale(1); }
            }
            /* Water Wave Animation */
            .waves {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 60px;
                min-height: 60px;
                max-height: 60px;
                z-index: 0;
                pointer-events: none;
            }

            .parallax > use {
                animation: move-forever 25s cubic-bezier(.55,.5,.45,.5) infinite;
            }
            .parallax > use:nth-child(1) {
                animation-delay: -2s;
                animation-duration: 7s;
            }
            .parallax > use:nth-child(2) {
                animation-delay: -3s;
                animation-duration: 10s;
            }
            .parallax > use:nth-child(3) {
                animation-delay: -4s;
                animation-duration: 13s;
            }
            .parallax > use:nth-child(4) {
                animation-delay: -5s;
                animation-duration: 20s;
            }

            @keyframes move-forever {
                0% { transform: translate3d(-90px,0,0); }
                100% { transform: translate3d(85px,0,0); }
            }

            @media (max-width: 768px) {
                .waves {
                    height: 40px;
                    min-height: 40px;
                }
            }
        </style>
    </head>
    <body>
        <div class="blob blob-1"></div>
        <div class="blob blob-2"></div>

        <div class="container">
            <div class="card">
                <img src="{{ asset('images/logo.png') }}" alt="Logo" class="logo-img">
                <div class="logo">PMO-FLMS</div>
                <h1 class="title">Welcome to the Foreign Leave Management System</h1>
                <p class="subtitle">
                    Prime Minister's Office - Foreign Leave Management System.
                    Click the button below to access the application portal.
                </p>
                
                <a href="{{ url('/dist') }}" class="btn">
                    Go to Application
                </a>

                <!-- Wave Container inside card -->
                <svg class="waves" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                viewBox="0 24 150 28" preserveAspectRatio="none" shape-rendering="auto">
                    <defs>
                        <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
                    </defs>
                    <g class="parallax">
                        <use xlink:href="#gentle-wave" x="48" y="0" fill="rgba(37, 99, 235, 0.05)" />
                        <use xlink:href="#gentle-wave" x="48" y="3" fill="rgba(37, 99, 235, 0.1)" />
                        <use xlink:href="#gentle-wave" x="48" y="5" fill="rgba(37, 99, 235, 0.03)" />
                        <use xlink:href="#gentle-wave" x="48" y="7" fill="rgba(37, 99, 235, 0.15)" />
                    </g>
                </svg>
            </div>

            <div class="footer">
                &copy; {{ date('Y') }} Prime Minister's Office. All rights reserved.
            </div>
        </div>

    </body>
</html>
