@extends('layouts.admin')

@section('title', 'Talent')
@section('page_title', 'Talent Management')

@section('content')
<div class="content-card">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h3 style="font-family: var(--font-serif); font-size: 1.25rem; font-weight: 700;">All Talent Profiles</h3>
        <a href="{{ route('admin.talent.create') }}" class="logout-btn" style="text-decoration: none;">Add New Talent</a>
    </div>
    <p style="color: hsl(var(--muted-foreground));">Talent profiles will appear here once you connect the database.</p>
</div>
@endsection
