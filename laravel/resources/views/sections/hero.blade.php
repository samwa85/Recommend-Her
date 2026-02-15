<section class="relative min-h-screen flex items-center overflow-hidden -mt-24 sm:-mt-28">
    <!-- Background Image -->
    <div class="absolute inset-0 z-0">
        <img
            src="{{ asset('images/hero-woman-hijab.jpg') }}"
            alt="Professional woman in hijab networking"
            class="w-full h-full object-cover object-center"
            loading="eager"
            fetchpriority="high"
        />
        <!-- Dark overlay for text readability -->
        <div 
            class="absolute inset-0"
            style="background: linear-gradient(135deg, oklch(0.18 0.08 340 / 0.85) 0%, oklch(0.18 0.08 340 / 0.65) 50%, oklch(0.35 0.15 340 / 0.75) 100%);"
        ></div>
        <!-- Bottom gradient fade -->
        <div class="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[hsl(var(--background))] to-transparent"></div>
    </div>

    <!-- Decorative Elements -->
    <div class="absolute inset-0 z-[1] pointer-events-none">
        <div 
            class="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-float opacity-20"
            style="background-color: hsl(var(--primary));"
        ></div>
        <div 
            class="absolute bottom-1/3 left-1/4 w-72 h-72 rounded-full blur-2xl animate-float-slow opacity-15"
            style="background-color: hsl(var(--accent));"
        ></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-40">
        <div class="max-w-3xl">
            <!-- Tagline -->
            <p
                class="font-sans text-sm uppercase tracking-[4px] font-semibold mb-6 reveal"
                style="color: hsl(var(--accent));"
            >
                #RecommendHerMovement
            </p>

            <!-- Headline -->
            <h1
                class="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-8 reveal"
                style="transition-delay: 100ms;"
            >
                When women 
                <span style="color: hsl(var(--accent));">recommend women,</span> 
                incredible things happen.
            </h1>

            <!-- Subheadline -->
            <p
                class="font-sans text-lg sm:text-xl lg:text-2xl text-white/90 max-w-2xl leading-relaxed mb-10 reveal"
                style="transition-delay: 200ms;"
            >
                Join a movement of leaders actively sponsoring talented women into
                leadership. Together, we're building a more equitable future.
            </p>

            <!-- CTA Buttons -->
            <div class="flex flex-wrap gap-4 reveal" style="transition-delay: 300ms;">
                <a
                    href="{{ url('/for-talent') }}"
                    class="group inline-flex items-center gap-2 px-8 py-4 rounded-xl font-sans font-semibold text-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                    style="background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); box-shadow: 0 4px 14px oklch(0.55 0.20 20 / 0.4);"
                >
                    Submit Your CV
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform group-hover:translate-x-1">
                        <path d="M5 12h14"></path>
                        <path d="m12 5 7 7-7 7"></path>
                    </svg>
                </a>
                <a
                    href="{{ url('/for-sponsors') }}"
                    class="group inline-flex items-center gap-2 px-8 py-4 rounded-xl font-sans font-semibold text-lg transition-all duration-300 border-2 border-white/40 text-white hover:bg-white/15 hover:border-white/60 backdrop-blur-sm"
                >
                    Become a Sponsor
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform group-hover:translate-x-1">
                        <path d="M5 12h14"></path>
                        <path d="m12 5 7 7-7 7"></path>
                    </svg>
                </a>
            </div>

            <!-- Stats Row -->
            <div class="flex flex-wrap gap-8 mt-16 pt-8 border-t border-white/20 reveal" style="transition-delay: 400ms;">
                <div class="text-center">
                    <p class="font-serif text-3xl sm:text-4xl font-bold text-white">500+</p>
                    <p class="font-sans text-sm text-white/70">Talents in Network</p>
                </div>
                <div class="text-center">
                    <p class="font-serif text-3xl sm:text-4xl font-bold text-white">150+</p>
                    <p class="font-sans text-sm text-white/70">Active Sponsors</p>
                </div>
                <div class="text-center">
                    <p class="font-serif text-3xl sm:text-4xl font-bold text-white">200+</p>
                    <p class="font-sans text-sm text-white/70">Successful Matches</p>
                </div>
            </div>
        </div>
    </div>
</section>
