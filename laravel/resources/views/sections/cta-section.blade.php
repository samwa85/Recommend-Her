<section class="py-24 lg:py-32 relative overflow-hidden" style="background-color: oklch(0.35 0.15 340);">
    <!-- Decorative Elements -->
    <div class="absolute inset-0 pointer-events-none">
        <div 
            class="absolute top-10 left-10 w-32 h-32 rounded-full blur-2xl animate-float"
            style="background-color: hsl(var(--primary)); opacity: 0.2;"
        ></div>
        <div 
            class="absolute bottom-10 right-10 w-48 h-48 rounded-full blur-3xl animate-float-slow"
            style="background-color: hsl(var(--accent)); opacity: 0.15;"
        ></div>
    </div>

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <!-- Headline -->
        <h2 class="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 reveal">
            <span class="inline-block mr-3">Ready</span>
            <span class="inline-block mr-3">to</span>
            <span class="inline-block mr-3">change</span>
            <span class="inline-block mr-3">the</span>
            <span class="inline-block mr-3">face</span>
            <span class="inline-block mr-3">of</span>
            <span class="inline-block">leadership?</span>
        </h2>

        <!-- Subheadline -->
        <p class="font-sans text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed reveal" style="transition-delay: 150ms;">
            Whether you're seeking sponsorship or ready to sponsor others, your
            journey starts here. Join the movement today.
        </p>

        <!-- CTA Buttons -->
        <div class="flex flex-wrap justify-center gap-4 reveal" style="transition-delay: 300ms;">
            <a
                href="{{ url('/for-talent') }}"
                class="group inline-flex items-center gap-2 px-8 py-4 rounded-lg font-sans font-bold text-lg transition-all duration-300 hover:-translate-y-1 hover:scale-105"
                style="background-color: #ffffff; color: #1e1b4b; box-shadow: 0 8px 30px rgba(255, 255, 255, 0.3), 0 4px 10px rgba(0, 0, 0, 0.2); border: 2px solid #ffffff;"
            >
                Submit Your CV
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="transition-transform duration-300 group-hover:translate-x-1">
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                </svg>
            </a>
            <a
                href="{{ url('/for-sponsors') }}"
                class="group inline-flex items-center gap-2 px-8 py-4 rounded-lg font-sans font-bold text-lg transition-all duration-300 border-2 hover:-translate-y-1 hover:scale-105"
                style="background-color: transparent; border-color: #ffffff; color: #ffffff; box-shadow: 0 4px 15px rgba(255, 255, 255, 0.15);"
            >
                Become a Sponsor
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="transition-transform duration-300 group-hover:translate-x-1">
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                </svg>
            </a>
        </div>
    </div>
</section>
