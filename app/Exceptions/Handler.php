<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * A list of exception types with their corresponding custom log levels.
     *
     * @var array<class-string<\Throwable>, \Psr\Log\LogLevel::*>
     */
    protected $levels = [];

    /**
     * A list of the exception types that are not reported.
     *
     * @var array<int, class-string<\Throwable>>
     */
    protected $dontReport = [];

    /**
     * A list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    /**
     * Render an exception into an HTTP response.
     */
    public function render($request, Throwable $e): Response
    {
        // For Inertia requests, we need to ensure proper handling
        if ($request->header('X-Inertia')) {
            // Handle validation exceptions properly for Inertia
            if ($e instanceof ValidationException) {
                // Return the validation errors in the format Inertia expects
                return parent::render($request, $e);
            }
            
            // For other exceptions that would normally return JSON,
            // we need to convert them to redirect responses with flash data
            $response = parent::render($request, $e);
            
            if ($response->getStatusCode() >= 400) {
                // Convert error responses to redirects for Inertia
                return redirect()->back()->withErrors([
                    'general' => $this->getErrorMessage($e)
                ])->withInput($request->except(['password', 'password_confirmation']));
            }
        }

        return parent::render($request, $e);
    }

    /**
     * Get a user-friendly error message for the exception.
     */
    protected function getErrorMessage(Throwable $e): string
    {
        // Return user-friendly messages for common exceptions
        return match (get_class($e)) {
            'Illuminate\Auth\AuthenticationException' => '请先登录后再继续',
            'Illuminate\Auth\Access\AuthorizationException' => '您没有权限执行此操作',
            'Symfony\Component\HttpKernel\Exception\NotFoundHttpException' => '请求的页面不存在',
            'Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException' => '请求过于频繁，请稍后再试',
            default => '操作失败，请稍后重试'
        };
    }
}