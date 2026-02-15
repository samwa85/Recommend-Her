@php
$navLinks = [
    ['path' => '/', 'label' => 'Home'],
    ['path' => '/mission', 'label' => 'The Mission'],
    ['path' => '/for-talent', 'label' => 'For Talent'],
    ['path' => '/for-sponsors', 'label' => 'For Sponsors'],
    ['path' => '/talent-pool', 'label' => 'Talent Pool'],
    ['path' => '/resources', 'label' => 'Resources'],
    ['path' => '/contact', 'label' => 'Contact'],
];

$currentPath = request()->path();
$currentPath = $currentPath === '/' ? '/' : '/' . $currentPath;
@endphp

<nav class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white shadow-sm py-4">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between">
            <!-- Logo - Larger -->
            <a href="{{ url('/') }}" class="flex items-center transition-transform duration-300 hover:scale-105">
                <img
                    src="{{ asset('images/logo.png') }}"
                    alt="Recommend Her"
                    class="h-16 sm:h-20 w-auto object-contain"
                    style="max-width: 280px;"
                    loading="eager"
                    fetchpriority="high"
                />
            </a>

            <!-- Desktop Navigation -->
            <div class="hidden lg:flex items-center gap-8">
                @foreach($navLinks as $link)
                    @php
                        $isActive = $currentPath === $link['path'];
                    @endphp
                    <a
                        href="{{ url($link['path']) }}"
                        class="relative font-sans text-base font-semibold transition-colors duration-300 group {{ $isActive ? 'text-[hsl(var(--primary))]' : 'text-gray-800 hover:text-[hsl(var(--primary))]' }}"
                    >
                        {{ $link['label'] }}
                        <span
                            class="absolute -bottom-1 left-1/2 h-0.5 bg-[hsl(var(--primary))] transition-all duration-300 -translate-x-1/2 {{ $isActive ? 'w-full' : 'w-0 group-hover:w-full' }}"
                        ></span>
                    </a>
                @endforeach
            </div>

            <!-- CTA Button -->
            <div class="hidden lg:block">
                <a
                    href="{{ url('/for-sponsors') }}"
                    class="px-6 py-3 rounded-lg font-sans text-base font-bold transition-all duration-300 hover:-translate-y-0.5"
                    style="background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); box-shadow: var(--shadow);"
                >
                    Join the Movement
                </a>
            </div>

            <!-- Mobile Menu Button -->
            <button
                class="lg:hidden p-2 text-gray-800"
                onclick="toggleMobileMenu()"
                aria-label="Toggle menu"
                aria-expanded="false"
                aria-controls="mobile-menu"
            >
                <svg id="menu-icon" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
                <svg id="close-icon" class="hidden" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>

        <!-- Mobile Menu -->
        <div
            id="mobile-menu"
            class="lg:hidden overflow-hidden transition-all duration-300 max-h-0"
            role="navigation"
            aria-label="Mobile navigation"
        >
            <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mt-0">
                @foreach($navLinks as $link)
                    @php
                        $isActive = $currentPath === $link['path'];
                    @endphp
                    <a
                        href="{{ url($link['path']) }}"
                        class="block py-3 font-sans text-lg font-semibold border-b last:border-0 {{ $isActive ? 'text-[hsl(var(--primary))]' : 'text-gray-800 hover:text-[hsl(var(--primary))]' }}"
                        style="border-color: #f3f4f6;"
                    >
                        {{ $link['label'] }}
                    </a>
                @endforeach
                <a
                    href="{{ url('/for-sponsors') }}"
                    class="block mt-4 px-6 py-3 rounded-lg font-sans text-lg font-bold text-center transition-all duration-300"
                    style="background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground));"
                >
                    Join the Movement
                </a>
            </div>
        </div>
    </div>
</nav>

<!-- Spacer for fixed navigation -->
<div class="h-24 sm:h-28"></div>

<script>
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');
    const button = document.querySelector('[aria-controls="mobile-menu"]');
    
    if (menu.classList.contains('max-h-0')) {
        menu.classList.remove('max-h-0');
        menu.classList.add('max-h-[500px]', 'mt-4');
        menuIcon.classList.add('hidden');
        closeIcon.classList.remove('hidden');
        button.setAttribute('aria-expanded', 'true');
    } else {
        menu.classList.add('max-h-0');
        menu.classList.remove('max-h-[500px]', 'mt-4');
        menuIcon.classList.remove('hidden');
        closeIcon.classList.add('hidden');
        button.setAttribute('aria-expanded', 'false');
    }
}
</script>
