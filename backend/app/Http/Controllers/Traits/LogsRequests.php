<?php

namespace App\Http\Controllers\Traits;

use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;

trait LogsRequests
{
    /**
     * Log the start of a request
     */
    protected function logRequestStart(Request $request, string $methodName): void
    {
        Log::info("[REQUEST] {$this->getControllerName()}.{$methodName}: Started", [
            'user_id' => auth()->id(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'timestamp' => now()->toISOString()
        ]);
    }

    /**
     * Log the successful completion of a request
     */
    protected function logRequestSuccess(string $methodName, array $additionalData = [], float $executionTime = null): void
    {
        $logData = [
            'user_id' => auth()->id(),
            'timestamp' => now()->toISOString()
        ];

        if ($executionTime !== null) {
            $logData['execution_time_ms'] = round($executionTime, 2);

            // Log performance warning for slow operations
            if ($executionTime > 1000) { // > 1 second
                Log::warning("[PERFORMANCE] {$this->getControllerName()}.{$methodName}: Slow execution ({$logData['execution_time_ms']}ms)", $logData);
            }
        }

        // Merge additional data
        $logData = array_merge($logData, $additionalData);

        Log::info("[SUCCESS] {$this->getControllerName()}.{$methodName}: Completed" . ($executionTime ? " in {$logData['execution_time_ms']}ms" : ""), $logData);
    }

    /**
     * Log errors with consistent formatting
     */
    protected function logRequestError(string $methodName, \Throwable $e, array $additionalData = []): void
    {
        Log::error("[ERROR] {$this->getControllerName()}.{$methodName}: {$e->getMessage()} on line {$e->getLine()}", [
            'user_id' => auth()->id(),
            'exception_class' => get_class($e),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString(),
            'timestamp' => now()->toISOString(),
            ...$additionalData
        ]);
    }

    /**
     * Log important business operations
     */
    protected function logBusinessOperation(string $operation, array $data = []): void
    {
        Log::info("[BUSINESS] {$this->getControllerName()}: {$operation}", [
            'user_id' => auth()->id(),
            'timestamp' => now()->toISOString(),
            ...$data
        ]);
    }

    /**
     * Measure execution time of a callable
     */
    protected function measureExecutionTime(callable $callable): array
    {
        $startTime = microtime(true);
        $result = $callable();
        $executionTime = (microtime(true) - $startTime) * 1000; // Convert to milliseconds

        return [$result, $executionTime];
    }

    /**
     * Log the start of a request without explicit Request object
     */
    protected function logRequestStartAuto(string $methodName): void
    {
        $this->logRequestStart(request(), $methodName);
    }

    /**
     * Log Request Error using backtrace if method unspecified
     */
    protected function logRequestErrorAuto(\Throwable $e, array $additionalData = []): void
    {
        $trace = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 3);
        $methodName = $trace[1]['function'] ?? 'unknown';

        $this->logRequestError($methodName, $e, $additionalData);
    }

    /**
     * Get the controller name for logging
     */
    private function getControllerName(): string
    {
        return class_basename($this);
    }
}