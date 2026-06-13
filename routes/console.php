<?php

use Illuminate\Support\Facades\Schedule;
use App\Models\Activity;

Schedule::call(function () {

    $now = now();

    Activity::where('type', 'event')
        ->where('activity_date', '<', now())
        ->whereNotIn('status', ['cancelled', 'completed'])
        ->update(['status' => 'completed']);

    Activity::where('type', 'task')
        ->whereNotIn('status', ['completed', 'cancelled', 'overdue'])
        ->whereNotNull('deadline')
        ->where('deadline', '<', now())
        ->update(['status' => 'overdue']);

})->everyMinute();