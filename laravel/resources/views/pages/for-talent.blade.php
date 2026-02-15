@extends('layouts.app')

@section('title', 'For Talent - Submit Your Profile - Recommend Her Initiative')

@php
$features = [
    'Access to senior leaders actively looking to sponsor',
    'No cost to join our vetted talent network',
    'Confidential and secure profile management',
];

$industries = ['Technology', 'Finance', 'Healthcare', 'Marketing', 'Consulting', 'Manufacturing', 'Education', 'Non-profit', 'Other'];
$seniorityLevels = ['Entry Level', 'Mid Level', 'Senior Level', 'Executive/C-Suite'];
@endphp

@section('content')
<section class="pt-32 pb-24 lg:pb-32 min-h-screen" style="background-color: hsl(var(--background));">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="text-center mb-16 reveal">
            <p class="font-sans text-sm uppercase tracking-[4px] mb-4" style="color: hsl(var(--primary));">
                Join Our Network
            </p>
            <h1 class="font-serif text-4xl sm:text-5xl font-bold mb-6" style="color: hsl(var(--foreground));">
                For Talent
            </h1>
            <p class="font-sans text-lg max-w-2xl mx-auto" style="color: hsl(var(--muted-foreground));">
                Submit your profile to our vetted talent pool and get discovered by sponsors 
                looking for exceptional women leaders.
            </p>
        </div>

        <div class="grid lg:grid-cols-5 gap-8">
            <!-- Left: Benefits -->
            <div class="lg:col-span-2 reveal">
                <div class="sticky top-32">
                    <h2 class="font-serif text-2xl font-bold mb-6" style="color: hsl(var(--foreground));">
                        Why Join?
                    </h2>
                    <ul class="space-y-4 mb-8">
                        @foreach($features as $feature)
                            <li class="flex items-center gap-3 font-sans text-base" style="color: hsl(var(--foreground));">
                                <span class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style="background-color: hsl(var(--primary));">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-white">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                </span>
                                {{ $feature }}
                            </li>
                        @endforeach
                    </ul>

                    <div class="rounded-2xl p-6" style="background-color: hsl(var(--primary) / 0.1);">
                        <div class="flex items-center gap-3 mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: hsl(var(--primary));">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                            </svg>
                            <span class="font-serif text-lg font-bold" style="color: hsl(var(--foreground));">Your Privacy Matters</span>
                        </div>
                        <p class="font-sans text-sm" style="color: hsl(var(--muted-foreground));">
                            Your profile is only visible to verified sponsors. We never share your 
                            information with third parties without your consent.
                        </p>
                    </div>
                </div>
            </div>

            <!-- Right: Form -->
            <div class="lg:col-span-3 reveal" style="transition-delay: 150ms;">
                <form 
                    class="rounded-2xl p-8"
                    style="background-color: hsl(var(--card)); box-shadow: var(--shadow-lg);"
                    action="{{ route('talent.submit') }}"
                    method="POST"
                    enctype="multipart/form-data"
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

                    <h3 class="font-serif text-xl font-bold mb-6" style="color: hsl(var(--foreground));">Personal Information</h3>

                    <div class="grid sm:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label class="block font-sans text-sm font-medium mb-2" style="color: hsl(var(--foreground));">Full Name *</label>
                            <input 
                                type="text" 
                                name="full_name"
                                required
                                class="w-full px-4 py-3 rounded-lg border font-sans text-base"
                                style="border-color: hsl(var(--border)); background-color: hsl(var(--background)); color: hsl(var(--foreground));"
                                placeholder="Your full name"
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
                        <label class="block font-sans text-sm font-medium mb-2" style="color: hsl(var(--foreground));">Professional Headline *</label>
                        <input 
                            type="text" 
                            name="headline"
                            required
                            class="w-full px-4 py-3 rounded-lg border font-sans text-base"
                            style="border-color: hsl(var(--border)); background-color: hsl(var(--background)); color: hsl(var(--foreground));"
                            placeholder="e.g., Senior Product Manager | 8+ Years Experience"
                            value="{{ old('headline') }}"
                        >
                        @error('headline')
                            <p class="mt-1 font-sans text-sm text-red-600">{{ $message }}</p>
                        @enderror
                    </div>

                    <div class="grid sm:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label class="block font-sans text-sm font-medium mb-2" style="color: hsl(var(--foreground));">Industry *</label>
                            <select 
                                name="industry"
                                required
                                class="w-full px-4 py-3 rounded-lg border font-sans text-base appearance-none"
                                style="border-color: hsl(var(--border)); background-color: hsl(var(--background)); color: hsl(var(--foreground));"
                            >
                                <option value="">Select industry</option>
                                @foreach($industries as $industry)
                                    <option value="{{ $industry }}" {{ old('industry') === $industry ? 'selected' : '' }}>{{ $industry }}</option>
                                @endforeach
                            </select>
                            @error('industry')
                                <p class="mt-1 font-sans text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>
                        <div>
                            <label class="block font-sans text-sm font-medium mb-2" style="color: hsl(var(--foreground));">Seniority Level *</label>
                            <select 
                                name="seniority_level"
                                required
                                class="w-full px-4 py-3 rounded-lg border font-sans text-base appearance-none"
                                style="border-color: hsl(var(--border)); background-color: hsl(var(--background)); color: hsl(var(--foreground));"
                            >
                                <option value="">Select level</option>
                                @foreach($seniorityLevels as $level)
                                    <option value="{{ $level }}" {{ old('seniority_level') === $level ? 'selected' : '' }}>{{ $level }}</option>
                                @endforeach
                            </select>
                            @error('seniority_level')
                                <p class="mt-1 font-sans text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>
                    </div>

                    <div class="mb-6">
                        <label class="block font-sans text-sm font-medium mb-2" style="color: hsl(var(--foreground));">Bio / Summary</label>
                        <textarea 
                            name="bio"
                            rows="4"
                            class="w-full px-4 py-3 rounded-lg border font-sans text-base resize-none"
                            style="border-color: hsl(var(--border)); background-color: hsl(var(--background)); color: hsl(var(--foreground));"
                            placeholder="Tell us about your experience, achievements, and career goals..."
                        >{{ old('bio') }}</textarea>
                    </div>

                    <div class="mb-8">
                        <label class="block font-sans text-sm font-medium mb-2" style="color: hsl(var(--foreground));">Upload CV/Resume (PDF, DOC, DOCX)</label>
                        <div class="border-2 border-dashed rounded-lg p-6 text-center" style="border-color: hsl(var(--border));">
                            <input 
                                type="file" 
                                name="cv"
                                accept=".pdf,.doc,.docx"
                                class="hidden"
                                id="cv-upload"
                            >
                            <label for="cv-upload" class="cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-2" style="color: hsl(var(--muted-foreground));">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="17 8 12 3 7 8"></polyline>
                                    <line x1="12" y1="3" x2="12" y2="15"></line>
                                </svg>
                                <p class="font-sans text-sm" style="color: hsl(var(--muted-foreground));">Click to upload or drag and drop</p>
                            </label>
                        </div>
                    </div>

                    <div class="mb-6">
                        <label class="flex items-start gap-3 cursor-pointer">
                            <input 
                                type="checkbox" 
                                name="consent"
                                required
                                class="w-5 h-5 mt-0.5 rounded"
                                style="accent-color: hsl(var(--primary));"
                            >
                            <span class="font-sans text-sm" style="color: hsl(var(--muted-foreground));">
                                I consent to my profile being shared with verified sponsors in the 
                                Recommend Her network. I understand that my information will be handled 
                                in accordance with the privacy policy.
                            </span>
                        </label>
                    </div>

                    <button 
                        type="submit"
                        class="w-full inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-sans font-semibold text-lg transition-all duration-300 hover:-translate-y-1"
                        style="background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); box-shadow: var(--shadow);"
                    >
                        Submit Your Profile
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform group-hover:translate-x-1">
                            <path d="M5 12h14"></path>
                            <path d="m12 5 7 7-7 7"></path>
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    </div>
</section>
@endsection
