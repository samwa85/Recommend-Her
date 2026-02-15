@php
$footerLinks = [
    'quickLinks' => [
        ['label' => 'Home', 'path' => '/'],
        ['label' => 'The Mission', 'path' => '/mission'],
        ['label' => 'For Talent', 'path' => '/for-talent'],
        ['label' => 'For Sponsors', 'path' => '/for-sponsors'],
        ['label' => 'Talent Pool', 'path' => '/talent-pool'],
        ['label' => 'Resources', 'path' => '/resources'],
        ['label' => 'Contact', 'path' => '/contact'],
    ],
    'resources' => [
        ['label' => 'Success Stories', 'path' => '/resources'],
        ['label' => 'Blog', 'path' => '/blog'],
        ['label' => 'Privacy Policy', 'path' => '/privacy'],
        ['label' => 'Terms of Service', 'path' => '/terms'],
    ],
];

$socialLinks = [
    ['label' => 'LinkedIn', 'href' => 'https://www.linkedin.com/in/recommend-her-tanzania-0991893aa/', 'icon' => 'linkedin'],
    ['label' => 'Twitter', 'href' => '#', 'icon' => 'twitter'],
    ['label' => 'Instagram', 'href' => '#', 'icon' => 'instagram'],
];
@endphp

<footer class="pt-16 pb-8" style="background-color: oklch(0.30 0.12 340);">
    <!-- Top border -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="h-px mb-12" style="background-color: hsl(var(--primary));"></div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
            <!-- Brand Column -->
            <div class="lg:col-span-1">
                <a href="{{ url('/') }}" class="inline-block mb-6 group">
                    <div class="relative transition-transform duration-300 group-hover:scale-105">
                        <img
                            src="{{ asset('images/logo.png') }}"
                            alt="Recommend Her"
                            class="h-16 sm:h-20 w-auto object-contain"
                            style="max-width: 280px; filter: brightness(0) invert(1);"
                            loading="lazy"
                        />
                    </div>
                </a>
                <p class="font-serif text-lg sm:text-xl text-white/90 leading-relaxed mb-4 font-semibold">
                    Empowering women through intentional sponsorship networks.
                </p>
                <p class="font-sans text-base font-bold" style="color: hsl(var(--accent));">
                    #RecommendHerMovement
                </p>
            </div>

            <!-- Quick Links -->
            <div>
                <h4 class="font-serif text-base font-semibold text-white uppercase tracking-wider mb-5">
                    Quick Links
                </h4>
                <ul class="space-y-3">
                    @foreach($footerLinks['quickLinks'] as $link)
                        <li>
                            <a
                                href="{{ url($link['path']) }}"
                                class="font-sans text-base text-white/70 hover:text-white transition-colors duration-200"
                            >
                                {{ $link['label'] }}
                            </a>
                        </li>
                    @endforeach
                </ul>
            </div>

            <!-- Resources -->
            <div>
                <h4 class="font-serif text-base font-semibold text-white uppercase tracking-wider mb-5">
                    Resources
                </h4>
                <ul class="space-y-3">
                    @foreach($footerLinks['resources'] as $link)
                        <li>
                            <a
                                href="{{ url($link['path']) }}"
                                class="font-sans text-base text-white/70 hover:text-white transition-colors duration-200"
                            >
                                {{ $link['label'] }}
                            </a>
                        </li>
                    @endforeach
                </ul>
            </div>

            <!-- Connect -->
            <div>
                <h4 class="font-serif text-base font-semibold text-white uppercase tracking-wider mb-5">
                    Connect With Us
                </h4>
                <p class="font-sans text-base text-white/70 mb-4">
                    Follow our journey and join the conversation.
                </p>
                <!-- Social Links -->
                <div class="flex items-center gap-3">
                    @foreach($socialLinks as $social)
                        <a
                            href="{{ $social['href'] }}"
                            class="w-10 h-10 rounded-full flex items-center justify-center text-white/70 transition-all duration-300 hover:scale-110"
                            style="background-color: rgba(255,255,255,0.1);"
                            aria-label="{{ $social['label'] }}"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            @if($social['icon'] === 'linkedin')
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                                    <rect x="2" y="9" width="4" height="12"></rect>
                                    <circle cx="4" cy="4" r="2"></circle>
                                </svg>
                            @elseif($social['icon'] === 'twitter')
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                                </svg>
                            @elseif($social['icon'] === 'instagram')
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                                </svg>
                            @endif
                        </a>
                    @endforeach
                </div>
            </div>
        </div>

        <!-- Bottom Bar -->
        <div class="pt-8 border-t border-white/10">
            <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p class="font-sans text-sm text-white/50">
                    © {{ date('Y') }} Recommend Her. All rights reserved.
                </p>
                <p class="font-sans text-xs text-white/40">
                    Made with passion for gender equity.
                </p>
            </div>
        </div>
    </div>
</footer>
