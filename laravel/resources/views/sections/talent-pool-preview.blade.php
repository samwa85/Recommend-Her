@php
$talents = [
    [
        'id' => 1,
        'title' => 'Senior Product Manager | 8+ Years',
        'tags' => ['Tech', 'Product'],
        'expertise' => 'Product strategy, team leadership, agile methodologies',
        'image' => 'images/talent-1.jpg',
        'alt' => 'Professional Black woman in business attire',
    ],
    [
        'id' => 2,
        'title' => 'Marketing Director | 12+ Years',
        'tags' => ['Marketing', 'Strategy'],
        'expertise' => 'Brand development, digital marketing, growth strategy',
        'image' => 'images/talent-2.jpg',
        'alt' => 'Black American woman marketing professional',
    ],
    [
        'id' => 3,
        'title' => 'Data Science Lead | 7+ Years',
        'tags' => ['Data', 'AI/ML'],
        'expertise' => 'Machine learning, data analytics, business intelligence',
        'image' => 'images/talent-3.jpg',
        'alt' => 'Black woman data scientist working',
    ],
    [
        'id' => 4,
        'title' => 'HR Director | 10+ Years',
        'tags' => ['HR', 'Leadership'],
        'expertise' => 'Talent acquisition, organizational development, DEI',
        'image' => 'images/talent-4.jpg',
        'alt' => 'Black American woman HR professional',
    ],
];
@endphp

<section class="py-24 lg:py-32 overflow-hidden" style="background-color: hsl(var(--background));">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Section Header -->
        <div class="flex flex-col md:flex-row md:items-end md:justify-between mb-12 reveal">
            <div>
                <p 
                    class="font-sans text-sm uppercase tracking-[4px] mb-4"
                    style="color: hsl(var(--primary));"
                >
                    Talent Pool
                </p>
                <h2 
                    class="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
                    style="color: hsl(var(--foreground));"
                >
                    Meet Our Community
                </h2>
                <p 
                    class="font-sans text-lg max-w-xl leading-relaxed"
                    style="color: hsl(var(--muted-foreground));"
                >
                    A glimpse of the exceptional women in our network, ready for their
                    next leadership opportunity.
                </p>
            </div>
            <a
                href="{{ url('/talent-pool') }}"
                class="group inline-flex items-center gap-2 mt-6 md:mt-0 font-sans font-semibold transition-colors duration-300"
                style="color: hsl(var(--primary));"
            >
                View Full Directory
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform duration-300 group-hover:translate-x-1">
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                </svg>
            </a>
        </div>

        <!-- Talent Cards -->
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            @foreach($talents as $index => $talent)
                <a
                    href="{{ url('/talent/' . $talent['id']) }}"
                    class="group rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-4 block reveal"
                    style="background-color: hsl(var(--card)); box-shadow: var(--shadow); border: 1px solid hsl(var(--border)); transition-delay: {{ $index * 100 }}ms;"
                >
                    <!-- Avatar with Image -->
                    <div
                        class="relative h-40 overflow-hidden"
                        style="background: linear-gradient(135deg, hsl(var(--primary)), hsl(346 60% 42%));"
                    >
                        <img
                            src="{{ asset($talent['image']) }}"
                            alt="{{ $talent['alt'] }}"
                            class="w-full h-full object-cover"
                            loading="lazy"
                        />
                        <!-- Overlay gradient for better text readability -->
                        <div
                            class="absolute inset-0"
                            style="background: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 100%);"
                        ></div>
                    </div>

                    <!-- Content -->
                    <div class="p-6">
                        <h3 
                            class="font-serif text-lg sm:text-xl font-bold mb-2"
                            style="color: hsl(var(--foreground));"
                        >
                            {{ $talent['title'] }}
                        </h3>

                        <!-- Tags -->
                        <div class="flex flex-wrap gap-2 mb-4">
                            @foreach($talent['tags'] as $tag)
                                <span
                                    class="px-3 py-1 rounded-full font-sans text-sm font-medium"
                                    style="background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground));"
                                >
                                    {{ $tag }}
                                </span>
                            @endforeach
                        </div>

                        <p 
                            class="font-sans text-base line-clamp-2 mb-4 leading-relaxed"
                            style="color: hsl(var(--muted-foreground));"
                        >
                            {{ $talent['expertise'] }}
                        </p>

                        <!-- CTA -->
                        <span
                            class="inline-flex items-center gap-2 font-sans text-sm font-semibold transition-all duration-300"
                            style="color: hsl(var(--primary));"
                        >
                            View Profile
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                                <path d="M7 7h10v10"></path>
                                <path d="M7 17 17 7"></path>
                            </svg>
                        </span>
                    </div>
                </a>
            @endforeach
        </div>
    </div>
</section>
