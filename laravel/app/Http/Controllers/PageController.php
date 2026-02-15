<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PageController extends Controller
{
    /**
     * Display the home page.
     */
    public function home()
    {
        return view('pages.home');
    }

    /**
     * Display the mission page.
     */
    public function mission()
    {
        return view('pages.mission');
    }

    /**
     * Display the for talent page.
     */
    public function forTalent()
    {
        return view('pages.for-talent');
    }

    /**
     * Display the for sponsors page.
     */
    public function forSponsors()
    {
        return view('pages.for-sponsors');
    }

    /**
     * Display the talent pool page.
     */
    public function talentPool()
    {
        return view('pages.talent-pool');
    }

    /**
     * Display a specific talent profile.
     */
    public function talentDetail($id)
    {
        return view('pages.talent-detail', compact('id'));
    }

    /**
     * Display the resources page.
     */
    public function resources()
    {
        return view('pages.resources');
    }

    /**
     * Display the blog index page.
     */
    public function blog()
    {
        return view('pages.blog.index');
    }

    /**
     * Display a specific blog post.
     */
    public function blogPost($slug)
    {
        return view('pages.blog.show', compact('slug'));
    }

    /**
     * Display the contact page.
     */
    public function contact()
    {
        return view('pages.contact');
    }

    /**
     * Display the privacy policy page.
     */
    public function privacy()
    {
        return view('pages.privacy');
    }

    /**
     * Display the terms of service page.
     */
    public function terms()
    {
        return view('pages.terms');
    }
}
