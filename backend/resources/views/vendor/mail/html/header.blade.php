@props(['url'])
<tr>
<td class="header" style="text-align: center; padding: 25px 0;">
<a href="{{ $url }}" style="display: inline-block; color: #3d4852; font-size: 19px; font-weight: bold; text-decoration: none;">
@if (trim($slot) === 'Laravel')
    {{ config('app.name') }}
@else
    {{ $slot }}
@endif
</a>
</td>
</tr>
