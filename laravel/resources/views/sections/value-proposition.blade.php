@php
$values = [
    [
        'icon' => 'eye',
        'title' => 'Visibility',
        'description' => 'Get seen by leaders who actively advocate for your career growth.',
        'color' => 'bg-[hsl(var(--primary))]',
    ],
    [
        'icon' => 'network',
        'title' => 'Access',
        'description' => 'Tap into a curated network of intentional sponsors and allies.',
        'color' => 'bg-[hsl(var(--accent))]',
    ],
    [
        'icon' => 'trending',
        'title' => 'Impact',
        'description' => 'Build a more equitable leadership pipeline for future generations.',
        'color' => 'bg-[hsl(346_50%_15%)]',
    ],
];
@endphp

<section class="py-20 lg:py-28" style="background-color: hsl(var(--background));">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Section Header -->
        <div class="text-center mb-14 reveal">
            <p 
                class="font-sans text-sm uppercase tracking-[4px] font-semibold mb-4"
                style="color: hsl(var(--primary));"
            >
                Why Join
            </p>
            <h2 
                class="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold mb-5"
                style="color: hsl(var(--foreground));"
            >
                The Power of Sponsorship
            </h2>
            <p 
                class="font-sans text-lg max-w-2xl mx-auto"
                style="color: hsl(var(--muted-foreground));"
            >
                Not just mentorship—active advocacy that opens doors and creates lasting change.
            </p>
        </div>

        <!-- Value Cards -->
        <div class="grid md:grid-cols-3 gap-6">
            @foreach($values as $index => $value)
                <div
                    class="group relative p-8 rounded-2xl bg-white border transition-all duration-300 hover:-translate-y-2 hover:shadow-lg cursor-default reveal"
                    style="border-color: hsl(var(--border)); transition-delay: {{ $index * 100 }}ms;"
                >
                    <!-- Icon -->
                    <div class="w-14 h-14 rounded-xl flex items-center justify-center mb-5 {{ $value['color'] }}">
                        @if($value['icon'] === 'eye')
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white">
                                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        @elseif($value['icon'] === 'network')
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white">
                                <circle cx="12" cy="12" r="10"></circle>
                                <circle cx="12" cy="12" r="4"></circle>
                                <path d="M12 2v4"></path>
                                <path d="M12 18v4"></path>
                                <path d="m4.93 4.93 2.83 2.83"></path>
                                <path d="m16.24 16.24 2.83 2.83"></path>
                                <path d="M2 12h4"></path>
                                <path d="M18 12h4"></path>
                                <path d="m4.93 19.07 2.83-2.83"></path>
                                <path d="m16.24 7.76 2.83-2.83"></path>
                            </svg>
                        @elseif($value['icon'] === 'trending')
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white">
                                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                                <polyline points="17 6 23 6 23 12"></polyline>
                            </svg>
                        @endif
                    </div>

                    <!-- Content -->
                    <h3 
                        class="font-serif text-2xl font-bold mb-3"
                        style="color: hsl(var(--foreground));"
                    >
                        {{ $value['title'] }}
                    </h3>
                    <p 
                        class="font-sans text-base leading-relaxed"
                        style="color: hsl(var(--muted-foreground));"
                    >
                        {{ $value['description'] }}
                    </p>
                </div>
            @endforeach
        </div>
    </div>
</section>
