<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;

class DashboardController extends Controller
{
    /**
     * Display the admin dashboard.
     */
    public function index()
    {
        // Stats would come from database
        $stats = [
            'total_talent' => 500,
            'total_sponsors' => 150,
            'new_submissions' => 12,
            'successful_matches' => 200,
        ];

        return view('admin.dashboard', compact('stats'));
    }
}
