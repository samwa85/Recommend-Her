@php
$steps = [
    [
        'number' => '01',
        'icon' => 'user-plus',
        'title' => 'Submit Your Profile',
        'description' => 'Talent submits a curated profile to our vetted network.',
        'color' => 'bg-[hsl(var(--primary))]',
    ],
    [
        'number' => '02',
        'icon' => 'handshake',
        'title' => 'Sponsors Pledge',
        'description' => 'Sponsors pledge to recommend actively from our talent pool.',
        'color' => 'bg-[hsl(var(--accent))]',
    ],
    [
        'number' => '03',
        'icon' => 'rocket',
        'title' => 'Create Opportunities',
        'description' => 'Matches create career-defining opportunities for women leaders.',
        'color' => 'bg-[hsl(var(--primary))]',
    ],
];
@endphp

<section class="py-24 lg:py-32" style="background-color: hsl(var(--card));">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Section Header -->
        <div class="text-center mb-16 reveal">
            <p 
                class="font-sans text-sm uppercase tracking-[4px] mb-4"
                style="color: hsl(var(--primary));"
            >
                How It Works
            </p>
            <h2 
                class="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
                style="color: hsl(var(--foreground));"
            >
                Three Steps to Change
            </h2>
            <p 
                class="font-sans text-lg max-w-2xl mx-auto leading-relaxed"
                style="color: hsl(var(--muted-foreground));"
            >
                Our simple process connects talented women with leaders ready to advocate for them.
            </p>
        </div>

        <!-- Steps -->
        <div class="grid md:grid-cols-3 gap-8 mb-12">
            @foreach($steps as $index => $step)
                <div class="relative group reveal" style="transition-delay: {{ $index * 150 }}ms;">
                    <!-- Connector Line (hidden on mobile) -->
                    @if($index < count($steps) - 1)
                        <div 
                            class="hidden md:block absolute top-16 left-[60%] w-full h-0.5"
                            style="background-color: hsl(var(--border));"
                        >
                            <div 
                                class="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
                                style="background-color: hsl(var(--primary));"
                            ></div>
                        </div>
                    @endif

                    <div 
                        class="rounded-2xl p-8 transition-all duration-500 hover:-translate-y-2"
                        style="background-color: hsl(var(--background)); box-shadow: var(--shadow);"
                    >
                        <!-- Icon Badge -->
                        <div class="inline-flex items-center justify-center w-12 h-12 {{ $step['color'] }} rounded-xl mb-6">
                            @if($step['icon'] === 'user-plus')
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <line x1="19" y1="8" x2="19" y2="14"></line>
                                    <line x1="22" y1="11" x2="16" y2="11"></line>
                                </svg>
                            @elseif($step['icon'] === 'handshake')
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white">
                                    <path d="m11 17 2 2a1 1 0 1 0 3-3"></path>
                                    <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.27.13a3 3 0 0 0 2.54.05l2.66-.67"></path>
                                    <path d="m18.73 5.41-.95.95a3 3 0 0 1-2.12.88H12.5a6 6 0 0 0-6 6v1.17a3 3 0 0 1-.88 2.12l-.95.95"></path>
                                </svg>
                            @elseif($step['icon'] === 'rocket')
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white">
                                    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
                                    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
                                    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
                                    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
                                </svg>
                            @endif
                        </div>

                        <!-- Number -->
                        <span 
                            class="font-serif text-5xl font-bold block mb-4"
                            style="color: hsl(var(--border));"
                        >
                            {{ $step['number'] }}
                        </span>

                        <!-- Content -->
                        <h3 
                            class="font-serif text-xl sm:text-2xl font-bold mb-3"
                            style="color: hsl(var(--foreground));"
                        >
                            {{ $step['title'] }}
                        </h3>
                        <p 
                            class="font-sans text-base leading-relaxed"
                            style="color: hsl(var(--muted-foreground));"
                        >
                            {{ $step['description'] }}
                        </p>
                    </div>
                </div>
            @endforeach
        </div>

        <!-- CTA -->
        <div class="text-center reveal" style="transition-delay: 450ms;">
            <a
                href="{{ url('/mission') }}"
                class="group inline-flex items-center gap-2 font-sans font-semibold transition-colors duration-300"
                style="color: hsl(var(--primary));"
            >
                See Success Stories
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform duration-300 group-hover:translate-x-1">
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                </svg>
            </a>
        </div>
    </div>
</section>
