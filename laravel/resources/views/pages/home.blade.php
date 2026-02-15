@extends('layouts.app')

@section('title', 'Recommend Her Initiative - Elevating Women into Leadership')

@section('content')
    @include('sections.hero')
    @include('sections.value-proposition')
    @include('sections.how-it-works')
    @include('sections.talent-pool-preview')
    @include('sections.for-sponsors')
    @include('sections.for-talent')
    @include('sections.testimonials')
    @include('sections.cta-section')
@endsection
