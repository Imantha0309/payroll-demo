<x-mail::message>
# OFFICIAL COMMUNICATION
## Reference: {{ $subject ?? 'Letter Notification' }}

---

{!! nl2br(e($content)) !!}

---
 
{{ config('app.name') }}
</x-mail::message>
