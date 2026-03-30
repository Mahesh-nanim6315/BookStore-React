<?php

namespace App\Providers;

use App\Services\Contracts\LLMServiceInterface;
use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Pagination\Paginator;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{

    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(LLMServiceInterface::class, function () {
            $provider = config('ai.provider', 'ollama');
            $providers = config('ai.providers', []);

            if (! isset($providers[$provider])) {
                throw new \RuntimeException("Invalid AI provider: {$provider}");
            }

            return app($providers[$provider]);
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Paginator::useBootstrap();

        Password::defaults(function () {
            return Password::min(8)
                ->mixedCase()
                ->numbers()
                ->symbols();
        });

        ResetPassword::createUrlUsing(function (User $user, string $token) {
            $frontendBase = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173')), '/');

            return $frontendBase.'/reset-password/'.$token.'?email='.urlencode($user->email);
        });
    }
}
