@extends('layouts.app')

@section('title', ($post['title'] ?? 'Blog Post') . ' - Recommend Her Initiative')

@php
// This would normally come from the database
$post = $post ?? [
    'slug' => 'power-of-sponsorship',
    'title' => 'The Power of Sponsorship vs. Mentorship',
    'excerpt' => 'Understanding the critical difference between mentorship and sponsorship can transform your career trajectory.',
    'category' => 'Career Growth',
    'date' => 'Jan 15, 2026',
    'readTime' => '5 min read',
    'author' => 'Recommend Her Team',
    'content' => '
        <p class="mb-4">In the world of career advancement, two terms often get used interchangeably: mentorship and sponsorship. While both are valuable, understanding the critical difference between them can transform your career trajectory.</p>
        
        <h2 class="font-serif text-2xl font-bold mt-8 mb-4" style="color: hsl(var(--foreground));">What is Mentorship?</h2>
        <p class="mb-4">Mentorship is a relationship where a more experienced person provides guidance, advice, and support to someone less experienced. Mentors share their knowledge, help navigate challenges, and offer perspective based on their own career journeys.</p>
        <p class="mb-4">Mentors are essential for professional development. They help you think through problems, expand your knowledge, and grow your confidence. However, mentorship typically stays in the realm of advice and guidance.</p>
        
        <h2 class="font-serif text-2xl font-bold mt-8 mb-4" style="color: hsl(var(--foreground));">What is Sponsorship?</h2>
        <p class="mb-4">Sponsorship goes a step further. A sponsor is someone in a position of power who actively advocates for your advancement. They use their influence to open doors, recommend you for opportunities, and put their own reputation on the line for your success.</p>
        <p class="mb-4">While a mentor might advise you on how to position yourself for a promotion, a sponsor will actually recommend you for that promotion to decision-makers when you are not in the room.</p>
        
        <h2 class="font-serif text-2xl font-bold mt-8 mb-4" style="color: hsl(var(--foreground));">Why Sponsorship Matters More for Women</h2>
        <p class="mb-4">Research consistently shows that women are over-mentored and under-sponsored. This gap helps explain why women, despite receiving plenty of advice and guidance, continue to be underrepresented in senior leadership positions.</p>
        <p class="mb-4">Sponsorship is particularly crucial because:</p>
        <ul class="list-disc pl-6 mb-4 space-y-2">
            <li>Sponsors provide access to opportunities that are not publicly posted</li>
            <li>Sponsors advocate for you in rooms where you are not present</li>
            <li>Sponsors help navigate organizational politics and power structures</li>
            <li>Sponsors create visibility for your work among senior leaders</li>
        </ul>
        
        <h2 class="font-serif text-2xl font-bold mt-8 mb-4" style="color: hsl(var(--foreground));">How to Attract Sponsors</h2>
        <p class="mb-4">Attracting sponsors requires a different approach than finding mentors. Here are key strategies:</p>
        <p class="mb-4"><strong>1. Deliver exceptional work consistently.</strong> Sponsors want to back winners. They need to trust that recommending you will reflect well on them.</p>
        <p class="mb-4"><strong>2. Make your ambitions known.</strong> People cannot advocate for you if they do not know what you want. Be clear about your career goals.</p>
        <p class="mb-4"><strong>3. Build relationships strategically.</strong> Identify people in positions of influence who have seen your work firsthand. These are your potential sponsors.</p>
        <p class="mb-4"><strong>4. Ask for opportunities, not just advice.</strong> When you meet with senior leaders, ask for specific opportunities to demonstrate your capabilities.</p>
        
        <h2 class="font-serif text-2xl font-bold mt-8 mb-4" style="color: hsl(var(--foreground));">The Role of Recommend Her</h2>
        <p class="mb-4">Recommend Her was built specifically to bridge the sponsorship gap. Our platform connects talented women with leaders who are committed to active sponsorship—not just giving advice, but opening doors and creating real opportunities.</p>
        <p class="mb-4">By joining our network, you gain access to a community of sponsors who have pledged to actively recommend women from our talent pool for leadership opportunities.</p>
        
        <p class="mt-8 font-serif text-xl" style="color: hsl(var(--foreground));">Ready to find your sponsor? <a href="' . url("/for-talent") . '" style="color: hsl(var(--primary));">Submit your profile</a> to our talent pool today.</p>
    ',
];

$relatedPosts = [
    [
        'slug' => 'building-your-personal-brand',
        'title' => 'Building Your Personal Brand as a Leader',
        'category' => 'Leadership',
        'date' => 'Jan 10, 2026',
    ],
    [
        'slug' => 'salary-negotiation-strategies',
        'title' => 'Salary Negotiation Strategies for Women',
        'category' => 'Career Growth',
        'date' => 'Dec 28, 2025',
    ],
];
@endphp

@section('content')
<section class="pt-32 pb-24 lg:pb-32 min-h-screen" style="background-color: hsl(var(--background));">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Back Link -->
        <a href="{{ url('/blog') }}" class="inline-flex items-center gap-2 font-sans text-sm mb-8 transition-colors hover:opacity-80" style="color: hsl(var(--primary));">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m15 18-6-6 6-6"></path>
            </svg>
            Back to Blog
        </a>

        <!-- Article Header -->
        <div class="mb-8 reveal">
            <div class="flex items-center gap-3 mb-4">
                <span class="px-3 py-1 rounded-full font-serif text-sm" style="background-color: hsl(var(--primary) / 0.1); color: hsl(var(--primary));">
                    {{ $post['category'] }}
                </span>
                <span class="font-sans text-sm" style="color: hsl(var(--muted-foreground));">{{ $post['date'] }}</span>
            </div>
            <h1 class="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold mb-4" style="color: hsl(var(--foreground));">
                {{ $post['title'] }}
            </h1>
            <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-full flex items-center justify-center" style="background-color: hsl(var(--primary) / 0.1);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: hsl(var(--primary));">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                </div>
                <div>
                    <p class="font-sans text-sm font-medium" style="color: hsl(var(--foreground));">{{ $post['author'] }}</p>
                    <p class="font-sans text-xs" style="color: hsl(var(--muted-foreground));">{{ $post['readTime'] }}</p>
                </div>
            </div>
        </div>

        <!-- Featured Image -->
        <div class="rounded-2xl overflow-hidden mb-8 h-64 sm:h-80 reveal" style="background: linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--accent) / 0.2));">
            <div class="w-full h-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="color: hsl(var(--primary) / 0.5);">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
            </div>
        </div>

        <!-- Article Content -->
        <article class="font-sans text-base leading-relaxed reveal" style="color: hsl(var(--foreground));">
            {!! $post['content'] !!}
        </article>

        <!-- Share -->
        <div class="mt-12 pt-8 border-t reveal" style="border-color: hsl(var(--border));">
            <p class="font-sans text-sm font-medium mb-4" style="color: hsl(var(--foreground));">Share this article</p>
            <div class="flex items-center gap-3">
                <a href="#" class="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:-translate-y-1" style="background-color: hsl(var(--muted)); color: hsl(var(--foreground));">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                    </svg>
                </a>
                <a href="#" class="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:-translate-y-1" style="background-color: hsl(var(--muted)); color: hsl(var(--foreground));">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                        <rect x="2" y="9" width="4" height="12"></rect>
                        <circle cx="4" cy="4" r="2"></circle>
                    </svg>
                </a>
                <a href="#" class="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:-translate-y-1" style="background-color: hsl(var(--muted)); color: hsl(var(--foreground));">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                </a>
            </div>
        </div>

        <!-- Related Posts -->
        <div class="mt-16 reveal">
            <h3 class="font-serif text-2xl font-bold mb-6" style="color: hsl(var(--foreground));">Related Articles</h3>
            <div class="grid sm:grid-cols-2 gap-6">
                @foreach($relatedPosts as $related)
                    <a
                        href="{{ url('/blog/' . $related['slug']) }}"
                        class="group rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 block"
                        style="background-color: hsl(var(--card)); box-shadow: var(--shadow); border: 1px solid hsl(var(--border));"
                    >
                        <span class="px-3 py-1 rounded-full font-serif text-xs" style="background-color: hsl(var(--primary) / 0.1); color: hsl(var(--primary));">
                            {{ $related['category'] }}
                        </span>
                        <h4 class="font-serif text-lg font-bold mt-3 mb-2 group-hover:text-[hsl(var(--primary))] transition-colors" style="color: hsl(var(--foreground));">
                            {{ $related['title'] }}
                        </h4>
                        <p class="font-sans text-sm" style="color: hsl(var(--muted-foreground));">{{ $related['date'] }}</p>
                    </a>
                @endforeach
            </div>
        </div>
    </div>
</section>
@endsection
