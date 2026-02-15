@extends('layouts.app')

@section('title', $talent['title'] . ' - Recommend Her Initiative')

@php
// This would normally come from the database
$talent = $talent ?? [
    'id' => 1,
    'title' => 'Senior Product Manager | 8+ Years',
    'name' => 'Sarah M.',
    'tags' => ['Tech', 'Product', 'Strategy'],
    'expertise' => 'Product strategy, team leadership, agile methodologies, roadmap planning, user research, data-driven decision making',
    'experience' => '8 years',
    'industry' => 'Technology',
    'seniority' => 'Senior',
    'bio' => 'Experienced product manager with a track record of launching successful products and leading high-performing teams. Passionate about building user-centered solutions and driving business growth through innovation.',
    'achievements' => [
        'Led product launch generating $2M ARR within first year',
        'Managed cross-functional team of 15 engineers and designers',
        'Scaled product from 0 to 100K active users',
        'Implemented agile processes that reduced time-to-market by 40%',
    ],
    'skills' => ['Product Strategy', 'Agile/Scrum', 'User Research', 'Data Analysis', 'Team Leadership', 'Roadmapping'],
    'education' => 'MBA, Harvard Business School',
    'languages' => ['English', 'Swahili'],
    'availability' => 'Open to opportunities',
];
@endphp

@section('content')
<section class="pt-32 pb-24 lg:pb-32 min-h-screen" style="background-color: hsl(var(--background));">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Back Link -->
        <a href="{{ url('/talent-pool') }}" class="inline-flex items-center gap-2 font-sans text-sm mb-8 transition-colors hover:opacity-80" style="color: hsl(var(--primary));">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m15 18-6-6 6-6"></path>
            </svg>
            Back to Talent Pool
        </a>

        <!-- Profile Card -->
        <div class="rounded-2xl overflow-hidden" style="background-color: hsl(var(--card)); box-shadow: var(--shadow-lg);">
            <!-- Header -->
            <div class="p-8" style="background: linear-gradient(135deg, hsl(var(--primary)), hsl(346 60% 42%));">
                <div class="flex items-start gap-6">
                    <div class="w-24 h-24 rounded-2xl flex items-center justify-center flex-shrink-0" style="background-color: rgba(255,255,255,0.2);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white">
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </div>
                    <div class="flex-1">
                        <h1 class="font-serif text-2xl sm:text-3xl font-bold text-white mb-2">
                            {{ $talent['title'] }}
                        </h1>
                        <div class="flex flex-wrap gap-2 mb-4">
                            @foreach($talent['tags'] as $tag)
                                <span class="px-3 py-1 rounded-full font-sans text-sm font-medium bg-white/20 text-white">
                                    {{ $tag }}
                                </span>
                            @endforeach
                        </div>
                        <p class="font-sans text-white/80">{{ $talent['experience'] }} • {{ $talent['industry'] }}</p>
                    </div>
                </div>
            </div>

            <!-- Content -->
            <div class="p-8">
                <!-- Bio -->
                <div class="mb-8">
                    <h2 class="font-serif text-xl font-bold mb-3" style="color: hsl(var(--foreground));">About</h2>
                    <p class="font-sans text-base leading-relaxed" style="color: hsl(var(--muted-foreground));">{{ $talent['bio'] }}</p>
                </div>

                <!-- Key Achievements -->
                <div class="mb-8">
                    <h2 class="font-serif text-xl font-bold mb-3" style="color: hsl(var(--foreground));">Key Achievements</h2>
                    <ul class="space-y-3">
                        @foreach($talent['achievements'] as $achievement)
                            <li class="flex items-start gap-3">
                                <span class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style="background-color: hsl(var(--primary) / 0.1);">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="color: hsl(var(--primary));">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                </span>
                                <span class="font-sans text-base" style="color: hsl(var(--foreground));">{{ $achievement }}</span>
                            </li>
                        @endforeach
                    </ul>
                </div>

                <!-- Skills -->
                <div class="mb-8">
                    <h2 class="font-serif text-xl font-bold mb-3" style="color: hsl(var(--foreground));">Skills</h2>
                    <div class="flex flex-wrap gap-2">
                        @foreach($talent['skills'] as $skill)
                            <span class="px-4 py-2 rounded-lg font-sans text-sm" style="background-color: hsl(var(--muted)); color: hsl(var(--foreground));">{{ $skill }}</span>
                        @endforeach
                    </div>
                </div>

                <!-- Additional Info -->
                <div class="grid sm:grid-cols-3 gap-6 mb-8 pt-8 border-t" style="border-color: hsl(var(--border));">
                    <div>
                        <p class="font-sans text-sm mb-1" style="color: hsl(var(--muted-foreground));">Education</p>
                        <p class="font-sans text-base font-medium" style="color: hsl(var(--foreground));">{{ $talent['education'] }}</p>
                    </div>
                    <div>
                        <p class="font-sans text-sm mb-1" style="color: hsl(var(--muted-foreground));">Languages</p>
                        <p class="font-sans text-base font-medium" style="color: hsl(var(--foreground));">{{ implode(', ', $talent['languages']) }}</p>
                    </div>
                    <div>
                        <p class="font-sans text-sm mb-1" style="color: hsl(var(--muted-foreground));">Availability</p>
                        <p class="font-sans text-base font-medium" style="color: hsl(var(--primary));">{{ $talent['availability'] }}</p>
                    </div>
                </div>

                <!-- CTA -->
                <div class="flex flex-wrap gap-4">
                    <a 
                        href="{{ url('/contact') }}?subject=Interest in {{ urlencode($talent['title']) }}"
                        class="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-sans font-semibold transition-all duration-300 hover:-translate-y-1"
                        style="background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); box-shadow: var(--shadow);"
                    >
                        Request Introduction
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M5 12h14"></path>
                            <path d="m12 5 7 7-7 7"></path>
                        </svg>
                    </a>
                    <a 
                        href="{{ url('/talent-pool') }}"
                        class="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-sans font-semibold border-2 transition-all duration-300 hover:-translate-y-1"
                        style="border-color: hsl(var(--border)); color: hsl(var(--foreground));"
                    >
                        View More Talent
                    </a>
                </div>
            </div>
        </div>
    </div>
</section>
@endsection
