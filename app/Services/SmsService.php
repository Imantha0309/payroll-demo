<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SmsService
{
    private const SERVICE_URL = 'https://msmsenterpriseapi.mobitel.lk/mSMSEnterpriseAPI/mSMSEnterpriseAPI.php';

    private string $username;
    private string $password;
    private string $alias;
    
    /**
     * Stores the session XML string if a batch session is active.
     */
    private ?string $activeSessionXml = null;

    public function __construct()
    {
        $this->username = config('sms.username', '');
        $this->password = config('sms.password', '');
        $this->alias    = config('sms.alias', '');
    }

    /**
     * Send application status SMS based on application type and requested status.
     * Optimized to reuse a single session for all recipients.
     */
    public function sendApplicationStatusSms(string $applicationType, string $requestedStatus, string $message): void
    {
        try {
            $roleId = null;
            $designationId = null;
            $status = strtolower(trim($requestedStatus));

            // Define routing logic
            if ($applicationType === 'PO') {
                if ($status === 'forward for recommendation') {
                    $roleId = 5; $designationId = 6;
                } elseif ($status === 'recommended') {
                    $roleId = 2; $designationId = 5;
                }
            } elseif ($applicationType === 'MP') {
                if ($status === 'check 3' || $status === 'checked') {
                    $roleId = 5; $designationId = 6;
                } elseif ($status === 'forward for recommendation') {
                    $roleId = 2; $designationId = 5;
                } elseif ($status === 'recommended') {
                    $roleId = 2; $designationId = 2;
                }
            }

            if (!$roleId || !$designationId) return;

            $users = DB::table('users')
                ->where('role_id', $roleId)
                ->where('designation_id', $designationId)
                ->where('is_active', true)
                ->whereNotNull('phone_no')
                ->where('phone_no', '!=', '')
                ->select('id', 'full_name', 'phone_no')
                ->get();

            if ($users->isEmpty()) {
                Log::info("SmsService: No users found for Role: {$roleId}, Desig: {$designationId}");
                return;
            }

            $baseUrl = "https://pas.pmoffice.gov.lk:903/dist/";

            // --- BATCH SEND START ---
            $this->startSession();

            foreach ($users as $user) {
                $fullMessage = "Dear " . $user->full_name . ", " . $message . " " . $baseUrl;
                $sent = $this->sendSms($user->phone_no, $fullMessage);
                Log::info("SmsService: Status SMS " . ($sent ? 'sent' : 'FAILED') . " to {$user->full_name}");
            }

            $this->endSession();
            // --- BATCH SEND END ---

        } catch (\Exception $e) {
            Log::error('SmsService::sendApplicationStatusSms error: ' . $e->getMessage());
            $this->endSession(); 
        }
    }

    /**
     * Find users with permission and send SMS notifications.
     * Optimized to reuse a single session.
     */
    public function notifyUsersWithPermission(string $permissionName, string $message): void
    {
        try {
            $permission = DB::table('permissions')->where('name', $permissionName)->first();
            if (!$permission) return;

            $roleIds = DB::table('role_permissions')->where('permission_id', $permission->id)->pluck('role_id');
            if ($roleIds->isEmpty()) return;

            $users = DB::table('users')
                ->leftJoin('designations', 'users.designation_id', '=', 'designations.id')
                ->whereIn('users.role_id', $roleIds)
                ->where('users.is_active', true)
                ->whereNotNull('users.phone_no')
                ->where('users.phone_no', '!=', '')
                ->select('users.full_name', 'users.phone_no')
                ->get();

            if ($users->isEmpty()) return;

            $baseUrl = "https://pas.pmoffice.gov.lk:903/dist/";

            $this->startSession();
            foreach ($users as $user) {
                $fullMessage = "Dear " . $user->full_name . ", " . $message . " " . $baseUrl;
                $this->sendSms($user->phone_no, $fullMessage);
            }
            $this->endSession();

        } catch (\Exception $e) {
            Log::error('SmsService::notifyUsersWithPermission error: ' . $e->getMessage());
            $this->endSession();
        }
    }

    /**
     * Core logic to send an SMS. 
     * Handles both standalone calls and batch calls automatically.
     */
    public function sendSms(string $phoneNumber, string $message): bool
    {
        try {
            $isStandalone = false;

            // If no global session exists, create a one-off session
            if (!$this->activeSessionXml) {
                if (!$this->startSession()) return false;
                $isStandalone = true;
            }

            $result = $this->sendMessageInternal($this->activeSessionXml, $phoneNumber, $message);

            // If it was a one-off session, close it immediately
            if ($isStandalone) {
                $this->endSession();
            }

            return $result;
        } catch (\Exception $e) {
            Log::error('SmsService sendSms error: ' . $e->getMessage());
            return false;
        }
    }

    // -------------------------------------------------------------------------
    // Session Management Helpers
    // -------------------------------------------------------------------------

    private function startSession(): bool
    {
        if (empty($this->username) || empty($this->password)) {
            Log::error('SmsService: Credentials missing.');
            return false;
        }

        $this->activeSessionXml = $this->createSession();
        return !empty($this->activeSessionXml);
    }

    private function endSession(): void
    {
        if ($this->activeSessionXml) {
            $this->closeSession($this->activeSessionXml);
            $this->activeSessionXml = null;
        }
    }

    // -------------------------------------------------------------------------
    // Private SOAP Helpers
    // -------------------------------------------------------------------------

    private function createSession(): ?string
    {
        $soapRequest = <<<XML
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="https://ws.esms.mobitel.lk/">
   <soapenv:Header/>
   <soapenv:Body>
      <ws:createSession>
         <user>
            <username>{$this->username}</username>
            <password>{$this->password}</password>
         </user>
      </ws:createSession>
   </soapenv:Body>
</soapenv:Envelope>
XML;
        $response = $this->postSoap($soapRequest);
        return $this->extractInnerXml($response, 'return');
    }

    private function sendMessageInternal(string $sessionXml, string $phoneNumber, string $message): bool
    {
        $soapRequest = <<<XML
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="https://ws.esms.mobitel.lk/">
   <soapenv:Header/>
   <soapenv:Body>
      <ws:sendMessages>
         <session>{$sessionXml}</session>
         <smsMessage>
            <sender>{$this->alias}</sender>
            <recipients>{$phoneNumber}</recipients>
            <message>{$message}</message>
            <messageType>1</messageType>
         </smsMessage>
      </ws:sendMessages>
   </soapenv:Body>
</soapenv:Envelope>
XML;
        $response  = $this->postSoap($soapRequest);
        $returnVal = $this->extractInnerXml($response, 'return');

        return $returnVal === '200' || $returnVal === '0' || !empty($returnVal);
    }

    private function closeSession(string $sessionXml): void
    {
        $soapRequest = <<<XML
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="https://ws.esms.mobitel.lk/">
   <soapenv:Header/>
   <soapenv:Body>
      <ws:closeSession>
         <session>{$sessionXml}</session>
      </ws:closeSession>
   </soapenv:Body>
</soapenv:Envelope>
XML;
        $this->postSoap($soapRequest);
    }

    private function postSoap(string $soapRequest): string
    {
        $ch = curl_init(self::SERVICE_URL);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $soapRequest,
            CURLOPT_HTTPHEADER     => [
                'Content-Type: text/xml; charset=utf-8',
                'Content-Length: ' . strlen($soapRequest),
            ],
            CURLOPT_TIMEOUT        => 30,
            CURLOPT_SSL_VERIFYPEER => false,
        ]);

        $response = curl_exec($ch);
        curl_close($ch);

        return $response ?: '';
    }

    private function extractInnerXml(string $xml, string $tagName): ?string
    {
        if (empty($xml)) return null;

        if (preg_match('/<' . preg_quote($tagName, '/') . '\b[^>]*>(.*?)<\/' . preg_quote($tagName, '/') . '>/s', $xml, $matches)) {
            return $matches[1];
        }

        if (preg_match('/<[^:>]+:' . preg_quote($tagName, '/') . '\b[^>]*>(.*?)<\/[^:>]+:' . preg_quote($tagName, '/') . '>/s', $xml, $matches)) {
            return $matches[1];
        }

        return null;
    }

    /**
     * Send a pending application SMS to users with Role ID 7 
     * if the application's submitted_through ID equals 2.
     */
    public function sendPendingApplicationSms(int $applicationId): void
    {
        try {
            Log::info("SmsService: [TRIGGERED] Checking Pending Application for ID: {$applicationId}");

            // 1. Fetch application details
            $application = DB::table('applications')->where('id', $applicationId)->first();

            if (!$application) {
                Log::warning("SmsService: [ERROR] Application ID {$applicationId} not found in database.");
                return;
            }

            $appArray = (array)$application;
            Log::info("SmsService: [DB DATA] Row content: " . json_encode($appArray));

            if (!array_key_exists('submitted_through', $appArray)) {
                Log::error("SmsService: [SCHEMA ERROR] 'submitted_through' column does not exist in your applications table.");
                return;
            }

            Log::info("SmsService: [CHECK] Value of submitted_through is: '" . $application->submitted_through . "'");

            if ((int)$application->submitted_through !== 2) {
                Log::info("SmsService: [SKIPPED] Core logic stopped because submitted_through is not 2.");
                return;
            }

            // 2. Fetch active users assigned to role_id 7
            $users = DB::table('users')
                ->where('role_id', 7)
                ->where('is_active', true)
                ->whereNotNull('phone_no')
                ->where('phone_no', '!=', '')
                ->select('id', 'full_name', 'phone_no')
                ->get();

            if ($users->isEmpty()) {
                Log::warning("SmsService: [USERS] No active users found with role_id = 7 and valid phone numbers.");
                return;
            }

            Log::info("SmsService: [USERS] Found " . $users->count() . " user(s) to notify.");

            $baseUrl = "https://pmoffice.gov.lk";
            $messageBody = " has been created by ";

            // 3. Send SMS using single batch session
            $this->startSession();

            foreach ($users as $user) {
                $fullMessage = "Dear " . $user->full_name . ", PMO FLMS: Application " . $application->code . $messageBody . $application->organization_name . " organization. Please take an action at: " ." ". $baseUrl;
                Log::info("SmsService: [API ATTEMPT] Sending to phone: {$user->phone_no}");
                
                $sent = $this->sendSms($user->phone_no, $fullMessage);
                
                if ($sent) {
                    Log::info("SmsService: [SUCCESS] SMS sent to {$user->full_name}");
                } else {
                    Log::error("SmsService: [API FAILURE] Mobitel API rejected the message for {$user->full_name}");
                }
            }

            $this->endSession();

        } catch (\Exception $e) {
            Log::error('SmsService::sendPendingApplicationSms Exception: ' . $e->getMessage());
            $this->endSession(); 
        }
    }

}