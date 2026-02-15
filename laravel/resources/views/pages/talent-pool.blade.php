@extends('layouts.app')

@section('title', 'Talent Pool - Recommend Her Initiative')

@php
$allTalents = [
    [
        'id' => 1,
        'title' => 'Senior Product Manager | 8+ Years',
        'tags' => ['Tech', 'Product', 'Strategy'],
        'expertise' => 'Product strategy, team leadership, agile methodologies, roadmap planning',
        'experience' => '8 years',
        'industry' => 'Technology',
        'achievements' => [
            'Led product launch generating $2M ARR',
            'Managed cross-functional team of 15',
            'Scaled product from 0 to 100K users',
        ],
    ],
    [
        'id' => 2,
        'title' => 'Marketing Director | 12+ Years',
        'tags' => ['Marketing', 'Strategy', 'Brand'],
        'expertise' => 'Brand development, digital marketing, growth strategy, team management',
        'experience' => '12 years',
        'industry' => 'Marketing',
        'achievements' => [
            'Increased brand awareness by 300%',
            'Built marketing team from scratch',
            'Managed $5M annual budget',
        ],
    ],
    [
        'id' => 3,
        'title' => 'Data Science Lead | 7+ Years',
        'tags' => ['Data', 'AI/ML', 'Analytics'],
        'expertise' => 'Machine learning, data analytics, business intelligence, Python, SQL',
        'experience' => '7 years',
        'industry' => 'Technology',
        'achievements' => [
            'Built ML models improving efficiency by 40%',
            'Led data transformation initiative',
            'Published 3 research papers',
        ],
    ],
    [
        'id' => 4,
        'title' => 'HR Director | 10+ Years',
        'tags' => ['HR', 'Leadership', 'DEI'],
        'expertise' => 'Talent acquisition, organizational development, DEI initiatives',
        'experience' => '10 years',
        'industry' => 'Human Resources',
        'achievements' => [
            'Reduced turnover by 35%',
            'Implemented DEI program reaching 500+ employees',
            'Built leadership development pipeline',
        ],
    ],
    [
        'id' => 5,
        'title' => 'VP of Engineering | 15+ Years',
        'tags' => ['Tech', 'Engineering', 'Leadership'],
        'expertise' => 'Software engineering, team scaling, technical strategy, cloud architecture',
        'experience' => '15 years',
        'industry' => 'Technology',
        'achievements' => [
            'Scaled engineering team from 10 to 100',
            'Led cloud migration saving $1M annually',
            'Built high-performance engineering culture',
        ],
    ],
    [
        'id' => 6,
        'title' => 'Director of Operations | 14+ Years',
        'tags' => ['Operations', 'Strategy', 'Leadership'],
        'expertise' => 'Operational excellence, process optimization, supply chain, P&L management',
        'experience' => '14 years',
        'industry' => 'Manufacturing',
        'achievements' => [
            'Improved operational efficiency by 25%',
            'Managed $50M P&L',
            'Led 3 successful M&A integrations',
        ],
    ],
];

$industries = ['All', 'Technology', 'Finance', 'Marketing', 'Human Resources', 'Manufacturing', 'Legal'];
@endphp

@section('content')
<section class="pt-32 pb-24 lg:pb-32 min-h-screen" style="background-color: hsl(var(--background));">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="text-center mb-12 reveal">
            <p class="font-sans text-sm uppercase tracking-[4px] mb-4" style="color: hsl(var(--primary));">
                Exclusive Network
            </p>
            <h1 class="font-serif text-4xl sm:text-5xl font-bold mb-6" style="color: hsl(var(--foreground));">
                Talent Pool
            </h1>
            <p class="font-sans text-lg max-w-2xl mx-auto" style="color: hsl(var(--muted-foreground));">
                Browse our curated network of exceptional women leaders. 
                Access requires sponsor verification.
            </p>
        </div>

        <!-- Password Protection -->
        <div id="password-gate" class="max-w-md mx-auto mb-12">
            <div class="rounded-2xl p-8 text-center" style="background-color: hsl(var(--card)); box-shadow: var(--shadow-lg);">
                <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style="background-color: hsl(var(--primary) / 0.1);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: hsl(var(--primary));">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                </div>
                <h3 class="font-serif text-xl font-bold mb-2" style="color: hsl(var(--foreground));">Sponsor Access</h3>
                <p class="font-sans text-sm mb-4" style="color: hsl(var(--muted-foreground));">Enter password to view talent profiles</p>
                <div class="relative">
                    <input 
                        type="password" 
                        id="access-password"
                        class="w-full px-4 py-3 rounded-lg border font-sans text-base text-center"
                        style="border-color: hsl(var(--border)); background-color: hsl(var(--background)); color: hsl(var(--foreground));"
                        placeholder="Enter password"
                    >
                </div>
                <p id="password-error" class="mt-2 font-sans text-sm text-red-600 hidden">Incorrect password</p>
                <button 
                    onclick="checkPassword()"
                    class="w-full mt-4 px-6 py-3 rounded-lg font-sans font-semibold transition-all duration-300"
                    style="background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground));"
                >
                    Access Talent Pool
                </button>
            </div>
        </div>

        <!-- Talent Content (Hidden by default) -->
        <div id="talent-content" class="hidden">
            <!-- Filters -->
            <div class="flex flex-col sm:flex-row gap-4 mb-8 reveal">
                <div class="relative flex-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-3 top-1/2 -translate-y-1/2" style="color: hsl(var(--muted-foreground));">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.3-4.3"></path>
                    </svg>
                    <input 
                        type="text" 
                        id="search-talent"
                        class="w-full pl-10 pr-4 py-3 rounded-lg border font-sans text-base"
                        style="border-color: hsl(var(--border)); background-color: hsl(var(--background)); color: hsl(var(--foreground));"
                        placeholder="Search by role, skills, or expertise..."
                    >
                </div>
                <select 
                    id="industry-filter"
                    class="px-4 py-3 rounded-lg border font-sans text-base appearance-none"
                    style="border-color: hsl(var(--border)); background-color: hsl(var(--background)); color: hsl(var(--foreground)); min-width: 150px;"
                >
                    @foreach($industries as $industry)
                        <option value="{{ $industry }}">{{ $industry }}</option>
                    @endforeach
                </select>
            </div>

            <!-- Talent Grid -->
            <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" id="talent-grid">
                @foreach($allTalents as $index => $talent)
                    <a
                        href="{{ url('/talent/' . $talent['id']) }}"
                        class="group rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 block reveal"
                        style="background-color: hsl(var(--card)); box-shadow: var(--shadow); border: 1px solid hsl(var(--border)); transition-delay: {{ $index * 50 }}ms;"
                        data-industry="{{ $talent['industry'] }}"
                    >
                        <!-- Header -->
                        <div class="p-6">
                            <h3 class="font-serif text-lg font-bold mb-2" style="color: hsl(var(--foreground));">
                                {{ $talent['title'] }}
                            </h3>
                            
                            <!-- Tags -->
                            <div class="flex flex-wrap gap-2 mb-4">
                                @foreach($talent['tags'] as $tag)
                                    <span class="px-3 py-1 rounded-full font-sans text-sm font-medium" style="background-color: hsl(var(--primary) / 0.1); color: hsl(var(--primary));">
                                        {{ $tag }}
                                    </span>
                                @endforeach
                            </div>

                            <p class="font-sans text-sm mb-4" style="color: hsl(var(--muted-foreground));">
                                {{ $talent['expertise'] }}
                            </p>

                            <div class="flex items-center justify-between pt-4 border-t" style="border-color: hsl(var(--border));">
                                <span class="font-sans text-sm" style="color: hsl(var(--muted-foreground));">
                                    {{ $talent['experience'] }}
                                </span>
                                <span class="inline-flex items-center gap-1 font-sans text-sm font-semibold" style="color: hsl(var(--primary));">
                                    View Profile
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                                        <path d="M7 7h10v10"></path>
                                        <path d="M7 17 17 7"></path>
                                    </svg>
                                </span>
                            </div>
                        </div>
                    </a>
                @endforeach
            </div>
        </div>
    </div>
</section>

<script>
const CORRECT_PASSWORD = 'sponsor2024';

function checkPassword() {
    const input = document.getElementById('access-password');
    const error = document.getElementById('password-error');
    const gate = document.getElementById('password-gate');
    const content = document.getElementById('talent-content');
    
    if (input.value === CORRECT_PASSWORD) {
        gate.classList.add('hidden');
        content.classList.remove('hidden');
        error.classList.add('hidden');
    } else {
        error.classList.remove('hidden');
        input.classList.add('border-red-500');
    }
}

// Simple search and filter
document.getElementById('search-talent')?.addEventListener('input', function() {
    const query = this.value.toLowerCase();
    const cards = document.querySelectorAll('#talent-grid > a');
    
    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(query) ? 'block' : 'none';
    });
});

document.getElementById('industry-filter')?.addEventListener('change', function() {
    const industry = this.value;
    const cards = document.querySelectorAll('#talent-grid > a');
    
    cards.forEach(card => {
        if (industry === 'All' || card.dataset.industry === industry) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
});
</script>
@endsection
