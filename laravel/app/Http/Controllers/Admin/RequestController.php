<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;

class RequestController extends Controller
{
    public function index()
    {
        $requests = []; // Would come from database
        return view('admin.requests.index', compact('requests'));
    }
}
