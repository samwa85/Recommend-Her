<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;

class MessageController extends Controller
{
    public function index()
    {
        $messages = []; // Would come from database
        return view('admin.messages.index', compact('messages'));
    }
}
