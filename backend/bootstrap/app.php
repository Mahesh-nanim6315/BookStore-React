<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
    )
    ->withMiddleware(function (Middleware $middleware) {

        // ✅ ADD THIS BLOCK 👇
        $middleware->redirectGuestsTo(function () {
            return null; // or abort(401)
        });

        $middleware->web(append: [
            \App\Http\Middleware\SetLocale::class,
            \App\Http\Middleware\CheckMaintenanceMode::class,
        ]);

        $middleware->api(append: [
            \App\Http\Middleware\ApiRequestLogger::class,
            // \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

        $middleware->alias([
            'admin' => \App\Http\Middleware\AdminMiddleware::class,
            'role' => \App\Http\Middleware\RoleMiddleware::class,
            'permission' => \App\Http\Middleware\PermissionMiddleware::class,
            'maintenance' => \App\Http\Middleware\CheckMaintenanceMode::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->dontFlash([
            'current_password',
            'password',
            'password_confirmation',
        ]);

        $exceptions->reportable(function (\Throwable $exception) {
            $request = request();

            if (! $request || ! ($request->expectsJson() || $request->is('api/*') || $request->is('v1/*'))) {
                return;
            }

            Log::channel('api')->error('Unhandled API exception', [
                'method' => $request->method(),
                'path' => $request->path(),
                'ip' => $request->ip(),
                'user_id' => $request->user()?->id,
                'message' => $exception->getMessage(),
                'exception' => $exception::class,
            ]);
        });

        $exceptions->shouldRenderJsonWhen(function (Request $request, \Throwable $exception) {
            return $request->expectsJson() || $request->is('api/*') || $request->is('v1/*');
        });

        $exceptions->render(function (ModelNotFoundException $exception, Request $request) {
            return response()->json([
                'success' => false,
                'message' => 'Resource not found',
            ], Response::HTTP_NOT_FOUND);
        });

        $exceptions->render(function (ValidationException $exception, Request $request) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $exception->errors(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        });

        $exceptions->render(function (AuthenticationException $exception, Request $request) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
            ], Response::HTTP_UNAUTHORIZED);
        });

        $exceptions->render(function (HttpExceptionInterface $exception, Request $request) {
            return response()->json([
                'success' => false,
                'message' => $exception->getMessage() ?: Response::$statusTexts[$exception->getStatusCode()] ?? 'HTTP Error',
            ], $exception->getStatusCode());
        });

        $exceptions->render(function (\Throwable $exception, Request $request) {
            return response()->json([
                'success' => false,
                'message' => config('app.debug')
                    ? $exception->getMessage()
                    : 'Something went wrong',
                'trace' => config('app.debug')
                    ? $exception->getTrace()
                    : [],
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        });
    })
    ->create();
