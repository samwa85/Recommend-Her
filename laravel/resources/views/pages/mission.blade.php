@extends('layouts.app')

@section('title', 'The Mission - Recommend Her Initiative')

@php
$stats = [
    ['number' => '27%', 'label' => 'Women in C-Suite', 'description' => 'Despite being 50% of workforce'],
    ['number' => '1 in 5', 'label' => 'Fortune 500 CEOs', 'description' => 'Are women in 2024'],
    ['number' => '85%', 'label' => 'Jobs Filled', 'description' => 'Through networking & referrals'],
];
@endphp

@section('content')
<section class="pt-32 pb-24 lg:pb-32 min-h-screen" style="background-color: hsl(var(--background));">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="text-center mb-16 reveal">
            <p 
                class="font-sans text-sm uppercase tracking-[4px] mb-4"
                style="color: hsl(var(--primary));"
            >
                About Us
            </p>
            <h1 
                class="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
                style="color: hsl(var(--foreground));"
            >
                The Mission
            </h1>
            <p 
                class="font-sans text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed"
                style="color: hsl(var(--muted-foreground));"
            >
                Creating tangible gender equity in corporate leadership through intentional sponsorship.
            </p>
        </div>

        <!-- Founder's Story -->
        <div 
            class="rounded-2xl p-8 lg:p-12 mb-16 reveal"
            style="background-color: hsl(var(--card)); box-shadow: var(--shadow-lg);"
        >
            <div class="flex flex-col md:flex-row gap-8 items-start">
                <div class="w-full md:w-1/3">
                    <div 
                        class="aspect-square rounded-2xl flex items-center justify-center"
                        style="background-color: hsl(var(--primary) / 0.08);"
                    >
                        <div class="text-center">
                            <div 
                                class="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4"
                                style="background-color: hsl(var(--primary) / 0.15);"
                            >
                                <span 
                                    class="font-serif text-3xl font-bold"
                                    style="color: hsl(var(--primary));"
                                >
                                    WM
                                </span>
                            </div>
                            <p 
                                class="font-serif font-semibold text-lg"
                                style="color: hsl(var(--foreground));"
                            >
                                Wahda Mbaraka
                            </p>
                            <p 
                                class="font-sans text-base"
                                style="color: hsl(var(--muted-foreground));"
                            >
                                Founder
                            </p>
                        </div>
                    </div>
                </div>
                <div class="w-full md:w-2/3">
                    <h2 
                        class="font-serif text-2xl sm:text-3xl font-bold mb-4"
                        style="color: hsl(var(--foreground));"
                    >
                        The Quiet Problem
                    </h2>
                    <p 
                        class="font-sans text-base leading-relaxed mb-4"
                        style="color: hsl(var(--muted-foreground));"
                    >
                        For years, I've watched talented women work twice as hard to get half as far. 
                        The data is clear: women are underrepresented in leadership not because of 
                        capability, but because of access.
                    </p>
                    <p 
                        class="font-sans text-base leading-relaxed mb-4"
                        style="color: hsl(var(--muted-foreground));"
                    >
                        Recommend Her was born from a simple belief: when women recommend women, 
                        incredible things happen. Not mentorship from afar—but active sponsorship 
                        that opens doors and creates opportunities.
                    </p>
                    <p 
                        class="font-sans text-base leading-relaxed"
                        style="color: hsl(var(--muted-foreground));"
                    >
                        This is not a job board. It's a movement. A pipeline built on trust, 
                        proactive advocacy, and the power of intentional recommendation.
                    </p>
                </div>
            </div>
        </div>

        <!-- Statistics -->
        <div class="mb-16">
            <h2 
                class="font-serif text-2xl sm:text-3xl font-bold text-center mb-8 reveal"
                style="color: hsl(var(--foreground));"
            >
                Why This Matters
            </h2>
            <div class="grid md:grid-cols-3 gap-6">
                @foreach($stats as $index => $stat)
                    <div
                        class="rounded-xl p-6 text-center transition-all duration-300 hover:-translate-y-1 reveal"
                        style="background-color: hsl(var(--card)); box-shadow: var(--shadow); transition-delay: {{ $index * 100 }}ms;"
                    >
                        <p 
                            class="font-serif text-4xl font-bold mb-2"
                            style="color: hsl(var(--primary));"
                        >
                            {{ $stat['number'] }}
                        </p>
                        <p 
                            class="font-serif font-semibold text-lg mb-1"
                            style="color: hsl(var(--foreground));"
                        >
                            {{ $stat['label'] }}
                        </p>
                        <p 
                            class="font-sans text-base"
                            style="color: hsl(var(--muted-foreground));"
                        >
                            {{ $stat['description'] }}
                        </p>
                    </div>
                @endforeach
            </div>
        </div>

        <!-- Mission Statement -->
        <div 
            class="rounded-2xl p-8 lg:p-12 text-center reveal"
            style="background-color: hsl(var(--primary));"
        >
            <h2 
                class="font-serif text-xl sm:text-2xl font-bold mb-6"
                style="color: hsl(var(--accent));"
            >
                Our Mission Statement
            </h2>
            <p class="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
                "To activate intentional sponsorship networks that create tangible 
                gender equity in corporate leadership."
            </p>
        </div>
    </div>
</section>
@endsection
