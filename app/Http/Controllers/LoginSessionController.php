<?php

namespace App\Http\Controllers;

use App\Models\LoginSession;
use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class LoginSessionController extends Controller
{
    private function hasPermission($permissionName)
    {
        $user = auth()->user();

        if (!$user) {
            return false;
        }

        $permission = Permission::where('name', $permissionName)->first();

        if (!$permission) {
            return false;
        }

        return DB::table('role_permissions')
            ->where('role_id', $user->role_id)
            ->where('permission_id', $permission->id)
            ->exists();
    }

    public function index(Request $request)
    {
        if (!$this->hasPermission('Security_read_all')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access.'
            ], 403);
        }

        // Auto close sessions older than 8 hours
        try {
            $oldSessions = LoginSession::whereNull('logout_time')
                ->where('login_time', '<', now()->subHours(8))
                ->get();

            foreach ($oldSessions as $session) {
                $session->logout_time = Carbon::parse($session->login_time)->addHours(2);
                $session->save();
            }
        } catch (\Exception $e) {
            Log::warning('Failed to auto-close old login sessions: ' . $e->getMessage());
        }

        $perPage = $request->get('per_page', 10);
        $search = trim($request->get('search', ''));

        // Build query
        $query = LoginSession::with('user')
            ->orderByDesc('id');

        // Search
        if (!empty($search) && strlen($search) >= 3) {

            $query->where(function ($q) use ($search) {

                $q->where('id', 'LIKE', "%{$search}%")
                    ->orWhere('user_id', 'LIKE', "%{$search}%")
                    ->orWhere('login_time', 'LIKE', "%{$search}%")
                    ->orWhere('logout_time', 'LIKE', "%{$search}%")
                    ->orWhere('ip_address', 'LIKE', "%{$search}%")
                    ->orWhereHas('user', function ($u) use ($search) {
                        $u->where('full_name', 'LIKE', "%{$search}%")
                          ->orWhere('username', 'LIKE', "%{$search}%");
                    });

            });
        }

        $sessions = $query->paginate($perPage);

        $data = $sessions->getCollection()->map(function ($session) {
            return [
                'id' => $session->id,
                'user_id' => $session->user_id,
                'user_name' => optional($session->user)->full_name,
                'login_time' => $session->login_time,
                'logout_time' => $session->logout_time,
                'ip_address' => $session->ip_address,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
            'current_page' => $sessions->currentPage(),
            'last_page' => $sessions->lastPage(),
            'per_page' => $sessions->perPage(),
            'total' => $sessions->total(),
        ]);
    }
}