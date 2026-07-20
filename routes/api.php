<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\AdminLogController;
use App\Http\Controllers\LoginSessionController;


// ─── CSRF Cookie ──────────────────────────────────────────────────────────────
Route::get('/sanctum/csrf-cookie', function (Request $request) {
    return response()->json(['message' => 'CSRF cookie set']);
});


// ─── Authentication (public) ──────────────────────────────────────────────────
Route::post('/login', [AuthController::class, 'login']);
// Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
// Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('auth:sanctum');
// Route::get('/user-sessions/{user_id}', [AuthController::class, 'getUserSessions'])->middleware('auth:sanctum');
// Route::get('/login-sessions', [LoginSessionController::class, 'index'])->middleware('auth:sanctum');


// ─── Password Reset (public) ──────────────────────────────────────────────────
Route::post('/password/forgot', [PasswordResetController::class, 'sendResetLinkEmail']);
Route::post('/password/validate-token', [PasswordResetController::class, 'validateToken']);
Route::post('/password/reset', [PasswordResetController::class, 'resetPassword']);

// Roles
Route::get('/public/roles', [RoleController::class, 'publicIndex']);


// Role-Permissions Management
Route::get('/role-permissions', [RoleController::class, 'getRolePermissions']);
Route::post('/role-permissions/sync', [RoleController::class, 'syncRolePermissions']);
Route::post('/role-permissions/sync-role', [RoleController::class, 'syncSingleRolePermissions']);



// ─── Protected Routes ─────────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    //Authentication
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    Route::get('/user-sessions/{user_id}', [AuthController::class, 'getUserSessions']);
    Route::get('/login-sessions', [LoginSessionController::class, 'index']);


    // Dashboard
    Route::get(
        'dashboard/stats',
        [DashboardController::class, 'getStats']
    );


    // User — reset password
    Route::post(
        '/users/reset-password',
        [UserController::class, 'resetPassword']
    );


    // User sessions
    Route::get(
        '/user-sessions/{user_id}',
        [AuthController::class, 'getUserSessions']
    );


    /*
    |--------------------------------------------------------------------------
    | Permission Management
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/permissions',
        [PermissionController::class, 'index']
    );


    Route::post(
        '/permissions',
        [PermissionController::class, 'store']
    );


    Route::put(
        '/permissions/{id}',
        [PermissionController::class, 'update']
    );


    Route::delete(
        '/permissions/{id}',
        [PermissionController::class, 'destroy']
    );

    Route::get('/roles', [RoleController::class, 'index']);

});

//admin logs
Route::get('/admin-logs', [AdminLogController::class, 'index']);