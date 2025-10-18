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
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type'); // big_room, small_room
            $table->text('description')->nullable();
            $table->integer('max_pax');
            $table->decimal('base_price', 10, 2);
            $table->integer('quantity');
            $table->boolean('has_ac')->default(false);
            $table->integer('free_entrance_count')->default(0);
            $table->decimal('excess_entrance_fee', 10, 2)->default(0);
            $table->json('inclusions')->nullable(); // free cottage info
            $table->json('images')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
