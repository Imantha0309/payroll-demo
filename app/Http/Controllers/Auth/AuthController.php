<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Models\User;
use App\Models\LoginSession;
use App\Models\AdminLog;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;

class AuthController extends Controller
{
    /**
     * Validate Google reCAPTCHA
     */
    private function validateGoogleRecaptcha($recaptcha)
    {
        $secretKey = '6Ldt1-krAAAAACx0FHFP21PnGqItFcZH-yoqXx1c';
        $response = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
            'secret' => $secretKey,
            'response' => $recaptcha
        ]);

        $result = $response->json();

        if ($result['success'] == true) {
            return ['status' => 1, "message" => "Google reCAPTCHA verified"];
        } else {
            return ['status' => 0, "message" => "Error in Google reCAPTCHA"];
        }
    }

    /**
     * Login user and return Sanctum token
     */
    public function login(LoginRequest $request)
    {
        // Validate reCAPTCHA first
        $recaptchaValidation = $this->validateGoogleRecaptcha($request->input('recaptcha'));
        if ($recaptchaValidation['status'] == 0) {
            return response()->json([
                'status' => false,
                'message' => 'reCAPTCHA verification failed. Please try again.'
            ], 422);
        }

        $user = User::where('username', $request->input('email'))->first();

        if (!$user || !Hash::check($request->input('password'), $user->password)) {
            return response()->json([
                'status' => false,
                'message' => 'Invalid credentials'
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'status' => false,
                'message' => 'Your account has been deactivated. Please contact the administrator.'
            ], 403);
        }

        // Load user permissions
        $user->load(['role.permissions']);

        // Get permissions as array
        $permissions = $user->role->permissions->pluck('name')->toArray();

        // Revoke old tokens
        $user->tokens()->delete();

        // Close any existing active sessions for this user that were left open
        LoginSession::where('user_id', $user->id)
            ->whereNull('logout_time')
            ->update([
                'logout_time' => Carbon::now()
            ]);

        // Create login session
        $loginSession = LoginSession::create([
            'user_id' => $user->id,
            'login_time' => Carbon::now(),
            'logout_time' => null,
            'ip_address' => $request->ip(),
        ]);


        // Create new token
        $token = $user->createToken('auth_token')->plainTextToken;

        // Admin Log — Login
        AdminLog::create([
            'session_id'  => $loginSession->id,
            'module'      => 'Security',
            'action_type' => 'Login',
            'performed_by'=> $user->full_name,
            'details'     => $user->full_name . ' (' . $user->username . ') logged in.',
            'log'         => 'Login',
        ]);

        return response()->json([
            'status' => true,
            'token' => $token,
            'role' => $user->role->name ?? null,
            'user' => $user,
            'permissions' => $permissions,
            'login_session_id' => $loginSession->id,
        ]);
    }

    /**
     * Logout user (delete all tokens and update login session)
     */
    public function logout()
    {
        $user = auth()->user();

        if ($user) {
            // Get the login_session_id from the request or fallback to most recent active session
            $loginSessionId = request()->header('X-Login-Session-ID');
            if (!$loginSessionId) {
                $activeSession = LoginSession::where('user_id', $user->id)
                    ->whereNull('logout_time')
                    ->orderBy('login_time', 'desc')
                    ->first();
                $loginSessionId = $activeSession ? $activeSession->id : null;
            }

            // Update logout time in login_session table
            if ($loginSessionId) {
                LoginSession::where('id', $loginSessionId)
                    ->where('user_id', $user->id)
                    ->whereNull('logout_time')
                    ->update([
                        'logout_time' => Carbon::now()
                    ]);
            } else {
                // Fallback: update the most recent active session
                LoginSession::where('user_id', $user->id)
                    ->whereNull('logout_time')
                    ->orderBy('login_time', 'desc')
                    ->limit(1)
                    ->update([
                        'logout_time' => Carbon::now()
                    ]);
            }

            // Delete all tokens (avoid trait method for better static analysis)
            \Laravel\Sanctum\PersonalAccessToken::where('tokenable_id', $user->id)->delete();

            // Admin Log — Logout
            AdminLog::create([
                'session_id'  => $loginSessionId,
                'module'      => 'Security',
                'action_type' => 'Logout',
                'performed_by'=> $user->full_name,
                'details'     => $user->full_name . ' (' . $user->username . ') logged out.',
                'log'         => 'Logout',
            ]);
        }

        return response()->json([
            'status' => true,
            'message' => 'Logged out successfully'
        ]);
    }

    /**
     * Get user's login sessions
     */
    public function getUserSessions($userId)
    {
        $sessions = LoginSession::where('user_id', $userId)
            ->orderBy('login_time', 'desc')
            ->get();

        return response()->json([
            'status' => true,
            'sessions' => $sessions
        ]);
    }
}