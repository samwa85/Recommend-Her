<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PageController;
use App\Http\Controllers\FormController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

// Home
Route::get('/', [PageController::class, 'home'])->name('home');

// Public Pages
Route::get('/mission', [PageController::class, 'mission'])->name('mission');
Route::get('/for-talent', [PageController::class, 'forTalent'])->name('for-talent');
Route::get('/for-sponsors', [PageController::class, 'forSponsors'])->name('for-sponsors');
Route::get('/talent-pool', [PageController::class, 'talentPool'])->name('talent-pool');
Route::get('/talent/{id}', [PageController::class, 'talentDetail'])->name('talent.detail');
Route::get('/resources', [PageController::class, 'resources'])->name('resources');
Route::get('/blog', [PageController::class, 'blog'])->name('blog');
Route::get('/blog/{slug}', [PageController::class, 'blogPost'])->name('blog.post');
Route::get('/contact', [PageController::class, 'contact'])->name('contact');

// Form Submissions
Route::post('/contact/submit', [FormController::class, 'submitContact'])->name('contact.submit');
Route::post('/talent/submit', [FormController::class, 'submitTalent'])->name('talent.submit');
Route::post('/sponsor/submit', [FormController::class, 'submitSponsor'])->name('sponsor.submit');

// Legal Pages
Route::get('/privacy', [PageController::class, 'privacy'])->name('privacy');
Route::get('/terms', [PageController::class, 'terms'])->name('terms');

// Admin Routes (require authentication)
Route::prefix('admin')->middleware(['auth'])->group(function () {
    Route::get('/', [\App\Http\Controllers\Admin\DashboardController::class, 'index'])->name('admin.dashboard');
    Route::get('/talent', [\App\Http\Controllers\Admin\TalentController::class, 'index'])->name('admin.talent');
    Route::get('/talent/new', [\App\Http\Controllers\Admin\TalentController::class, 'create'])->name('admin.talent.create');
    Route::get('/sponsors', [\App\Http\Controllers\Admin\SponsorController::class, 'index'])->name('admin.sponsors');
    Route::get('/sponsors/new', [\App\Http\Controllers\Admin\SponsorController::class, 'create'])->name('admin.sponsors.create');
    Route::get('/requests', [\App\Http\Controllers\Admin\RequestController::class, 'index'])->name('admin.requests');
    Route::get('/messages', [\App\Http\Controllers\Admin\MessageController::class, 'index'])->name('admin.messages');
    Route::get('/analytics', [\App\Http\Controllers\Admin\AnalyticsController::class, 'index'])->name('admin.analytics');
    Route::get('/settings', [\App\Http\Controllers\Admin\SettingsController::class, 'index'])->name('admin.settings');
    Route::get('/blog', [\App\Http\Controllers\Admin\BlogController::class, 'index'])->name('admin.blog');
});

// Admin Login
Route::get('/admin/login', [\App\Http\Controllers\Admin\AuthController::class, 'login'])->name('admin.login');
Route::post('/admin/login', [\App\Http\Controllers\Admin\AuthController::class, 'authenticate'])->name('admin.authenticate');
Route::post('/admin/logout', [\App\Http\Controllers\Admin\AuthController::class, 'logout'])->name('admin.logout');
