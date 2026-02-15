@php
$testimonials = [
    [
        'id' => 1,
        'name' => 'Dr. Monique Thompson',
        'title' => 'VP Engineering at TechCorp',
        'image' => 'images/testimonial-1.jpg',
        'quote' => "Recommend Her connected me with a sponsor who actively advocated for my promotion. Six months later, I landed my dream role. This platform truly changes lives.",
    ],
    [
        'id' => 2,
        'name' => 'Zahra Ibrahim',
        'title' => 'Director of Operations',
        'image' => 'images/testimonial-2.jpg',
        'quote' => "As a sponsor, I've found exceptional talent through this network. It's not just recruiting—it's building the future of leadership and creating lasting impact.",
    ],
    [
        'id' => 3,
        'name' => 'Patricia Daniels',
        'title' => 'CFO at Global Finance',
        'image' => 'images/testimonial-3.jpg',
        'quote' => "The quality of candidates in this pool is outstanding. Every introduction has led to meaningful conversations and successful placements. Highly recommended.",
    ],
];
@endphp

<section class="py-24 lg:py-32" style="background-color: oklch(0.35 0.15 340);">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Section Header -->
        <div class="text-center mb-12 reveal">
            <p 
                class="font-sans text-sm uppercase tracking-[4px] mb-4 font-semibold"
                style="color: #f472b6;"
            >
                Testimonials
            </p>
            <h2 class="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold" style="color: #ffffff;">
                What Our Community Says
            </h2>
        </div>

        <!-- Testimonial Card -->
        <div class="relative">
            <div
                id="testimonial-card"
                class="rounded-3xl p-8 sm:p-12 relative"
                style="background-color: oklch(0.30 0.12 340); box-shadow: var(--shadow-lg);"
            >
                <!-- Quote Icon -->
                <div 
                    class="absolute -top-6 left-8 w-12 h-12 rounded-full flex items-center justify-center"
                    style="background-color: hsl(var(--primary));"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white">
                        <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
                        <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
                    </svg>
                </div>

                <!-- Content -->
                <div class="pt-4">
                    <p 
                        id="testimonial-quote"
                        class="font-serif text-xl sm:text-2xl leading-relaxed mb-8"
                        style="color: #ffffff; line-height: 1.7;"
                    >
                        "{{ $testimonials[0]['quote'] }}"
                    </p>

                    <!-- Author -->
                    <div class="flex items-center gap-4">
                        <img
                            id="testimonial-image"
                            src="{{ asset($testimonials[0]['image']) }}"
                            alt="{{ $testimonials[0]['name'] }}"
                            class="w-16 h-16 rounded-full object-cover border-4"
                            style="border-color: hsl(var(--primary));"
                        />
                        <div>
                            <h4 
                                id="testimonial-name"
                                class="font-serif text-lg sm:text-xl font-bold"
                                style="color: #ffffff;"
                            >
                                {{ $testimonials[0]['name'] }}
                            </h4>
                            <p 
                                id="testimonial-title"
                                class="font-sans text-base font-medium"
                                style="color: #9ca3af;"
                            >
                                {{ $testimonials[0]['title'] }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Navigation -->
            <div class="flex items-center justify-center gap-4 mt-8">
                <button
                    onclick="prevTestimonial()"
                    class="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white transition-all duration-300 hover:bg-white/20 hover:scale-110"
                    aria-label="Previous testimonial"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m15 18-6-6 6-6"></path>
                    </svg>
                </button>

                <!-- Dots -->
                <div class="flex gap-2" id="testimonial-dots">
                    @foreach($testimonials as $index => $testimonial)
                        <button
                            onclick="goToTestimonial({{ $index }})"
                            class="h-3 rounded-full transition-all duration-300 {{ $index === 0 ? 'w-8' : 'w-3 bg-white/30 hover:bg-white/50' }}"
                            style="{{ $index === 0 ? 'background-color: hsl(var(--primary));' : '' }}"
                            aria-label="Go to testimonial {{ $index + 1 }}"
                            data-index="{{ $index }}"
                        ></button>
                    @endforeach
                </div>

                <button
                    onclick="nextTestimonial()"
                    class="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white transition-all duration-300 hover:bg-white/20 hover:scale-110"
                    aria-label="Next testimonial"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m9 18 6-6-6-6"></path>
                    </svg>
                </button>
            </div>
        </div>
    </div>
</section>

<script>
const testimonials = @json($testimonials);
let currentIndex = 0;
let isAnimating = false;

function updateTestimonial(index) {
    if (isAnimating) return;
    isAnimating = true;

    const card = document.getElementById('testimonial-card');
    const quote = document.getElementById('testimonial-quote');
    const image = document.getElementById('testimonial-image');
    const name = document.getElementById('testimonial-name');
    const title = document.getElementById('testimonial-title');
    const dots = document.querySelectorAll('#testimonial-dots button');

    // Animate out
    card.style.opacity = '0';
    card.style.transform = 'translateX(-50px)';
    card.style.transition = 'all 0.3s ease-in';

    setTimeout(() => {
        // Update content
        const t = testimonials[index];
        quote.textContent = `"${t.quote}"`;
        image.src = `{{ asset('') }}${t.image}`;
        image.alt = t.name;
        name.textContent = t.name;
        title.textContent = t.title;

        // Update dots
        dots.forEach((dot, i) => {
            if (i === index) {
                dot.classList.remove('w-3', 'bg-white/30');
                dot.classList.add('w-8');
                dot.style.backgroundColor = 'hsl(var(--primary))';
            } else {
                dot.classList.remove('w-8');
                dot.classList.add('w-3', 'bg-white/30');
                dot.style.backgroundColor = '';
            }
        });

        // Animate in
        card.style.transform = 'translateX(50px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.4s ease-out';
            card.style.opacity = '1';
            card.style.transform = 'translateX(0)';
            isAnimating = false;
        }, 50);
    }, 300);

    currentIndex = index;
}

function nextTestimonial() {
    const nextIndex = (currentIndex + 1) % testimonials.length;
    updateTestimonial(nextIndex);
}

function prevTestimonial() {
    const prevIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
    updateTestimonial(prevIndex);
}

function goToTestimonial(index) {
    if (index === currentIndex) return;
    updateTestimonial(index);
}

// Auto-rotate
setInterval(() => {
    if (!isAnimating) {
        nextTestimonial();
    }
}, 6000);
</script>
