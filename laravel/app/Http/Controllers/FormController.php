<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FormController extends Controller
{
    /**
     * Handle contact form submission.
     */
    public function submitContact(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'full_name' => 'required|string|min:2|max:255',
            'email' => 'required|email|max:255',
            'inquiry_type' => 'required|string|max:255',
            'organization' => 'nullable|string|max:255',
            'message' => 'required|string|min:10|max:5000',
        ]);

        if ($validator->fails()) {
            return back()
                ->withErrors($validator)
                ->withInput();
        }

        // Here you would typically:
        // 1. Save to database
        // 2. Send notification email
        // 3. Maybe trigger a webhook

        // Example: Save to database (uncomment when you have the migration)
        // ContactSubmission::create([
        //     'full_name' => $request->full_name,
        //     'email' => $request->email,
        //     'inquiry_type' => $request->inquiry_type,
        //     'organization' => $request->organization,
        //     'message' => $request->message,
        //     'status' => 'new',
        // ]);

        return back()->with('success', 'Thank you for your message! We will get back to you within 24-48 hours.');
    }

    /**
     * Handle talent profile submission.
     */
    public function submitTalent(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'full_name' => 'required|string|min:2|max:255',
            'email' => 'required|email|max:255|unique:talent_profiles,email',
            'headline' => 'required|string|min:10|max:255',
            'industry' => 'required|string|max:255',
            'seniority_level' => 'required|string|max:255',
            'bio' => 'nullable|string|max:2000',
            'cv' => 'nullable|file|mimes:pdf,doc,docx|max:10240',
            'consent' => 'required|accepted',
        ]);

        if ($validator->fails()) {
            return back()
                ->withErrors($validator)
                ->withInput();
        }

        // Handle file upload
        $cvPath = null;
        if ($request->hasFile('cv')) {
            $cvPath = $request->file('cv')->store('cvs', 'private');
        }

        // Save to database (uncomment when you have the migration)
        // TalentProfile::create([
        //     'full_name' => $request->full_name,
        //     'email' => $request->email,
        //     'headline' => $request->headline,
        //     'industry' => $request->industry,
        //     'seniority_level' => $request->seniority_level,
        //     'bio' => $request->bio,
        //     'cv_path' => $cvPath,
        //     'status' => 'pending',
        // ]);

        return back()->with('success', 'Thank you for submitting your profile! Our team will review it within 3-5 business days.');
    }

    /**
     * Handle sponsor registration submission.
     */
    public function submitSponsor(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'full_name' => 'required|string|min:2|max:255',
            'email' => 'required|email|max:255|unique:sponsors,email',
            'organization' => 'nullable|string|max:255',
            'title' => 'required|string|max:255',
            'sponsor_type' => 'nullable|string|max:255',
            'message' => 'required|string|min:10|max:2000',
            'pledge' => 'required|accepted',
        ]);

        if ($validator->fails()) {
            return back()
                ->withErrors($validator)
                ->withInput();
        }

        // Save to database (uncomment when you have the migration)
        // Sponsor::create([
        //     'full_name' => $request->full_name,
        //     'email' => $request->email,
        //     'organization' => $request->organization,
        //     'title' => $request->title,
        //     'sponsor_type' => $request->sponsor_type,
        //     'message' => $request->message,
        //     'status' => 'pending',
        // ]);

        return back()->with('success', 'Thank you for joining as a sponsor! We will review your application and contact you shortly.');
    }
}
