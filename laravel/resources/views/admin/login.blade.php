<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Admin Login - Recommend Her</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Playfair+Display:wght@500;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --background: 340 20% 98%;
            --foreground: 340 25% 15%;
            --primary: 20 70% 45%;
            --primary-foreground: 0 0% 100%;
            --muted: 340 10% 92%;
            --muted-foreground: 340 10% 40%;
            --border: 340 10% 88%;
            --font-sans: 'Poppins', system-ui, sans-serif;
            --font-serif: 'Playfair Display', Georgia, serif;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: var(--font-sans);
            background: linear-gradient(135deg, oklch(0.35 0.15 340) 0%, oklch(0.25 0.08 340) 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
        }
        
        .login-container {
            width: 100%;
            max-width: 420px;
        }
        
        .login-card {
            background: white;
            border-radius: 1.5rem;
            padding: 2.5rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        
        .login-header {
            text-align: center;
            margin-bottom: 2rem;
        }
        
        .login-header h1 {
            font-family: var(--font-serif);
            font-size: 1.75rem;
            font-weight: 700;
            color: hsl(var(--foreground));
            margin-bottom: 0.5rem;
        }
        
        .login-header p {
            font-size: 0.875rem;
            color: hsl(var(--muted-foreground));
        }
        
        .form-group {
            margin-bottom: 1.25rem;
        }
        
        .form-label {
            display: block;
            font-size: 0.875rem;
            font-weight: 500;
            color: hsl(var(--foreground));
            margin-bottom: 0.5rem;
        }
        
        .form-input {
            width: 100%;
            padding: 0.875rem 1rem;
            border: 2px solid hsl(var(--border));
            border-radius: 0.75rem;
            font-family: var(--font-sans);
            font-size: 0.875rem;
            color: hsl(var(--foreground));
            transition: all 0.2s;
        }
        
        .form-input:focus {
            outline: none;
            border-color: hsl(var(--primary));
            box-shadow: 0 0 0 3px hsl(var(--primary) / 0.1);
        }
        
        .error-message {
            color: #dc2626;
            font-size: 0.75rem;
            margin-top: 0.25rem;
        }
        
        .error-alert {
            background: #fef2f2;
            border: 1px solid #fecaca;
            color: #dc2626;
            padding: 0.75rem 1rem;
            border-radius: 0.75rem;
            font-size: 0.875rem;
            margin-bottom: 1rem;
        }
        
        .remember-me {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1.5rem;
        }
        
        .remember-me input[type="checkbox"] {
            width: 1rem;
            height: 1rem;
            accent-color: hsl(var(--primary));
        }
        
        .remember-me label {
            font-size: 0.875rem;
            color: hsl(var(--muted-foreground));
        }
        
        .submit-btn {
            width: 100%;
            padding: 1rem;
            background: hsl(var(--primary));
            color: white;
            border: none;
            border-radius: 0.75rem;
            font-family: var(--font-sans);
            font-size: 0.9375rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .submit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px -10px hsl(var(--primary));
        }
        
        .back-link {
            display: block;
            text-align: center;
            margin-top: 1.5rem;
            font-size: 0.875rem;
            color: hsl(var(--muted-foreground));
            text-decoration: none;
        }
        
        .back-link:hover {
            color: hsl(var(--primary));
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="login-card">
            <div class="login-header">
                <h1>Recommend Her</h1>
                <p>Admin Dashboard Login</p>
            </div>

            @if($errors->any())
                <div class="error-alert">
                    {{ $errors->first() }}
                </div>
            @endif

            <form method="POST" action="{{ route('admin.authenticate') }}">
                @csrf
                
                <div class="form-group">
                    <label for="email" class="form-label">Email Address</label>
                    <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        class="form-input" 
                        value="{{ old('email') }}"
                        required 
                        autofocus
                        placeholder="admin@example.com"
                    >
                </div>

                <div class="form-group">
                    <label for="password" class="form-label">Password</label>
                    <input 
                        type="password" 
                        id="password" 
                        name="password" 
                        class="form-input" 
                        required
                        placeholder="••••••••"
                    >
                </div>

                <div class="remember-me">
                    <input type="checkbox" id="remember" name="remember">
                    <label for="remember">Remember me</label>
                </div>

                <button type="submit" class="submit-btn">
                    Sign In
                </button>
            </form>

            <a href="{{ route('home') }}" class="back-link">
                ← Back to website
            </a>
        </div>
    </div>
</body>
</html>
