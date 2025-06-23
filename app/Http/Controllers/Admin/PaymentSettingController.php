<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentSettingController extends Controller
{
    public function index()
    {
        $settings = PaymentSetting::all()->groupBy('group');

        return Inertia::render('dashboard/payment/index', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        \Log::info('Payment settings update request', $request->all());

        // Handle direct form data (not nested in settings array)
        $formData = $request->except(['_token', '_method']);

        foreach ($formData as $key => $value) {
            if (PaymentSetting::where('key', $key)->exists()) {
                PaymentSetting::set($key, $value);
                \Log::info("Updated setting: {$key} = {$value}");
            }
        }

        PaymentSetting::clearCache();

        return redirect()->back()->with('success', 'Payment settings updated successfully.');
    }
}
