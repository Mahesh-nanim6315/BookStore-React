<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class ApiRequestLogger
{
    public function handle(Request $request, Closure $next)
    {
        $startedAt = microtime(true);
        $response = $next($request);

        try {
            if (! $this->shouldLog($request)) {
                return $response;
            }

            $context = [
                'method' => $request->method(),
                'path' => $request->path(),
                'status' => $response->getStatusCode(),
                'duration_ms' => round((microtime(true) - $startedAt) * 1000, 2),
                'ip' => $request->ip(),
                'user_id' => $request->user()?->id,
                'request' => $this->sanitizePayload($request->all()),
                'response' => $this->extractResponseSummary($response),
            ];

            if ($response->getStatusCode() >= 400) {
                Log::channel('api')->warning('API request failed', $context);
            } else {
                Log::channel('api')->info('API request succeeded', $context);
            }
        } catch (\Throwable $e) {
            // Prevent logging failures from crashing the response
            Log::channel('api')->error('Logging middleware error', [
                'exception' => $e::class,
                'message' => $e->getMessage(),
            ]);
        }

        return $response;
    }

    private function shouldLog(Request $request): bool
    {
        return $request->expectsJson()
            || $request->is('api/*')
            || $request->is('v1/*');
    }

    private function sanitizePayload(array $payload): array
    {
        $sensitiveKeys = [
            'password',
            'password_confirmation',
            'current_password',
            'token',
        ];

        array_walk_recursive($payload, function (&$value, $key) use ($sensitiveKeys) {
            if (in_array($key, $sensitiveKeys, true)) {
                $value = '[REDACTED]';
            }
        });

        return $payload;
    }

    private function extractResponseSummary(Response $response): array
    {
        $summary = [];

        if (method_exists($response, 'getContent')) {
            $content = $response->getContent();

            if (is_string($content) && $content !== '') {
                $decoded = json_decode($content, true);

                if (is_array($decoded)) {
                    $summary = array_filter([
                        'success' => $decoded['success'] ?? null,
                        'message' => $decoded['message'] ?? null,
                    ], static fn ($value) => $value !== null);
                }
            }
        }

        return $summary;
    }
}
