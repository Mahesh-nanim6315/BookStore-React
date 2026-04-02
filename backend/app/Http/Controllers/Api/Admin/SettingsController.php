<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SettingsController extends Controller
{
    private const DEFAULTS = [
        'site_name' => '',
        'support_email' => '',
        'tax_rate' => '5',
        'maintenance_mode' => '0',
        'subscriptions_enabled' => '1',
        'free_trial_days' => '0',
        'auto_approve_reviews' => '0',
        'books_per_page' => '12',
    ];

    public function index()
    {
        try {
            $settings = $this->settingsPayload();

            return response()->json([
                'success' => true,
                'data' => [
                    'settings' => $settings
                ]
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('SettingsController.index: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while loading settings.'
            ], 500);
        }
    }

    public function update(Request $request)
    {
        try {
            $validated = $request->validate([
                'site_name' => ['nullable', 'string', 'max:255'],
                'support_email' => ['nullable', 'email', 'max:255'],
                'tax_rate' => ['required', 'numeric', 'min:0', 'max:100'],
                'maintenance_mode' => ['required', Rule::in(['0', '1', 0, 1, true, false])],
                'subscriptions_enabled' => ['required', Rule::in(['0', '1', 0, 1, true, false])],
                'free_trial_days' => ['required', 'integer', 'min:0', 'max:365'],
                'auto_approve_reviews' => ['required', Rule::in(['0', '1', 0, 1, true, false])],
                'books_per_page' => ['required', 'integer', 'min:5', 'max:100'],
            ]);

            $normalized = [
                'site_name' => trim((string) ($validated['site_name'] ?? '')),
                'support_email' => trim((string) ($validated['support_email'] ?? '')),
                'tax_rate' => $this->normalizeNumericSetting($validated['tax_rate']),
                'maintenance_mode' => $this->normalizeBooleanSetting($validated['maintenance_mode']),
                'subscriptions_enabled' => $this->normalizeBooleanSetting($validated['subscriptions_enabled']),
                'free_trial_days' => (string) (int) $validated['free_trial_days'],
                'auto_approve_reviews' => $this->normalizeBooleanSetting($validated['auto_approve_reviews']),
                'books_per_page' => (string) (int) $validated['books_per_page'],
            ];

            foreach ($normalized as $key => $value) {
                Setting::set($key, $value);
            }

            return response()->json([
                'success' => true,
                'message' => 'Settings updated successfully.',
                'data' => [
                    'settings' => $this->settingsPayload()
                ]
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('SettingsController.update: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while updating settings.'
            ], 500);
        }
    }

    public static function publicSettingsPayload(): array
    {
        return [
            'site_name' => (string) Setting::get('site_name', ''),
            'support_email' => (string) Setting::get('support_email', ''),
            'tax_rate' => (string) Setting::get('tax_rate', '5'),
            'maintenance_mode' => (string) Setting::get('maintenance_mode', '0'),
        ];
    }

    private function settingsPayload(): array
    {
        return array_merge(
            self::DEFAULTS,
            Setting::query()->pluck('value', 'key')->toArray(),
        );
    }

    private function normalizeBooleanSetting(mixed $value): string
    {
        return in_array($value, ['1', 1, true, 'true'], true) ? '1' : '0';
    }

    private function normalizeNumericSetting(mixed $value): string
    {
        $number = is_numeric($value) ? (float) $value : 0;
        $normalized = round(max(0, $number), 2);

        return rtrim(rtrim(number_format($normalized, 2, '.', ''), '0'), '.') ?: '0';
    }
}
