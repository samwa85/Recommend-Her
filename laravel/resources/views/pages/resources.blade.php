@extends('layouts.app')

@section('title', 'Resources & Blog - Recommend Her Initiative')

@php
$resources = [
    [
        'icon' => 'file-text',
        'title' => 'How to Optimize Your CV for Sponsorship',
        'description' => 'A comprehensive guide to crafting a CV that gets noticed by sponsors.',
        'type' => 'PDF Guide',
    ],
    [
        'icon' => 'book',
        'title' => "The Sponsor's Playbook",
        'description' => 'A guide to effective recommendation and active sponsorship.',
        'type' => 'PDF Guide',
    ],
    [
        'icon' => 'check-circle',
        'title' => 'Preparing for Your Next Career Leap',
        'description' => 'A checklist to help you prepare for your next leadership opportunity.',
        'type' => 'Checklist',
    ],
];

$blogPosts = [
    [
        'slug' => 'power-of-sponsorship',
        'title' => 'The Power of Sponsorship vs. Mentorship',
        'excerpt' => 'Understanding the critical difference between mentorship and sponsorship can transform your career trajectory.',
        'category' => 'Career Growth',
        'date' => 'Jan 15, 2026',
        'readTime' => '5 min read',
    ],
    [
        'slug' => 'building-your-personal-brand',
        'title' => 'Building Your Personal Brand as a Leader',
        'excerpt' => 'Learn how to establish yourself as a thought leader in your industry.',
        'category' => 'Leadership',
        'date' => 'Jan 10, 2026',
        'readTime' => '4 min read',
    ],
    [
        'slug' => 'navigating-office-politics',
        'title' => 'Navigating Office Politics with Integrity',
        'excerpt' => 'Strategies for advancing your career while staying true to your values.',
        'category' => 'Workplace',
        'date' => 'Jan 5, 2026',
        'readTime' => '6 min read',
    ],
];
@endphp

@section('content')
<section class="pt-32 pb-24 lg:pb-32 min-h-screen" style="background-color: hsl(var(--background));">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="text-center mb-16 reveal">
            <p class="font-serif text-sm uppercase tracking-[4px] mb-4" style="color: hsl(var(--primary));">
                Resources & Blog
            </p>
            <h1 class="font-serif text-4xl sm:text-5xl font-bold mb-6" style="color: hsl(var(--foreground));">
                Knowledge Hub
            </h1>
            <p class="font-sans text-lg max-w-2xl mx-auto" style="color: hsl(var(--muted-foreground));">
                Downloadable guides, success stories, and thought leadership to help you 
                on your sponsorship journey.
            </p>
        </div>

        <!-- Downloadable Resources -->
        <div class="mb-20">
            <h2 class="font-serif text-2xl font-bold mb-8" style="color: hsl(var(--foreground));">
                Downloadable Guides
            </h2>
            <div class="grid md:grid-cols-3 gap-6">
                @foreach($resources as $index => $resource)
                    <div
                        class="bg-white rounded-2xl p-6 shadow-brand border border-gray-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg group cursor-pointer reveal"
                        style="transition-delay: {{ $index * 100 }}ms;"
                    >
                        <div class="w-14 h-14 rounded-xl flex items-center justify-center mb-4" style="background-color: hsl(var(--primary) / 0.1);">
                            @if($resource['icon'] === 'file-text')
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: hsl(var(--primary));">
                                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                </svg>
                            @elseif($resource['icon'] === 'book')
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: hsl(var(--primary));">
                                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                                </svg>
                            @elseif($resource['icon'] === 'check-circle')
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: hsl(var(--primary));">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                            @endif
                        </div>
                        <span class="inline-block px-3 py-1 rounded-full font-serif text-xs mb-3" style="background-color: hsl(var(--muted)); color: hsl(var(--muted-foreground));">
                            {{ $resource['type'] }}
                        </span>
                        <h3 class="font-serif text-lg font-bold mb-2" style="color: hsl(var(--foreground));">
                            {{ $resource['title'] }}
                        </h3>
                        <p class="font-sans text-sm mb-4" style="color: hsl(var(--muted-foreground));">
                            {{ $resource['description'] }}
                        </p>
                        <button class="inline-flex items-center gap-2 font-serif text-sm font-semibold" style="color: hsl(var(--primary));">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            Download
                        </button>
                    </div>
                @endforeach
            </div>
        </div>

        <!-- Blog Posts -->
        <div>
            <div class="flex items-center justify-between mb-8">
                <h2 class="font-serif text-2xl font-bold" style="color: hsl(var(--foreground));">
                    Latest from the Blog
                </h2>
                <a href="{{ url('/blog') }}" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border font-sans text-sm font-semibold transition-all duration-300 hover:bg-gray-50" style="border-color: hsl(var(--border)); color: hsl(var(--foreground));">
                    View All
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M5 12h14"></path>
                        <path d="m12 5 7 7-7 7"></path>
                    </svg>
                </a>
            </div>
            <div class="grid md:grid-cols-3 gap-6">
                @foreach($blogPosts as $index => $post)
                    <a
                        href="{{ url('/blog/' . $post['slug']) }}"
                        class="bg-white rounded-2xl p-6 shadow-brand border border-gray-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg group cursor-pointer block reveal"
                        style="transition-delay: {{ $index * 100 }}ms;"
                    >
                        <div class="flex items-center gap-3 mb-4">
                            <span class="px-3 py-1 rounded-full font-serif text-xs" style="background-color: hsl(var(--primary) / 0.1); color: hsl(var(--primary));">
                                {{ $post['category'] }}
                            </span>
                            <span class="font-sans text-xs" style="color: hsl(var(--muted-foreground));">
                                {{ $post['date'] }}
                            </span>
                        </div>
                        <h3 class="font-serif text-lg font-bold mb-3 group-hover:text-[hsl(var(--primary))] transition-colors" style="color: hsl(var(--foreground));">
                            {{ $post['title'] }}
                        </h3>
                        <p class="font-sans text-sm mb-4" style="color: hsl(var(--muted-foreground));">
                            {{ $post['excerpt'] }}
                        </p>
                        <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                            <span class="text-sm font-medium" style="color: hsl(var(--primary));">
                                Read Article
                            </span>
                            <div class="flex items-center gap-1 text-xs" style="color: hsl(var(--muted-foreground));">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                                {{ $post['readTime'] }}
                            </div>
                        </div>
                    </a>
                @endforeach
            </div>
        </div>
    </div>
</section>
@endsection
