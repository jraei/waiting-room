<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'quadrant',
        'urgency_score',
        'ai_reasoning',
        'is_completed',
        'position',
    ];

    protected $casts = [
        'urgency_score' => 'integer',
        'is_completed' => 'boolean',
        'position' => 'integer',
    ];

    /**
     * Get the user that owns the task.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to filter by quadrant.
     */
    public function scopeInQuadrant($query, string $quadrant)
    {
        return $query->where('quadrant', $quadrant);
    }

    /**
     * Scope to filter pending tasks.
     */
    public function scopePending($query)
    {
        return $query->where('is_completed', false);
    }

    /**
     * Scope to filter completed tasks.
     */
    public function scopeCompleted($query)
    {
        return $query->where('is_completed', true);
    }
}
