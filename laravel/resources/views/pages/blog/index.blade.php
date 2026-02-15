@extends('layouts.app')

@section('title', 'Blog - Recommend Her Initiative')

@php
$blogPosts = [
    [
        'slug' => 'power-of-sponsorship',
        'title' => 'The Power of Sponsorship vs. Mentorship',
        'excerpt' => 'Understanding the critical difference between mentorship and sponsorship can transform your career trajectory. Learn how sponsors actively advocate for your advancement.',
        'category' => 'Career Growth',
        'date' => 'Jan 15, 2026',
        'readTime' => '5 min read',
        'image' => 'images/blog-1.jpg',
    ],
    [
        'slug' => 'building-your-personal-brand',
        'title' => 'Building Your Personal Brand as a Leader',
        'excerpt' => 'Learn how to establish yourself as a thought leader in your industry and create visibility among decision-makers who matter.',
        'category' => 'Leadership',
        'date' => 'Jan 10, 2026',
        'readTime' => '4 min read',
        'image' => 'images/blog-2.jpg',
    ],
    [
        'slug' => 'navigating-office-politics',
        'title' => 'Navigating Office Politics with Integrity',
        'excerpt' => 'Strategies for advancing your career while staying true to your values and building authentic relationships.',
        'category' => 'Workplace',
        'date' => 'Jan 5, 2026',
        'readTime' => '6 min read',
        'image' => 'images/blog-3.jpg',
    ],
    [
        'slug' => 'salary-negotiation-strategies',
        'title' => 'Salary Negotiation Strategies for Women',
        'excerpt' => 'Research-backed tactics to help you negotiate compensation packages that reflect your true value.',
        'category' => 'Career Growth',
        'date' => 'Dec 28, 2025',
        'readTime' => '7 min read',
        'image' => 'images/blog-4.jpg',
    ],
    [
        'slug' => 'imposter-syndrome',
        'title' => 'Overcoming Imposter Syndrome in Leadership',
        'excerpt' => 'Practical strategies for recognizing and overcoming self-doubt as you advance in your career.',
        'category' => 'Leadership',
        'date' => 'Dec 20, 2025',
        'readTime' => '5 min read',
        'image' => 'images/blog-5.jpg',
    ],
    [
        'slug' => 'networking-strategies',
        'title' => 'Strategic Networking for Career Advancement',
        'excerpt' => 'How to build and maintain professional relationships that open doors to new opportunities.',
        'category' => 'Career Growth',
        'date' => 'Dec 15, 2025',
        'readTime' => '4 min read',
        'image' => 'images/blog-6.jpg',
    ],
];

$categories = ['All', 'Career Growth', 'Leadership', 'Workplace'];
@endphp

@section('content')
<section class="pt-32 pb-24 lg:pb-32 min-h-screen" style="background-color: hsl(var(--background));">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="text-center mb-12 reveal">
            <p class="font-sans text-sm uppercase tracking-[4px] mb-4" style="color: hsl(var(--primary));">
                Insights & Stories
            </p>
            <h1 class="font-serif text-4xl sm:text-5xl font-bold mb-6" style="color: hsl(var(--foreground));">
                Blog
            </h1>
            <p class="font-sans text-lg max-w-2xl mx-auto" style="color: hsl(var(--muted-foreground));">
                Thought leadership, career advice, and success stories from our community.
            </p>
        </div>

        <!-- Filters -->
        <div class="flex flex-wrap justify-center gap-2 mb-12 reveal">
            @foreach($categories as $category)
                <button 
                    class="px-4 py-2 rounded-full font-sans text-sm font-medium transition-all duration-300"
                    style="{{ $category === 'All' ? 'background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground));' : 'background-color: hsl(var(--muted)); color: hsl(var(--muted-foreground));' }}"
                >
                    {{ $category }}
                </button>
            @endforeach
        </div>

        <!-- Blog Grid -->
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            @foreach($blogPosts as $index => $post)
                <a
                    href="{{ url('/blog/' . $post['slug']) }}"
                    class="group rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 block reveal"
                    style="background-color: hsl(var(--card)); box-shadow: var(--shadow); border: 1px solid hsl(var(--border)); transition-delay: {{ $index * 50 }}ms;"
                >
                    <!-- Image -->
                    <div class="h-48 overflow-hidden" style="background: linear-gradient(135deg, hsl(var(--primary) / 0.3), hsl(var(--accent) / 0.3));">
                        <div class="w-full h-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="color: hsl(var(--primary) / 0.5);">
                                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                        </div>
                    </div>

                    <!-- Content -->
                    <div class="p-6">
                        <div class="flex items-center gap-3 mb-3">
                            <span class="px-3 py-1 rounded-full font-serif text-xs" style="background-color: hsl(var(--primary) / 0.1); color: hsl(var(--primary));">
                                {{ $post['category'] }}
                            </span>
                            <span class="font-sans text-xs" style="color: hsl(var(--muted-foreground));">
                                {{ $post['date'] }}
                            </span>
                        </div>
                        <h3 class="font-serif text-lg font-bold mb-2 group-hover:text-[hsl(var(--primary))] transition-colors" style="color: hsl(var(--foreground));">
                            {{ $post['title'] }}
                        </h3>
                        <p class="font-sans text-sm mb-4" style="color: hsl(var(--muted-foreground));">
                            {{ $post['excerpt'] }}
                        </p>
                        <div class="flex items-center justify-between pt-4 border-t" style="border-color: hsl(var(--border));">
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
                    </div>
                </a>
            @endforeach
        </div>
    </div>
</section>
@endsection
