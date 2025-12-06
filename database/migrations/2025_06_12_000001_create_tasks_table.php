<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('quadrant', ['do', 'decide', 'delegate', 'delete']);
            $table->unsignedTinyInteger('urgency_score')->default(50);
            $table->text('ai_reasoning')->nullable();
            $table->boolean('is_completed')->default(false);
            $table->unsignedInteger('position')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'quadrant']);
            $table->index(['user_id', 'is_completed']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
