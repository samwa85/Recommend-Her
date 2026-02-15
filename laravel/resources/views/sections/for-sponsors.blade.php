@php
$stats = [
    ['value' => 500, 'suffix' => '+', 'label' => 'Talents in Pool'],
    ['value' => 150, 'suffix' => '+', 'label' => 'Active Sponsors'],
    ['value' => 200, 'suffix' => '+', 'label' => 'Successful Matches'],
];
@endphp

<section class="py-24 lg:py-32 overflow-hidden" style="background-color: oklch(0.35 0.15 340);">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid lg:grid-cols-2 gap-12 lg:gap-0 items-center">
            <!-- Image -->
            <div class="relative lg:h-[600px] overflow-hidden rounded-2xl lg:rounded-r-none order-2 lg:order-1 reveal">
                <div class="absolute inset-0">
                    <img
                        src="{{ asset('images/sponsors-hero.jpg') }}"
                        alt="Women in business meeting"
                        class="w-full h-full object-cover"
                        loading="lazy"
                    />
                    <!-- Overlay gradient -->
                    <div 
                        class="absolute inset-0 lg:block hidden"
                        style="background: linear-gradient(to left, oklch(0.35 0.15 340 / 0.5), transparent, transparent);"
                    />
                </div>
            </div>

            <!-- Content -->
            <div class="relative z-10 lg:pl-0 order-1 lg:order-2 reveal" style="transition-delay: 150ms;">
                <div 
                    class="rounded-2xl p-8 lg:p-12 lg:ml-[-10%] backdrop-blur-sm border border-white/10"
                    style="background-color: rgba(255,255,255,0.05);"
                >
                    <p 
                        class="font-sans text-sm uppercase tracking-[4px] mb-4"
                        style="color: hsl(var(--accent));"
                    >
                        For Sponsors
                    </p>

                    <h2 class="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                        Be the leader who opens doors.
                    </h2>

                    <p class="font-sans text-lg text-white/80 mb-8 leading-relaxed">
                        Join a network of executives and allies committed to active
                        sponsorship. Access vetted talent, make meaningful connections,
                        and drive real change in leadership diversity.
                    </p>

                    <!-- Stats -->
                    <div class="grid grid-cols-3 gap-6 mb-8">
                        @foreach($stats as $stat)
                            <div class="text-center">
                                <div 
                                    class="font-serif text-3xl sm:text-4xl font-bold mb-1 stat-counter"
                                    style="color: hsl(var(--accent));"
                                    data-target="{{ $stat['value'] }}"
                                >
                                    0{{ $stat['suffix'] }}
                                </div>
                                <div class="font-sans text-sm text-white/70 uppercase tracking-wider">
                                    {{ $stat['label'] }}
                                </div>
                            </div>
                        @endforeach
                    </div>

                    <a
                        href="{{ url('/for-sponsors') }}"
                        class="group inline-flex items-center gap-2 px-8 py-4 rounded-lg font-sans font-semibold transition-all duration-300 hover:-translate-y-1"
                        style="background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); box-shadow: var(--shadow);"
                    >
                        Join as a Sponsor
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform duration-300 group-hover:translate-x-1">
                            <path d="M5 12h14"></path>
                            <path d="m12 5 7 7-7 7"></path>
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    </div>
</section>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const counters = document.querySelectorAll('.stat-counter');
    
    const animateCounters = () => {
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const suffix = counter.textContent.replace(/[0-9]/g, '');
            const duration = 1500;
            const step = target / (duration / 16);
            let current = 0;
            
            const updateCounter = () => {
                current += step;
                if (current < target) {
                    counter.textContent = Math.round(current) + suffix;
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target + suffix;
                }
            };
            
            updateCounter();
        });
    };

    // Trigger animation when section is in view
    const section = document.querySelector('.stat-counter').closest('section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    observer.observe(section);
});
</script>
