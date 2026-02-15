@extends('layouts.admin')

@section('title', 'Dashboard')
@section('page_title', 'Overview')

@section('content')
<!-- Stats Grid -->
<div class="stats-grid">
    <div class="stat-card">
        <p class="stat-label">Total Talent</p>
        <p class="stat-value">{{ $stats['total_talent'] }}</p>
    </div>
    <div class="stat-card">
        <p class="stat-label">Total Sponsors</p>
        <p class="stat-value">{{ $stats['total_sponsors'] }}</p>
    </div>
    <div class="stat-card">
        <p class="stat-label">New Submissions</p>
        <p class="stat-value">{{ $stats['new_submissions'] }}</p>
    </div>
    <div class="stat-card">
        <p class="stat-label">Successful Matches</p>
        <p class="stat-value">{{ $stats['successful_matches'] }}</p>
    </div>
</div>

<!-- Recent Activity -->
<div class="content-card">
    <h3 style="font-family: var(--font-serif); font-size: 1.25rem; font-weight: 700; margin-bottom: 1.5rem;">Recent Activity</h3>
    <p style="color: hsl(var(--muted-foreground));">No recent activity to display.</p>
</div>
@endsection
