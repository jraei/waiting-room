<?php

use App\Http\Controllers\TaskController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

// Dashboard with tasks

// Task API routes
Route::middleware('auth')->prefix('tasks')->name('tasks.')->group(function () {
    Route::get('/', [TaskController::class, 'index'])->name('index');
    Route::post('/', [TaskController::class, 'store'])->name('store');
    Route::patch('/{task}/quadrant', [TaskController::class, 'updateQuadrant'])->name('update-quadrant');
    Route::post('/{task}/complete', [TaskController::class, 'complete'])->name('complete');
    Route::delete('/{task}', [TaskController::class, 'destroy'])->name('destroy');
});

require __DIR__ . '/settings.php';
