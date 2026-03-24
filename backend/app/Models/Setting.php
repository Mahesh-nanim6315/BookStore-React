<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = ['key', 'value'];

    public static function get($key, $default = null)
    {
        return static::where('key', $key)->value('value') ?? $default;
    }

    public static function set($key, $value)
    {
        return static::updateOrCreate(
            ['key' => $key],
            ['value' => $value]
        );
    }

    public static function taxRate(): float
    {
        $value = static::get('tax_rate', '5');

        if (!is_numeric($value)) {
            return 5.0;
        }

        return max(0, (float) $value);
    }

    public static function calculateTax(float|int $subtotal): int
    {
        return (int) round(((float) $subtotal * static::taxRate()) / 100);
    }
}
