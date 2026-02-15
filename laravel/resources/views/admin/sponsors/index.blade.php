@extends('layouts.admin')

@section('title', 'Sponsors')
@section('page_title', 'Sponsor Management')

@section('content')
<div class="content-card">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h3 style="font-family: var(--font-serif); font-size: 1.25rem; font-weight: 700;">All Sponsors</h3>
        <a href="{{ route('admin.sponsors.create') }}" class="logout-btn" style="text-decoration: none;">Add New Sponsor</a>
    </div>
    <p style="color: hsl(var(--muted-foreground));">Sponsor profiles will appear here once you connect the database.</p>
</div>
@endsection
