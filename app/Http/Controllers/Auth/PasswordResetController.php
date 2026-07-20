<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class PasswordResetController extends Controller
{
    /**
     * Send password reset link to user's email
     */
    public function sendResetLinkEmail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please provide a valid email address.',
                'errors' => $validator->errors()
            ], 422);
        }

        $email = $request->email;
        
        // Check if user exists (username column stores the email)
        $user = User::where('username', $email)->first();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Email not recognised under the system.'
            ], 404);
        }

        // Check if user is active
        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Your account has been deactivated. Please contact the administrator.'
            ], 403);
        }

        // Clean up very old records (older than 30 days) to prevent bloat
        DB::table('password_resets')
            ->where('created_at', '<', Carbon::now()->subDays(30))
            ->delete();

        // Generate a random token
        $token = Str::random(64);
        
        // Token expiration time: 30 minutes (can be changed here)
        $expireDate = Carbon::now()->addMinutes(30);

        // Store the token in database
        DB::table('password_resets')->insert([
            'email' => $email,
            'user_id' => $user->id,
            'token' => Hash::make($token),
            'expire_date' => $expireDate,
            'created_at' => Carbon::now()
        ]);

        // Create reset link
        $resetLink = env('FRONTEND_URL', 'http://localhost:3000') . '/reset-password?token=' . $token . '&email=' . urlencode($email);

        try {
            // Send email
            Mail::send('emails.password-reset', [
                'resetLink' => $resetLink,
                'user' => $user,
                'expireMinutes' => 30 // Can be changed to match the expiration time above
            ], function ($message) use ($email) {
                $message->to($email);
                $message->subject('Password Reset Request - FLMS');
            });

            return response()->json([
                'success' => true,
                'message' => 'Password reset link has been sent to your email address.'
            ], 200);
        } catch (\Exception $e) {
            Log::error('Password reset email failed: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to send reset email. Please contact administrator.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Validate reset token
     */
    public function validateToken(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'token' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'valid' => false,
                'success' => false,
                'message' => 'Invalid request.'
            ], 422);
        }

        // Find all password reset records for this email
        $resetRecords = DB::table('password_resets')
            ->where('email', $request->email)
            ->get();

        if ($resetRecords->isEmpty()) {
            return response()->json([
                'valid' => false,
                'success' => false,
                'message' => 'Reset link expired or invalid.'
            ], 400);
        }

        // Find the record that matches the token
        $resetRecord = null;
        foreach ($resetRecords as $record) {
            if (Hash::check($request->token, $record->token)) {
                $resetRecord = $record;
                break;
            }
        }

        // If no matching token found
        if (!$resetRecord) {
            return response()->json([
                'valid' => false,
                'success' => false,
                'message' => 'Reset link expired. Invalid reset token.'
            ], 400);
        }

        // Check if already used
        if ($resetRecord->resetted_at !== null) {
            return response()->json([
                'valid' => false,
                'success' => false,
                'message' => 'Reset link expired. This link has already been used.'
            ], 400);
        }

        // Check if expired
        $expireDate = Carbon::parse($resetRecord->expire_date);
        if (Carbon::now()->greaterThan($expireDate)) {
            return response()->json([
                'valid' => false,
                'success' => false,
                'message' => 'Reset link expired. Please request a new password reset link.'
            ], 400);
        }

        return response()->json([
            'valid' => true,
            'success' => true,
            'message' => 'Token is valid.'
        ], 200);
    }

    /**
     * Reset the user's password
     */
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/',
            'password_confirmation' => 'required|string|same:password',
            'token' => 'required|string'
        ], [
            'password.required' => 'Password is required',
            'password.min' => 'Password must be at least 6 characters',
            'password.regex' => 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
            'password_confirmation.required' => 'Password confirmation is required',
            'password_confirmation.same' => 'Password confirmation does not match'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $validator->errors()
            ], 422);
        }

        // Find all password reset records for this email
        $resetRecords = DB::table('password_resets')
            ->where('email', $request->email)
            ->get();

        if ($resetRecords->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Reset link expired. Please request a new password reset link.'
            ], 400);
        }

        // Find the record that matches the token
        $resetRecord = null;
        foreach ($resetRecords as $record) {
            if (Hash::check($request->token, $record->token)) {
                $resetRecord = $record;
                break;
            }
        }

        // If no matching token found
        if (!$resetRecord) {
            return response()->json([
                'success' => false,
                'message' => 'Reset link expired. Invalid reset token.'
            ], 400);
        }

        // Check if token has already been used
        if ($resetRecord->resetted_at !== null) {
            return response()->json([
                'success' => false,
                'message' => 'Reset link expired. This link has already been used.'
            ], 400);
        }

        // Check if token is expired
        $expireDate = Carbon::parse($resetRecord->expire_date);
        if (Carbon::now()->greaterThan($expireDate)) {
            return response()->json([
                'success' => false,
                'message' => 'Reset link expired. Please request a new password reset link.'
            ], 400);
        }

        // Find user
        $user = User::where('username', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.'
            ], 404);
        }

        // Update password
        $user->password = Hash::make($request->password);
        $user->save();

        // Mark the token as used
        DB::table('password_resets')
            ->where('id', $resetRecord->id)
            ->update([
                'resetted_at' => Carbon::now()
            ]);

        // Revoke all existing tokens for security
        $user->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Your password has been reset successfully. You can now login with your new password.'
        ], 200);
    }
}
