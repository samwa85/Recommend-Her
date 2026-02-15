<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;

class BlogController extends Controller
{
    public function index()
    {
        $posts = []; // Would come from database
        return view('admin.blog.index', compact('posts'));
    }
}
