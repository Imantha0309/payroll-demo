<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return string|null
     */
    protected function redirectTo($request)
    {
        // For API requests, return a JSON response instead of redirecting
        if ($request->is('api/*') || $request->expectsJson()) {
            return null; // This will result in a 401 Unauthorized response
        }
        
        // For web requests, redirect to login page
        return route('login');
    }
    
    /**
     * Handle unauthenticated requests.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  array  $guards
     * @return void
     *
     * @throws \Illuminate\Auth\AuthenticationException
     */
    protected function unauthenticated($request, array $guards)
    {
        // For API requests, return a JSON response
        if ($request->is('api/*') || $request->expectsJson()) {
            abort(response()->json(['message' => 'Unauthenticated.'], 401));
        }
        
        // For web requests, use the parent method
        parent::unauthenticated($request, $guards);
    }
}