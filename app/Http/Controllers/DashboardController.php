<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\LoginSession;
use App\Models\Role;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Get login and authentication statistics
     */
    public function getStats()
    {
        try {
            $user = auth()->user();
            
            // Total registered users
            $totalUsers = User::count();
            
            // Active sessions (where logout_time is null)
            $activeSessions = LoginSession::whereNull('logout_time')->count();
            
            // Total login sessions ever recorded
            $totalLogins = LoginSession::count();
            
            // Logins today
            $loginsToday = LoginSession::whereDate('login_time', Carbon::today())->count();
            
            // Count users per role
            $roleDistribution = Role::withCount('users')->get()->map(function($role) {
                return [
                    'name' => $role->name,
                    'count' => $role->users_count
                ];
            });

            // Get recent login sessions
            $recentSessions = LoginSession::with('user.role')
                ->orderBy('login_time', 'desc')
                ->limit(5)
                ->get()
                ->map(function($session) {
                    return [
                        'username' => $session->user->username ?? 'Unknown',
                        'full_name' => $session->user->full_name ?? 'Unknown',
                        'role' => $session->user->role->name ?? 'N/A',
                        'login_time' => $session->login_time,
                        'ip_address' => $session->ip_address,
                        'is_active' => is_null($session->logout_time)
                    ];
                });

            return response()->json([
                'success' => true,
                'stats' => [
                    'total_users' => $totalUsers,
                    'active_sessions' => $activeSessions,
                    'total_logins' => $totalLogins,
                    'logins_today' => $loginsToday,
                ],
                'role_distribution' => $roleDistribution,
                'recent_sessions' => $recentSessions
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch auth stats',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
