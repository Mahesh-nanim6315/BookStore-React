<?php

namespace App\Providers;

use App\Services\Contracts\LLMServiceInterface;
use Illuminate\Pagination\Paginator;
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
    }
}
