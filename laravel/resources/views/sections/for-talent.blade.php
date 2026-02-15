@php
$features = [
    'Access to senior leaders',
    'No cost to join',
    'Confidential and secure',
];
@endphp

<section class="py-24 lg:py-32 overflow-hidden" style="background-color: hsl(var(--background));">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid lg:grid-cols-2 gap-12 lg:gap-0 items-center">
            <!-- Content -->
            <div class="relative z-10 lg:pr-0 reveal">
                <div
                    class="rounded-2xl p-8 lg:p-12 lg:mr-[-10%]"
                    style="background-color: hsl(var(--card)); box-shadow: var(--shadow-lg);"
                >
                    <p 
                        class="font-sans text-sm uppercase tracking-[4px] mb-4"
                        style="color: hsl(var(--primary));"
                    >
                        For Talent
                    </p>

                    <h2 
                        class="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
                        style="color: hsl(var(--foreground));"
                    >
                        Ready to be recommended?
                    </h2>

                    <p 
                        class="font-sans text-lg mb-8 leading-relaxed"
                        style="color: hsl(var(--muted-foreground));"
                    >
                        Submit your profile to our vetted talent pool. When sponsors are
                        looking for candidates, you'll be on their radar. Your next
                        opportunity could be one recommendation away.
                    </p>

                    <!-- Features -->
                    <ul class="space-y-4 mb-8">
                        @foreach($features as $feature)
                            <li
                                class="flex items-center gap-3 font-sans text-base"
                                style="color: hsl(var(--foreground));"
                            >
                                <span
                                    class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                                    style="background-color: hsl(var(--primary));"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-white">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                </span>
                                {{ $feature }}
                            </li>
                        @endforeach
                    </ul>

                    <a
                        href="{{ url('/for-talent') }}"
                        class="group inline-flex items-center gap-2 px-8 py-4 rounded-lg font-sans font-semibold transition-all duration-300 hover:-translate-y-1"
                        style="background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); box-shadow: var(--shadow);"
                    >
                        Submit Your Profile
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform duration-300 group-hover:translate-x-1">
                            <path d="M5 12h14"></path>
                            <path d="m12 5 7 7-7 7"></path>
                        </svg>
                    </a>
                </div>
            </div>

            <!-- Image -->
            <div class="relative lg:h-[600px] overflow-hidden rounded-2xl lg:rounded-l-none reveal" style="transition-delay: 150ms;">
                <div class="absolute inset-0">
                    <img
                        src="{{ asset('images/talent-hero.jpg') }}"
                        alt="Professional woman working"
                        class="w-full h-full object-cover"
                        loading="lazy"
                    />
                    <!-- Overlay gradient -->
                    <div 
                        class="absolute inset-0 lg:block hidden"
                        style="background: linear-gradient(to right, hsl(var(--background) / 0.5), transparent, transparent);"
                    />
                </div>
            </div>
        </div>
    </div>
</section>
