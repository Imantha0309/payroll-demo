<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Mobitel eSMS API Credentials
    |--------------------------------------------------------------------------
    |
    | These values are used by the SmsService to authenticate with the
    | Mobitel mSMS Enterprise API and send outgoing SMS messages.
    |
    */

    'username' => env('SMS_USERNAME', ''),

    'password' => env('SMS_PASSWORD', ''),

    'alias' => env('SMS_ALIAS', ''),

];
