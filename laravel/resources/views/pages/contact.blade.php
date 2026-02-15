@extends('layouts.app')

@section('title', 'Contact Us - Recommend Her Initiative')

@php
$inquiryTypes = [
    'General Inquiry',
    'Partnership Opportunity',
    'Media Request',
    'Speaking Engagement',
    'Other',
];

$contactInfo = [
    ['icon' => 'mail', 'label' => 'Email', 'value' => 'hello@recommendher.africa'],
    ['icon' => 'phone', 'label' => 'Phone', 'value' => '+255 123 456 789'],
    ['icon' => 'map-pin', 'label' => 'Location', 'value' => 'Dar es Salaam, Tanzania'],
];
@endphp

@section('content')
<section class="pt-32 pb-24 lg:pb-32 min-h-screen" style="background-color: hsl(var(--background));">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="text-center mb-16 reveal">
            <p class="font-sans text-sm uppercase tracking-[4px] mb-4" style="color: hsl(var(--primary));">
                Get in Touch
            </p>
            <h1 class="font-serif text-4xl sm:text-5xl font-bold mb-6" style="color: hsl(var(--foreground));">
                Contact Us
            </h1>
            <p class="font-sans text-lg max-w-2xl mx-auto" style="color: hsl(var(--muted-foreground));">
                Have a question or want to partner with us? We'd love to hear from you.
            </p>
        </div>

        <div class="grid lg:grid-cols-3 gap-8">
            <!-- Contact Info -->
            <div class="lg:col-span-1 space-y-6 reveal">
                @foreach($contactInfo as $info)
                    <div class="flex items-start gap-4 p-6 rounded-2xl" style="background-color: hsl(var(--card)); box-shadow: var(--shadow);">
                        <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style="background-color: hsl(var(--primary) / 0.1);">
                            @if($info['icon'] === 'mail')
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: hsl(var(--primary));">
                                    <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                                </svg>
                            @elseif($info['icon'] === 'phone')
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: hsl(var(--primary));">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                </svg>
                            @elseif($info['icon'] === 'map-pin')
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: hsl(var(--primary));">
                                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                            @endif
                        </div>
                        <div>
                            <p class="font-sans text-sm font-medium mb-1" style="color: hsl(var(--muted-foreground));">{{ $info['label'] }}</p>
                            <p class="font-sans text-base font-semibold" style="color: hsl(var(--foreground));">{{ $info['value'] }}</p>
                        </div>
                    </div>
                @endforeach
            </div>

            <!-- Contact Form -->
            <div class="lg:col-span-2 reveal" style="transition-delay: 150ms;">
                <form 
                    class="rounded-2xl p-8" 
                    style="background-color: hsl(var(--card)); box-shadow: var(--shadow-lg);"
                    action="{{ route('contact.submit') }}"
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

                    @if($errors->any())
                        <div class="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
                            <div class="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-600">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                                <p class="font-sans text-sm text-red-800">Please fix the errors below.</p>
                            </div>
                        </div>
                    @endif
                    
                    <div class="grid sm:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label class="block font-sans text-sm font-medium mb-2" style="color: hsl(var(--foreground));">
                                Full Name *
                            </label>
                            <div class="relative">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-3 top-1/2 -translate-y-1/2" style="color: hsl(var(--muted-foreground));">
                                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                                <input 
                                    type="text" 
                                    name="full_name"
                                    required
                                    class="w-full pl-10 pr-4 py-3 rounded-lg border font-sans text-base focus:outline-none focus:ring-2"
                                    style="border-color: hsl(var(--border)); background-color: hsl(var(--background)); color: hsl(var(--foreground));"
                                    placeholder="Your name"
                                    value="{{ old('full_name') }}"
                                >
                            </div>
                            @error('full_name')
                                <p class="mt-1 font-sans text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>
                        
                        <div>
                            <label class="block font-sans text-sm font-medium mb-2" style="color: hsl(var(--foreground));">
                                Email *
                            </label>
                            <div class="relative">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-3 top-1/2 -translate-y-1/2" style="color: hsl(var(--muted-foreground));">
                                    <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                                </svg>
                                <input 
                                    type="email" 
                                    name="email"
                                    required
                                    class="w-full pl-10 pr-4 py-3 rounded-lg border font-sans text-base focus:outline-none focus:ring-2"
                                    style="border-color: hsl(var(--border)); background-color: hsl(var(--background)); color: hsl(var(--foreground));"
                                    placeholder="your@email.com"
                                    value="{{ old('email') }}"
                                >
                            </div>
                            @error('email')
                                <p class="mt-1 font-sans text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>
                    </div>

                    <div class="grid sm:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label class="block font-sans text-sm font-medium mb-2" style="color: hsl(var(--foreground));">
                                Inquiry Type *
                            </label>
                            <select 
                                name="inquiry_type"
                                required
                                class="w-full px-4 py-3 rounded-lg border font-sans text-base focus:outline-none focus:ring-2 appearance-none"
                                style="border-color: hsl(var(--border)); background-color: hsl(var(--background)); color: hsl(var(--foreground));"
                            >
                                <option value="">Select type</option>
                                @foreach($inquiryTypes as $type)
                                    <option value="{{ $type }}" {{ old('inquiry_type') === $type ? 'selected' : '' }}>{{ $type }}</option>
                                @endforeach
                            </select>
                            @error('inquiry_type')
                                <p class="mt-1 font-sans text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>
                        
                        <div>
                            <label class="block font-sans text-sm font-medium mb-2" style="color: hsl(var(--foreground));">
                                Organization
                            </label>
                            <div class="relative">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-3 top-1/2 -translate-y-1/2" style="color: hsl(var(--muted-foreground));">
                                    <path d="M3 21h18"></path>
                                    <path d="M5 21V7l8-4 8 4v14"></path>
                                    <path d="M9 21v-6h6v6"></path>
                                </svg>
                                <input 
                                    type="text" 
                                    name="organization"
                                    class="w-full pl-10 pr-4 py-3 rounded-lg border font-sans text-base focus:outline-none focus:ring-2"
                                    style="border-color: hsl(var(--border)); background-color: hsl(var(--background)); color: hsl(var(--foreground));"
                                    placeholder="Company name"
                                    value="{{ old('organization') }}"
                                >
                            </div>
                        </div>
                    </div>

                    <div class="mb-6">
                        <label class="block font-sans text-sm font-medium mb-2" style="color: hsl(var(--foreground));">
                            Message *
                        </label>
                        <div class="relative">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-3 top-3" style="color: hsl(var(--muted-foreground));">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            <textarea 
                                name="message"
                                required
                                rows="5"
                                class="w-full pl-10 pr-4 py-3 rounded-lg border font-sans text-base focus:outline-none focus:ring-2 resize-none"
                                style="border-color: hsl(var(--border)); background-color: hsl(var(--background)); color: hsl(var(--foreground));"
                                placeholder="Tell us how we can help you..."
                            >{{ old('message') }}</textarea>
                        </div>
                        @error('message')
                            <p class="mt-1 font-sans text-sm text-red-600">{{ $message }}</p>
                        @enderror
                    </div>

                    <button 
                        type="submit"
                        class="group inline-flex items-center gap-2 px-8 py-4 rounded-lg font-sans font-semibold text-lg transition-all duration-300 hover:-translate-y-1"
                        style="background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); box-shadow: var(--shadow);"
                    >
                        Send Message
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform group-hover:translate-x-1">
                            <path d="m22 2-7 20-4-9-9-4 20-7z"></path>
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    </div>
</section>
@endsection
