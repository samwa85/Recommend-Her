@extends('layouts.app')

@section('title', 'For Sponsors - Join Our Network - Recommend Her Initiative')

@php
$benefits = [
    [
        'icon' => 'users',
        'title' => 'Access Vetted Talent',
        'description' => 'Browse profiles of pre-qualified women leaders ready for their next opportunity.',
    ],
    [
        'icon' => 'network',
        'title' => 'Expand Your Network',
        'description' => 'Connect with other sponsors and allies committed to advancing women in leadership.',
    ],
    [
        'icon' => 'award',
        'title' => 'Make Real Impact',
        'description' => 'Be part of the solution in creating gender equity in corporate leadership.',
    ],
];

$sponsorTypes = ['Individual Executive', 'Company/Organization', 'Recruiter', 'Other'];
@endphp

@section('content')
<section class="pt-32 pb-24 lg:pb-32 min-h-screen" style="background-color: hsl(var(--background));">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="text-center mb-16 reveal">
            <p class="font-sans text-sm uppercase tracking-[4px] mb-4" style="color: hsl(var(--primary));">
                Become a Sponsor
            </p>
            <h1 class="font-serif text-4xl sm:text-5xl font-bold mb-6" style="color: hsl(var(--foreground));">
                For Sponsors
            </h1>
            <p class="font-sans text-lg max-w-2xl mx-auto" style="color: hsl(var(--muted-foreground));">
                Join our network of executives and allies committed to actively recommending 
                talented women for leadership opportunities.
            </p>
        </div>

        <!-- Benefits -->
        <div class="grid md:grid-cols-3 gap-6 mb-16">
            @foreach($benefits as $index => $benefit)
                <div class="rounded-2xl p-6 text-center reveal" style="background-color: hsl(var(--card)); box-shadow: var(--shadow); transition-delay: {{ $index * 100 }}ms;">
                    <div class="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4" style="background-color: hsl(var(--primary) / 0.1);">
                        @if($benefit['icon'] === 'users')
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: hsl(var(--primary));">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                        @elseif($benefit['icon'] === 'network')
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: hsl(var(--primary));">
                                <circle cx="12" cy="12" r="10"></circle>
                                <circle cx="12" cy="12" r="4"></circle>
                                <path d="M12 2v4"></path>
                                <path d="M12 18v4"></path>
                                <path d="m4.93 4.93 2.83 2.83"></path>
                                <path d="m16.24 16.24 2.83 2.83"></path>
                            </svg>
                        @elseif($benefit['icon'] === 'award')
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: hsl(var(--primary));">
                                <circle cx="12" cy="8" r="7"></circle>
                                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                            </svg>
                        @endif
                    </div>
                    <h3 class="font-serif text-lg font-bold mb-2" style="color: hsl(var(--foreground));">{{ $benefit['title'] }}</h3>
                    <p class="font-sans text-sm" style="color: hsl(var(--muted-foreground));">{{ $benefit['description'] }}</p>
                </div>
            @endforeach
        </div>

        <!-- Form -->
        <div class="max-w-2xl mx-auto reveal">
            <form 
                class="rounded-2xl p-8"
                style="background-color: hsl(var(--card)); box-shadow: var(--shadow-lg);"
                action="{{ route('sponsor.submit') }}"
                method="POST"
            >
                @csrf

                @if(session('success'))
                    <div class="mb-6 p-4 rounded-xl bg-green-50 border border-green-200">
                        <div class="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-600">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                            <p class="font-sans text-sm text-green-800">{{ session('success') }}</p>
                        </div>
                    </div>
                @endif

                <h3 class="font-serif text-xl font-bold mb-6" style="color: hsl(var(--foreground));">Join as a Sponsor</h3>

                <div class="grid sm:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label class="block font-sans text-sm font-medium mb-2" style="color: hsl(var(--foreground));">Full Name *</label>
                        <input 
                            type="text" 
                            name="full_name"
                            required
                            class="w-full px-4 py-3 rounded-lg border font-sans text-base"
                            style="border-color: hsl(var(--border)); background-color: hsl(var(--background)); color: hsl(var(--foreground));"
                            placeholder="Your name"
                            value="{{ old('full_name') }}"
                        >
                        @error('full_name')
                            <p class="mt-1 font-sans text-sm text-red-600">{{ $message }}</p>
                        @enderror
                    </div>
                    <div>
                        <label class="block font-sans text-sm font-medium mb-2" style="color: hsl(var(--foreground));">Email *</label>
                        <input 
                            type="email" 
                            name="email"
                            required
                            class="w-full px-4 py-3 rounded-lg border font-sans text-base"
                            style="border-color: hsl(var(--border)); background-color: hsl(var(--background)); color: hsl(var(--foreground));"
                            placeholder="your@email.com"
                            value="{{ old('email') }}"
                        >
                        @error('email')
                            <p class="mt-1 font-sans text-sm text-red-600">{{ $message }}</p>
                        @enderror
                    </div>
                </div>

                <div class="mb-6">
                    <label class="block font-sans text-sm font-medium mb-2" style="color: hsl(var(--foreground));">Organization</label>
                    <input 
                        type="text" 
                        name="organization"
                        class="w-full px-4 py-3 rounded-lg border font-sans text-base"
                        style="border-color: hsl(var(--border)); background-color: hsl(var(--background)); color: hsl(var(--foreground));"
                        placeholder="Company or organization name"
                        value="{{ old('organization') }}"
                    >
                </div>

                <div class="mb-6">
                    <label class="block font-sans text-sm font-medium mb-2" style="color: hsl(var(--foreground));">Title/Role *</label>
                    <input 
                        type="text" 
                        name="title"
                        required
                        class="w-full px-4 py-3 rounded-lg border font-sans text-base"
                        style="border-color: hsl(var(--border)); background-color: hsl(var(--background)); color: hsl(var(--foreground));"
                        placeholder="e.g., VP of Engineering"
                        value="{{ old('title') }}"
                    >
                    @error('title')
                        <p class="mt-1 font-sans text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <div class="mb-6">
                    <label class="block font-sans text-sm font-medium mb-2" style="color: hsl(var(--foreground));">Sponsor Type</label>
                    <select 
                        name="sponsor_type"
                        class="w-full px-4 py-3 rounded-lg border font-sans text-base appearance-none"
                        style="border-color: hsl(var(--border)); background-color: hsl(var(--background)); color: hsl(var(--foreground));"
                    >
                        <option value="">Select type</option>
                        @foreach($sponsorTypes as $type)
                            <option value="{{ $type }}" {{ old('sponsor_type') === $type ? 'selected' : '' }}>{{ $type }}</option>
                        @endforeach
                    </select>
                </div>

                <div class="mb-6">
                    <label class="block font-sans text-sm font-medium mb-2" style="color: hsl(var(--foreground));">Why do you want to join? *</label>
                    <textarea 
                        name="message"
                        required
                        rows="4"
                        class="w-full px-4 py-3 rounded-lg border font-sans text-base resize-none"
                        style="border-color: hsl(var(--border)); background-color: hsl(var(--background)); color: hsl(var(--foreground));"
                        placeholder="Tell us about your interest in sponsoring women leaders..."
                    >{{ old('message') }}</textarea>
                    @error('message')
                        <p class="mt-1 font-sans text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <div class="mb-6">
                    <label class="flex items-start gap-3 cursor-pointer">
                        <input 
                            type="checkbox" 
                            name="pledge"
                            required
                            class="w-5 h-5 mt-0.5 rounded"
                            style="accent-color: hsl(var(--primary));"
                        >
                        <span class="font-sans text-sm" style="color: hsl(var(--muted-foreground));">
                            I pledge to actively recommend qualified women from the Recommend Her 
                            network for leadership opportunities within my sphere of influence.
                        </span>
                    </label>
                </div>

                <button 
                    type="submit"
                    class="w-full inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-sans font-semibold text-lg transition-all duration-300 hover:-translate-y-1"
                    style="background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); box-shadow: var(--shadow);"
                >
                    Join as a Sponsor
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform group-hover:translate-x-1">
                        <path d="M5 12h14"></path>
                        <path d="m12 5 7 7-7 7"></path>
                    </svg>
                </button>
            </form>
        </div>
    </div>
</section>
@endsection
