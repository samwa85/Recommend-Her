<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class TalentController extends Controller
{
    public function index()
    {
        $talents = []; // Would come from database
        return view('admin.talent.index', compact('talents'));
    }

    public function create()
    {
        return view('admin.talent.create');
    }
}
